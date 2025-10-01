import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Unions from "@/pages/unions";
import UnionDetail from "@/pages/union-detail";
import Dashboard from "@/pages/dashboard";
import Education from "@/pages/education";
import Events from "@/pages/events";
import Profile from "@/pages/profile";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/unions" component={Unions} />
        <Route path="/unions/:id" component={UnionDetail} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/education" component={Education} />
        <Route path="/events" component={Events} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
