import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UnionCard from "@/components/union-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Unions() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data: unions = [], isLoading } = useQuery({
    queryKey: ["/api/unions", { category, search }],
  });

  const categories = [
    { value: "", label: "All Issues" },
    { value: "climate", label: "Climate" },
    { value: "housing", label: "Housing" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "labor", label: "Labor" },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Voting Unions</h1>
            <p className="text-muted-foreground">
              Join a union or create your own to organize around issues that matter
            </p>
          </div>
          <Link href="/unions/create">
            <Button data-testid="button-create-union">Create Union</Button>
          </Link>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search unions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
            data-testid="input-search-unions"
          />
        </div>

        <Tabs value={category} onValueChange={setCategory} className="mb-8">
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} data-testid={`tab-${cat.value || 'all'}`}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-center py-12" data-testid="loading-state">Loading...</div>
        ) : unions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No unions found</p>
            <Link href="/unions/create">
              <Button>Create the first union</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unions.map((union: any) => (
              <UnionCard key={union.id} union={union} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
