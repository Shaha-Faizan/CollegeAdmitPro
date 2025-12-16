import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";

export default function Courses() {
  const courses = [
    {
      id: "bca",
      name: "Bachelor of Computer Applications (BCA)",
      code: "BCA",
      description:
        "Focuses on computer applications, programming languages, software development, and IT fundamentals.",
      duration: "3 years",
      degree: "Bachelor's",
    },
    {
      id: "bba",
      name: "Bachelor of Business Administration (BBA)",
      code: "BBA",
      description:
        "Covers business management, finance, marketing, entrepreneurship, and organizational skills.",
      duration: "3 years",
      degree: "Bachelor's",
    },
    {
      id: "mca",
      name: "Master of Computer Applications (MCA)",
      code: "MCA",
      description:
        "Advanced study of software development, databases, networking, cloud computing, and system design.",
      duration: "2 years",
      degree: "Master's",
    },
    {
      id: "mba",
      name: "Master of Business Administration (MBA)",
      code: "MBA",
      description:
        "Develops leadership, strategic thinking, business analytics, finance, and managerial expertise.",
      duration: "2 years",
      degree: "Master's",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-medium">Available Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our professionally designed programs to build a successful career
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </div>
  );
}
