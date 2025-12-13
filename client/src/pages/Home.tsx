import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import {
  CheckCircle,
  Clock,
  FileCheck,
  GraduationCap,
  TrendingUp,
  Users,
  Award,
  Globe,
} from "lucide-react";
import heroImage from "@/attached_assets/generated_images/modern_university_campus_hero.png";
import student1 from "@/attached_assets/generated_images/female_student_testimonial_photo.png";
import student2 from "@/attached_assets/generated_images/male_student_testimonial_photo.png";

// const HERO_IMAGE_URL = "/generated_images/modern_university_campus_hero.png";
// const STUDENT_1_URL = "/generated_images/female_student_testimonial_photo.png";
// const STUDENT_2_URL = "/generated_images/male_student_testimonial_photo.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section
        className="relative h-[60vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-medium text-white">
            Your Journey to Higher Education Starts Here
          </h1>
          <p className="text-xl text-white/90">
            Streamline your college admission process with our modern management system
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-primary/90 backdrop-blur-md" data-testid="button-hero-apply">
                Apply Now
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20" data-testid="button-hero-courses">
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">Why Choose EduAdmit?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience a seamless admission process with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Application</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Submit your application in minutes with our intuitive multi-step form
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Track Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor your application progress in real-time from your dashboard
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Quick Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get faster decisions with our efficient review and approval system
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">Admission Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to complete your application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with your email" },
              { step: "02", title: "Fill Application", desc: "Complete your details" },
              { step: "03", title: "Submit Documents", desc: "Upload required files" },
              { step: "04", title: "Get Admitted", desc: "Receive your decision" },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-medium text-primary">{item.step}</span>
                </div>
                <h3 className="font-medium text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-medium" data-testid="text-students-enrolled">25,000+</p>
              <p className="text-sm text-muted-foreground">Students Enrolled</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-medium" data-testid="text-courses-offered">150+</p>
              <p className="text-sm text-muted-foreground">Courses Offered</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-medium" data-testid="text-success-rate">95%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-medium" data-testid="text-years-experience">50+</p>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">What Our Students Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students who successfully navigated the admission process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={student1}
                    alt="Student"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      "The application process was incredibly smooth. I could track everything
                      in real-time and got my admission within a week!"
                    </p>
                    <div>
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">Computer Science Student</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={student2}
                    alt="Student"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      "The dashboard made it so easy to submit documents and communicate with
                      the admissions team. Highly recommended!"
                    </p>
                    <div>
                      <p className="font-medium">Michael Chen</p>
                      <p className="text-sm text-muted-foreground">Business Administration Student</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-medium">Ready to Begin Your Journey?</h2>
          <p className="text-lg text-primary-foreground/90">
            Join thousands of students who have successfully applied through our platform
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" data-testid="button-cta-apply">
                Apply Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-cta-contact"
              >
                Contact Admissions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-card-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-medium">EduAdmit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 EduAdmit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
