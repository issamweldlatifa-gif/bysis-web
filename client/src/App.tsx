import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, useState, createContext, useContext } from "react";
import { CartProvider } from "./contexts/CartContext";
import { I18nProvider } from "./contexts/I18nContext";
import { Route, Switch, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "sonner";
// AIChat is lazy loaded below

// Context to allow any page to open AIChat
export const ChatContext = createContext<{ openChat: () => void; closeChat: () => void; chatOpen: boolean }>({ openChat: () => {}, closeChat: () => {}, chatOpen: false });
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
const ShipMasterDashboard = lazy(() => import("./pages/ShipMasterDashboard"));
const Parametres = lazy(() => import("./pages/Parametres"));
const Panier = lazy(() => import("./pages/Panier"));
const Scanner = lazy(() => import("./pages/Scanner"));
const Catalogue = lazy(() => import("./pages/Catalogue"));
const ProduitDetail = lazy(() => import("./pages/ProduitDetail"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

// Lazy load AIChat (only loaded when needed)
const AIChatLazy = lazy(() => import("./components/AIChat"));

// Import LoadingScreen
import LoadingScreen from "./components/LoadingScreen";

// Loading fallback — professional Bysis AI loading screen
function PageLoader() {
  return <LoadingScreen />;
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
          <Route path={"/suivi"} component={TrackOrder} />
          <Route path={"/confirmation"} component={OrderConfirmation} />
          <Route path={"/arrivage"} component={Arrivage} />
          <Route path={"/admin/arrivage"} component={AdminArrivage} />
          <Route path={"/admin/shipmaster"} component={ShipMasterDashboard} />
          <Route path={"/parametres"} component={Parametres} />
          <Route path={"/panier"} component={Panier} />
          <Route path={"/scanner"} component={Scanner} />
          <Route path={"/catalogue"} component={Catalogue} />
          <Route path={"/produit/:id"} component={ProduitDetail} />
          <Route path={"/admin/panel"} component={AdminPanel} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </Suspense>
  );
}

function AIChatWrapper({ chatOpen, setChatOpen }: { chatOpen: boolean; setChatOpen: (v: boolean) => void }) {
  return (
    <Suspense fallback={null}>
      <AIChatLazy isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </Suspense>
  );
}

function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <I18nProvider>
        <CartProvider>
        <TooltipProvider>
          <ChatContext.Provider value={{ openChat: () => setChatOpen(true), closeChat: () => setChatOpen(false), chatOpen }}>
            <Toaster />
            <Router />
            <AIChatWrapper chatOpen={chatOpen} setChatOpen={setChatOpen} />
          </ChatContext.Provider>
        </TooltipProvider>
        </CartProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
