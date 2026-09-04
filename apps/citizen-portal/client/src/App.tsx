// Civic Editorial app routing: all citizen journeys share one shell while each module boundary remains easy for teammates to replace or extend.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import ReportIssue from "./pages/ReportIssue";
import MyComplaints from "./pages/MyComplaints";
import IssueDetails from "./pages/IssueDetails";
import Nearby from "./pages/Nearby";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";
import CityIntelligence from "./pages/CityIntelligence";
import NotFound from "./pages/NotFound";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/report" component={ReportIssue} />
    <Route path="/complaints" component={MyComplaints} />
    <Route path="/nearby" component={Nearby} />
    <Route path="/notifications" component={Notifications} />
    <Route path="/intelligence" component={CityIntelligence} />
    <Route path="/command-center" component={CityIntelligence} />
    <Route path="/login" component={() => <Auth mode="login" />} />
    <Route path="/register" component={() => <Auth mode="register" />} />
    <Route path="/issues/:id" component={IssueDetails} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><AuthProvider><TooltipProvider><Toaster position="top-right" /><Router /></TooltipProvider></AuthProvider></ThemeProvider></ErrorBoundary>;
}
