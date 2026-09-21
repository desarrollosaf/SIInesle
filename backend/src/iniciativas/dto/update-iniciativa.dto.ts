import { PartialType } from '@nestjs/mapped-types';
import { CreateIniciativaDto } from './create-iniciativa.dto';

export class UpdateIniciativaDto extends PartialType(CreateIniciativaDto) {}
