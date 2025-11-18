import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AdminAuthDto {
  @ApiProperty({ description: 'Admin password for authentication' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
