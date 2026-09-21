import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ImportarIniciativaFilaDto } from './importar-iniciativa-fila.dto';

export class ImportarIniciativasDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportarIniciativaFilaDto)
  filas: ImportarIniciativaFilaDto[];

  @IsOptional()
  @IsBoolean()
  agregarCatalogos?: boolean;

  @IsOptional()
  @IsIn(['omitir', 'actualizar'])
  siExiste?: 'omitir' | 'actualizar';

  @IsOptional()
  nombreArchivo?: string;
}
