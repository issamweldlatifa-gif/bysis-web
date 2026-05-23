import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  ShoppingBag, Users, TrendingUp, Package, Search, Eye, Ban, CheckCircle,
  AlertTriangle, ChevronRight, LogOut, Settings, BarChart2,
  Shield, RefreshCw, Filter, Truck, DollarSign, LayoutDashboard,
} from "lucide-react";
import { Link, useLocation } from "wouter";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Nouvelle", color: "text-blue-700", bg: "bg-blue-100" },
  processing: { label: "En traitement", color: "text-yellow-700", bg: "bg-yellow-100" },
  waiting_payment: { label: "Attente paiement", color: "text-orange-700", bg: "bg-orange-100" },
  shipped: { label: "Expédiée", color: "text-purple-700", bg: "bg-purple-100" },
  arrived: { label: "Arrivée", color: "text-teal-700", bg: "bg-teal-100" },
  completed: { label: "Complétée", color: "text-green-700", bg: "bg-green-100" },
  cancelled: { label: "Annulée", color: "text-red-700", bg: "bg-red-100" },
};

const CLIENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Actif", color: "text-green-700", bg: "bg-green-100" },
  suspended: { label: "Suspendu", color: "text-orange-700", bg: "bg-orange-100" },
  banned: { label: "Banni", color: "text-red-700", bg: "bg-red-100" },
};

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#f97316", "#8b5cf6", "#14b8a6", "#22c55e", "#ef4444"];

type AdminTab = "analytics" | "orders" | "crm" | "audit" | "settings";

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ShipMasterDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AdminTab>("analytics");
  const [orderSearch, setOrderSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const prevOrderCountRef = useRef<number | null>(null);

  // ── Queries ──
  const { data: stats, refetch: refetchStats } = trpc.analytics.getStats.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: orders, refetch: refetchOrders } = trpc.orders.list.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: clients, refetch: refetchClients } = trpc.crm.list.useQuery(
    { search: clientSearch || undefined },
    { refetchInterval: 30000 }
  );
  const { data: clientDetail } = trpc.crm.getById.useQuery(
    { id: selectedClient! },
    { enabled: selectedClient !== null }
  );
  const { data: auditLogs } = trpc.auditLog.list.useQuery(
    { limit: 100 },
    { enabled: tab === "audit" }
  );

  // ── Sound on new order ──
  useEffect(() => {
    if (!orders) return;
    const count = orders.length;
    if (prevOrderCountRef.current !== null && count > prevOrderCountRef.current) {
      const diff = count - prevOrderCountRef.current;
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
  const filteredOrders = (orders || []).filter((o: any) => {
    const matchSearch = !orderSearch ||
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone?.includes(orderSearch) ||
      o.trackingCode?.includes(orderSearch);
    const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  const newOrdersCount = (orders || []).filter((o: any) => o.status === "new").length;

  // ── Auth guard ──
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Card className="w-full max-w-sm mx-4 bg-gray-900 border-gray-800">
          <CardContent className="pt-8 pb-8 text-center">
            <Shield className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-2">Accès restreint</p>
            <p className="text-gray-400 text-sm mb-6">Réservé aux administrateurs Bysis</p>
            <Link href="/">
              <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">Retour à l'accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Sidebar nav items ──
  const navItems = [
    { id: "analytics", icon: BarChart2, label: "Analytics" },
    { id: "orders", icon: ShoppingBag, label: "Commandes", badge: newOrdersCount > 0 ? newOrdersCount : undefined },
    { id: "crm", icon: Users, label: "CRM Clients" },
    { id: "audit", icon: Shield, label: "Journal d'audit" },
    { id: "settings", icon: Settings, label: "Paramètres" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 fixed h-full z-20">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center font-bold text-sm">B</div>
            <div>
              <p className="font-bold text-sm">Bysis</p>
              <p className="text-xs text-gray-400">ShipMaster Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id as AdminTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === id ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && (
                <span className="bg-pink-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link href="/admin">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard classique
            </button>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-pink-500 text-white text-xs">{user?.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-400">Administrateur</p>
            </div>
          </div>
          <button onClick={() => logout()} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-20 flex">
        {navItems.map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id as AdminTab)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors relative ${tab === id ? "text-pink-400" : "text-gray-500"}`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
            {badge !== undefined && (
              <span className="absolute top-1 right-1/4 bg-pink-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg">
            {tab === "analytics" && "📊 Analytics"}
            {tab === "orders" && "📦 Gestion des Commandes"}
            {tab === "crm" && "👥 CRM Clients"}
            {tab === "audit" && "🛡️ Journal d'Audit"}
            {tab === "settings" && "⚙️ Paramètres"}
          </h1>
          <button
            onClick={() => { refetchStats(); refetchOrders(); refetchClients(); toast.success("Données actualisées"); }}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 md:p-6">

          {/* ═══ ANALYTICS ═══ */}
          {tab === "analytics" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Commandes aujourd'hui", value: stats?.today ?? 0, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Cette semaine", value: stats?.thisWeek ?? 0, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
                  { label: "Ce mois", value: stats?.thisMonth ?? 0, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10" },
                  { label: "Clients actifs", value: stats?.total ?? 0, icon: Users, color: "text-pink-400", bg: "bg-pink-500/10" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <Card key={label} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <p className="text-2xl font-bold text-white">{value}</p>
                      <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Revenue + Shipments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Revenus ce mois (TND)", value: `${stats?.monthRevenue ?? 0} DT`, icon: DollarSign, color: "text-yellow-400" },
                  { label: "Expéditions actives", value: stats?.activeShipments ?? 0, icon: Truck, color: "text-teal-400" },
                  { label: "Total commandes", value: stats?.total ?? 0, icon: Package, color: "text-indigo-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <Card key={label} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Icon className={`h-8 w-8 ${color}`} />
                      <div>
                        <p className="text-xl font-bold text-white">{value}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-300">Commandes (7 derniers jours)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats?.dailyStats ?? []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} labelStyle={{ color: "#f9fafb" }} />
                        <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-300">Répartition par statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={Object.entries(stats?.statusBreakdown ?? {}).map(([status, count]) => ({ status, count }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="status">
                          {Object.keys(stats?.statusBreakdown ?? {}).map((_: string, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                        <Legend formatter={(v: string) => STATUS_CONFIG[v]?.label || v} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ═══ ORDERS ═══ */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Rechercher par nom, téléphone, tracking..."
                    className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
                  />
                </div>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-gray-900 border-gray-700 text-white rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all" className="text-white">Tous les statuts</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-white">{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">#</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Client</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Tracking</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Statut</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Date</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-gray-500">Aucune commande trouvée</td></tr>
                      ) : filteredOrders.map((order: any) => {
                        const sc = STATUS_CONFIG[order.status] || { label: order.status, color: "text-gray-400", bg: "bg-gray-700" };
                        return (
                          <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-gray-300">#{order.id}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-white">{order.customerName}</p>
                              <p className="text-xs text-gray-400">{order.customerPhone || "—"}</p>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-gray-400">{order.trackingCode || "—"}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                              {order.requiresVerification === 1 && (
                                <span className="ml-1 text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">⚠️</span>
                              )}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)} className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ═══ CRM ═══ */}
          {tab === "crm" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Rechercher par nom ou téléphone..."
                  className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(clients || []).map((client: any) => {
                  const sc = CLIENT_STATUS_CONFIG[client.accountStatus] || { label: client.accountStatus, color: "text-gray-400", bg: "bg-gray-700" };
                  return (
                    <Card key={client.id} className="bg-gray-900 border-gray-800 cursor-pointer hover:border-pink-500/50 transition-all" onClick={() => setSelectedClient(client.id)}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={client.avatarUrl || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold">
                            {(client.name || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white truncate">{client.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          </div>
                          <p className="text-sm text-gray-400">{client.phone || "—"}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            <span>{client.totalOrders ?? 0} commandes</span>
                            <span>{client.totalSpent ?? 0} DT dépensé</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      </CardContent>
                    </Card>
                  );
                })}
                {(clients || []).length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">Aucun client trouvé</div>
                )}
              </div>
            </div>
          )}

          {/* ═══ AUDIT LOG ═══ */}
          {tab === "audit" && (
            <div className="space-y-3">
              {(auditLogs || []).map((log: any) => (
                <Card key={log.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">{log.adminName || "Admin"}</span>
                          <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">{log.action}</span>
                          <span className="text-xs text-gray-500">{log.entityType} #{log.entityId}</span>
                        </div>
                        {log.description && <p className="text-sm text-gray-400 mt-1">{log.description}</p>}
                        {(log.oldValue || log.newValue) && (
                          <div className="flex gap-2 mt-1 text-xs">
                            {log.oldValue && <span className="text-red-400 line-through">{log.oldValue}</span>}
                            {log.newValue && <span className="text-green-400">→ {log.newValue}</span>}
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-1">{new Date(log.createdAt).toLocaleString("fr-FR")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(auditLogs || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">Aucune entrée dans le journal</div>
              )}
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {tab === "settings" && <ShipMasterSettings />}
        </div>
      </main>

      {/* ── Modals ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={(data: any) => updateOrderFull.mutate({ id: selectedOrder.id, ...data })}
          isPending={updateOrderFull.isPending}
        />
      )}
      {selectedClient !== null && clientDetail && (
        <ClientDetailModal
          client={clientDetail.client}
          orders={clientDetail.orders}
          onClose={() => setSelectedClient(null)}
          onUpdateStatus={(status: string, reason?: string) => updateClientStatus.mutate({ id: selectedClient, status: status as any, reason })}
          onUpdateNotes={(notes: string) => updateClientNotes.mutate({ id: selectedClient, notes })}
          isPending={updateClientStatus.isPending}
        />
      )}
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
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Commande #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="bg-gray-800 rounded-xl p-3 space-y-1">
            <p className="text-sm font-semibold text-white">{order.customerName}</p>
            <p className="text-xs text-gray-400">{order.customerPhone || "—"}</p>
            <p className="text-xs text-gray-400">{order.customerAddress || "—"}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Lien produit</p>
            <a href={order.productLink} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 hover:underline break-all">{order.productLink}</a>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Statut</label>
            <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-white">{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.status === "cancelled" && (
            <Input value={form.rejectionReason} onChange={(e) => setForm(f => ({ ...f, rejectionReason: e.target.value }))} className="bg-gray-800 border-gray-700 text-white rounded-xl" placeholder="Raison d'annulation..." />
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Plateforme</label>
            <Select value={form.platform} onValueChange={(v) => setForm(f => ({ ...f, platform: v }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {["shein", "aliexpress", "temu"].map(p => (
                  <SelectItem key={p} value={p} className="text-white capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Coût (TND)</label>
              <Input type="number" value={form.costTnd} onChange={(e) => setForm(f => ({ ...f, costTnd: Number(e.target.value) }))} className="bg-gray-800 border-gray-700 text-white rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Profit (TND)</label>
              <Input type="number" value={form.profitTnd} onChange={(e) => setForm(f => ({ ...f, profitTnd: Number(e.target.value) }))} className="bg-gray-800 border-gray-700 text-white rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
            <input type="checkbox" id="verif" checked={form.requiresVerification === 1} onChange={(e) => setForm(f => ({ ...f, requiresVerification: e.target.checked ? 1 : 0 }))} className="h-4 w-4 accent-orange-500" />
            <label htmlFor="verif" className="text-sm text-gray-300">Demander vérification client</label>
          </div>
          {form.requiresVerification === 1 && (
            <Input value={form.verificationReason} onChange={(e) => setForm(f => ({ ...f, verificationReason: e.target.value }))} className="bg-gray-800 border-gray-700 text-white rounded-xl" placeholder="Raison de la vérification..." />
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes admin</label>
            <Textarea value={form.adminNotes} onChange={(e) => setForm(f => ({ ...f, adminNotes: e.target.value }))} className="bg-gray-800 border-gray-700 text-white rounded-xl resize-none" rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-gray-400">Annuler</Button>
          <Button onClick={() => onUpdate(form)} disabled={isPending} className="bg-pink-500 hover:bg-pink-600 text-white">
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Client Detail Modal ───────────────────────────────────────────────────────

function ClientDetailModal({ client, orders, onClose, onUpdateStatus, onUpdateNotes, isPending }: any) {
  const [notes, setNotes] = useState(client.notes || "");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={client.avatarUrl || ""} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold">
                {(client.name || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {client.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="bg-gray-800 rounded-xl p-3 space-y-1 text-sm">
            <p className="text-gray-300">📞 {client.phone || "—"}</p>
            {client.email && <p className="text-gray-300">✉️ {client.email}</p>}
            {client.address && <p className="text-gray-300">📍 {client.address}</p>}
            {client.gouvernorat && <p className="text-gray-300">🗺️ {client.gouvernorat}</p>}
            <div className="flex gap-3 pt-1 text-xs text-gray-400">
              <span>{client.totalOrders ?? 0} commandes</span>
              <span>{client.totalSpent ?? 0} DT dépensé</span>
            </div>
          </div>
          <div className="flex gap-2">
            {client.accountStatus !== "active" && (
              <Button size="sm" onClick={() => onUpdateStatus("active")} disabled={isPending} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-xl">
                <CheckCircle className="h-3 w-3 mr-1" /> Activer
              </Button>
            )}
            {client.accountStatus !== "suspended" && (
              <Button size="sm" onClick={() => onUpdateStatus("suspended", "Compte suspendu")} disabled={isPending} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-xl">
                <AlertTriangle className="h-3 w-3 mr-1" /> Suspendre
              </Button>
            )}
            {client.accountStatus !== "banned" && (
              <Button size="sm" onClick={() => onUpdateStatus("banned", "Compte banni")} disabled={isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl">
                <Ban className="h-3 w-3 mr-1" /> Bannir
              </Button>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes admin</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-gray-800 border-gray-700 text-white rounded-xl resize-none" rows={3} />
            <Button size="sm" onClick={() => onUpdateNotes(notes)} className="mt-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-xl">
              Sauvegarder les notes
            </Button>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Historique des commandes</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-3">Aucune commande</p>
              ) : orders.map((o: any) => {
                const sc = STATUS_CONFIG[o.status] || { label: o.status, color: "text-gray-400", bg: "bg-gray-700" };
                return (
                  <div key={o.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-2.5">
                    <div>
                      <p className="text-xs font-medium text-white">#{o.id}</p>
                      <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Settings Panel ────────────────────────────────────────────────────────────

function ShipMasterSettings() {
  const { data: busyMode } = trpc.settings.get.useQuery({ key: "busy_mode" });
  const { data: busyMessage } = trpc.settings.get.useQuery({ key: "busy_message" });
  const setSetting = trpc.settings.set.useMutation({ onSuccess: () => toast.success("Paramètre sauvegardé ✅") });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (busyMessage?.value) setMsg(busyMessage.value);
  }, [busyMessage]);

  return (
    <div className="space-y-4 max-w-lg">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-300">Mode Occupé (Busy Mode)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Activer le mode occupé</span>
            <button
              onClick={() => setSetting.mutate({ key: "busy_mode", value: busyMode?.value === "true" ? "false" : "true" })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${busyMode?.value === "true" ? "bg-pink-500" : "bg-gray-700"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${busyMode?.value === "true" ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Message du mode occupé</label>
            <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="bg-gray-800 border-gray-700 text-white rounded-xl resize-none" rows={3} />
            <Button size="sm" onClick={() => setSetting.mutate({ key: "busy_message", value: msg })} className="mt-2 bg-pink-500 hover:bg-pink-600 text-white text-xs rounded-xl">
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
