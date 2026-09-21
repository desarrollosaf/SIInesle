import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Iniciativa } from '../models/ini-iniciativa.model';
import { Legislatura } from '../models/ini-legislatura.model';
import { Estatus } from '../models/ini-estatus.model';
import { Legislador } from '../models/ini-legislador.model';
import { Partido } from '../models/ini-partido.model';
import { Tema } from '../models/ini-tema.model';
import { Comision } from '../models/ini-comision.model';
import { IniciativaLegislador } from '../models/ini-iniciativa-legislador.model';
import { IniciativaPartido } from '../models/ini-iniciativa-partido.model';
import { IniciativaTema } from '../models/ini-iniciativa-tema.model';
import { IniciativaComision } from '../models/ini-iniciativa-comision.model';
import { AuthModule } from '../auth/auth.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { IniciativasService } from './iniciativas.service';
import { IniciativasController } from './iniciativas.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Iniciativa, Legislatura, Estatus, Legislador, Partido, Tema, Comision,
      IniciativaLegislador, IniciativaPartido, IniciativaTema, IniciativaComision,
    ]),
    AuthModule,
    AuditoriaModule,
  ],
  providers: [IniciativasService],
  controllers: [IniciativasController],
  exports: [IniciativasService],
})
export class IniciativasModule {}
