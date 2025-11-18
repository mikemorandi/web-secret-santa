import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Settings extends Document {
  @ApiProperty({ example: 5 })
  @Prop({ required: true })
  retry_sec: number;

  @ApiProperty({ example: '2025-12-24T00:00:00Z' })
  @Prop({ required: true })
  drawing_time: Date;

  @ApiProperty({
    example: 'Bitte denk daran, dass das Wichtelgeschenk nicht mehr als 50.- kosten sollte.',
    description: 'Optional hint text shown in assignment emails. Can be null/undefined.'
  })
  @Prop()
  assignment_hint?: string;

  @ApiProperty({
    example: 'UTC',
    description: 'IANA timezone identifier for displaying dates and times'
  })
  @Prop({ default: 'UTC' })
  timezone?: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);