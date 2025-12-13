import CourseCard from '../CourseCard';

export default function CourseCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
      <CourseCard
        name="Computer Science"
        code="CS101"
        description="Learn programming, algorithms, and software development"
        duration="4 years"
        degree="Bachelor's"
      />
      <CourseCard
        name="Business Administration"
        code="BA201"
        description="Master business fundamentals and management skills"
        duration="4 years"
        degree="Bachelor's"
      />
      <CourseCard
        name="Data Science"
        code="DS301"
        description="Analytics, machine learning, and big data processing"
        duration="2 years"
        degree="Master's"
      />
    </div>
  );
}
