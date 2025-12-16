import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "@shared/schema";

/* ---------------- Environment ---------------- */

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error(
    "MONGO_URI must be set. Did you forget to configure MongoDB?"
  );
}

/* ---------------- Connection Options ---------------- */

const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/* ---------------- Connect DB ---------------- */

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI, connectionOptions);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

/* ---------------- Disconnect DB ---------------- */

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting MongoDB:", error);
  }
};

/* ---------------- Seed Database ---------------- */

export const seedDatabase = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({
      email: "admin@example.com",
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        email: "admin@example.com",
        password: hashedPassword,
        fullName: "Admin User",
        role: "admin",
      });

      console.log("✅ Admin created: admin@example.com / admin123");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  }
};

/* ---------------- Mongoose Events ---------------- */

mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected");
});

mongoose.connection.on("error", (err) => {
  console.error("🔥 Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose disconnected");
});

/* ---------------- Graceful Shutdown ---------------- */

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

/* ---------------- Export Mongoose ---------------- */

export { mongoose };
