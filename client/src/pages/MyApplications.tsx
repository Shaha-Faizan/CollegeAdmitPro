import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import type { ApplicationDoc, CourseDoc } from "@shared/schema";
import { format } from "date-fns";
import { ApplicationTimeline } from "@/components/ApplicationTimeline";
import { useState } from "react";
import { useLocation } from "wouter";

export default function MyApplications() {
  const [, navigate] = useLocation();
  const [selectedApp, setSelectedApp] = useState<ApplicationDoc | null>(null);

  const { data: applications = [], isLoading } = useQuery<ApplicationDoc[]>({
    queryKey: ["/api/applications"],
  });

  const { data: courses = [] } = useQuery<CourseDoc[]>({
    queryKey: ["/api/courses"],
  });

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    return course ? `${course.name} (${course.code})` : "Unknown Course";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
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
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-medium">My Applications</h1>
          <p className="text-muted-foreground">
            Track all your submitted applications
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">No applications yet</p>
                <p className="text-sm text-muted-foreground">
                  Start by submitting your first application
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app._id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">
                        {getCourseName(app.courseId)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Application ID: {app._id.slice(0, 8)}
                      </p>
                    </div>

                    <Badge
                      variant={getStatusVariant(app.status)}
                      data-testid={`badge-status-${app._id}`}
                    >
                      {getStatusIcon(app.status)}
                      <span className="ml-1">
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Submitted:</span>{" "}
                        {app.submittedAt
                          ? format(
                              new Date(app.submittedAt),
                              "MMM dd, yyyy"
                            )
                          : "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Last Update:</span>{" "}
                        {app.updatedAt
                          ? format(
                              new Date(app.updatedAt),
                              "MMM dd, yyyy"
                            )
                          : "N/A"}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                      data-testid={`button-view-${app._id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Timeline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Dialog */}
      <Dialog
        open={!!selectedApp}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedApp && getCourseName(selectedApp.courseId)}
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              <ApplicationTimeline application={selectedApp} />

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedApp(null);
                    navigate(
                      `/student/applications/${selectedApp._id}`
                    );
                  }}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
