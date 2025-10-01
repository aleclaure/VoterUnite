import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const { data: myUnions = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "unions"],
    enabled: !!user?.id,
  });

  const { data: myPledges = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "pledges"],
    enabled: !!user?.id,
  });

  const { data: myBadges = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "badges"],
    enabled: !!user?.id,
  });

  const stats = {
    unionsJoined: myUnions.length,
    pledgesMade: myPledges.length,
    eventsAttended: 0,
  };

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="profile-name">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
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

        {myBadges.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {myBadges.map((badge: any) => (
                  <div key={badge.badgeType} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{badge.badgeType}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Unions</CardTitle>
          </CardHeader>
          <CardContent>
            {myUnions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't joined any unions yet</p>
                <Link href="/unions">
                  <Button>Browse Unions</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myUnions.map((union: any) => (
                  <div key={union.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">{union.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {union.category} • {union.memberCount || 0} members
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
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive" 
              onClick={handleSignOut}
              data-testid="button-signout-profile"
            >
              🚪 Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
