import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

// User Pages
import PollList from "@/pages/user/poll-list";
import ParticipatePoll from "@/pages/user/participate-poll";
import Leaderboard from "@/pages/user/leaderboard";
import UserProfile from "@/pages/user/user-profile";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import CreatePoll from "@/pages/admin/create-poll";
import ViewResults from "@/pages/admin/view-results";
import UserManagement from "@/pages/admin/user-management";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={PollList} />
      <Route path="/polls/:id" component={ParticipatePoll} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/user-profile/:name" component={UserProfile} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/create" component={CreatePoll} />
      <ProtectedRoute path="/admin/results/:id" component={ViewResults} />
      <ProtectedRoute path="/admin/users" component={UserManagement} />
      
      {/* Auth Route (only needed for admin login) */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
