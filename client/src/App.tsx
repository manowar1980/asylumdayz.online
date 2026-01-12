import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AsylumAIChat } from "@/components/AsylumAIChat";

import Home from "@/pages/Home";
import Info from "@/pages/Info";
import Battlepass from "@/pages/Battlepass";
import Donate from "@/pages/Donate";
import Support from "@/pages/Support";
import Admin from "@/pages/Admin";
import Maps from "@/pages/Maps";
import Factions from "@/pages/Factions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/info" component={Info} />
      <Route path="/maps" component={Maps} />
      <Route path="/factions" component={Factions} />
      <Route path="/battlepass" component={Battlepass} />
      <Route path="/donate" component={Donate} />
      <Route path="/support" component={Support} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <AsylumAIChat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
