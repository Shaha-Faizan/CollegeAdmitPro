import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  duration: text("duration"),
  degree: text("degree"),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id").notNull(),
  status: text("status").notNull().default("pending"),
  personalDetails: text("personal_details"),
  academicDetails: text("academic_details"),
  documents: text("documents"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Types for form data
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

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  supportStaffId: varchar("support_staff_id"),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationCodes = pgTable("verification_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isVerified: integer("is_verified").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({
  id: true,
  createdAt: true,
  isVerified: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;
