import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({
  timestamps: false,
})
export class Otp {
  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  code!: string;

  @Prop({ default: Date.now, expires: 300 }) // Auto-delete in 5 minutes
  createdAt!: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
