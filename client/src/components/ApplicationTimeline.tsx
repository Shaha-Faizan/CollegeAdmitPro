import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import type { Application } from "@shared/schema";

interface TimelineEvent {
  status: string;
  date: Date;
  label: string;
}

export function ApplicationTimeline({ application }: { application: Application }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "submitted":
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200";
      case "submitted":
        return "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  // Build timeline events
  const events: TimelineEvent[] = [];
  
  // Application submitted event
  if (application.submittedAt) {
    events.push({
      status: "submitted",
      date: new Date(application.submittedAt),
      label: "Application Submitted",
    });
  }

  // Current status event
  const statusDate = application.updatedAt || application.submittedAt;
  if (statusDate) {
    events.push({
      status: application.status,
      date: new Date(statusDate),
      label: `Application ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`,
    });
  }

  // Sort events by date (oldest first)
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Application Timeline</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 to-primary/10" />

          {/* Timeline events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={index} className="flex gap-4 relative">
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center relative z-10">
                  {getStatusIcon(event.status)}
                </div>

                {/* Event content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium">{event.label}</h3>
                    <Badge
                      className={getStatusColor(event.status)}
                      variant="outline"
                      data-testid={`badge-timeline-${event.status}`}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(event.date, "PPP 'at' p")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Status Summary */}
      <div className={`p-4 rounded-lg ${getStatusColor(application.status)}`}>
        <h3 className="font-semibold mb-1">Current Status</h3>
        <p className="text-sm">
          Your application is currently{" "}
          <span className="font-medium">
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
          . {getStatusMessage(application.status)}
        </p>
      </div>
    </div>
  );
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "approved":
      return "Congratulations! Your application has been approved. You will receive further instructions via email.";
    case "pending":
      return "Your application is under review. Please check back later for updates.";
    case "rejected":
      return "Unfortunately, your application has been rejected. Please contact support for more information.";
    case "submitted":
      return "Your application has been successfully submitted and is waiting for review.";
    default:
      return "Thank you for applying.";
  }
}
