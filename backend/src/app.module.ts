import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { IniciativasModule } from './iniciativas/iniciativas.module';
import { ComparativasModule } from './comparativas/comparativas.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

import { UsersSafs } from './models/users-safs.model';
import { SUsuario } from './models/s-usuario.model';
import { SUsers } from './models/s-users.model';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión principal (iniciativas_inesle)
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'mariadb',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASS', ''),
        database: config.get<string>('DB_NAME', 'iniciativas_inesle'),
        autoLoadModels: true,
        synchronize: false,
        logging: false,
        dialectOptions: { charset: 'utf8mb4' },
      }),
    }),

    // Conexión externa: identidad corporativa compartida (saf)
    SequelizeModule.forRootAsync({
      name: 'saf',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'mariadb',
        host: config.get<string>('SAF_DB_HOST', 'localhost'),
        port: config.get<number>('SAF_DB_PORT', 3306),
        username: config.get<string>('SAF_DB_USER', 'root'),
        password: config.get<string>('SAF_DB_PASS', ''),
        database: config.get<string>('SAF_DB_NAME', 'saf'),
        models: [UsersSafs, SUsuario, SUsers],
        synchronize: false,
        logging: false,
        dialectOptions: { charset: 'utf8mb4' },
      }),
    }),

    AuthModule,
    CatalogosModule,
    IniciativasModule,
    ComparativasModule,
    AuditoriaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
