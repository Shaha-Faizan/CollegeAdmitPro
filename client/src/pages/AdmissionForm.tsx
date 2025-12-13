import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText, CheckCircle, Loader2 } from "lucide-react";
import type { Course, PersonalDetails, ParentGuardianDetails, AcademicDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentFile {
  name: string;
  size: number;
  url?: string;
}

interface DocumentState {
  passportPhoto?: DocumentFile;
  aadhaarFront?: DocumentFile;
  aadhaarBack?: DocumentFile;
  tenthMarksheet?: DocumentFile;
  twelfthMarksheet?: DocumentFile;
  casteCertificate?: DocumentFile;
  domicileCertificate?: DocumentFile;
}

export default function AdmissionForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [uploadingField, setUploadingField] = useState<keyof DocumentState | null>(null);
  
  // File input refs to prevent auto-fill
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const [personalData, setPersonalData] = useState<PersonalDetails>({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    mobileNumber: "",
    email: "",
    alternateMobileNumber: "",
    aadhaarNumber: "",
    nationality: "",
    religion: "",
    category: "",
    permanentAddress: "",
    temporaryAddress: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
  });

  const [parentData, setParentData] = useState<ParentGuardianDetails>({
    fatherName: "",
    fatherPhone: "",
    fatherOccupation: "",
    fatherIncome: "",
    motherName: "",
    motherPhone: "",
    motherOccupation: "",
    motherIncome: "",
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
  });

  const [academicData, setAcademicData] = useState<AcademicDetails>({
    tenthSchoolName: "",
    tenthBoard: "",
    tenthPassingYear: "",
    tenthPercentage: "",
    twelfthSchoolName: "",
    twelfthBoard: "",
    twelfthPassingYear: "",
    twelfthStream: "",
    twelfthPercentage: "",
    graduationCollege: "",
    graduationDegree: "",
    graduationBranch: "",
    graduationMode: "",
    graduationYear: "",
    graduationPercentage: "",
    courseId: "",
    courseSpecialization: "",
    courseMode: "",
  });

  const [documents, setDocuments] = useState<DocumentState>({});

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });


  const createApplicationMutation = useMutation({
    mutationFn: async () => {
      const submissionData: any = {
        courseId: academicData.courseId,
        personalDetails: JSON.stringify(personalData),
        academicDetails: JSON.stringify({ ...parentData, ...academicData }),
      };

      // Prepare full document objects for storage (with name, size, url)
      if (Object.keys(documents).length > 0) {
        const docObjects: Record<string, any> = {};
        for (const [key, doc] of Object.entries(documents)) {
          if (doc?.url) {
            docObjects[key] = {
              name: doc.name,
              size: doc.size,
              url: doc.url,
            };
          }
        }
        if (Object.keys(docObjects).length > 0) {
          submissionData.documents = JSON.stringify(docObjects);
        }
      }

      return await apiRequest("POST", "/api/applications", submissionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully",
      });
      setLocation("/student/my-applications");
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (key: keyof DocumentState, file: File) => {
    if (!file) return;

    try {
      // Frontend validation - only allow specific image formats
      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      
      if (!allowedImageTypes.includes(file.type)) {
        toast({
          title: "Invalid file format",
          description: "Only JPG, PNG, GIF, and WebP image formats are allowed",
          variant: "destructive",
        });
        // Reset the specific input
        const inputElement = fileInputRefs.current[key as string];
        if (inputElement) {
          inputElement.value = "";
        }
        return;
      }

      // Validate file size (max 10MB)
      const maxSizeInBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        toast({
          title: "File too large",
          description: "File size must not exceed 10MB",
          variant: "destructive",
        });
        // Reset the specific input
        const inputElement = fileInputRefs.current[key as string];
        if (inputElement) {
          inputElement.value = "";
        }
        return;
      }

      setUploadingField(key);

      // Upload to backend which will store in Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fieldName", key);

      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      // Update only this specific field, don't touch others
      setDocuments(prevDocuments => ({
        ...prevDocuments,
        [key]: {
          name: file.name,
          size: file.size,
          url: data.url,
        },
      }));

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
      // Reset the specific input
      const inputElement = fileInputRefs.current[key as string];
      if (inputElement) {
        inputElement.value = "";
      }
    }
  };

  const removeFile = (key: keyof DocumentState) => {
    // Update state with a new object, removing only this key
    setDocuments(prevDocuments => {
      const newDocs = { ...prevDocuments };
      delete newDocs[key];
      return newDocs;
    });
    
    // Reset the specific input
    const inputElement = fileInputRefs.current[key as string];
    if (inputElement) {
      inputElement.value = "";
    }
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!academicData.courseId) {
      toast({
        title: "Course required",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }
    if (!personalData.firstName || !personalData.email || !personalData.mobileNumber) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required personal information",
        variant: "destructive",
      });
      return;
    }
    createApplicationMutation.mutate();
  };

  const progress = (step / 6) * 100;

  const FileUploadField = ({
    label,
    fieldKey,
    accept,
    maxSize,
    required = false,
  }: {
    label: string;
    fieldKey: keyof DocumentState;
    accept: string;
    maxSize: string;
    required?: boolean;
  }) => {
    const file = documents[fieldKey];
    const isUploading = uploadingField === fieldKey;
    const isImage = file?.name?.match(/\.(jpg|jpeg|png|gif)$/i);
    const isPdf = file?.name?.match(/\.pdf$/i);

    return (
      <div className="space-y-2">
        <Label>{label} {required && "*"}</Label>
        {!file ? (
          <label
            className="block border-2 border-dashed border-muted-foreground rounded-lg p-6 text-center hover-elevate cursor-pointer transition-colors hover:border-primary relative"
            data-testid={`upload-${fieldKey}`}
          >
            <input
              ref={(el) => {
                fileInputRefs.current[fieldKey] = el;
              }}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileUpload(fieldKey, selectedFile);
                }
              }}
              disabled={isUploading}
            />
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 mx-auto mb-2 text-primary animate-spin" />
                <p className="text-sm font-medium">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Max {maxSize}</p>
              </>
            )}
          </label>
        ) : (
          <div className="space-y-3 bg-muted/50 p-4 rounded-lg border border-border">
            {/* Preview */}
            {isImage && file.url ? (
              <div className="h-48 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-full w-full object-cover"
                  data-testid={`img-preview-${fieldKey}`}
                />
              </div>
            ) : isPdf && file.url ? (
              <div className="h-48 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <embed
                  src={file.url}
                  type="application/pdf"
                  className="h-full w-full"
                  data-testid={`pdf-preview-${fieldKey}`}
                />
              </div>
            ) : null}

            {/* File Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" data-testid={`filename-${fieldKey}`}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(fieldKey)}
                data-testid={`remove-${fieldKey}`}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="sticky top-0 z-10 bg-background pt-4 pb-2">
          <h1 className="text-3xl font-bold">College Admission Application</h1>
          <p className="text-muted-foreground">Complete all steps to submit your application</p>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-primary">Step {step} of 6</p>
                  <p className="text-xs text-muted-foreground">
                    {step === 1 && "Personal Information"}
                    {step === 2 && "Address Details"}
                    {step === 3 && "Parent / Guardian Details"}
                    {step === 4 && "Academic History"}
                    {step === 5 && "Course Selection"}
                    {step === 6 && "Documents Upload"}
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                  
                  <div className="bg-muted/50 rounded-lg p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-base mb-4">Full Name</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={personalData.firstName}
                            onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                            data-testid="input-firstname"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="middleName">Middle Name</Label>
                          <Input
                            id="middleName"
                            placeholder="Kumar"
                            value={personalData.middleName}
                            onChange={(e) => setPersonalData({ ...personalData, middleName: e.target.value })}
                            data-testid="input-middlename"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={personalData.lastName}
                            onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                            data-testid="input-lastname"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender *</Label>
                          <Select
                            value={personalData.gender}
                            onValueChange={(value) => setPersonalData({ ...personalData, gender: value })}
                          >
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={personalData.dateOfBirth}
                            onChange={(e) => setPersonalData({ ...personalData, dateOfBirth: e.target.value })}
                            data-testid="input-dob"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nationality">Nationality *</Label>
                          <Input
                            id="nationality"
                            placeholder="Indian"
                            value={personalData.nationality}
                            onChange={(e) => setPersonalData({ ...personalData, nationality: e.target.value })}
                            data-testid="input-nationality"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="religion">Religion</Label>
                          <Input
                            id="religion"
                            placeholder="Optional"
                            value={personalData.religion}
                            onChange={(e) => setPersonalData({ ...personalData, religion: e.target.value })}
                            data-testid="input-religion"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={personalData.category}
                            onValueChange={(value) => setPersonalData({ ...personalData, category: value })}
                          >
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="obc">OBC</SelectItem>
                              <SelectItem value="sc">SC</SelectItem>
                              <SelectItem value="st">ST</SelectItem>
                              <SelectItem value="ews">EWS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                          <Input
                            id="aadhaarNumber"
                            placeholder="12-digit Aadhaar"
                            value={personalData.aadhaarNumber}
                            onChange={(e) => setPersonalData({ ...personalData, aadhaarNumber: e.target.value })}
                            data-testid="input-aadhaar"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email ID *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={personalData.email}
                            onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                            data-testid="input-email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mobileNumber">Mobile Number *</Label>
                          <Input
                            id="mobileNumber"
                            placeholder="10-digit mobile"
                            value={personalData.mobileNumber}
                            onChange={(e) => setPersonalData({ ...personalData, mobileNumber: e.target.value })}
                            data-testid="input-mobile"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="alternateMobileNumber">Alternate Mobile Number</Label>
                          <Input
                            id="alternateMobileNumber"
                            placeholder="Optional"
                            value={personalData.alternateMobileNumber}
                            onChange={(e) => setPersonalData({ ...personalData, alternateMobileNumber: e.target.value })}
                            data-testid="input-alternate-mobile"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Details */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-6">Address Information</h2>

                  <div className="bg-muted/50 rounded-lg p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-base mb-4">Permanent Address</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="permanentAddress">Address *</Label>
                          <Textarea
                            id="permanentAddress"
                            placeholder="Enter your complete address"
                            value={personalData.permanentAddress}
                            onChange={(e) => setPersonalData({ ...personalData, permanentAddress: e.target.value })}
                            rows={3}
                            data-testid="input-permanent-address"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              placeholder="Maharashtra"
                              value={personalData.state}
                              onChange={(e) => setPersonalData({ ...personalData, state: e.target.value })}
                              data-testid="input-state"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="district">District *</Label>
                            <Input
                              id="district"
                              placeholder="Mumbai"
                              value={personalData.district}
                              onChange={(e) => setPersonalData({ ...personalData, district: e.target.value })}
                              data-testid="input-district"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              placeholder="Mumbai"
                              value={personalData.city}
                              onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                              data-testid="input-city"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                              id="pincode"
                              placeholder="400001"
                              value={personalData.pincode}
                              onChange={(e) => setPersonalData({ ...personalData, pincode: e.target.value })}
                              data-testid="input-pincode"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Temporary Address (if different)</h3>
                      <div className="space-y-2">
                        <Label htmlFor="temporaryAddress">Address</Label>
                        <Textarea
                          id="temporaryAddress"
                          placeholder="Leave blank if same as permanent"
                          value={personalData.temporaryAddress}
                          onChange={(e) => setPersonalData({ ...personalData, temporaryAddress: e.target.value })}
                          rows={3}
                          data-testid="input-temporary-address"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Parent/Guardian Details */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-6">Parent / Guardian Information</h2>

                  <div className="bg-muted/50 rounded-lg p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-base mb-4">Father's Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fatherName">Name</Label>
                          <Input
                            id="fatherName"
                            placeholder="Father's name"
                            value={parentData.fatherName}
                            onChange={(e) => setParentData({ ...parentData, fatherName: e.target.value })}
                            data-testid="input-father-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherPhone">Phone</Label>
                          <Input
                            id="fatherPhone"
                            placeholder="Phone number"
                            value={parentData.fatherPhone}
                            onChange={(e) => setParentData({ ...parentData, fatherPhone: e.target.value })}
                            data-testid="input-father-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherOccupation">Occupation</Label>
                          <Input
                            id="fatherOccupation"
                            placeholder="Occupation"
                            value={parentData.fatherOccupation}
                            onChange={(e) => setParentData({ ...parentData, fatherOccupation: e.target.value })}
                            data-testid="input-father-occupation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherIncome">Annual Income</Label>
                          <Input
                            id="fatherIncome"
                            placeholder="Annual income"
                            value={parentData.fatherIncome}
                            onChange={(e) => setParentData({ ...parentData, fatherIncome: e.target.value })}
                            data-testid="input-father-income"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Mother's Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="motherName">Name</Label>
                          <Input
                            id="motherName"
                            placeholder="Mother's name"
                            value={parentData.motherName}
                            onChange={(e) => setParentData({ ...parentData, motherName: e.target.value })}
                            data-testid="input-mother-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherPhone">Phone</Label>
                          <Input
                            id="motherPhone"
                            placeholder="Phone number"
                            value={parentData.motherPhone}
                            onChange={(e) => setParentData({ ...parentData, motherPhone: e.target.value })}
                            data-testid="input-mother-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherOccupation">Occupation</Label>
                          <Input
                            id="motherOccupation"
                            placeholder="Occupation"
                            value={parentData.motherOccupation}
                            onChange={(e) => setParentData({ ...parentData, motherOccupation: e.target.value })}
                            data-testid="input-mother-occupation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherIncome">Annual Income</Label>
                          <Input
                            id="motherIncome"
                            placeholder="Annual income"
                            value={parentData.motherIncome}
                            onChange={(e) => setParentData({ ...parentData, motherIncome: e.target.value })}
                            data-testid="input-mother-income"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Guardian Details (if applicable)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guardianName">Name</Label>
                          <Input
                            id="guardianName"
                            placeholder="Guardian's name (optional)"
                            value={parentData.guardianName}
                            onChange={(e) => setParentData({ ...parentData, guardianName: e.target.value })}
                            data-testid="input-guardian-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardianRelation">Relation</Label>
                          <Input
                            id="guardianRelation"
                            placeholder="Relation (optional)"
                            value={parentData.guardianRelation}
                            onChange={(e) => setParentData({ ...parentData, guardianRelation: e.target.value })}
                            data-testid="input-guardian-relation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardianPhone">Phone</Label>
                          <Input
                            id="guardianPhone"
                            placeholder="Phone (optional)"
                            value={parentData.guardianPhone}
                            onChange={(e) => setParentData({ ...parentData, guardianPhone: e.target.value })}
                            data-testid="input-guardian-phone"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Academic Details */}
            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-6">Academic History</h2>

                  <div className="bg-muted/50 rounded-lg p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-base mb-4">10th Grade</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tenthSchoolName">School Name *</Label>
                          <Input
                            id="tenthSchoolName"
                            placeholder="School name"
                            value={academicData.tenthSchoolName}
                            onChange={(e) => setAcademicData({ ...academicData, tenthSchoolName: e.target.value })}
                            data-testid="input-tenth-school"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenthBoard">Board *</Label>
                          <Input
                            id="tenthBoard"
                            placeholder="CBSE / ICSE / State"
                            value={academicData.tenthBoard}
                            onChange={(e) => setAcademicData({ ...academicData, tenthBoard: e.target.value })}
                            data-testid="input-tenth-board"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenthPassingYear">Passing Year *</Label>
                          <Input
                            id="tenthPassingYear"
                            placeholder="2020"
                            value={academicData.tenthPassingYear}
                            onChange={(e) => setAcademicData({ ...academicData, tenthPassingYear: e.target.value })}
                            data-testid="input-tenth-year"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenthPercentage">Percentage / CGPA *</Label>
                          <Input
                            id="tenthPercentage"
                            placeholder="85.5"
                            value={academicData.tenthPercentage}
                            onChange={(e) => setAcademicData({ ...academicData, tenthPercentage: e.target.value })}
                            data-testid="input-tenth-percentage"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">12th Grade</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="twelfthSchoolName">School/College Name *</Label>
                          <Input
                            id="twelfthSchoolName"
                            placeholder="School/College name"
                            value={academicData.twelfthSchoolName}
                            onChange={(e) => setAcademicData({ ...academicData, twelfthSchoolName: e.target.value })}
                            data-testid="input-twelfth-school"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twelfthBoard">Board *</Label>
                          <Input
                            id="twelfthBoard"
                            placeholder="CBSE / ICSE / State"
                            value={academicData.twelfthBoard}
                            onChange={(e) => setAcademicData({ ...academicData, twelfthBoard: e.target.value })}
                            data-testid="input-twelfth-board"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twelfthPassingYear">Passing Year *</Label>
                          <Input
                            id="twelfthPassingYear"
                            placeholder="2022"
                            value={academicData.twelfthPassingYear}
                            onChange={(e) => setAcademicData({ ...academicData, twelfthPassingYear: e.target.value })}
                            data-testid="input-twelfth-year"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twelfthStream">Stream *</Label>
                          <Select
                            value={academicData.twelfthStream}
                            onValueChange={(value) => setAcademicData({ ...academicData, twelfthStream: value })}
                          >
                            <SelectTrigger data-testid="select-stream">
                              <SelectValue placeholder="Select stream" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="commerce">Commerce</SelectItem>
                              <SelectItem value="arts">Arts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twelfthPercentage">Percentage / CGPA *</Label>
                          <Input
                            id="twelfthPercentage"
                            placeholder="88.5"
                            value={academicData.twelfthPercentage}
                            onChange={(e) => setAcademicData({ ...academicData, twelfthPercentage: e.target.value })}
                            data-testid="input-twelfth-percentage"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Graduation (if applicable)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="graduationCollege">College/University Name</Label>
                          <Input
                            id="graduationCollege"
                            placeholder="College name"
                            value={academicData.graduationCollege}
                            onChange={(e) => setAcademicData({ ...academicData, graduationCollege: e.target.value })}
                            data-testid="input-graduation-college"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationDegree">Degree</Label>
                          <Select
                            value={academicData.graduationDegree}
                            onValueChange={(value) => setAcademicData({ ...academicData, graduationDegree: value })}
                          >
                            <SelectTrigger data-testid="select-degree">
                              <SelectValue placeholder="Select degree" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bsc">BSc</SelectItem>
                              <SelectItem value="ba">BA</SelectItem>
                              <SelectItem value="bcom">BCom</SelectItem>
                              <SelectItem value="bca">BCA</SelectItem>
                              <SelectItem value="btech">BTech</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationBranch">Branch / Stream</Label>
                          <Input
                            id="graduationBranch"
                            placeholder="Branch name"
                            value={academicData.graduationBranch}
                            onChange={(e) => setAcademicData({ ...academicData, graduationBranch: e.target.value })}
                            data-testid="input-graduation-branch"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationMode">Mode</Label>
                          <Select
                            value={academicData.graduationMode}
                            onValueChange={(value) => setAcademicData({ ...academicData, graduationMode: value })}
                          >
                            <SelectTrigger data-testid="select-graduation-mode">
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="distance">Distance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Passing Year</Label>
                          <Input
                            id="graduationYear"
                            placeholder="2023"
                            value={academicData.graduationYear}
                            onChange={(e) => setAcademicData({ ...academicData, graduationYear: e.target.value })}
                            data-testid="input-graduation-year"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationPercentage">Percentage / CGPA</Label>
                          <Input
                            id="graduationPercentage"
                            placeholder="7.8"
                            value={academicData.graduationPercentage}
                            onChange={(e) => setAcademicData({ ...academicData, graduationPercentage: e.target.value })}
                            data-testid="input-graduation-percentage"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Course Selection */}
            {step === 5 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-6">Course Selection</h2>

                  <div className="bg-muted/50 rounded-lg p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="course">Desired Course *</Label>
                      <Select
                        value={academicData.courseId}
                        onValueChange={(value) => setAcademicData({ ...academicData, courseId: value })}
                      >
                        <SelectTrigger data-testid="select-course">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name} ({course.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="courseSpecialization">Specialization</Label>
                        <Input
                          id="courseSpecialization"
                          placeholder="If any"
                          value={academicData.courseSpecialization}
                          onChange={(e) => setAcademicData({ ...academicData, courseSpecialization: e.target.value })}
                          data-testid="input-specialization"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="courseMode">Mode</Label>
                        <Select
                          value={academicData.courseMode}
                          onValueChange={(value) => setAcademicData({ ...academicData, courseMode: value })}
                        >
                          <SelectTrigger data-testid="select-course-mode">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="distance">Distance</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Document Upload */}
            {step === 6 && (
              <div className="space-y-8">
                {/* Document Review Section */}
                {Object.keys(documents).length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Your Uploaded Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(documents).map(([key, doc]) => {
                        const isImage = doc.name?.match(/\.(jpg|jpeg|png|gif)$/i);
                        const documentLabels: Record<string, string> = {
                          passportPhoto: "Passport Photo",
                          aadhaarFront: "Aadhaar Front",
                          aadhaarBack: "Aadhaar Back",
                          tenthMarksheet: "10th Marksheet",
                          twelfthMarksheet: "12th Marksheet",
                          casteCertificate: "Caste Certificate",
                          domicileCertificate: "Domicile Certificate",
                        };

                        return (
                          <Card key={key} className="overflow-hidden hover-elevate">
                            <CardContent className="p-4 space-y-3">
                              {/* Document Preview */}
                              {isImage && doc.url ? (
                                <div className="h-40 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                                  <img
                                    src={doc.url}
                                    alt={doc.name}
                                    className="h-full w-full object-cover"
                                    data-testid={`preview-${key}`}
                                  />
                                </div>
                              ) : (
                                <div className="h-40 bg-muted rounded-lg flex flex-col items-center justify-center">
                                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                                  <p className="text-xs text-muted-foreground text-center">PDF Document</p>
                                </div>
                              )}

                              {/* Document Info */}
                              <div className="space-y-1">
                                <p className="text-sm font-semibold truncate" data-testid={`doc-label-${key}`}>
                                  {documentLabels[key] || key}
                                </p>
                                <p className="text-xs text-muted-foreground truncate" data-testid={`doc-name-${key}`}>
                                  {doc.name}
                                </p>
                                <p className="text-xs text-muted-foreground" data-testid={`doc-size-${key}`}>
                                  {(doc.size / 1024).toFixed(2)} KB
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                {doc.url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => window.open(doc.url, "_blank")}
                                    data-testid={`button-view-${key}`}
                                  >
                                    View
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => removeFile(key as keyof DocumentState)}
                                  data-testid={`button-reupload-${key}`}
                                >
                                  Re-upload
                                </Button>
                              </div>

                              {/* Upload Status */}
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs pt-2 border-t">
                                <CheckCircle className="h-4 w-4" />
                                <span>Uploaded</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold mb-6">Upload More Documents</h2>

                  <div className="bg-muted/50 rounded-lg p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-base mb-4">Personal Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUploadField
                          label="Passport Size Photo"
                          fieldKey="passportPhoto"
                          accept="image/jpeg,image/png"
                          maxSize="200 KB"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Identity Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUploadField
                          label="Aadhaar Front"
                          fieldKey="aadhaarFront"
                          accept="image/jpeg,image/png,application/pdf"
                          maxSize="1 MB"
                        />
                        <FileUploadField
                          label="Aadhaar Back"
                          fieldKey="aadhaarBack"
                          accept="image/jpeg,image/png,application/pdf"
                          maxSize="1 MB"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Academic Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUploadField
                          label="10th Marksheet"
                          fieldKey="tenthMarksheet"
                          accept="image/jpeg,image/png,application/pdf"
                          maxSize="5 MB"
                        />
                        <FileUploadField
                          label="12th Marksheet"
                          fieldKey="twelfthMarksheet"
                          accept="image/jpeg,image/png,application/pdf"
                          maxSize="5 MB"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Certificates (if applicable)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUploadField
                          label="Caste Certificate"
                          fieldKey="casteCertificate"
                          accept="image/jpeg,image/png,application/pdf"
                          maxSize="2 MB"
                        />
                        <FileUploadField
                          label="Domicile Certificate"
                          fieldKey="domicileCertificate"
                          accept="image/jpeg,image/png,application/pdf"
                          maxSize="2 MB"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <FileText className="inline h-4 w-4 mr-2" />
                        Upload files in JPG, PNG, or PDF format. Each document is uploaded securely to our cloud storage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                data-testid="button-back"
              >
                Back
              </Button>
              {step < 6 ? (
                <Button onClick={handleNext} data-testid="button-next">
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  data-testid="button-submit"
                  disabled={createApplicationMutation.isPending}
                >
                  {createApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
