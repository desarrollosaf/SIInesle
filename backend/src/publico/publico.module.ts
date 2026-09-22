import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Iniciativa } from '../models/ini-iniciativa.model';
import { Legislatura } from '../models/ini-legislatura.model';
import { Estatus } from '../models/ini-estatus.model';
import { Legislador } from '../models/ini-legislador.model';
import { Partido } from '../models/ini-partido.model';
import { Tema } from '../models/ini-tema.model';
import { Comision } from '../models/ini-comision.model';
import { PublicoService } from './publico.service';
import { PublicoController } from './publico.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Iniciativa, Legislatura, Estatus, Legislador, Partido, Tema, Comision]),
  ],
  providers: [PublicoService],
  controllers: [PublicoController],
})
export class PublicoModule {}
