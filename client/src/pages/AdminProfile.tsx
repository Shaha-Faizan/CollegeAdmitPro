import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AdminProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "Administrator",
    email: user?.email || "admin@example.com",
    phone: "+1 (555) 000-0000",
    department: "Admissions",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile updated:", formData);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-medium">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your admin account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" data-testid="button-change-photo">Change Photo</Button>
                <p className="text-sm text-muted-foreground mt-2">
                  JPG or PNG. Max size 2MB
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  data-testid="input-fullname"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-email"
                  disabled
                />
                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  data-testid="input-department"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" data-testid="button-save">Save Changes</Button>
                <Button type="button" variant="outline" data-testid="button-cancel">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your account security settings
            </p>
            <Button variant="outline" data-testid="button-change-password">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
