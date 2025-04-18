import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Creates TypeORM configuration for Oracle database
 * @param configService NestJS Config Service
 * @returns TypeORM configuration object
 */
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'oracle',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    sid: configService.get<string>('DB_DATABASE'),
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
    logging: configService.get<boolean>('DB_LOGGING', false),
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, './migrations/*{.ts,.js}')],
    autoLoadEntities: true,
    connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${configService.get<string>(
      'DB_HOST',
    )})(PORT=${configService.get<number>(
      'DB_PORT',
    )}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=${configService.get<string>(
      'DB_DATABASE',
    )})))`,
  };
};

/**
 * For TypeORM migrations
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'oracle',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1521', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  sid: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${
    process.env.DB_HOST
  })(PORT=${process.env.DB_PORT || '1521'}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=${
    process.env.DB_DATABASE
  })))`,
};

export default new DataSource(dataSourceOptions);
