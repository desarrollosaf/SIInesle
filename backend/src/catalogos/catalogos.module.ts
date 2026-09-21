import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Legislador } from '../models/ini-legislador.model';
import { Partido } from '../models/ini-partido.model';
import { Tema } from '../models/ini-tema.model';
import { Legislatura } from '../models/ini-legislatura.model';
import { Comision } from '../models/ini-comision.model';
import { Estatus } from '../models/ini-estatus.model';
import { AuthModule } from '../auth/auth.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { CatalogosService } from './catalogos.service';
import { CatalogosController } from './catalogos.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Legislador, Partido, Tema, Legislatura, Comision, Estatus]),
    AuthModule,
    AuditoriaModule,
  ],
  providers: [CatalogosService],
  controllers: [CatalogosController],
  exports: [CatalogosService],
})
export class CatalogosModule {}
