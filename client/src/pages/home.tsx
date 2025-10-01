import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/stat-card";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-sm font-semibold">Join 127,543 organized voters</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Your Vote. <br/>
                <span className="gradient-primary bg-clip-text text-transparent">Your Union.</span> <br/>
                Your Power.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Join issue-based voting unions to collectively bargain with candidates, track commitments, and build real political leverage in your district.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/unions">
                  <Button size="lg" className="text-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create a Union
                  </Button>
                </Link>
                <Link href="/unions">
                  <Button variant="outline" size="lg" className="text-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Unions
                  </Button>
                </Link>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-foreground">1,247</div>
                  <div className="text-sm text-muted-foreground">Active Unions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">2.3M</div>
                  <div className="text-sm text-muted-foreground">Pledged Votes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">8,432</div>
                  <div className="text-sm text-muted-foreground">Commitments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How UnionVote Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to transform your individual vote into collective bargaining power
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Join or Create a Union</h3>
              <p className="text-muted-foreground">
                Choose an issue that matters to you—climate, housing, healthcare—and join others in your district.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Vote on Demands</h3>
              <p className="text-muted-foreground">
                Democratically decide your union's platform demands through internal voting on key policy positions.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Pledge Your Vote</h3>
              <p className="text-muted-foreground">
                Commit your vote only to candidates who meet your union's conditions. Track your collective leverage.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-chart-4/10 text-chart-4 flex items-center justify-center mb-4 text-2xl font-bold">4</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Hold Accountable</h3>
              <p className="text-muted-foreground">
                Track candidate commitments and legislative action. Withdraw pledges if promises are broken.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
