import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SessionService } from '../auth/services/session.service';
import * as ldap from 'ldapjs';

@Injectable()
export class LdapService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  private get LDAP_URL(): string {
    return this.configService.get<string>('LDAP_URL', 'ldap://10.40.1.225');
  }

  private get BASE_DN(): string {
    return this.configService.get<string>('LDAP_BASE_DN', 'DC=tat,DC=or,DC=th');
  }

  async authenticate(email: string, password: string): Promise<any> {
    console.log(email, password);

    // กำหนด timeout และ retry options
    const LDAP_TIMEOUT = 10000; // 10 seconds
    const LDAP_RETRY_ATTEMPTS = 3;
    const LDAP_RETRY_DELAY = 1000; // 1 second

    const client = ldap.createClient({
      url: this.LDAP_URL,
      timeout: LDAP_TIMEOUT,
      connectTimeout: LDAP_TIMEOUT,
      idleTimeout: LDAP_TIMEOUT,
      reconnect: true,
      maxConnections: 1,
    });

    // ตรวจสอบว่า email ลงท้ายด้วย @tat.or.th หรือไม่
    if (!email.endsWith('@tat.or.th')) {
      throw new UnauthorizedException('Email ต้องลงท้ายด้วย @tat.or.th');
    }

    // แยก username จาก email
    const username = email.replace('@tat.or.th', '');
    const userPrincipalName = email;

    return new Promise((resolve, reject) => {
      // เพิ่ม retry mechanism
      const attemptLdapBind = (attempt: number = 1) => {
        console.log(`LDAP bind attempt ${attempt}/${LDAP_RETRY_ATTEMPTS}`);

        client.bind(userPrincipalName, password, (err) => {
          console.log('LDAP bind error:', err);

          if (err) {
            if (err.name === 'InvalidCredentialsError') {
              return reject(
                new UnauthorizedException('Invalid username or password.'),
              );
            } else if (
              err.name === 'ConnectionError' ||
              err.code === 'ETIMEDOUT'
            ) {
              if (attempt < LDAP_RETRY_ATTEMPTS) {
                console.log(`Retrying LDAP bind in ${LDAP_RETRY_DELAY}ms...`);
                setTimeout(() => {
                  attemptLdapBind(attempt + 1);
                }, LDAP_RETRY_DELAY);
                return;
              } else {
                return reject(
                  new InternalServerErrorException(
                    'Cannot contact LDAP server after multiple attempts. Please check VPN or server settings.',
                  ),
                );
              }
            } else {
              return reject(
                new InternalServerErrorException(
                  `LDAP bind error: ${err.message}`,
                ),
              );
            }
          }

          // LDAP bind สำเร็จ เริ่มค้นหา user
          const opts = {
            filter: `(sAMAccountName=${username})`,
            scope: 'sub',
            attributes: [
              'givenName',
              'mail',
              'displayName',
              'department',
              'memberOf',
              'sAMAccountName',
              'userPrincipalName',
              'cn',
              'sn',
              'description',
              'postalCode',
              'physicalDeliveryOfficeName',
            ],
          };

          console.log('Searching with filter:', opts.filter);
          console.log('Base DN:', this.BASE_DN);
          client.search(this.BASE_DN, opts, (searchErr, res) => {
            if (searchErr) {
              console.log('Search error:', searchErr);
              return reject(
                new InternalServerErrorException(
                  `Search error: ${searchErr.message}`,
                ),
              );
            }

            let user: any = null;
            let entryCount = 0;

            res.on('searchEntry', (entry) => {
              entryCount++;
              //   console.log('Search entry found:', entryCount);
              //   console.log('Entry DN:', entry.dn);

              // ตรวจสอบว่า entry.object มีค่าหรือไม่
              if (entry.object) {
                // console.log('Entry attributes:', Object.keys(entry.object));
                // console.log('Found user:', entry.object);
                user = entry.object;
              } else {
                // console.log('Entry object is null or undefined');
                // ลองใช้ entry.attributes แทน
                if (entry.attributes) {
                  const userObj: any = {};
                  entry.attributes.forEach((attr: any) => {
                    if (attr.vals && attr.vals.length > 0) {
                      userObj[attr.type] = attr.vals[0].toString();
                    }
                  });
                  //   console.log('Constructed user object:', userObj);
                  user = userObj;
                }
              }
            });

            res.on('error', (searchError) => {
              console.log('Search stream error:', searchError);
              if (searchError.message.includes('No such object')) {
                return reject(
                  new InternalServerErrorException(
                    'Base DN not found (No such object).',
                  ),
                );
              }
              return reject(
                new InternalServerErrorException(
                  `LDAP search error: ${searchError.message}`,
                ),
              );
            });

            res.on('end', async () => {
              console.log('Search ended. Total entries found:', entryCount);
              client.unbind();
              if (!user) {
                console.log('No user found with sAMAccountName:', username);
                return reject(new UnauthorizedException('User not found.'));
              }
              console.log('Resolving user:', user);

              // ใช้ userPrincipalName (email) ไปค้นหา user ในฐานข้อมูล
              const userPrincipalName = user.userPrincipalName;
              if (!userPrincipalName) {
                return reject(
                  new UnauthorizedException(
                    'UserPrincipalName not found in LDAP response.',
                  ),
                );
              }

              try {
                // ค้นหา user ในฐานข้อมูล
                const dbUser =
                  await this.usersService.findByEmail(userPrincipalName);
                if (!dbUser) {
                  return reject(
                    new NotFoundException('User not found in database.'),
                  );
                }

                // สร้าง JWT payload
                const payload = {
                  sub: dbUser.pmtCode,
                  email: dbUser.email,
                  role: dbUser.role,
                  employeeCode: dbUser.pmtCode,
                };

                // สร้าง tokens
                const accessToken = this.jwtService.sign(payload);
                const refreshToken = this.jwtService.sign(payload, {
                  expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
                });

                // สร้าง session
                await this.sessionService.createSession(
                  dbUser.id,
                  refreshToken,
                  'LDAP Authentication',
                  'LDAP',
                  dbUser.pmtCode,
                );

                // ส่งคืน response เหมือน login ปกติ
                resolve({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  user: {
                    id: dbUser.id,
                    email: dbUser.pmtEmailAddr,
                    fullName: dbUser.pmtNameT,
                    role: dbUser.role,
                    position: dbUser.posPositionname,
                    employeeCode: dbUser.pmtCode,
                    isAdmin: dbUser.isAdmin === 1,
                  },
                  ldapUser: user, // ข้อมูลจาก LDAP
                });
              } catch (error) {
                console.log('Error finding user in database:', error);
                return reject(
                  new UnauthorizedException('Failed to authenticate user.'),
                );
              }
            });
          });
        });
      };

      // เริ่ม retry mechanism
      attemptLdapBind();
    });
  }
}
