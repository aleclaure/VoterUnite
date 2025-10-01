import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-foreground text-card py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xl font-bold">UnionVote</span>
            </div>
            <p className="text-card/70 mb-4">
              Building collective political power through organized voting unions.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-card/70">
              <li><Link href="/unions" className="hover:text-card transition-colors">Browse Unions</Link></li>
              <li><Link href="/dashboard" className="hover:text-card transition-colors">Transparency Dashboard</Link></li>
              <li><Link href="/education" className="hover:text-card transition-colors">Education Hub</Link></li>
              <li><Link href="/events" className="hover:text-card transition-colors">Events</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-card/70">
              <li><a href="#" className="hover:text-card transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Organizing Guide</a></li>
              <li><a href="#" className="hover:text-card transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Success Stories</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-card/70">
              <li><a href="#" className="hover:text-card transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-card/20 pt-8 text-center text-card/70">
          <p>&copy; 2024 UnionVote. All rights reserved. Built for the people, by the people.</p>
        </div>
      </div>
    </footer>
  );
}
