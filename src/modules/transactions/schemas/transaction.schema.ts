import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({
  _id: false,
})
export class CartItemRef {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;
}

const CartItemRefSchema = SchemaFactory.createForClass(CartItemRef);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret: Record<string, any>) => {
      ret.id = ret._id ? ret._id.toString() : undefined;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Transaction {
  @Prop({ required: true, type: String })
  _id!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ default: 'COP' })
  currency!: string;

  @Prop({ required: true })
  cardHolder!: string;

  @Prop({ required: true })
  cardMaskedNumber!: string;

  @Prop({ required: true, unique: true })
  reference!: string;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'DECLINED', 'FAILED'], default: 'PENDING' })
  status!: string;

  @Prop({ type: [CartItemRefSchema], default: [] })
  cart!: CartItemRef[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
