import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "verification">("form");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"checking" | "available" | "taken" | null>(null);
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes("@")) {
      setEmailStatus(null);
      return;
    }

    setEmailStatus("checking");

    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/auth/check-email/${encodeURIComponent(email)}`);
        const data = await response.json();
        setEmailStatus(data.available ? "available" : "taken");
      } catch (error) {
        console.error("Email check failed:", error);
        setEmailStatus(null);
      }
    }, 500); // Debounce 500ms

    setEmailCheckTimeout(timeout);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    checkEmailAvailability(email);
  };

  const sendVerificationCode = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    setSendingCode(true);
    try {
      const response = await fetch("/api/verification/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep("verification");
        toast({ title: "Code sent", description: `Verification code sent to ${formData.email}` });
      } else {
        toast({ title: "Failed", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyEmailAndCreateAccount = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify code first
      const verifyResponse = await fetch("/api/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: verificationCode,
          email: formData.email,
        }),
      });

      if (!verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        throw new Error(verifyData.error || "Verification failed");
      }

      // Email verified, now create account
      await register(formData.email, formData.password, formData.fullName);
      toast({
        title: "Account created!",
        description: "Welcome to EduAdmit",
      });
      setLocation("/student/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
      setStep("form");
      setVerificationCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailStatus === "taken") {
      toast({
        title: "Email already registered",
        description: "This email is already associated with an account. Please use a different email or try logging in.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fullName || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Send verification code instead of directly registering
    await sendVerificationCode();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-2xl font-medium">EduAdmit</span>
          </Link>
          <p className="text-muted-foreground">Create your student account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Start your admission journey today</CardDescription>
          </CardHeader>
          <CardContent>
            {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  data-testid="input-fullname"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    placeholder="john@example.com"
                    data-testid="input-email"
                    required
                    className={emailStatus === "taken" ? "border-destructive" : emailStatus === "available" ? "border-green-500" : ""}
                  />
                  {emailStatus === "checking" && (
                    <div className="flex items-center text-muted-foreground">
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                  )}
                  {emailStatus === "available" && (
                    <div className="flex items-center text-green-600" data-testid="icon-email-available">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {emailStatus === "taken" && (
                    <div className="flex items-center text-destructive" data-testid="icon-email-taken">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {emailStatus === "taken" && (
                  <p className="text-sm text-destructive" data-testid="text-email-taken">
                    This email is already registered
                  </p>
                )}
                {emailStatus === "available" && (
                  <p className="text-sm text-green-600" data-testid="text-email-available">
                    Email is available
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  data-testid="input-password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  data-testid="input-confirm-password"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" data-testid="button-signup" disabled={isLoading || sendingCode}>
                {sendingCode ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending code...</> : "Continue"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary hover-elevate px-1 rounded" data-testid="link-login">
                  Sign in
                </Link>
              </div>
            </form>
            ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Verify Your Email</h3>
                <p className="text-sm text-muted-foreground">We sent a 6-digit code to {formData.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                  maxLength={6}
                  data-testid="input-verification-code"
                />
              </div>
              <Button
                onClick={verifyEmailAndCreateAccount}
                className="w-full"
                disabled={isLoading}
                data-testid="button-verify-email"
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating Account...</> : "Create Account"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep("form");
                  setVerificationCode("");
                }}
                data-testid="button-back"
              >
                Back
              </Button>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
