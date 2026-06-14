'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  LayoutDashboard, Users, ShoppingBag, Truck, Bell, Search, RefreshCw,
  LogOut, Settings, Shield, BarChart2, Eye, Ban, CheckCircle, AlertTriangle,
  ChevronRight, X, Package, DollarSign, TrendingUp, MessageSquare,
  Clock, CreditCard, Warehouse, XCircle, Filter, Download, Menu, Tag, Bot,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import AdminSlides from "./AdminSlides";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminAiOrders from "./AdminAiOrders";
import AdminHomepage from "@/components/AdminHomepage";
import AdminSliders from "@/components/AdminSliders";

// Wrapper components for lazy rendering
function SlidesTabWrapper() { return <AdminSlides />; }
function ProductsTabWrapper() { return <AdminProducts />; }
function CategoriesTabWrapper() { return <AdminCategories />; }
function HomepageTabWrapper() { return <div className="space-y-8"><AdminHomepage /><AdminSliders /></div>; }

// ─── Color constants (light theme matching mockup) ────────────────────────────
const BG = "#F4F6F9";
const WHITE = "#FFFFFF";
const SIDEBAR_BG = "#1A2035";
const SIDEBAR_ACTIVE = "#1A1A1A";
const SIDEBAR_TEXT = "#A0AEC0";
const BLUE = "#1A1A1A";
const NAVY = "#1A1A1A";
const GREEN = "#00A651";
const RED = "#E53E3E";
const ORANGE = "#E67E22";
const AMBER = "#F59E0B";
const TEXT = "#1A202C";
const MUTED = "#718096";
const BORDER = "#E2E8F0";

// ─── Status configs ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:             { label: "Nouvelle",         color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  processing:      { label: "En traitement",    color: "#92400E", bg: "#FEF3C7", dot: "#F59E0B" },
  waiting_payment: { label: "Attente paiement", color: "#9A3412", bg: "#FFEDD5", dot: "#F97316" },
  shipped:         { label: "Expédiée",         color: "#5B21B6", bg: "#EDE9FE", dot: "#8B5CF6" },
  arrived:         { label: "Arrivée",          color: "#065F46", bg: "#D1FAE5", dot: "#10B981" },
  completed:       { label: "Livrée",           color: "#065F46", bg: "#D1FAE5", dot: "#00A651" },
  cancelled:       { label: "Annulée",          color: "#991B1B", bg: "#FEE2E2", dot: "#EF4444" },
};

const CLIENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Actif",     color: "#065F46", bg: "#D1FAE5" },
  suspended: { label: "Suspendu",  color: "#9A3412", bg: "#FFEDD5" },
  banned:    { label: "Banni",     color: "#991B1B", bg: "#FEE2E2" },
};

const PIE_COLORS = ["#3B82F6", "#F59E0B", "#F97316", "#8B5CF6", "#10B981", "#00A651", "#EF4444"];

type AdminTab = "dashboard" | "crm" | "orders" | "audit" | "settings" | "slides" | "products" | "categories" | "ai_orders" | "homepage";

// ─── Notification sound ───────────────────────────────────────────────────────
function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, config }: { status: string; config: Record<string, any> }) {
  const cfg = config[status] || { label: status, color: MUTED, bg: "#F7FAFC" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />}
      {cfg.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ShipMasterDashboard() {
  const { user } = useAuth();
  const { data: adminCheck, isLoading: adminLoading } = trpc.adminAuth.check.useQuery();
  const adminLogout = trpc.adminAuth.logout.useMutation({
    onSuccess: () => { navigate("/admin/login"); },
  });
  const isAuthenticated = adminCheck?.isAdmin || (user?.role === "admin");
  const logout = () => adminLogout.mutate();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const prevOrderCountRef = useRef<number | null>(null);

  // ── Queries ──
  const { data: stats, refetch: refetchStats } = trpc.analytics.getStats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: orders, refetch: refetchOrders } = trpc.orders.list.useQuery(undefined, { refetchInterval: 15000 });
  const { data: clients, refetch: refetchClients } = trpc.crm.list.useQuery(
    { search: clientSearch || undefined }, { refetchInterval: 30000 }
  );
  const { data: clientDetail } = trpc.crm.getById.useQuery(
    { id: selectedClient! }, { enabled: selectedClient !== null }
  );
  const { data: auditLogs } = trpc.auditLog.list.useQuery(
    { limit: 100 }, { enabled: tab === "audit" }
  );

  // ── Sound on new order ──
  useEffect(() => {
    if (!orders) return;
    const count = orders.length;
    if (prevOrderCountRef.current !== null && count > prevOrderCountRef.current) {
      const diff = count - prevOrderCountRef.current;
      playNotificationSound();
      toast.success(`🛒 ${diff} nouvelle${diff > 1 ? "s" : ""} commande${diff > 1 ? "s" : ""} reçue${diff > 1 ? "s" : ""}!`, { duration: 6000 });
    }
    prevOrderCountRef.current = count;
  }, [orders]);

  // ── Mutations ──
  const updateOrderFull = trpc.ordersAdmin.updateFull.useMutation({
    onSuccess: () => { toast.success("Commande mise à jour ✅"); refetchOrders(); setSelectedOrder(null); },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
  const updateClientStatus = trpc.crm.updateStatus.useMutation({
    onSuccess: () => { toast.success("Statut client mis à jour ✅"); refetchClients(); },
    onError: () => toast.error("Erreur"),
  });
  const updateClientNotes = trpc.crm.updateNotes.useMutation({
    onSuccess: () => toast.success("Notes sauvegardées ✅"),
  });

  // ── Filter orders ──
  const filteredOrders = useMemo(() => (orders || []).filter((o: any) => {
    const matchSearch = !orderSearch ||
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone?.includes(orderSearch) ||
      o.trackingCode?.includes(orderSearch);
    const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  }), [orders, orderSearch, orderStatusFilter]);

  const newOrdersCount = (orders || []).filter((o: any) => o.status === "new").length;

  // ── Auth guard ──
  if (!adminLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F6F9" }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full mx-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FEE2E2" }}>
            <Shield className="h-8 w-8" style={{ color: RED }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: TEXT }}>Accès restreint</h2>
          <p className="text-sm mb-6" style={{ color: MUTED }}>Réservé aux administrateurs Bysis</p>
          <Link href="/">
            <button className="w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-95"
              style={{ background: BLUE }}>Retour à l'accueil</button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Nav items ──
  const navItems: { id: AdminTab; icon: any; label: string; badge?: number }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de Bord" },
    { id: "crm",       icon: Users,           label: "CRM / Clients" },
    { id: "orders",    icon: ShoppingBag,     label: "Commandes", badge: newOrdersCount > 0 ? newOrdersCount : undefined },
    { id: "homepage",  icon: LayoutDashboard, label: "Homepage & Contenu" },
    { id: "audit",      icon: Shield,          label: "Journal d'Audit" },
    { id: "slides",     icon: LayoutDashboard, label: "Slides Carousel" },
    { id: "products",   icon: Package,         label: "Produits" },
    { id: "categories", icon: Tag,             label: "Catégories" },
    { id: "ai_orders",  icon: Bot,             label: "Commandes AI" },
    { id: "settings",   icon: Settings,        label: "Paramètres" },
  ];

  const handleTabChange = (t: AdminTab) => { setTab(t); setSidebarOpen(false); };

  return (
    <div className="min-h-screen flex" style={{ background: BG, fontFamily: "Inter, sans-serif" }}>

      {/* ── Sidebar overlay (mobile) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ width: 260, background: SIDEBAR_BG }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1A1A1A, #1A1A1A)" }}>B</div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Bysis</p>
            <p className="text-xs" style={{ color: SIDEBAR_TEXT }}>ShipMaster | CRM & Dashboard</p>
          </div>
          <button className="ml-auto md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label, badge }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => handleTabChange(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
                style={{
                  background: active ? "rgba(26,26,26,0.15)" : "transparent",
                  color: active ? "#60C8FF" : SIDEBAR_TEXT,
                  borderLeft: active ? `3px solid ${SIDEBAR_ACTIVE}` : "3px solid transparent",
                }}>
                <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white min-w-[20px] text-center"
                    style={{ background: "#E53E3E" }}>{badge}</span>
                )}
              </button>
            );
          })}

          <div className="pt-3 mt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs px-3 mb-2 uppercase tracking-wider font-semibold" style={{ color: "rgba(160,174,192,0.5)" }}>Accès rapide</p>
            <Link href="/admin/conversations">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{ color: SIDEBAR_TEXT }}>
                <MessageSquare style={{ width: 18, height: 18 }} />
                <span>Conversations</span>
              </button>
            </Link>
            <Link href="/admin/arrivage">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{ color: SIDEBAR_TEXT }}>
                <Package style={{ width: 18, height: 18 }} />
                <span>Arrivage</span>
              </button>
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={user?.avatarUrl || ""} />
              <AvatarFallback className="text-white text-sm font-bold" style={{ background: BLUE }}>
                {(user?.name || "A").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-xs" style={{ color: SIDEBAR_TEXT }}>Administrateur</p>
            </div>
          </div>
          <button onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:bg-red-500/10"
            style={{ color: "#FC8181" }}>
            <LogOut style={{ width: 16, height: 16 }} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: 0 }}>
        <div className="md:ml-[260px] flex flex-col min-h-screen">

          {/* ── Top Header ── */}
          <header className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 py-3"
            style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

            {/* Mobile menu */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" style={{ color: TEXT }} />
            </button>

            {/* Search */}
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: MUTED }} />
              <input
                placeholder="Rechercher commandes, clients..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                style={{ background: BG, border: `1.5px solid ${BORDER}`, color: TEXT }}
                onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.background = WHITE; }}
                onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.background = BG; }}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Refresh */}
              <button onClick={() => { refetchStats(); refetchOrders(); refetchClients(); toast.success("Actualisé"); }}
                className="p-2 rounded-xl transition-all hover:bg-gray-100" style={{ color: MUTED }}>
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl transition-all hover:bg-gray-100" style={{ color: MUTED }}>
                <Bell className="h-4 w-4" />
                {newOrdersCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: RED }} />
                )}
              </button>

              {/* Admin avatar */}
              <div className="flex items-center gap-2 pl-2" style={{ borderLeft: `1px solid ${BORDER}` }}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || ""} />
                  <AvatarFallback className="text-white text-xs font-bold" style={{ background: BLUE }}>
                    {(user?.name || "A").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold leading-tight" style={{ color: TEXT }}>{user?.name || "Admin"}</p>
                  <p className="text-xs" style={{ color: MUTED }}>Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* ── Page content ── */}
          <main className="flex-1 p-4 md:p-6">

            {/* Page title */}
            <div className="mb-6">
              <h1 className="text-xl font-bold" style={{ color: TEXT }}>
                {tab === "dashboard"  && "Tableau de Bord"}
                {tab === "crm"        && "CRM / Clients"}
                {tab === "orders"     && "Gestion des Commandes"}
                {tab === "homepage"   && "Homepage & Contenu"}
                {tab === "audit"      && "Journal d'Audit"}
                {tab === "slides"     && "Slides Carousel"}
                {tab === "products"   && "Catalogue Produits"}
                {tab === "categories" && "Catégories"}
                {tab === "ai_orders"  && "Commandes AI Chat"}
                {tab === "settings"   && "Paramètres"}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: MUTED }}>
                {tab === "dashboard"  && "Vue d'ensemble de votre activité"}
                {tab === "crm"        && "Gérez vos clients et leur historique"}
                {tab === "orders"     && "Suivez et mettez à jour les commandes"}
                {tab === "homepage"   && "Vidéos, textes, couleurs et magasins de la page d'accueil"}
                {tab === "audit"      && "Historique de toutes les actions admin"}
                {tab === "slides"     && "Gérez les slides de la page d'accueil"}
                {tab === "products"   && "Gérez votre catalogue de produits"}
                {tab === "categories" && "Organisez vos catégories de produits"}
                {tab === "ai_orders"  && "Commandes passées via le chat AI"}
                {tab === "settings"   && "Configuration de la plateforme"}
              </p>
            </div>

            {/* ═══════════════ DASHBOARD ═══════════════ */}
            {tab === "dashboard" && <DashboardTab stats={stats} orders={orders} clients={clients} />}

            {/* ═══════════════ CRM ═══════════════ */}
            {tab === "crm" && (
              <CRMTab
                clients={clients}
                clientSearch={clientSearch}
                setClientSearch={setClientSearch}
                selectedClient={selectedClient}
                setSelectedClient={setSelectedClient}
                clientDetail={clientDetail}
                onUpdateStatus={(id: number, status: string, reason?: string) => updateClientStatus.mutate({ id, status: status as any, reason })}
                onUpdateNotes={(id: number, notes: string) => updateClientNotes.mutate({ id, notes })}
                isPending={updateClientStatus.isPending}
                stats={stats}
              />
            )}

            {/* ═══════════════ ORDERS ═══════════════ */}
            {tab === "orders" && (
              <OrdersTab
                filteredOrders={filteredOrders}
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                orderStatusFilter={orderStatusFilter}
                setOrderStatusFilter={setOrderStatusFilter}
                onSelectOrder={setSelectedOrder}
              />
            )}

            {/* ═══════════════ HOMEPAGE ═══════════════ */}
            {tab === "homepage" && <HomepageTabWrapper />}
            {/* ═══════════════ AUDIT ═══════════════ */}
            {tab === "audit" && <AuditTab logs={auditLogs} />}

            {/* ═══════════════ SLIDES ═══════════════ */}
            {tab === "slides" && <SlidesTabWrapper />}

            {/* ═══════════════ PRODUCTS ═══════════════ */}
            {tab === "products" && <ProductsTabWrapper />}

            {/* ═══════════════ CATEGORIES ═══════════════ */}
            {tab === "categories" && <CategoriesTabWrapper />}

            {/* ═══════════════ AI ORDERS ═══════════════ */}
            {tab === "ai_orders" && <AdminAiOrders />}

            {/* ═══════════════ SETTINGS ═══════════════ */}
            {tab === "settings" && <SettingsTab />}

          </main>
        </div>
      </div>

      {/* ── Modals ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={(data: any) => updateOrderFull.mutate({ id: selectedOrder.id, ...data })}
          isPending={updateOrderFull.isPending}
        />
      )}
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ stats, orders, clients }: any) {
  const kpis = [
    { label: "Total Commandes Actives", value: (orders || []).filter((o: any) => !["completed","cancelled"].includes(o.status)).length, icon: ShoppingBag, color: BLUE, bg: "#EBF8FF" },
    { label: "Nouveaux Clients (Ce Mois)", value: stats?.thisMonth ?? 0, icon: Users, color: "#805AD5", bg: "#FAF5FF" },
    { label: "Total Revenu (DT)", value: `${stats?.monthRevenue ?? 0} DT`, icon: DollarSign, color: GREEN, bg: "#F0FFF4" },
    { label: "En Attente de Paiement", value: (orders || []).filter((o: any) => o.status === "waiting_payment").length, icon: CreditCard, color: ORANGE, bg: "#FFFAF0" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon style={{ width: 22, height: 22, color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: TEXT }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: TEXT }}>Commandes (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.dailyStats ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
              <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8 }} />
              <Bar dataKey="count" fill={BLUE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: TEXT }}>Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={Object.entries(stats?.statusBreakdown ?? {}).map(([status, count]) => ({ status, count }))}
                cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="status">
                {Object.keys(stats?.statusBreakdown ?? {}).map((_: string, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8 }} />
              <Legend formatter={(v: string) => STATUS_CONFIG[v]?.label || v} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders mini table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-sm" style={{ color: TEXT }}>Commandes Récentes</h3>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#EBF8FF", color: BLUE }}>
            {(orders || []).length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F7FAFC" }}>
                {["#", "Client", "Tracking", "Statut", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(orders || []).slice(0, 5).map((o: any) => (
                <tr key={o.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: MUTED }}>#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm" style={{ color: TEXT }}>{o.customerName}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{o.customerPhone || "—"}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: MUTED }}>{o.trackingCode || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} config={STATUS_CONFIG} /></td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
              {(orders || []).length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-sm" style={{ color: MUTED }}>Aucune commande</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── CRM Tab ──────────────────────────────────────────────────────────────────
function CRMTab({ clients, clientSearch, setClientSearch, selectedClient, setSelectedClient, clientDetail, onUpdateStatus, onUpdateNotes, isPending, stats }: any) {
  return (
    <div className="space-y-4">
      {/* Stats mini row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Commandes Actives", value: stats?.total ?? 0, icon: ShoppingBag, color: BLUE },
          { label: "Nouveaux Clients (Ce Mois)", value: stats?.thisMonth ?? 0, icon: Users, color: "#805AD5" },
          { label: "Total Revenu (DT)", value: `${stats?.monthRevenue ?? 0} DT`, icon: DollarSign, color: GREEN },
          { label: "Chariots en Attente", value: stats?.waitingPayment ?? 0, icon: CreditCard, color: ORANGE },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
            <Icon style={{ width: 20, height: 20, color, flexShrink: 0 }} />
            <div>
              <p className="font-bold text-lg leading-tight" style={{ color }}>{value}</p>
              <p className="text-xs" style={{ color: MUTED }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main CRM layout: table + side panel */}
      <div className="flex gap-4" style={{ minHeight: 500 }}>
        {/* Table */}
        <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
          {/* Search bar */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: MUTED }} />
              <input
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                placeholder="Numéro client..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{ background: BG, border: `1.5px solid ${BORDER}`, color: TEXT }}
              />
            </div>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ background: BLUE }}>
              Statistiques clients
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F7FAFC" }}>
                  {["ID Client", "Nom Complet", "Numéro", "Statut Compte", "Dernière Commande", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(clients || []).length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: MUTED }}>Aucun client trouvé</td></tr>
                ) : (clients || []).map((client: any, idx: number) => {
                  const isSelected = selectedClient === client.id;
                  return (
                    <tr key={client.id}
                      style={{
                        borderTop: `1px solid ${BORDER}`,
                        background: isSelected ? "#EBF8FF" : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedClient(isSelected ? null : client.id)}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: MUTED }}>{200 + idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarImage src={client.avatarUrl || ""} />
                            <AvatarFallback className="text-white text-xs font-bold" style={{ background: BLUE }}>
                              {(client.name || "?").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium" style={{ color: TEXT }}>{client.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: TEXT }}>{client.phone || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={client.accountStatus || "active"} config={CLIENT_STATUS_CONFIG} /></td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: MUTED }}>BSS-XXXXXX</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                            style={{ background: "#EBF8FF", color: BLUE }}
                            onClick={e => { e.stopPropagation(); setSelectedClient(client.id); }}>
                            <Eye style={{ width: 12, height: 12, display: "inline", marginRight: 3 }} />Voir
                          </button>
                          {client.accountStatus !== "banned" && (
                            <button className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: "#FEE2E2", color: RED }}
                              onClick={e => { e.stopPropagation(); onUpdateStatus(client.id, "banned", "Compte banni"); }}>
                              <Ban style={{ width: 12, height: 12, display: "inline", marginRight: 3 }} />Bannir
                            </button>
                          )}
                          {client.accountStatus === "banned" && (
                            <button className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: "#D1FAE5", color: GREEN }}
                              onClick={e => { e.stopPropagation(); onUpdateStatus(client.id, "active"); }}>
                              <CheckCircle style={{ width: 12, height: 12, display: "inline", marginRight: 3 }} />Activer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        {selectedClient !== null && clientDetail && (
          <ClientSidePanel
            client={clientDetail.client}
            orders={clientDetail.orders}
            onClose={() => setSelectedClient(null)}
            onUpdateStatus={(status: string, reason?: string) => onUpdateStatus(selectedClient, status, reason)}
            onUpdateNotes={(notes: string) => onUpdateNotes(selectedClient, notes)}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}

// ─── Client Side Panel ────────────────────────────────────────────────────────
function ClientSidePanel({ client, orders, onClose, onUpdateStatus, onUpdateNotes, isPending }: any) {
  const [notes, setNotes] = useState(client.notes || "");

  return (
    <div className="w-72 flex-shrink-0 rounded-2xl overflow-hidden flex flex-col"
      style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}`, background: "linear-gradient(135deg, #1A1A1A, #1A1A1A)" }}>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-white/30">
            <AvatarImage src={client.avatarUrl || ""} />
            <AvatarFallback className="text-white font-bold text-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
              {(client.name || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-white text-sm">{client.name}</p>
            <StatusBadge status={client.accountStatus || "active"} config={{
              active:    { label: "Actif",    color: "#065F46", bg: "rgba(255,255,255,0.9)" },
              suspended: { label: "Suspendu", color: "#9A3412", bg: "rgba(255,255,255,0.9)" },
              banned:    { label: "Banni",    color: "#991B1B", bg: "rgba(255,255,255,0.9)" },
            }} />
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Contact info */}
        <div className="space-y-1.5">
          {client.email && (
            <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
              <span>✉️</span><span>{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
              <span>📞</span><span>{client.phone}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
              <span>📍</span><span>{client.address}{client.gouvernorat ? `, ${client.gouvernorat}` : ""}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {client.accountStatus !== "suspended" && (
            <button onClick={() => onUpdateStatus("suspended", "Compte suspendu")} disabled={isPending}
              className="py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{ background: "#FFFAF0", color: ORANGE, border: `1px solid #FBD38D` }}>
              Suspendre Compte
            </button>
          )}
          {client.accountStatus !== "banned" && (
            <button onClick={() => onUpdateStatus("banned", "Compte banni")} disabled={isPending}
              className="py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{ background: "#FFF5F5", color: RED, border: `1px solid #FEB2B2` }}>
              Bannir Compte
            </button>
          )}
          {client.accountStatus !== "active" && (
            <button onClick={() => onUpdateStatus("active")} disabled={isPending}
              className="col-span-2 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{ background: "#F0FFF4", color: GREEN, border: `1px solid #9AE6B4` }}>
              Activer le Compte
            </button>
          )}
        </div>

        {/* Order history */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: MUTED }}>Historique de Commandes</p>
          <div className="space-y-2">
            {orders.length === 0 ? (
              <p className="text-xs text-center py-3" style={{ color: MUTED }}>Aucune commande</p>
            ) : orders.slice(0, 6).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: BG }}>
                <div>
                  <p className="text-xs font-mono font-semibold" style={{ color: BLUE }}>BSS-{String(o.id).padStart(4, "0")}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <StatusBadge status={o.status} config={STATUS_CONFIG} />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: MUTED }}>Notes Admin</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl p-3 text-xs outline-none resize-none"
            style={{ background: BG, border: `1.5px solid ${BORDER}`, color: TEXT }}
            placeholder="Notes internes..."
          />
          <button onClick={() => onUpdateNotes(notes)}
            className="mt-2 w-full py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
            style={{ background: BLUE }}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab({ filteredOrders, orderSearch, setOrderSearch, orderStatusFilter, setOrderStatusFilter, onSelectOrder }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: MUTED }} />
          <input
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, tracking..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: WHITE, border: `1.5px solid ${BORDER}`, color: TEXT }}
          />
        </div>
        <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
          <SelectTrigger className="w-full sm:w-52 rounded-xl" style={{ background: WHITE, borderColor: BORDER }}>
            <Filter className="h-4 w-4 mr-2" style={{ color: MUTED }} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={() => {
            if (!filteredOrders || filteredOrders.length === 0) { toast.error("Aucune commande à exporter"); return; }
            const headers = ["ID","Client","Téléphone","Tracking","Statut","Date"];
            const rows = filteredOrders.map((o: any) => [
              o.id, o.customerName, o.customerPhone || "", o.trackingCode || "",
              STATUS_CONFIG[o.status]?.label || o.status,
              new Date(o.createdAt).toLocaleDateString("fr-FR")
            ]);
            const csv = [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `commandes-${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            toast.success("Export CSV téléchargé ✅");
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: WHITE, border: `1.5px solid ${BORDER}`, color: MUTED }}>
          <Download className="h-4 w-4" />Export CSV
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F7FAFC" }}>
                {["#", "Client", "Téléphone", "Tracking", "Statut", "Date", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-sm" style={{ color: MUTED }}>Aucune commande trouvée</td></tr>
              ) : filteredOrders.map((o: any) => (
                <tr key={o.id} className="transition-colors hover:bg-blue-50/30" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: MUTED }}>#{o.id}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: TEXT }}>{o.customerName}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: MUTED }}>{o.customerPhone || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: BLUE }}>{o.trackingCode || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} config={STATUS_CONFIG} />
                    {o.requiresVerification === 1 && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#FFFAF0", color: ORANGE }}>⚠️ Vérif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => onSelectOrder(o)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: "#EBF8FF", color: BLUE }}>
                      <Eye style={{ width: 12, height: 12, display: "inline", marginRight: 3 }} />Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Audit Tab ────────────────────────────────────────────────────────────────
function AuditTab({ logs }: any) {
  return (
    <div className="space-y-3">
      {(logs || []).length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
          <Shield className="h-10 w-10 mx-auto mb-3" style={{ color: MUTED }} />
          <p className="text-sm" style={{ color: MUTED }}>Aucune entrée dans le journal</p>
        </div>
      ) : (logs || []).map((log: any) => (
        <div key={log.id} className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
          <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#EBF8FF" }}>
            <Shield className="h-4 w-4" style={{ color: BLUE }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: TEXT }}>{log.adminName || "Admin"}</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: BG, color: MUTED }}>{log.action}</span>
              <span className="text-xs" style={{ color: MUTED }}>{log.entityType} #{log.entityId}</span>
            </div>
            {log.description && <p className="text-sm mt-1" style={{ color: MUTED }}>{log.description}</p>}
            {(log.oldValue || log.newValue) && (
              <div className="flex gap-2 mt-1 text-xs">
                {log.oldValue && <span style={{ color: RED, textDecoration: "line-through" }}>{log.oldValue}</span>}
                {log.newValue && <span style={{ color: GREEN }}>→ {log.newValue}</span>}
              </div>
            )}
            <p className="text-xs mt-1" style={{ color: "#CBD5E0" }}>{new Date(log.createdAt).toLocaleString("fr-FR")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const { data: busyMode } = trpc.settings.get.useQuery({ key: "busy_mode" });
  const { data: busyMessage } = trpc.settings.get.useQuery({ key: "busy_message" });
  const setSetting = trpc.settings.set.useMutation({ onSuccess: () => toast.success("Paramètre sauvegardé ✅") });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (busyMessage?.value) setMsg(busyMessage.value);
  }, [busyMessage]);

  return (
    <div className="max-w-lg space-y-4">
      <div className="rounded-2xl p-5" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: TEXT }}>Mode Occupé (Busy Mode)</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm" style={{ color: MUTED }}>Activer le mode occupé</span>
          <button
            onClick={() => setSetting.mutate({ key: "busy_mode", value: busyMode?.value === "true" ? "false" : "true" })}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ background: busyMode?.value === "true" ? BLUE : "#CBD5E0" }}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${busyMode?.value === "true" ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Message du mode occupé</label>
          <Textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
            className="rounded-xl resize-none" style={{ background: BG, borderColor: BORDER }} />
          <button onClick={() => setSetting.mutate({ key: "busy_message", value: msg })}
            className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: BLUE }}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail Modal ────────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onUpdate, isPending }: any) {
  const [form, setForm] = useState({
    status: order.status,
    adminNotes: order.adminNotes || "",
    rejectionReason: order.rejectionReason || "",
    requiresVerification: order.requiresVerification || 0,
    verificationReason: order.verificationReason || "",
    costTnd: order.costTnd || 0,
    profitTnd: order.profitTnd || 0,
    platform: order.platform || "shein",
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: WHITE }}>
        <DialogHeader>
          <DialogTitle style={{ color: TEXT }}>Commande #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-xl p-3 space-y-1" style={{ background: BG }}>
            <p className="font-semibold text-sm" style={{ color: TEXT }}>{order.customerName}</p>
            <p className="text-xs" style={{ color: MUTED }}>{order.customerPhone || "—"}</p>
            <p className="text-xs" style={{ color: MUTED }}>{order.customerAddress || "—"}</p>
          </div>
          {order.productLink && (
            <div className="rounded-xl p-3" style={{ background: BG }}>
              <p className="text-xs mb-1" style={{ color: MUTED }}>Lien produit</p>
              <a href={order.productLink} target="_blank" rel="noopener noreferrer"
                className="text-xs hover:underline break-all" style={{ color: BLUE }}>{order.productLink}</a>
            </div>
          )}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Statut</label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="rounded-xl" style={{ background: BG, borderColor: BORDER }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.status === "cancelled" && (
            <Input value={form.rejectionReason} onChange={e => setForm(f => ({ ...f, rejectionReason: e.target.value }))}
              className="rounded-xl" style={{ background: BG, borderColor: BORDER }} placeholder="Raison d'annulation..." />
          )}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Plateforme</label>
            <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v }))}>
              <SelectTrigger className="rounded-xl" style={{ background: BG, borderColor: BORDER }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["shein", "aliexpress", "temu"].map(p => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Coût (TND)</label>
              <Input type="number" value={form.costTnd} onChange={e => setForm(f => ({ ...f, costTnd: Number(e.target.value) }))}
                className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Profit (TND)</label>
              <Input type="number" value={form.profitTnd} onChange={e => setForm(f => ({ ...f, profitTnd: Number(e.target.value) }))}
                className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: BG }}>
            <input type="checkbox" id="verif" checked={form.requiresVerification === 1}
              onChange={e => setForm(f => ({ ...f, requiresVerification: e.target.checked ? 1 : 0 }))}
              className="h-4 w-4" style={{ accentColor: ORANGE }} />
            <label htmlFor="verif" className="text-sm" style={{ color: TEXT }}>Demander vérification client</label>
          </div>
          {form.requiresVerification === 1 && (
            <Input value={form.verificationReason} onChange={e => setForm(f => ({ ...f, verificationReason: e.target.value }))}
              className="rounded-xl" style={{ background: BG, borderColor: BORDER }} placeholder="Raison de la vérification..." />
          )}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Notes admin</label>
            <Textarea value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))}
              className="rounded-xl resize-none" style={{ background: BG, borderColor: BORDER }} rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} style={{ color: MUTED }}>Annuler</Button>
          <Button onClick={() => onUpdate(form)} disabled={isPending}
            className="text-white" style={{ background: BLUE }}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
