import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Assignment extends Document {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Prop({ required: true })
  donor: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @Prop({ required: true })
  donee: string;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);