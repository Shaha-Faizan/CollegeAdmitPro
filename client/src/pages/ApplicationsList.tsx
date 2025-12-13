import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, CheckCircle2, XCircle } from "lucide-react";
import type { Application, Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ApplicationsList() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Status updated",
        description: "Application status has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : "Unknown";
  };

  const getCourseCode = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.code : "N/A";
  };

  const getPersonalDetails = (app: Application) => {
    try {
      return app.personalDetails ? JSON.parse(app.personalDetails) : {};
    } catch {
      return {};
    }
  };

  const getStudentName = (personalDetails: any) => {
    const { firstName = "", middleName = "", lastName = "" } = personalDetails;
    return [firstName, middleName, lastName].filter(Boolean).join(" ") || "N/A";
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

  const filteredApplications = applications.filter((app) => {
    const personalDetails = getPersonalDetails(app);
    const courseName = getCourseName(app.courseId);
    
    const studentName = getStudentName(personalDetails);
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (personalDetails.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: "rejected" });
  };

  const handleViewDetails = (appId: string) => {
    navigate(`/admin/applications/${appId}`);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-medium">Applications</h1>
          <p className="text-muted-foreground">Review and manage student applications</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading applications...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => {
                      const personalDetails = getPersonalDetails(app);
                      return (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium" data-testid={`cell-student-${app.id}`}>
                            {getStudentName(personalDetails)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {personalDetails.email || "N/A"}
                          </TableCell>
                          <TableCell>{getCourseName(app.courseId)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {app.submittedAt ? format(new Date(app.submittedAt), "MMM dd, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(app.status)} data-testid={`badge-status-${app.id}`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(app.id)}
                                data-testid={`button-view-${app.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {app.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleApprove(app.id)}
                                    data-testid={`button-approve-${app.id}`}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleReject(app.id)}
                                    data-testid={`button-reject-${app.id}`}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredApplications.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No applications found</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
