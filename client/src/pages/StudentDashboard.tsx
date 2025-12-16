import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatWidget } from "@/components/ChatWidget";
import {
  FileText,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import type { ApplicationDoc, CourseDoc } from "@shared/schema";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { data: applications = [] } = useQuery<ApplicationDoc[]>({
    queryKey: ["/api/applications"],
  });

  const { data: courses = [] } = useQuery<CourseDoc[]>({
    queryKey: ["/api/courses"],
  });

  const latestApplication = applications[0];

  const latestCourse = latestApplication
    ? courses.find(c => c._id === latestApplication.courseId)
    : null;

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const quickActions = [
    {
      title: "Fill Application",
      icon: FileText,
      href: "/student/application",
    },
    {
      title: "Update Profile",
      icon: User,
      href: "/student/profile",
    },
  ];

  return (
    <DashboardLayout role="student">
      <ChatWidget />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-medium">Welcome Back!</h1>
          <p className="text-muted-foreground">
            Here's your application overview
          </p>
        </div>

        {latestApplication && latestCourse ? (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>Latest Application</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {latestCourse.name}
                  </p>
                </div>

                <Badge
                  variant={
                    latestApplication.status === "approved"
                      ? "default"
                      : latestApplication.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {latestApplication.status === "pending" ? (
                    <Clock className="h-3 w-3 mr-1" />
                  ) : latestApplication.status === "approved" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {latestApplication.status.charAt(0).toUpperCase() +
                    latestApplication.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Submitted:{" "}
                  {latestApplication.submittedAt
                    ? format(
                        new Date(latestApplication.submittedAt),
                        "MMM dd, yyyy"
                      )
                    : "N/A"}
                </span>

                <Link href="/student/my-applications">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  No applications yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Get started by submitting your first application
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Total Applications
                </p>
                <p className="text-2xl font-medium">
                  {applications.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-medium">
                  {statusCounts.pending || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-medium">
                  {statusCounts.approved || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Quick access
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
