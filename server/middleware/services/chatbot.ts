import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Course } from "@shared/schema";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const COLLEGE_DOMAINS = [
  "admission",
  "course",
  "fees",
  "faculty",
  "scholarship",
  "eligibility",
  "application",
  "documents",
  "deadline",
  "qualification",
];

export interface ChatbotResponse {
  response: string;
  isRelevant: boolean;
}

function isCollegeRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return COLLEGE_DOMAINS.some((domain) => lowerMessage.includes(domain));
}

export async function generateChatbotResponse(
  userMessage: string,
  courseContext: Course[]
): Promise<ChatbotResponse> {
  try {
    // Check if message is college-related
    if (!isCollegeRelated(userMessage)) {
      return {
        response:
          "I can only help with questions about admissions, courses, fees, faculty, and scholarships. Please ask me something about these topics!",
        isRelevant: false,
      };
    }

    // Build course context for the AI
    const courseInfo = courseContext
      .map(
        (course) =>
          `Course: ${course.name} (${course.code})\nDegree: ${course.degree}\nDuration: ${course.duration}\nDescription: ${course.description}`
      )
      .join("\n\n");

    const systemPrompt = `You are a helpful college admission advisor chatbot. You help prospective students with questions about:
- Admissions process
- Courses and programs
- Fees and financial information
- Faculty information
- Scholarships and financial aid
- Eligibility requirements
- Application procedures

IMPORTANT RULES:
1. Only answer questions related to college admission, courses, fees, faculty, and scholarships
2. If a question is NOT about these topics, politely decline and redirect to admission-related topics
3. Use the college course information provided to give accurate answers
4. Be friendly, professional, and helpful
5. Keep responses concise (2-3 sentences max)
6. If you don't have information, suggest contacting the admission office

COLLEGE COURSES AND INFORMATION:
${courseInfo}

You are helping a prospective student. Be encouraging and supportive while maintaining professionalism.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    const response = result.response.text();

    return {
      response: response || "I couldn't generate a response. Please try again.",
      isRelevant: true,
    };
  } catch (error: any) {
    console.error("Chatbot error:", error);
    return {
      response:
        "Sorry, I'm experiencing technical difficulties. Please try again later or contact support.",
      isRelevant: false,
    };
  }
}
