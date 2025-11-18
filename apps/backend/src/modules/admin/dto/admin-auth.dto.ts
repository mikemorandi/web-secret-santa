import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AdminAuthDto {
  @ApiProperty({ description: 'SHA-256 hash of the admin password' })
  @IsString()
  @IsNotEmpty()
  passwordHash: string;
}
