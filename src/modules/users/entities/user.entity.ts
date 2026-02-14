import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  HR = 'HR',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 50 })
  matricule: string;

  @Prop({ required: true, maxlength: 20 })
  telephone: string;

  @Prop({ required: true, unique: true, maxlength: 255, index: true })
  email: string;

  @Prop({ required: true, maxlength: 255 })
  password: string;

  @Prop({ required: true, type: Date })
  date_embauche: Date;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  departement_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  manager_id: Types.ObjectId;

  @Prop({ required: true, maxlength: 50, default: 'active' })
  status: string;

  @Prop({ required: true, default: false })
  en_ligne: boolean;

  @Prop({ type: String, enum: UserRole, required: true, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ matricule: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ departement_id: 1 });
UserSchema.index({ manager_id: 1 });
