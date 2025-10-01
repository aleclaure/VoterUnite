import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Profile() {
  const mockUser = {
    username: "voter123",
    email: "voter@example.com",
    fullName: "John Doe",
    district: "CA-12",
    state: "California",
    zipCode: "94102",
  };

  const stats = {
    unionsJoined: 3,
    pledgesMade: 5,
    eventsAttended: 12,
  };

  const badges = [
    { type: "first_union", label: "First Union" },
    { type: "pledged", label: "Pledged" },
    { type: "organizer", label: "Organizer" },
  ];

  const myUnions = [
    { id: 1, name: "Climate Action Now", category: "climate", joinedAt: "2024-01-15" },
    { id: 2, name: "Affordable Housing Coalition", category: "housing", joinedAt: "2024-02-01" },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                {mockUser.fullName?.split(' ').map(n => n[0]).join('') || mockUser.username[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="profile-name">
                  {mockUser.fullName || mockUser.username}
                </h1>
                <p className="text-muted-foreground">{mockUser.email}</p>
                {mockUser.district && (
                  <p className="text-sm text-muted-foreground mt-1">
                    📍 {mockUser.district}, {mockUser.state}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl" data-testid="stat-unions">{stats.unionsJoined}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Unions Joined</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl" data-testid="stat-pledges">{stats.pledgesMade}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pledges Made</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl" data-testid="stat-events">{stats.eventsAttended}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Events Attended</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badges Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {badges.map((badge) => (
                <div key={badge.type} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{badge.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Unions</CardTitle>
          </CardHeader>
          <CardContent>
            {myUnions.length === 0 ? (
              <p className="text-muted-foreground">You haven't joined any unions yet</p>
            ) : (
              <div className="space-y-3">
                {myUnions.map((union) => (
                  <div key={union.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">{union.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Member since {new Date(union.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/unions/${union.id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" data-testid="button-settings">
              ⚙️ Settings
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-help">
              ❓ Help & Support
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive" data-testid="button-signout">
              🚪 Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
