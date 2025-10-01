import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StatCard from "@/components/stat-card";
import { useState } from "react";

export default function Dashboard() {
  const [zipCode, setZipCode] = useState("");

  const { data: unions = [] } = useQuery({
    queryKey: ["/api/unions"],
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ["/api/candidates"],
  });

  const totalMembers = unions.reduce((sum: number, u: any) => sum + (u.memberCount || 0), 0);
  const totalPledges = unions.reduce((sum: number, u: any) => sum + (u.pledgedCount || 0), 0);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transparency Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time tracking of collective voting power and candidate commitments
          </p>
        </div>

        <div className="mb-8 max-w-md">
          <div className="flex gap-2">
            <Input
              placeholder="Enter ZIP code..."
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={5}
              data-testid="input-zip-code"
            />
            <Button data-testid="button-search-zip">Search</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            value={unions.length.toLocaleString()}
            label="Active Unions"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            }
          />
          <StatCard
            value={totalMembers.toLocaleString()}
            label="Total Members"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            value={totalPledges.toLocaleString()}
            label="Pledged Votes"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            value={candidates.length.toLocaleString()}
            label="Candidates Tracked"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>National Union Power Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <p className="text-muted-foreground">Interactive map showing union power by district</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Candidate Scorecard</h2>
          {candidates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No candidates tracked yet</p>
          ) : (
            <div className="space-y-4">
              {candidates.slice(0, 5).map((candidate: any) => (
                <Card key={candidate.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {candidate.party} • {candidate.position}
                        </p>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Alignment Score</span>
                            <span className="font-bold">{candidate.alignmentScore}%</span>
                          </div>
                          <Progress value={parseFloat(candidate.alignmentScore)} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {candidate.pledgeCount.toLocaleString()} pledged votes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
