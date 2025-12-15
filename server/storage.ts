import {
  User,
  Course,
  Application,
  Conversation,
  Message,
  VerificationCode,
  type IUser,
  type ICourse,
  type IApplication,
  type IConversation,
  type IMessage,
  type IVerificationCode,
  type InsertUser,
  type InsertCourse,
  type InsertApplication,
  type InsertConversation,
  type InsertMessage,
  type InsertVerificationCode,
  type UserDoc,
  type CourseDoc,
  type ApplicationDoc,
  type ConversationDoc,
  type MessageDoc,
  type VerificationCodeDoc,
} from 'shared/schema.ts';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<UserDoc | null>;
  getUserByEmail(email: string): Promise<UserDoc | null>;
  createUser(user: InsertUser): Promise<IUser>;

  // Course methods
  getCourse(id: string): Promise<CourseDoc | null>;
  getAllCourses(): Promise<CourseDoc[]>;
  createCourse(course: InsertCourse): Promise<ICourse>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<CourseDoc | null>;
  deleteCourse(id: string): Promise<boolean>;

  // Application methods
  getApplication(id: string): Promise<ApplicationDoc | null>;
  getApplicationsByStudent(studentId: string): Promise<ApplicationDoc[]>;
  getAllApplications(): Promise<ApplicationDoc[]>;
  createApplication(application: InsertApplication): Promise<IApplication>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<ApplicationDoc | null>;

  // Conversation methods
  getConversation(id: string): Promise<ConversationDoc | null>;
  getConversationsByStudent(studentId: string): Promise<ConversationDoc[]>;
  getAllConversations(): Promise<ConversationDoc[]>;
  createConversation(conversation: InsertConversation): Promise<IConversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<ConversationDoc | null>;

  // Message methods
  getMessage(id: string): Promise<MessageDoc | null>;
  getMessagesByConversation(conversationId: string): Promise<MessageDoc[]>;
  createMessage(message: InsertMessage): Promise<IMessage>;

  // Verification code methods
  createVerificationCode(code: InsertVerificationCode): Promise<IVerificationCode>;
  getVerificationCode(email: string): Promise<VerificationCodeDoc | null>;
  verifyCode(code: string, email: string): Promise<boolean>;
  deleteExpiredCodes(): Promise<void>;
}

export class MongoDBStorage implements IStorage {
  // ============= User Methods =============
  async getUser(id: string): Promise<UserDoc | null> {
    const user = await User.findById(id).lean();
    if (!user) return null;
    return { ...user, _id: user._id.toString() };
  }

  async getUserByEmail(email: string): Promise<UserDoc | null> {
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return null;
    return { ...user, _id: user._id.toString() };
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    const user = new User(insertUser);
    return await user.save();
  }

  // ============= Course Methods =============
  async getCourse(id: string): Promise<CourseDoc | null> {
    const course = await Course.findById(id).lean();
    if (!course) return null;
    return { ...course, _id: course._id.toString() };
  }

  async getAllCourses(): Promise<CourseDoc[]> {
    const courses = await Course.find().lean();
    return courses.map(c => ({ ...c, _id: c._id.toString() }));
  }

  async createCourse(insertCourse: InsertCourse): Promise<ICourse> {
    const course = new Course(insertCourse);
    return await course.save();
  }

  async updateCourse(id: string, courseUpdate: Partial<InsertCourse>): Promise<CourseDoc | null> {
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: courseUpdate },
      { new: true, runValidators: true }
    ).lean();
    if (!course) return null;
    return { ...course, _id: course._id.toString() };
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await Course.findByIdAndDelete(id);
    return result !== null;
  }

  // ============= Application Methods =============
  async getApplication(id: string): Promise<ApplicationDoc | null> {
    const app = await Application.findById(id).lean();
    if (!app) return null;
    return { ...app, _id: app._id.toString() };
  }

  async getApplicationsByStudent(studentId: string): Promise<ApplicationDoc[]> {
    const apps = await Application.find({ studentId }).lean();
    return apps.map(a => ({ ...a, _id: a._id.toString() }));
  }

  async getAllApplications(): Promise<ApplicationDoc[]> {
    const apps = await Application.find().lean();
    return apps.map(a => ({ ...a, _id: a._id.toString() }));
  }

  async createApplication(insertApplication: InsertApplication): Promise<IApplication> {
    const application = new Application(insertApplication);
    return await application.save();
  }

  async updateApplication(
    id: string,
    applicationUpdate: Partial<InsertApplication>
  ): Promise<ApplicationDoc | null> {
    const app = await Application.findByIdAndUpdate(
      id,
      { 
        $set: {
          ...applicationUpdate,
          updatedAt: new Date(),
        }
      },
      { new: true, runValidators: true }
    ).lean();
    if (!app) return null;
    return { ...app, _id: app._id.toString() };
  }

  // ============= Conversation Methods =============
  async getConversation(id: string): Promise<ConversationDoc | null> {
    const conv = await Conversation.findById(id).lean();
    if (!conv) return null;
    return { ...conv, _id: conv._id.toString() };
  }

  async getConversationsByStudent(studentId: string): Promise<ConversationDoc[]> {
    const convs = await Conversation.find({ studentId })
      .sort({ updatedAt: -1 })
      .lean();
    return convs.map(c => ({ ...c, _id: c._id.toString() }));
  }

  async getAllConversations(): Promise<ConversationDoc[]> {
    const convs = await Conversation.find()
      .sort({ updatedAt: -1 })
      .lean();
    return convs.map(c => ({ ...c, _id: c._id.toString() }));
  }

  async createConversation(insertConversation: InsertConversation): Promise<IConversation> {
    const conversation = new Conversation(insertConversation);
    return await conversation.save();
  }

  async updateConversation(
    id: string,
    conversationUpdate: Partial<InsertConversation>
  ): Promise<ConversationDoc | null> {
    const conv = await Conversation.findByIdAndUpdate(
      id,
      {
        $set: {
          ...conversationUpdate,
          updatedAt: new Date(),
        }
      },
      { new: true, runValidators: true }
    ).lean();
    if (!conv) return null;
    return { ...conv, _id: conv._id.toString() };
  }

  // ============= Message Methods =============
  async getMessage(id: string): Promise<MessageDoc | null> {
    const msg = await Message.findById(id).lean();
    if (!msg) return null;
    return { ...msg, _id: msg._id.toString() };
  }

  async getMessagesByConversation(conversationId: string): Promise<MessageDoc[]> {
    const msgs = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();
    return msgs.map(m => ({ ...m, _id: m._id.toString() }));
  }

  async createMessage(insertMessage: InsertMessage): Promise<IMessage> {
    const message = new Message(insertMessage);
    return await message.save();
  }

  // ============= Verification Code Methods =============
  async createVerificationCode(code: InsertVerificationCode): Promise<IVerificationCode> {
    const verificationCode = new VerificationCode(code);
    return await verificationCode.save();
  }

  async getVerificationCode(email: string): Promise<VerificationCodeDoc | null> {
    const verCode = await VerificationCode.findOne({ email: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean();
    if (!verCode) return null;
    return { ...verCode, _id: verCode._id.toString() };
  }

  async verifyCode(code: string, email: string): Promise<boolean> {
    const verCode = await this.getVerificationCode(email);

    if (!verCode) return false;
    if (verCode.code !== code) return false;
    if (new Date() > verCode.expiresAt) return false;

    await VerificationCode.findByIdAndUpdate(verCode._id, {
      $set: { isVerified: true }
    });

    return true;
  }

  async deleteExpiredCodes(): Promise<void> {
    await VerificationCode.deleteMany({
      $or: [
        { isVerified: false, expiresAt: { $lt: new Date() } },
        { isVerified: true }
      ]
    });
  }
}

// Export singleton instance
export const storage = new MongoDBStorage();
