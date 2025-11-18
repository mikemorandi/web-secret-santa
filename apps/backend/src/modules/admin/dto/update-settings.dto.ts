import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @ApiProperty({ description: 'Drawing time for Secret Santa assignment', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  drawing_time?: Date;

  @ApiProperty({ description: 'Optional hint message for assignments', required: false })
  @IsString()
  @IsOptional()
  assignment_hint?: string;

  @ApiProperty({ description: 'Retry seconds for participation changes', required: false })
  @IsOptional()
  retry_sec?: number;

  @ApiProperty({ description: 'IANA timezone identifier (e.g., UTC, Europe/Zurich)', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;
}
