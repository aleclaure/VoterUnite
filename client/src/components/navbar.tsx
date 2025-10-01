import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/unions", label: "Unions" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/education", label: "Learn" },
    { href: "/events", label: "Events" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-foreground">UnionVote</span>
              </a>
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location === item.href ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/profile">
                <a>Sign In</a>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/unions">
                <a>Get Started</a>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
