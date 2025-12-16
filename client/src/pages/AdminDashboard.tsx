import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Clock, XCircle, TrendingUp } from "lucide-react";
import type {  ApplicationDoc,  CourseDoc } from "@shared/schema";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, navigate] = useLocation();

  const { data: applications = [] } = useQuery<ApplicationDoc[]>({
    queryKey: ["/api/applications"],
  });

  const { data: courses = [] } = useQuery<CourseDoc[]>({
    queryKey: ["/api/courses"],
  });

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 } as Record<string, number>
  );

  const courseDistribution = courses.map(course => ({
    course: course.name,
    count: applications.filter(app => app.courseId === course._id).length,
  })).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...courseDistribution.map(c => c.count), 1);

  const stats = [
    { title: "Total Applications", value: applications.length.toString(), icon: FileText },
    { title: "Pending", value: statusCounts.pending.toString(), icon: Clock },
    { title: "Approved", value: statusCounts.approved.toString(), icon: CheckCircle2 },
    { title: "Rejected", value: statusCounts.rejected.toString(), icon: XCircle },
  ];

  const recentApplications = applications
    .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
    .slice(0, 5);

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    return course ? course.name : "Unknown";
  };

  const getPersonalDetails = (app: ApplicationDoc) => {
    try {
      return app.personalDetails ? JSON.parse(app.personalDetails) : {};
    } catch {
      return {};
    }
  };

  const getStudentName = (personalDetails: any) => {
    const { firstName = "", middleName = "", lastName = "" } = personalDetails;
    return [firstName, middleName, lastName].filter(Boolean).join(" ") || "Unknown";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-medium">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage applications and admissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {courseDistribution.length > 0 ? (
                <div className="space-y-4">
                  {courseDistribution.map((item) => (
                    <div key={item.course} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.course}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No application data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/courses")}
                  data-testid="button-manage-courses"
                >
                  Manage Courses
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/applications")}
                  data-testid="button-view-all-apps"
                >
                  View All Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/applications")}
                data-testid="button-view-all"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((app) => {
                  const personalDetails = getPersonalDetails(app);
                  return (
                    <div
                      key={app._id}
                      className="flex items-center justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{getStudentName(personalDetails)}</p>
                        <p className="text-sm text-muted-foreground">{getCourseName(app.courseId)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {app.submittedAt ? format(new Date(app.submittedAt), "MMM dd") : "N/A"}
                        </span>
                        <Badge variant={getStatusVariant(app.status)} data-testid={`badge-status-${app._id}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/applications/${app._id}`)}
                          data-testid={`button-view-${app._id}`}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No applications yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
