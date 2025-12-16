import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-card-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md" data-testid="link-home">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-medium text-lg">EduAdmit</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-home-nav">Home</Link>
            <Link href="/about" className="text-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-about">About</Link>
            <Link href="/courses" className="text-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-courses">Courses</Link>
            <Link href="/contact" className="text-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-contact">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" data-testid="button-login">Login</Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="button-signup">Apply Now</Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-card-border">
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-home-mobile">Home</Link>
              <Link href="/about" className="text-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-about-mobile">About</Link>
              <Link href="/courses" className="text-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-courses-mobile">Courses</Link>
              <Link href="/contact" className="text-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-contact-mobile">Contact</Link>
              <Link href="/login">
                <Button variant="outline" className="w-full" data-testid="button-login-mobile">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full" data-testid="button-signup-mobile">Apply Now</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
