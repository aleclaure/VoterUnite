import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Events() {
  const [filter, setFilter] = useState("");
  const { toast } = useToast();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events", { eventType: filter }],
  });

  const handleRSVP = async (eventId: string) => {
    try {
      await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        body: { userId: "current-user-id", rsvpStatus: "going" },
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Success", description: "You've RSVP'd to this event!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to RSVP", variant: "destructive" });
    }
  };

  const eventTypeColors: any = {
    canvassing: "hsl(158, 64%, 52%)",
    town_hall: "hsl(221, 83%, 53%)",
    phone_bank: "hsl(262, 83%, 58%)",
    training: "hsl(43, 96%, 56%)",
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Community Events</h1>
            <p className="text-muted-foreground">Join local organizing activities</p>
          </div>
          <Button data-testid="button-create-event">Create Event</Button>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList>
            <TabsTrigger value="" data-testid="tab-all">All Events</TabsTrigger>
            <TabsTrigger value="canvassing" data-testid="tab-canvassing">Canvassing</TabsTrigger>
            <TabsTrigger value="town_hall" data-testid="tab-town-hall">Town Halls</TabsTrigger>
            <TabsTrigger value="phone_bank" data-testid="tab-phone-bank">Phone Banking</TabsTrigger>
            <TabsTrigger value="training" data-testid="tab-training">Training</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No events found</p>
            <Button>Create the first event</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: any) => {
              const eventDate = new Date(event.date);
              const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-6">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: eventTypeColors[event.eventType] || "hsl(221, 83%, 53%)" }}
                        >
                          {event.eventType[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-xs font-semibold px-3 py-1 rounded-full"
                              style={{
                                backgroundColor: `${eventTypeColors[event.eventType] || "hsl(221, 83%, 53%)"}20`,
                                color: eventTypeColors[event.eventType] || "hsl(221, 83%, 53%)",
                              }}
                            >
                              {event.eventType.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-muted-foreground">{dateStr}</span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground mb-2">{event.title}</h3>
                          {event.description && (
                            <p className="text-muted-foreground mb-4">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📍 {event.isVirtual ? 'Virtual' : event.location}</span>
                            <span>⏰ {timeStr}</span>
                            <span>👥 {event.attendeeCount} attending</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleRSVP(event.id)} data-testid={`button-rsvp-${event.id}`}>
                        RSVP
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
