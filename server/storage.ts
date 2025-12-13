import { users, courses, applications, conversations, messages, verificationCodes, type User, type InsertUser, type Course, type InsertCourse, type Application, type InsertApplication, type Conversation, type InsertConversation, type Message, type InsertMessage, type InsertVerificationCode, type VerificationCode } from "@shared/schema";
import { db } from "./db";
import { eq, desc, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCourse(id: string): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;
  
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByStudent(studentId: string): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined>;
  
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByStudent(studentId: string): Promise<Conversation[]>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;
  
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(email: string): Promise<VerificationCode | undefined>;
  verifyCode(code: string, email: string): Promise<boolean>;
  deleteExpiredCodes(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async updateCourse(id: string, courseUpdate: Partial<InsertCourse>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(courseUpdate)
      .where(eq(courses.id, id))
      .returning();
    return course || undefined;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationsByStudent(studentId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.studentId, studentId));
  }

  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async updateApplication(id: string, applicationUpdate: Partial<InsertApplication>): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({
        ...applicationUpdate,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByStudent(studentId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.studentId, studentId)).orderBy(desc(conversations.updatedAt));
  }

  async getAllConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: string, conversationUpdate: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({
        ...conversationUpdate,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    const [verCode] = await db
      .insert(verificationCodes)
      .values(code)
      .returning();
    return verCode;
  }

  async getVerificationCode(email: string): Promise<VerificationCode | undefined> {
    const [code] = await db
      .select()
      .from(verificationCodes)
      .where(eq(verificationCodes.email, email))
      .orderBy(desc(verificationCodes.createdAt))
      .limit(1);
    
    return code || undefined;
  }

  async verifyCode(code: string, email: string): Promise<boolean> {
    const verCode = await this.getVerificationCode(email);
    
    if (!verCode) return false;
    if (verCode.code !== code) return false;
    if (new Date() > verCode.expiresAt) return false;
    
    await db
      .update(verificationCodes)
      .set({ isVerified: 1 })
      .where(eq(verificationCodes.id, verCode.id));
    
    return true;
  }

  async deleteExpiredCodes(): Promise<void> {
    await db
      .delete(verificationCodes)
      .where(eq(verificationCodes.isVerified, 0));
  }
}

export const storage = new DatabaseStorage();
