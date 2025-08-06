import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LdapController } from './ldap.controller';
import { LdapService } from './ldap.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { DataviewsModule } from '@modules/dataviews/dataviews.module';
import { EmployeeRepository } from '@modules/dataviews/repositories/employee.repository';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    DataviewsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h',
        },
      }),
    }),
  ],
  controllers: [LdapController],
  providers: [LdapService, EmployeeRepository],
  exports: [LdapService],
})
export class LdapModule {}
