import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";

export default function Courses() {
  const courses = [
    {
      id: "1",
      name: "Computer Science",
      code: "CS101",
      description: "Learn programming, algorithms, data structures, and software development with hands-on projects",
      duration: "4 years",
      degree: "Bachelor's",
    },
    {
      id: "2",
      name: "Business Administration",
      code: "BA201",
      description: "Master business fundamentals, management, finance, and entrepreneurship skills",
      duration: "4 years",
      degree: "Bachelor's",
    },
    {
      id: "3",
      name: "Data Science",
      code: "DS301",
      description: "Advanced analytics, machine learning, big data processing, and AI applications",
      duration: "2 years",
      degree: "Master's",
    },
    {
      id: "4",
      name: "Mechanical Engineering",
      code: "ME101",
      description: "Design, analysis, and manufacturing of mechanical systems and products",
      duration: "4 years",
      degree: "Bachelor's",
    },
    {
      id: "5",
      name: "Psychology",
      code: "PSY101",
      description: "Study of human behavior, cognitive processes, and mental health",
      duration: "4 years",
      degree: "Bachelor's",
    },
    {
      id: "6",
      name: "Medicine",
      code: "MD501",
      description: "Comprehensive medical education covering diagnosis, treatment, and patient care",
      duration: "6 years",
      degree: "Doctor of Medicine",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-medium">Available Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of programs and find the perfect fit for your career goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </div>
  );
}
