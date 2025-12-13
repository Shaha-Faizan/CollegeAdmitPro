import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ManageCourses() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    duration: "",
    degree: "",
  });

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course created",
        description: "The course has been added successfully",
      });
      setDialogOpen(false);
      setFormData({ name: "", code: "", description: "", duration: "", degree: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest("PATCH", `/api/courses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course updated",
        description: "The course has been updated successfully",
      });
      setDialogOpen(false);
      setEditingCourse(null);
      setFormData({ name: "", code: "", description: "", duration: "", degree: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course deleted",
        description: "The course has been removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || "",
      duration: course.duration || "",
      degree: course.degree || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCourseToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete);
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCourse(null);
      setFormData({ name: "", code: "", description: "", duration: "", degree: "" });
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium">Manage Courses</h1>
            <p className="text-muted-foreground">Add, edit, or remove courses</p>
          </div>
          
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Course</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this course? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                  data-testid="button-cancel-delete"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  data-testid="button-confirm-delete"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-course">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? "Update the course details" : "Enter the details for the new course"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-course-name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    data-testid="input-course-code"
                    disabled={!!editingCourse}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 4 years"
                      data-testid="input-duration"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="e.g., Bachelor's"
                      data-testid="input-degree"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-save-course" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Course"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No courses available</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Degree</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.duration || "-"}</TableCell>
                      <TableCell>{course.degree || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(course)}
                            data-testid={`button-edit-${course.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(course.id)}
                            data-testid={`button-delete-${course.id}`}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
