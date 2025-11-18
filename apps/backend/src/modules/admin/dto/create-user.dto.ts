import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Participation status', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  participation?: boolean;

  @ApiProperty({ description: 'Array of user IDs to exclude from assignment', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  exclusions?: string[];
}
