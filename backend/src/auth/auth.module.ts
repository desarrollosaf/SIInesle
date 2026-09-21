import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { UsersSafs } from '../models/users-safs.model';
import { SUsuario } from '../models/s-usuario.model';
import { SUsers } from '../models/s-users.model';
import { IniAccesosModulos } from '../models/ini-accesos-modulos.model';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([IniAccesosModulos]),
    SequelizeModule.forFeature([UsersSafs, SUsuario, SUsers], 'saf'),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'si-inesle-secret-2025',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
