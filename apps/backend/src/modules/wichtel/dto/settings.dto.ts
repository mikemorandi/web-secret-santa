import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingsDto {
  @ApiProperty({ example: 5 })
  retrySec: number;

  @ApiProperty({ example: '2025-12-24T00:00:00Z' })
  drawingTime: Date;
  
  @ApiPropertyOptional({
    example: 'Bitte denk daran, dass das Wichtelgeschenk nicht mehr als 50.- kosten sollte.',
    description: 'Optional hint text shown in assignment emails. Only included if set in the database.'
  })
  assignmentHint?: string;

  @ApiPropertyOptional({
    example: 'UTC',
    description: 'IANA timezone identifier for displaying dates and times'
  })
  timezone?: string;
}