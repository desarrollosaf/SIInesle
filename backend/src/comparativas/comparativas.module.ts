import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comparativa } from '../models/ini-comparativa.model';
import { AuthModule } from '../auth/auth.module';
import { ComparativasService } from './comparativas.service';
import { ComparativasController } from './comparativas.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Comparativa]),
    AuthModule,
  ],
  providers: [ComparativasService],
  controllers: [ComparativasController],
  exports: [ComparativasService],
})
export class ComparativasModule {}
