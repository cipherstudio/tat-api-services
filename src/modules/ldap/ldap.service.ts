import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ldap from 'ldapjs';

@Injectable()
export class LdapService {
  constructor(private readonly configService: ConfigService) {}

  private get LDAP_URL(): string {
    return this.configService.get<string>('LDAP_URL', 'ldap://10.40.1.225');
  }

  private get BASE_DN(): string {
    return this.configService.get<string>('LDAP_BASE_DN', 'DC=tat,DC=or,DC=th');
  }

  async authenticate(email: string, password: string): Promise<any> {
    console.log(email, password);
    const client = ldap.createClient({
      url: this.LDAP_URL,
    });

    // ตรวจสอบว่า email ลงท้ายด้วย @tat.or.th หรือไม่
    if (!email.endsWith('@tat.or.th')) {
      throw new UnauthorizedException('Email ต้องลงท้ายด้วย @tat.or.th');
    }

    // แยก username จาก email
    const username = email.replace('@tat.or.th', '');
    const userPrincipalName = email;

    return new Promise((resolve, reject) => {
      client.bind(userPrincipalName, password, (err) => {
        console.log(err);
        if (err) {
          if (err.name === 'InvalidCredentialsError') {
            return reject(
              new UnauthorizedException('Invalid username or password.'),
            );
          } else if (err.name === 'ConnectionError') {
            return reject(
              new InternalServerErrorException(
                'Cannot contact LDAP server. Please check VPN or server settings.',
              ),
            );
          } else {
            return reject(
              new InternalServerErrorException(
                `LDAP bind error: ${err.message}`,
              ),
            );
          }
        }

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
            console.log('Search entry found:', entryCount);
            console.log('Entry DN:', entry.dn);

            // ตรวจสอบว่า entry.object มีค่าหรือไม่
            if (entry.object) {
              console.log('Entry attributes:', Object.keys(entry.object));
              console.log('Found user:', entry.object);
              user = entry.object;
            } else {
              console.log('Entry object is null or undefined');
              // ลองใช้ entry.attributes แทน
              if (entry.attributes) {
                const userObj: any = {};
                entry.attributes.forEach((attr: any) => {
                  if (attr.vals && attr.vals.length > 0) {
                    userObj[attr.type] = attr.vals[0].toString();
                  }
                });
                console.log('Constructed user object:', userObj);
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

          res.on('end', () => {
            console.log('Search ended. Total entries found:', entryCount);
            client.unbind();
            if (!user) {
              console.log('No user found with sAMAccountName:', username);
              return reject(new UnauthorizedException('User not found.'));
            }
            console.log('Resolving user:', user);
            resolve(user);
          });
        });
      });
    });
  }
}
