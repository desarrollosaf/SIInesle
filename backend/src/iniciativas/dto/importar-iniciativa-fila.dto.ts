import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class ImportarIniciativaFilaDto {
  @IsString()
  numero: string;

  @IsString()
  fecha_presentacion: string;

  @IsString()
  titulo: string;

  @IsArray()
  @IsString({ each: true })
  promotores: string[];

  @IsArray()
  @IsString({ each: true })
  partidos: string[];

  @IsArray()
  @IsString({ each: true })
  temas: string[];

  @IsArray()
  @IsString({ each: true })
  comisiones: string[];

  @IsOptional() @IsString() legislatura?: string;
  @IsOptional() @IsString() subtema?: string;
  @IsOptional() @IsString() resumen?: string;
  @IsOptional() @IsString() estatus?: string;
  @IsOptional() @IsString() enlace?: string;
  @IsOptional() @IsString() palabras_clave?: string;
  @IsOptional() @IsString() problema?: string;
  @IsOptional() @IsString() objetivo?: string;
  @IsOptional() @IsString() resumen_general?: string;
  @IsOptional() @IsString() beneficios?: string;
  @IsOptional() @IsString() riesgos?: string;
  @IsOptional() @IsIn(['Alta', 'Media', 'Baja', '']) nivel_viabilidad_tecnica?: string;
  @IsOptional() @IsIn(['Alta', 'Media', 'Baja', '']) nivel_viabilidad_juridica?: string;
  @IsOptional() @IsString() que_funcionaria?: string;
  @IsOptional() @IsString() que_podria_fracasar?: string;
  @IsOptional() @IsString() recomendacion?: string;
}
