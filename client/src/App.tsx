import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, useState, createContext, useContext } from "react";
import { Route, Switch, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import FloatingChat from "./components/FloatingChat";

// Context to allow any page to open FloatingChat
export const ChatContext = createContext<{ openChat: () => void }>({ openChat: () => {} });
export function useChatContext() { return useContext(ChatContext); }

// Eagerly loaded (critical path)
import Home from "./pages/Home";
import NotFound from "@/pages/NotFound";

// Lazy loaded (non-critical, reduces initial bundle)
const Calculator = lazy(() => import("./pages/Calculator"));
const OrderForm = lazy(() => import("./pages/OrderForm"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminConversations = lazy(() => import("@/pages/AdminConversations"));
const TrackOrder = lazy(() => import("@/pages/TrackOrder"));
const Arrivage = lazy(() => import("@/pages/Arrivage"));
const AdminArrivage = lazy(() => import("@/pages/AdminArrivage"));
const History = lazy(() => import("./pages/History"));
const Orders = lazy(() => import("./pages/Orders"));
const Settings = lazy(() => import("./pages/Settings"));
const Chat = lazy(() => import("./pages/Chat"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));

// Loading fallback — minimal spinner matching dark theme
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2F7]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center animate-pulse" style={{ background: "#0070BA" }}>
          <span className="text-white font-black text-lg">B</span>
        </div>
        <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-[loading_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/calculator"} component={Calculator} />
          <Route path={"/order"} component={OrderForm} />
          <Route path={"/history"} component={History} />
          <Route path={"/orders"} component={Orders} />
          <Route path={"/settings"} component={Settings} />
          <Route path={"/chat"} component={Chat} />
          <Route path={"/admin"} component={AdminDashboard} />
          <Route path={"/admin/login"} component={AdminLogin} />
          <Route path={"/admin/conversations"} component={AdminConversations} />
          <Route path={"/track"} component={TrackOrder} />
          <Route path={"/confirmation"} component={OrderConfirmation} />
          <Route path={"/arrivage"} component={Arrivage} />
          <Route path={"/admin/arrivage"} component={AdminArrivage} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </Suspense>
  );
}

function FloatingChatWrapper({ chatOpen, setChatOpen }: { chatOpen: boolean; setChatOpen: (v: boolean) => void }) {
  const [location] = useLocation();
  // Hide floating button on home page — it has its own chat button in the hero
  const hideOnHome = location === "/";
  if (hideOnHome && !chatOpen) return null;
  return <FloatingChat externalOpen={chatOpen} onExternalOpenChange={setChatOpen} />;
}

function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <ChatContext.Provider value={{ openChat: () => setChatOpen(true) }}>
            <Toaster />
            <Router />
            <FloatingChatWrapper chatOpen={chatOpen} setChatOpen={setChatOpen} />
          </ChatContext.Provider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
