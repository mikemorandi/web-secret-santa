import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Prop({ required: true, unique: true })
  id: string;

  @ApiProperty({ example: 'Samuel' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ example: 'Vennmann' })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({ example: 'samuel@example.com' })
  @Prop({ required: true })
  email: string;

  @ApiProperty({ example: true })
  @Prop({ default: false })
  participation: boolean;

  @ApiProperty()
  @Prop()
  lastModified: Date;

  @ApiProperty()
  @Prop({ type: [String], default: [] })
  exclusions: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);