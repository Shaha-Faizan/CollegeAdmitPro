export async function sendVerificationEmail(email: string, code: string) {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.warn("BREVO_API_KEY not configured. Skipping email send.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "EduAdmit",
          email: "faizanshaha21@gmail.com",
        },
        to: [
          {
            email: email,
            name: email.split("@")[0],
          },
        ],
        subject: "Your EduAdmit Verification Code",
        htmlContent: `
          <div style="background-color:#f4f7fb; padding:40px 0; font-family:Arial, sans-serif;">
            <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background:#1a73e8; padding:20px; text-align:center;">
                <h1 style="color:white; margin:0; font-size:24px; font-weight:600;">EduAdmit Verification</h1>
              </div>

              <!-- Body -->
              <div style="padding:30px;">
                <p style="font-size:16px; color:#333;">Hello,</p>

                <p style="font-size:16px; color:#555; line-height:1.6;">
                  Thank you for signing up for <strong>EduAdmit</strong>!
                  Please use the verification code below to confirm your email address:
                </p>

                <!-- OTP Box -->
                <div style="
                  background:#eef4ff;
                  padding:20px;
                  border-radius:8px;
                  text-align:center;
                  margin:30px 0;
                  border:1px solid #d6e2ff;
                ">
                  <span style="
                    font-size:36px;
                    font-weight:700;
                    color:#1a73e8;
                    letter-spacing:8px;
                  ">${code}</span>
                </div>

                <p style="font-size:15px; color:#666;">
                  This code is valid for <strong>10 minutes</strong>.
                </p>

                <p style="font-size:15px; color:#666; margin-top:20px;">
                  If you didn’t request this, you can safely ignore this email.
                </p>

                <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />

                <!-- Footer -->
                <p style="text-align:center; font-size:12px; color:#999;">
                  © 2025 EduAdmit. All rights reserved.<br />
                  This is an automated message — please do not reply.
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Brevo API error:", error);
      return { success: false, error: error.message || "Failed to send email" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
}
