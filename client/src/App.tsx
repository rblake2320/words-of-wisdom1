import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Speakers from "./pages/Speakers";
import SpeakerDetail from "./pages/SpeakerDetail";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import JamesProfile from "./pages/JamesProfile";
import Navbar from "./components/Navbar";
import WelcomeScreen from "./components/WelcomeScreen";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <WelcomeScreen />
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/library" component={Library} />
        <Route path="/speakers" component={Speakers} />
        <Route path="/speakers/:name" component={SpeakerDetail} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/admin" component={Admin} />
        <Route path="/james" component={JamesProfile} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
