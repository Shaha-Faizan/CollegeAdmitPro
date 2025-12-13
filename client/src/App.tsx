import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ChatWidget } from "@/components/ChatWidget";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Courses from "@/pages/Courses";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import StudentDashboard from "@/pages/StudentDashboard";
import StudentProfile from "@/pages/StudentProfile";
import AdmissionForm from "@/pages/AdmissionForm";
import MyApplications from "@/pages/MyApplications";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProfile from "@/pages/AdminProfile";
import ApplicationDetails from "@/pages/ApplicationDetails";
import ManageCourses from "@/pages/ManageCourses";
import ApplicationsList from "@/pages/ApplicationsList";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/courses" component={Courses} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/application" component={AdmissionForm} />
      <Route path="/student/my-applications" component={MyApplications} />
      
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/profile" component={AdminProfile} />
      <Route path="/admin/applications" component={ApplicationsList} />
      <Route path="/admin/applications/:id" component={ApplicationDetails} />
      <Route path="/admin/courses" component={ManageCourses} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
           <ChatWidget />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
