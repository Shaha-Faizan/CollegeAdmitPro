import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("student");
  const [studentData, setStudentData] = useState({ email: "", password: "" });
  const [adminData, setAdminData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(studentData.email, studentData.password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
      setLocation(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(adminData.email, adminData.password);
      if (user.role !== "admin") {
        throw new Error("Access denied. Admin credentials required.");
      }
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
      setLocation("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid admin credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/">
            <a className="inline-flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md">
              <GraduationCap className="h-10 w-10 text-primary" />
              <span className="text-2xl font-medium">EduAdmit</span>
            </a>
          </Link>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" data-testid="tab-student">Student</TabsTrigger>
            <TabsTrigger value="admin" data-testid="tab-admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Login</CardTitle>
                <CardDescription>Access your student dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      value={studentData.email}
                      onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                      placeholder="student@example.com"
                      data-testid="input-student-email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentData.password}
                      onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                      placeholder="••••••••"
                      data-testid="input-student-password"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" data-testid="button-student-login" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link href="/signup">
                      <a className="text-primary hover-elevate px-1 rounded" data-testid="link-signup">
                        Sign up
                      </a>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Access the admin dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      placeholder="admin@example.com"
                      data-testid="input-admin-email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      placeholder="••••••••"
                      data-testid="input-admin-password"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" data-testid="button-admin-login" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
