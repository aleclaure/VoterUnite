import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Education() {
  const courses = [
    {
      id: 1,
      title: "Collective Voting 101",
      description: "Master the fundamentals of organizing voters, building coalitions, and negotiating with candidates.",
      duration: "4 hours",
      students: 12487,
      badge: "Featured",
    },
    {
      id: 2,
      title: "Organizing Skills",
      description: "Learn community organizing and recruitment strategies.",
      duration: "6 hours",
      students: 8432,
    },
    {
      id: 3,
      title: "Policy & Advocacy",
      description: "Understand policy and legislative processes to maximize impact.",
      duration: "5 hours",
      students: 9214,
    },
  ];

  const workshops = [
    {
      id: 1,
      title: "Building Your First Union",
      date: "Feb 15, 2024",
      time: "7:00 PM EST",
      type: "Virtual",
    },
    {
      id: 2,
      title: "Candidate Negotiations",
      date: "Feb 18, 2024",
      time: "6:30 PM EST",
      type: "Virtual",
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Education Hub</h1>
          <p className="text-muted-foreground">
            Learn how collective voting works and gain organizing skills
          </p>
        </div>

        <div className="gradient-primary rounded-xl p-8 text-white mb-12">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/20 rounded-full px-4 py-1 mb-4">
              <span className="text-sm font-semibold">Featured Course</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Collective Voting 101</h2>
            <p className="text-lg mb-6 text-white/90">
              Master the fundamentals of organizing voters, building coalitions, and negotiating with candidates.
            </p>
            <div className="flex items-center gap-6 mb-6 text-white/90">
              <span>⏱️ 4 hours</span>
              <span>👥 12,487 enrolled</span>
              <span>🏆 Certificate</span>
            </div>
            <Button size="lg" variant="secondary" data-testid="button-start-course">
              Start Learning
            </Button>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Course Categories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{course.description}</p>
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>⏱️ {course.duration}</p>
                    <p>👥 {course.students.toLocaleString()} enrolled</p>
                  </div>
                  <Button className="w-full" data-testid={`button-enroll-${course.id}`}>
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Live Workshops</h2>
          <div className="space-y-4">
            {workshops.map((workshop) => (
              <Card key={workshop.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {workshop.date.split(" ")[1].replace(",", "")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {workshop.date.split(" ")[0]}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{workshop.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workshop.time} • {workshop.type}
                        </p>
                      </div>
                    </div>
                    <Button data-testid={`button-rsvp-${workshop.id}`}>RSVP</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
