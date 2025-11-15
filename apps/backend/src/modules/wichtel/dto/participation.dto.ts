import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ParticipationDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  participating: boolean;
}

export class ParticipationResponseDto extends ParticipationDto {
  @ApiProperty({ example: true })
  modified: boolean;
}