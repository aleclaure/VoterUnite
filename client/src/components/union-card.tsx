import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UnionCardProps {
  union: {
    id: string;
    name: string;
    category: string;
    scope: string;
    memberCount: number;
    pledgedCount: number;
    districtCount: number;
    powerIndex: string;
  };
}

export default function UnionCard({ union }: UnionCardProps) {
  const categoryColors: any = {
    climate: "hsl(158, 64%, 52%)",
    housing: "hsl(221, 83%, 53%)",
    healthcare: "hsl(262, 83%, 58%)",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`union-card-${union.id}`}>
      <div className="h-2" style={{ backgroundColor: categoryColors[union.category] || "hsl(221, 83%, 53%)" }} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2" data-testid="union-name">{union.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
              <span data-testid="union-scope">{union.scope}</span>
              <span>•</span>
              <span data-testid="union-category">{union.category}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Union Power</span>
            <span className="font-bold text-foreground" data-testid="union-power">{union.powerIndex}%</span>
          </div>
          <Progress value={parseFloat(union.powerIndex)} />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-foreground" data-testid="union-members">{union.memberCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground" data-testid="union-pledged">{union.pledgedCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Pledged</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground" data-testid="union-districts">{union.districtCount}</div>
            <div className="text-xs text-muted-foreground">Districts</div>
          </div>
        </div>
        
        <Button asChild className="w-full" data-testid="button-join-union">
          <Link href={`/unions/${union.id}`}>
            <a>Join Union</a>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
