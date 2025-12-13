import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCourseSchema, insertApplicationSchema, insertConversationSchema, insertMessageSchema, insertVerificationCodeSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";
import { requireAuth, requireAdmin } from "./middleware/auth";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { generateChatbotResponse } from "./middleware/services/chatbot";
import { sendVerificationEmail } from "./middleware/services/email";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

declare module "express-session" {
  interface SessionData {
    userId: string;
    isAdmin: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const existingUser = await storage.getUserByEmail(result.data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(result.data.password, 10);
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
      });
      
      const { password, ...userWithoutPassword } = user;
      
      if (req.session) {
        req.session.userId = user.id;
        req.session.isAdmin = user.role === "admin";
      }
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      
      if (req.session) {
        req.session.userId = user.id;
        req.session.isAdmin = user.role === "admin";
      }
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/check-email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const existingUser = await storage.getUserByEmail(email);
      res.json({ 
        available: !existingUser,
        email: email 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/verification/send-code", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const result = insertVerificationCodeSchema.safeParse({
        email,
        code,
        expiresAt,
      });

      if (!result.success) {
        console.error("Verification code schema error:", fromError(result.error).toString());
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const verCode = await storage.createVerificationCode(result.data);
      console.log(`✓ Verification code created for ${email}, Code:`, code);

      // Send email verification
      const emailResult = await sendVerificationEmail(email, code);
      if (!emailResult.success) {
        console.warn("Email send failed:", emailResult.error);
      } else {
        console.log("✓ Email sent successfully to:", email);
      }

      res.json({ 
        success: true, 
        message: `Verification code sent to ${email}`,
        code // In production, don't return this - only for testing
      });
    } catch (error: any) {
      console.error("Send verification code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/verification/verify-code", async (req, res) => {
    try {
      const { code, email } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Verification code required" });
      }
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      console.log(`Verifying code for ${email}:`, code);
      const isValid = await storage.verifyCode(code, email);
      
      if (!isValid) {
        console.warn(`Code verification failed for ${email}`);
        return res.status(400).json({ error: "Invalid or expired code" });
      }

      console.log(`✓ Code verified for ${email}`);
      res.json({ success: true, message: "Code verified successfully" });
    } catch (error: any) {
      console.error("Verify code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "No session to logout" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/courses", requireAuth, async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/courses", requireAdmin, async (req, res) => {
    try {
      const result = insertCourseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const course = await storage.createCourse(result.data);
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/courses/:id", requireAdmin, async (req, res) => {
    try {
      const result = insertCourseSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const course = await storage.updateCourse(req.params.id, result.data);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/courses/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCourse(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json({ message: "Course deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role === "admin") {
        const applications = await storage.getAllApplications();
        res.json(applications);
      } else {
        const applications = await storage.getApplicationsByStudent(req.session.userId!);
        res.json(applications);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/applications/:id", async (req, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      const result = insertApplicationSchema.safeParse({
        ...req.body,
        studentId: req.session.userId!,
      });
      
      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const application = await storage.createApplication(result.data);
      res.json(application);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== "admin" && application.studentId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const result = insertApplicationSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const updatedApplication = await storage.updateApplication(req.params.id, result.data);
      res.json(updatedApplication);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Document upload endpoint - using Cloudinary
  app.post("/api/upload-document", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const fieldName = req.body.fieldName || "document";
      const userId = req.session.userId!;
      
      // Only allow image formats
      const mimetype = req.file.mimetype;
      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const isAllowedImage = allowedImageTypes.includes(mimetype);
      
      if (!isAllowedImage) {
        return res.status(400).json({ 
          error: "Only image formats are allowed (JPG, PNG, GIF, WebP)" 
        });
      }

      // Upload to Cloudinary with image resource type
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `admission-documents/${userId}`,
            public_id: `${fieldName}-${Date.now()}`,
            resource_type: "image",
            overwrite: false,
          },
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file!.buffer);
      });

      const result: any = await uploadPromise;

      res.json({
        url: result.secure_url,
        fileName: req.file.originalname,
        size: req.file.size,
        type: "image",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image: " + error.message });
    }
  });

  // Chat routes - Authenticated
  app.get("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const conversations = await storage.getConversationsByStudent(req.session.userId!);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const result = insertConversationSchema.safeParse({
        studentId: req.session.userId!,
        subject: req.body.subject,
      });

      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const conversation = await storage.createConversation(result.data);
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/chat/messages/:conversationId", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/messages", requireAuth, async (req, res) => {
    try {
      const result = insertMessageSchema.safeParse({
        conversationId: req.body.conversationId,
        senderId: req.session.userId!,
        message: req.body.message,
      });

      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const userMessage = await storage.createMessage(result.data);
      await storage.updateConversation(req.body.conversationId, {});
      
      // Generate AI chatbot response
      try {
        const courses = await storage.getAllCourses();
        const chatbotReply = await generateChatbotResponse(req.body.message, courses);
        
        if (chatbotReply.isRelevant) {
          const aiMessage = await storage.createMessage({
            conversationId: req.body.conversationId,
            senderId: "system",
            message: chatbotReply.response,
          });
          res.json({ userMessage, aiMessage });
        } else {
          res.json({ userMessage });
        }
      } catch (aiError: any) {
        console.error("AI response error:", aiError);
        res.json({ userMessage });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat routes - Guest (Unauthenticated)
  app.get("/api/chat/guest/conversations", async (req, res) => {
    try {
      const guestId = req.query.guestId as string;
      if (!guestId) {
        return res.status(400).json({ error: "Guest ID required" });
      }
      // For guests, create a special guest student ID from their guest ID
      const conversations = await storage.getConversationsByStudent(guestId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/guest/conversations", async (req, res) => {
    try {
      const guestId = req.body.guestId as string;
      if (!guestId || !req.body.subject) {
        return res.status(400).json({ error: "Guest ID and subject required" });
      }

      const result = insertConversationSchema.safeParse({
        studentId: guestId,
        subject: req.body.subject,
      });

      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const conversation = await storage.createConversation(result.data);
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/chat/guest/messages/:conversationId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/guest/messages", async (req, res) => {
    try {
      const guestId = req.body.guestId as string;
      if (!guestId) {
        return res.status(400).json({ error: "Guest ID required" });
      }

      const result = insertMessageSchema.safeParse({
        conversationId: req.body.conversationId,
        senderId: guestId,
        message: req.body.message,
      });

      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).toString() });
      }

      const userMessage = await storage.createMessage(result.data);
      await storage.updateConversation(req.body.conversationId, {});
      
      // Generate AI chatbot response
      try {
        const courses = await storage.getAllCourses();
        const chatbotReply = await generateChatbotResponse(req.body.message, courses);
        
        if (chatbotReply.isRelevant) {
          const aiMessage = await storage.createMessage({
            conversationId: req.body.conversationId,
            senderId: "system",
            message: chatbotReply.response,
          });
          res.json({ userMessage, aiMessage });
        } else {
          res.json({ userMessage });
        }
      } catch (aiError: any) {
        console.error("AI response error:", aiError);
        res.json({ userMessage });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/chat/conversations", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const conversations = await storage.getAllConversations();
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conv) => ({
          ...conv,
          messages: await storage.getMessagesByConversation(conv.id),
          student: await storage.getUser(conv.studentId),
        }))
      );
      res.json(conversationsWithMessages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/chat/conversations/:id/assign", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const conversation = await storage.updateConversation(req.params.id, {
        supportStaffId: req.body.supportStaffId || user.id,
      });

      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/chat/conversations/:id/close", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const conversation = await storage.updateConversation(req.params.id, {
        status: "closed",
      });

      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
