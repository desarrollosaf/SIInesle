import {
  ArrayMinSize, IsArray, IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl,
  Matches, MinLength,
} from 'class-validator';

export class CreateIniciativaDto {
  @Matches(/^\d+$/, { message: 'El número de iniciativa debe contener solo dígitos.' })
  numero: string;

  @IsDateString()
  fecha_presentacion: string;

  @IsInt()
  legislatura_id: number;

  @IsString()
  @MinLength(20, { message: 'El título debe contener al menos 20 caracteres.' })
  titulo: string;

  @IsString()
  @MinLength(5, { message: 'El subtema debe contener al menos 5 caracteres.' })
  subtema: string;

  @IsString()
  @MinLength(80, { message: 'El resumen técnico debe contener al menos 80 caracteres.' })
  resumen: string;

  @IsInt()
  estatus_id: number;

  @IsOptional()
  @IsUrl({}, { message: 'Ingrese una dirección completa que comience con http:// o https://.' })
  enlace?: string | null;

  @IsString()
  @IsNotEmpty()
  palabras_clave: string;

  @IsIn(['Alta', 'Media', 'Baja'])
  nivel_viabilidad_tecnica: 'Alta' | 'Media' | 'Baja';

  @IsString()
  @MinLength(30, { message: 'Justifique la viabilidad técnica en al menos 30 caracteres.' })
  justificacion_tecnica: string;

  @IsIn(['Alta', 'Media', 'Baja'])
  nivel_viabilidad_juridica: 'Alta' | 'Media' | 'Baja';

  @IsString()
  @MinLength(30, { message: 'Justifique la viabilidad jurídica en al menos 30 caracteres.' })
  justificacion_juridica: string;

  @IsString()
  @MinLength(60, { message: 'Explique el problema público en al menos 60 caracteres.' })
  problema: string;

  @IsString()
  @MinLength(40, { message: 'Explique el objetivo en al menos 40 caracteres.' })
  objetivo: string;

  @IsString()
  @MinLength(80, { message: 'El resumen del análisis debe contener al menos 80 caracteres.' })
  resumen_general: string;

  @IsString()
  @MinLength(30, { message: 'Describa los beneficios esperados en al menos 30 caracteres.' })
  beneficios: string;

  @IsString()
  @MinLength(30, { message: 'Describa los riesgos en al menos 30 caracteres.' })
  riesgos: string;

  @IsString()
  @MinLength(30, { message: 'Describa los elementos con posibilidad de éxito en al menos 30 caracteres.' })
  que_funcionaria: string;

  @IsString()
  @MinLength(30, { message: 'Describa los factores de riesgo en al menos 30 caracteres.' })
  que_podria_fracasar: string;

  @IsString()
  @MinLength(40, { message: 'Capture una recomendación final de al menos 40 caracteres.' })
  recomendacion: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Agregue al menos una persona legisladora o promovente.' })
  @IsInt({ each: true })
  legislador_ids: number[];

  @IsArray()
  @ArrayMinSize(1, { message: 'Agregue al menos un grupo parlamentario o tipo de promovente.' })
  @IsInt({ each: true })
  partido_ids: number[];

  @IsArray()
  @ArrayMinSize(1, { message: 'Agregue al menos un tema.' })
  @IsInt({ each: true })
  tema_ids: number[];

  @IsArray()
  @ArrayMinSize(1, { message: 'Agregue al menos una comisión turnada.' })
  @IsInt({ each: true })
  comision_ids: number[];
}
