import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen } from "lucide-react";

interface CourseCardProps {
  name: string;
  code: string;
  description: string;
  duration: string;
  degree: string;
}

export default function CourseCard({ name, code, description, duration, degree }: CourseCardProps) {
  return (
    <Card className="hover-elevate">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>{code}</CardDescription>
          </div>
          <div className="bg-primary/10 px-3 py-1 rounded-md">
            <span className="text-sm font-medium text-primary">{degree}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{degree}</span>
          </div>
        </div>
        <Button className="w-full" data-testid={`button-apply-${code}`}>Apply Now</Button>
      </CardContent>
    </Card>
  );
}
