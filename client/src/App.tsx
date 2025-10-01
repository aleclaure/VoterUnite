import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Unions from "@/pages/unions";
import UnionDetail from "@/pages/union-detail";
import PostDetail from "@/pages/post-detail";
import Dashboard from "@/pages/dashboard";
import Education from "@/pages/education";
import Events from "@/pages/events";
import Profile from "@/pages/profile";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
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
        <Route path="/posts/:id" component={PostDetail} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/education" component={Education} />
        <Route path="/events" component={Events} />
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/sign-in" component={SignIn} />
        <Route path="/sign-up" component={SignUp} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
