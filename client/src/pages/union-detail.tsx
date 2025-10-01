import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UnionDetail() {
  const [, params] = useRoute("/unions/:id");
  const unionId = params?.id;
  const { toast } = useToast();

  const { data: union, isLoading } = useQuery({
    queryKey: ["/api/unions", unionId],
    enabled: !!unionId,
  });

  const { data: demands = [] } = useQuery({
    queryKey: ["/api/unions", unionId, "demands"],
    enabled: !!unionId,
  });

  const handleJoin = async () => {
    try {
      await apiRequest(`/api/unions/${unionId}/join`, {
        method: "POST",
        body: { userId: "current-user-id" },
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/unions", unionId] });
      toast({ title: "Success", description: "You've joined the union!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to join union", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!union) {
    return <div className="min-h-screen flex items-center justify-center">Union not found</div>;
  }

  const categoryColors: any = {
    climate: "hsl(158, 64%, 52%)",
    housing: "hsl(221, 83%, 53%)",
    healthcare: "hsl(262, 83%, 58%)",
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: categoryColors[union.category] || "hsl(221, 83%, 53%)" }}
            >
              {union.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="union-name">{union.name}</h1>
              <p className="text-muted-foreground">{union.scope} • {union.category}</p>
            </div>
          </div>
          {union.description && (
            <p className="text-muted-foreground mb-6">{union.description}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl" data-testid="union-members">{union.memberCount.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl" data-testid="union-pledged">{union.pledgedCount.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pledged Votes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl" data-testid="union-power">{union.powerIndex}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Union Power</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Union Power Index</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={parseFloat(union.powerIndex)} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {union.powerIndex}% of voters in this district are unionized
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Demands</CardTitle>
          </CardHeader>
          <CardContent>
            {demands.length === 0 ? (
              <p className="text-muted-foreground">No demands yet</p>
            ) : (
              <div className="space-y-4">
                {demands.slice(0, 5).map((demand: any) => (
                  <div key={demand.id}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{demand.demandText}</p>
                      <span className="text-sm text-muted-foreground">{demand.supportPercentage}%</span>
                    </div>
                    <Progress value={parseFloat(demand.supportPercentage)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleJoin} className="w-full" size="lg" data-testid="button-join-union">
          Join Union
        </Button>
      </div>
    </div>
  );
}
