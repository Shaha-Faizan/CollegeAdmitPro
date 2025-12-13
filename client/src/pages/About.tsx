import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Award, Globe, Users } from "lucide-react";
import aboutImage from "@/attached_assets/generated_images/university_building_about_page.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-medium">About EduAdmit</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transforming the college admission experience with modern technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={aboutImage}
              alt="University Building"
              className="rounded-lg w-full h-auto"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-medium">Our Mission</h2>
            <p className="text-muted-foreground">
              At EduAdmit, we believe that the college admission process should be transparent,
              efficient, and accessible to everyone. Our platform streamlines the entire process,
              from application submission to final decision.
            </p>
            <p className="text-muted-foreground">
              We're committed to providing students with a seamless experience while helping
              educational institutions manage admissions more effectively.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Accreditation</h3>
              <p className="text-muted-foreground">
                Fully accredited by national and international education boards, ensuring
                the highest standards of quality education.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Global Recognition</h3>
              <p className="text-muted-foreground">
                Our platform serves students worldwide, partnering with leading institutions
                across continents.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Student-Centered</h3>
              <p className="text-muted-foreground">
                Every feature is designed with students in mind, making the admission process
                as smooth as possible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Excellence</h3>
              <p className="text-muted-foreground">
                Committed to academic excellence and helping students achieve their
                educational goals.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-medium">Our Vision</h2>
            <p className="text-muted-foreground text-lg">
              To become the leading admission management platform that empowers students
              worldwide to access quality education seamlessly. We envision a future where
              technology removes barriers and creates equal opportunities for all aspiring
              students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
