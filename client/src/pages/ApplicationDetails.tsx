import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, XCircle, Download, Eye, X } from "lucide-react";
import type { ApplicationDoc, CourseDoc } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function ApplicationDetails() {
  const [, navigate] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const [viewingDocument, setViewingDocument] = useState<{url: string; name: string; type: string} | null>(null);

  const handleViewDocument = async (url: string, docName: string, isPdf: boolean) => {
    try {
      if (isPdf) {
        // For PDFs, fetch as blob to bypass CORS
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setViewingDocument({url: blobUrl, name: docName, type: 'pdf'});
      } else {
        // For images, use direct URL
        setViewingDocument({url, name: docName, type: 'image'});
      }
    } catch (error) {
      console.error('View error:', error);
      toast({
        title: "View failed",
        description: "Unable to open the document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const urlBlob = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Unable to download the file",
        variant: "destructive",
      });
    }
  };

  const { data: applications = [] } = useQuery<ApplicationDoc[]>({
    queryKey: ["/api/applications"],
  });

  const { data: courses = [] } = useQuery<CourseDoc[]>({
    queryKey: ["/api/courses"],
  });

  const application = applications.find(app => app._id === id);

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/applications/${data.id}`, { status: data.status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });

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

  const getAcademicDetails = (app: ApplicationDoc) => {
    try {
      return app.academicDetails ? JSON.parse(app.academicDetails) : {};
    } catch {
      return {};
    }
  };

  const getDocuments = (app: ApplicationDoc) => {
    try {
      return app.documents ? JSON.parse(app.documents) : {};
    } catch {
      return {};
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
        return "outline";
    }
  };

  const handleApprove = (appId: string) => {
    updateStatusMutation.mutate({ id: appId, status: "approved" });
  };

  const handleReject = (appId: string) => {
    updateStatusMutation.mutate({ id: appId, status: "rejected" });
  };

  if (!application) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Application not found</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const personalDetails = getPersonalDetails(application);
  const academicDetails = getAcademicDetails(application);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/dashboard")}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-medium">Application Details</h1>
          <p className="text-muted-foreground">Complete information about this student application</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="font-medium text-lg">{personalDetails.firstName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Middle Name</p>
                <p className="font-medium text-lg">{personalDetails.middleName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="font-medium text-lg">{personalDetails.lastName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium text-lg">{personalDetails.gender ? personalDetails.gender.charAt(0).toUpperCase() + personalDetails.gender.slice(1) : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium text-lg">{personalDetails.dateOfBirth || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile Number</p>
                <p className="font-medium text-lg">{personalDetails.mobileNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email ID</p>
                <p className="font-medium text-lg">{personalDetails.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alternate Mobile</p>
                <p className="font-medium text-lg">{personalDetails.alternateMobileNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aadhaar Number</p>
                <p className="font-medium text-lg">{personalDetails.aadhaarNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nationality</p>
                <p className="font-medium text-lg">{personalDetails.nationality || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Religion</p>
                <p className="font-medium text-lg">{personalDetails.religion || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium text-lg">{personalDetails.category ? personalDetails.category.toUpperCase() : "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-lg">{personalDetails.permanentAddress || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium text-lg">{personalDetails.state || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">District</p>
                    <p className="font-medium text-lg">{personalDetails.district || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium text-lg">{personalDetails.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pincode</p>
                    <p className="font-medium text-lg">{personalDetails.pincode || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              {personalDetails.temporaryAddress && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-3">Temporary Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-lg">{personalDetails.temporaryAddress || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent / Guardian Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Father's Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{academicDetails.fatherName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{academicDetails.fatherPhone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{academicDetails.fatherOccupation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Income</p>
                    <p className="font-medium">{academicDetails.fatherIncome || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-3">Mother's Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{academicDetails.motherName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{academicDetails.motherPhone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{academicDetails.motherOccupation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Income</p>
                    <p className="font-medium">{academicDetails.motherIncome || "N/A"}</p>
                  </div>
                </div>
              </div>

              {academicDetails.guardianName && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-3">Guardian Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{academicDetails.guardianName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relation</p>
                      <p className="font-medium">{academicDetails.guardianRelation || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{academicDetails.guardianPhone || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">10th Grade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">School Name</p>
                    <p className="font-medium">{academicDetails.tenthSchoolName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Board</p>
                    <p className="font-medium">{academicDetails.tenthBoard || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passing Year</p>
                    <p className="font-medium">{academicDetails.tenthPassingYear || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Percentage / CGPA</p>
                    <p className="font-medium">{academicDetails.tenthPercentage || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-3">12th Grade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">School/College Name</p>
                    <p className="font-medium">{academicDetails.twelfthSchoolName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Board</p>
                    <p className="font-medium">{academicDetails.twelfthBoard || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passing Year</p>
                    <p className="font-medium">{academicDetails.twelfthPassingYear || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stream</p>
                    <p className="font-medium">{academicDetails.twelfthStream || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Percentage / CGPA</p>
                    <p className="font-medium">{academicDetails.twelfthPercentage || "N/A"}</p>
                  </div>
                </div>
              </div>

              {academicDetails.graduationCollege && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-3">Graduation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">College/University</p>
                      <p className="font-medium">{academicDetails.graduationCollege || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Degree</p>
                      <p className="font-medium">{academicDetails.graduationDegree || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Branch / Stream</p>
                      <p className="font-medium">{academicDetails.graduationBranch || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mode</p>
                      <p className="font-medium">{academicDetails.graduationMode || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Passing Year</p>
                      <p className="font-medium">{academicDetails.graduationYear || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Percentage / CGPA</p>
                      <p className="font-medium">{academicDetails.graduationPercentage || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Desired Course</p>
                <p className="font-medium text-lg">{getCourseName(application.courseId)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Specialization</p>
                <p className="font-medium text-lg">{academicDetails.courseSpecialization || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mode</p>
                <p className="font-medium text-lg">{academicDetails.courseMode || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Applied Course</p>
                <p className="font-medium text-lg">{getCourseName(application.courseId)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Application Status</p>
                <Badge variant={getStatusVariant(application.status)} className="mt-2">
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted Date</p>
                <p className="font-medium text-lg">
                  {application.submittedAt ? format(new Date(application.submittedAt), "MMM dd, yyyy") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statement of Purpose</p>
                <p className="font-medium text-lg">{personalDetails.purposeStatement ? personalDetails.purposeStatement.substring(0, 100) + "..." : "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const docs = getDocuments(application);
              const allEntries = Object.entries(docs);
              const docEntries = allEntries.filter(([, doc]: any) => {
                if (!doc) return false;
                // Handle both old format (string URL) and new format (object with url)
                return typeof doc === 'string' || (typeof doc === 'object' && doc.url);
              });
              
              return docEntries.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {docEntries.map(([docType, doc]: any) => {
                    // Handle both formats: string (old) or object with name/size/url (new)
                    const docUrl = typeof doc === 'string' ? doc : doc.url;
                    const docName = typeof doc === 'string' ? docType : (doc.name || docType);
                    const docSize = typeof doc === 'string' ? 0 : (doc.size || 0);
                    
                    // Check extension from name or URL
                    const checkExtension = (str: string, exts: string[]) => {
                      return exts.some(ext => str.toLowerCase().includes(`.${ext}`));
                    };
                    
                    const isImage = checkExtension(docName, ['jpg', 'jpeg', 'png', 'gif']);
                    const isPdf = checkExtension(docName, ['pdf']);
                    
                    return (
                      <div key={docType} className="space-y-3 border rounded-lg p-4 bg-muted/30">
                        {/* Header: File Name + Buttons */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold capitalize">{docType.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-xs text-muted-foreground truncate" data-testid={`filename-${docType}`}>{docName}</p>
                            {docSize > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {(docSize / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button 
                              onClick={() => handleViewDocument(docUrl, docName, isPdf)}
                              className="p-2 hover:bg-muted rounded text-primary hover:text-primary/80 transition-colors"
                              data-testid={`link-preview-${docType}`}
                              title="View"
                              type="button"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDownload(docUrl, docName)}
                              className="p-2 hover:bg-muted rounded text-primary hover:text-primary/80 transition-colors"
                              data-testid={`link-download-${docType}`}
                              title="Download"
                              type="button"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Preview - Same as Admission Form */}
                        {isImage && docUrl ? (
                          <div className="h-48 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            <img
                              src={docUrl}
                              alt={docName}
                              className="h-full w-full object-cover"
                              data-testid={`img-preview-${docType}`}
                            />
                          </div>
                        ) : isPdf && docUrl ? (
                          <div className="h-48 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            <embed
                              src={`${docUrl}#toolbar=0`}
                              type="application/pdf"
                              className="h-full w-full"
                              data-testid={`pdf-preview-${docType}`}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No documents uploaded
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {application.status === "pending" && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <CardHeader>
              <CardTitle>Take Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Approve or reject this application</p>
              <div className="flex gap-3">
                <Button
                  variant="default"
                  onClick={() => handleApprove(application._id)}
                  disabled={updateStatusMutation.isPending}
                  data-testid="button-approve"
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {updateStatusMutation.isPending ? "Processing..." : "Approve"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(application._id)}
                  disabled={updateStatusMutation.isPending}
                  data-testid="button-reject"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {application.status !== "pending" && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Badge variant={getStatusVariant(application.status)} className="mb-2">
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
                <p className="text-muted-foreground">
                  This application has already been {application.status}.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Document Viewer Modal */}
      <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[70vh] flex items-center justify-center bg-muted rounded-lg overflow-hidden">
            {viewingDocument?.type === 'pdf' ? (
              <iframe
                src={viewingDocument.url}
                className="w-full h-full"
                title={viewingDocument.name}
              />
            ) : (
              <img
                src={viewingDocument?.url}
                alt={viewingDocument?.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
