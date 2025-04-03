import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ParticipantDetailsDto {
  @ApiProperty({ example: 'Samuel' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Vennmann' })
  @IsString()
  lastName: string;
}