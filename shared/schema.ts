import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// ============= User Schema =============
export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'admin' | 'support';
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  role: { type: String, required: true, default: 'student', enum: ['student', 'admin', 'support'] },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', userSchema);

// ============= Course Schema =============
export interface ICourse extends Document {
  name: string;
  code: string;
  description?: string;
  duration?: string;
  degree?: string;
}

const courseSchema = new Schema<ICourse>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  duration: { type: String, trim: true },
  degree: { type: String, trim: true },
});

export const Course = mongoose.model<ICourse>('Course', courseSchema);

// ============= Application Schema =============
export interface IApplication extends Document {
  studentId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  personalDetails?: string;
  academicDetails?: string;
  documents?: string;
  submittedAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>({
  studentId: { type: String, required: true, ref: 'User' },
  courseId: { type: String, required: true, ref: 'Course' },
  status: { type: String, required: true, default: 'pending', enum: ['pending', 'approved', 'rejected', 'under_review'] },
  personalDetails: { type: String },
  academicDetails: { type: String },
  documents: { type: String },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Application = mongoose.model<IApplication>('Application', applicationSchema);

// ============= Conversation Schema =============
export interface IConversation extends Document {
  studentId: string;
  supportStaffId?: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  studentId: { type: String, required: true, ref: 'User' },
  supportStaffId: { type: String, ref: 'User' },
  subject: { type: String, required: true, trim: true },
  status: { type: String, required: true, default: 'open', enum: ['open', 'closed', 'pending'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

// ============= Message Schema =============
export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  message: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, ref: 'Conversation' },
  senderId: { type: String, required: true, ref: 'User' },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);

// ============= Verification Code Schema =============
export interface IVerificationCode extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  isVerified: boolean;
  createdAt: Date;
}

const verificationCodeSchema = new Schema<IVerificationCode>({
  email: { type: String, required: true, trim: true, lowercase: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// TTL index to auto-delete expired codes after 1 hour
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export const VerificationCode = mongoose.model<IVerificationCode>('VerificationCode', verificationCodeSchema);

// ============= Zod Validation Schemas =============
export const insertUserSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6),
  fullName: z.string().min(1).trim(),
  role: z.enum(['student', 'admin', 'support']).default('student'),
});

export const insertCourseSchema = z.object({
  name: z.string().min(1).trim(),
  code: z.string().min(1).trim(),
  description: z.string().optional(),
  duration: z.string().optional(),
  degree: z.string().optional(),
});

export const insertApplicationSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected', 'under_review']).default('pending'),
  personalDetails: z.string().optional(),
  academicDetails: z.string().optional(),
  documents: z.string().optional(),
});

export const insertConversationSchema = z.object({
  studentId: z.string().min(1),
  supportStaffId: z.string().optional(),
  subject: z.string().min(1).trim(),
  status: z.enum(['open', 'closed', 'pending']).default('open'),
});

export const insertMessageSchema = z.object({
  conversationId: z.string().min(1),
  senderId: z.string().min(1),
  message: z.string().min(1).trim(),
});

export const insertVerificationCodeSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  code: z.string().min(1),
  expiresAt: z.date(),
});

// ============= Type Exports =============
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;

// ============= Plain Object Types (for .lean() queries) =============
export type UserDoc = {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'admin' | 'support';
  createdAt: Date;
};

export type CourseDoc = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  duration?: string;
  degree?: string;
};

export type ApplicationDoc = {
  _id: string;
  studentId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  personalDetails?: string;
  academicDetails?: string;
  documents?: string;
  submittedAt: Date;
  updatedAt: Date;
};

export type ConversationDoc = {
  _id: string;
  studentId: string;
  supportStaffId?: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
};

export type MessageDoc = {
  _id: string;
  conversationId: string;
  senderId: string;
  message: string;
  createdAt: Date;
};

export type VerificationCodeDoc = {
  _id: string;
  email: string;
  code: string;
  expiresAt: Date;
  isVerified: boolean;
  createdAt: Date;
};



export type PersonalDetails = {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  email: string;
  alternateMobileNumber?: string;
  aadhaarNumber: string;
  nationality: string;
  religion?: string;
  category: string;
  permanentAddress: string;
  temporaryAddress?: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
};

export type ParentGuardianDetails = {
  fatherName: string;
  fatherPhone: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  motherName: string;
  motherPhone: string;
  motherOccupation?: string;
  motherIncome?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
};

export type AcademicDetails = {
  tenthSchoolName: string;
  tenthBoard: string;
  tenthPassingYear: string;
  tenthPercentage: string;
  twelfthSchoolName: string;
  twelfthBoard: string;
  twelfthPassingYear: string;
  twelfthStream: string;
  twelfthPercentage: string;
  graduationCollege?: string;
  graduationDegree?: string;
  graduationBranch?: string;
  graduationMode?: string;
  graduationYear?: string;
  graduationPercentage?: string;
  courseId: string;
  courseSpecialization?: string;
  courseMode?: string;
};

export type DocumentDetails = {
  passportPhoto?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  tenthMarksheet?: string;
  twelfthMarksheet?: string;
  graduationMarksheets?: string[];
  tcMigrationCertificate?: string;
  casteCertificate?: string;
  domicileCertificate?: string;
};
