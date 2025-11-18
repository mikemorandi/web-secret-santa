import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'First name of the user', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Email address of the user', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Participation status', required: false })
  @IsBoolean()
  @IsOptional()
  participation?: boolean;

  @ApiProperty({ description: 'Array of user IDs to exclude from assignment', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  exclusions?: string[];
}
