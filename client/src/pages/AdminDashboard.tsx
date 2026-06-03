import { useState, useEffect, useRef, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ShoppingBag,
  LogOut,
  Image,
  MapPin,
  Download,
  Search,
  Filter,
  StickyNote,
  Truck,
  Warehouse,
  CreditCard,
  Save,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "Nouveau", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Package },
  processing: { label: "En cours", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  waiting_payment: { label: "Attente paiement", color: "bg-[#FFF9E6] text-yellow-700 border-yellow-200", icon: CreditCard },
  shipped: { label: "Expédié", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  arrived: { label: "Arrivé au dépôt", color: "bg-teal-100 text-teal-700 border-teal-200", icon: Warehouse },
  completed: { label: "Livré", color: "bg-[#E8F5E9] text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Annulé", color: "bg-blue-100 text-blue-700 border-blue-200", icon: XCircle },
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: authCheck, isLoading: authLoading } = trpc.adminAuth.check.useQuery();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
        </main>
      </div>
    );
  }

  if (!authCheck?.isAdmin) {
    navigate("/admin/login");
    return null;
  }

  return <AdminContent />;
}

// Play a short notification beep using Web Audio API
// Returns true if sound played, false if blocked (e.g. autoplay policy)
function playNotificationSound(): boolean {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return false;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
    return true;
  } catch {
    return false;
  }
}

function AdminContent() {
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const prevOrderCountRef = useRef<number | null>(null);

  // Busy mode
  const { data: busyData, refetch: refetchBusy } = trpc.settings.get.useQuery({ key: "busy_mode" });
  const isBusy = busyData?.value === "true";
  const setSetting = trpc.settings.set.useMutation({
    onSuccess: () => {
      refetchBusy();
      toast.success(isBusy ? "وضع المشغول أُلغي ✅" : "وضع المشغول فُعِّل 🔴");
    },
  });
  const toggleBusy = () => setSetting.mutate({ key: "busy_mode", value: isBusy ? "false" : "true" });

  // Arrivage info for chatbot
  const { data: arrivageInfoData } = trpc.settings.get.useQuery({ key: "arrivage_info" });
  const [arrivageInfoText, setArrivageInfoText] = useState("");
  const saveArrivageInfo = trpc.settings.set.useMutation({
    onSuccess: () => toast.success("معلومات الأريفاج تحفظت ✅"),
    onError: (e) => toast.error(e.message),
  });
  // Sync arrivage info from server
  useEffect(() => {
    if (arrivageInfoData?.value !== undefined) {
      setArrivageInfoText(arrivageInfoData.value ?? "");
    }
  }, [arrivageInfoData?.value]);

  const utils = trpc.useUtils();
  const { data: orders, isLoading, error, refetch } = trpc.orders.list.useQuery(
    undefined,
    { refetchInterval: 15000 } // poll every 15s
  );

  // Sound + toast when new order arrives
  useEffect(() => {
    if (!orders) return;
    const count = orders.length;
    if (prevOrderCountRef.current !== null && count > prevOrderCountRef.current) {
      const diff = count - prevOrderCountRef.current;
      playNotificationSound();
      toast.success(`🛒 ${diff} nouvelle${diff > 1 ? "s" : ""} commande${diff > 1 ? "s" : ""} reçue${diff > 1 ? "s" : ""}!`, {
        duration: 6000,
      });
    }
    prevOrderCountRef.current = count;
  }, [orders]);

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      refetch();
    },
    onError: (err) => {
      toast.error("Erreur : " + err.message);
    },
  });

  const updateNotes = trpc.orders.updateNotes.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Notes sauvegardées");
      setEditingNotes((prev) => {
        const copy = { ...prev };
        delete copy[variables.id];
        return copy;
      });
      refetch();
    },
    onError: (err) => {
      toast.error("Erreur : " + err.message);
    },
  });

  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => {
      utils.adminAuth.check.invalidate();
      toast.success("Déconnexion réussie");
      navigate("/admin/login");
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({
      id,
      status: status as any,
    });
  };

  const handleSaveNotes = (id: number) => {
    const notes = editingNotes[id];
    if (notes !== undefined) {
      updateNotes.mutate({ id, adminNotes: notes });
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let result = [...orders];
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.productLink.toLowerCase().includes(q) ||
          (o.customerPhone && o.customerPhone.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    if (!orders) return { total: 0, new: 0, processing: 0, waiting_payment: 0, shipped: 0, arrived: 0, completed: 0, cancelled: 0 };
    return {
      total: orders.length,
      new: orders.filter((o) => o.status === "new").length,
      processing: orders.filter((o) => o.status === "processing").length,
      waiting_payment: orders.filter((o) => o.status === "waiting_payment").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      arrived: orders.filter((o) => o.status === "arrived").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  // Orders by day (last 7 days)
  const chartData = useMemo(() => {
    if (!orders) return [];
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const count = orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      days.push({ label: dayStr, count });
    }
    return days;
  }, [orders]);

  // Export CSV
  const exportCSV = () => {
    if (!filteredOrders.length) {
      toast.error("Aucune commande à exporter");
      return;
    }
    const headers = ["ID", "Nom", "Téléphone", "Adresse", "Lien produit", "Quantité", "Notes client", "Statut", "Date"];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.customerName,
      o.customerPhone || "",
      o.customerAddress || "",
      o.productLink,
      o.quantity,
      o.notes || "",
      statusConfig[o.status]?.label || o.status,
      new Date(o.createdAt).toLocaleString("fr-FR"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bysis-commandes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar />

      <main className="flex-1 py-6 md:py-10">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <LayoutDashboard className="h-7 w-7 text-primary" />
                Tableau de bord
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gérez toutes les commandes de vos clients
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Busy mode toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: isBusy ? "rgba(239,68,68,0.08)" : "rgba(52,211,153,0.06)", borderColor: isBusy ? "rgba(239,68,68,0.3)" : "rgba(52,211,153,0.2)" }}>
                <Switch
                  id="busy-mode"
                  checked={isBusy}
                  onCheckedChange={toggleBusy}
                  disabled={setSetting.isPending}
                />
                <Label htmlFor="busy-mode" className="text-xs cursor-pointer" style={{ color: isBusy ? "#f87171" : "#6ee7b7" }}>
                  {isBusy ? "🔴 مشغول" : "🟢 متاح"}
                </Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/conversations")} className="gap-2">
                <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                Conversations
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/arrivage")} className="gap-2">
                <Package className="h-4 w-4" strokeWidth={1.5} />
                Arrivage
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
                <Download className="h-4 w-4" strokeWidth={1.5} />
                Export CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="gap-2 text-muted-foreground"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Déconnexion
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("all")}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "new" ? "ring-2 ring-blue-400" : ""}`} onClick={() => setStatusFilter("new")}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                <p className="text-[11px] text-muted-foreground">Nouvelles</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "waiting_payment" ? "ring-2 ring-yellow-400" : ""}`} onClick={() => setStatusFilter("waiting_payment")}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-[#FFC107]">{stats.waiting_payment}</p>
                <p className="text-[11px] text-muted-foreground">Paiement</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "processing" ? "ring-2 ring-blue-400" : ""}`} onClick={() => setStatusFilter("processing")}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                <p className="text-[11px] text-muted-foreground">En cours</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "shipped" ? "ring-2 ring-purple-400" : ""}`} onClick={() => setStatusFilter("shipped")}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                <p className="text-[11px] text-muted-foreground">Expédié</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "arrived" ? "ring-2 ring-teal-400" : ""}`} onClick={() => setStatusFilter("arrived")}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-teal-600">{stats.arrived}</p>
                <p className="text-[11px] text-muted-foreground">Au dépôt</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "completed" ? "ring-2 ring-green-400" : ""}`} onClick={() => setStatusFilter("completed")}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-[#28A745]">{stats.completed}</p>
                <p className="text-[11px] text-muted-foreground">Livrées</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Chart - Last 7 days */}
          {chartData.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Commandes des 7 derniers jours</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-end gap-2 h-24">
                  {chartData.map((day, i) => {
                    const maxCount = Math.max(...chartData.map((d) => d.count), 1);
                    const height = (day.count / maxCount) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-foreground">{day.count || ""}</span>
                        <div
                          className="w-full rounded-t-sm bg-primary/80 transition-all duration-300"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-[9px] text-muted-foreground">{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Arrivage Info for Chatbot */}
          <Card className="mb-6 border-cyan-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-cyan-600" strokeWidth={1.5} />
                معلومات الأريفاج (يستخدمها الشات بوت)
              </CardTitle>
              <CardDescription className="text-xs">
                اكتب هنا معلومات الأريفاج الحالي — الشات بوت سيستخدمها تلقائياً للرد على العملاء
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex gap-2">
                <Textarea
                  value={arrivageInfoText}
                  onChange={(e) => setArrivageInfoText(e.target.value)}
                  placeholder="مثال: الأريفاج الجديد وصل! عندنا فساتين صيفية من Shein بسعر 80-150 دينار، وأحذية رياضية من AliExpress بسعر 120 دينار..."
                  className="flex-1 text-sm resize-none"
                  rows={3}
                  dir="rtl"
                />
                <Button
                  size="sm"
                  onClick={() => saveArrivageInfo.mutate({ key: "arrivage_info", value: arrivageInfoText })}
                  disabled={saveArrivageInfo.isPending}
                  className="self-end gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                  حفظ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <Input
                placeholder="Rechercher par nom, téléphone ou lien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="waiting_payment">Attente paiement</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="shipped">Expédié</SelectItem>
                <SelectItem value="arrived">Arrivé au dépôt</SelectItem>
                <SelectItem value="completed">Livré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Commandes
              </CardTitle>
              <CardDescription>
                {filteredOrders.length} commande{filteredOrders.length !== 1 ? "s" : ""} affichée{filteredOrders.length !== 1 ? "s" : ""}
                {statusFilter !== "all" && ` (filtre: ${statusConfig[statusFilter]?.label})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-destructive">
                  <XCircle className="h-12 w-12 mb-4 opacity-50" strokeWidth={1.5} />
                  <p className="font-medium">Erreur de chargement</p>
                  <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                    Réessayer
                  </Button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4 opacity-30" strokeWidth={1.5} />
                  <p>Aucune commande trouvée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const config = statusConfig[order.status] || statusConfig.new;
                    const StatusIcon = config.icon;
                    const isEditingNote = editingNotes[order.id] !== undefined;
                    const currentNotes = isEditingNote
                      ? editingNotes[order.id]
                      : (order as any).adminNotes || "";

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col gap-3">
                          {/* Top row */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-muted-foreground font-mono">#{order.id}</span>
                                <h3 className="font-semibold">{order.customerName}</h3>
                                <Badge variant="outline" className={config.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-0.5">
                                {order.customerPhone && <p>Tel: {order.customerPhone}</p>}
                                {order.customerAddress && (
                                  <p className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" strokeWidth={1.5} />
                                    {order.customerAddress}
                                  </p>
                                )}
                                <p className="flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                                  <a
                                    href={order.productLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate max-w-xs inline-block"
                                  >
                                    {order.productLink}
                                  </a>
                                </p>
                                <p>Quantité: {order.quantity}</p>
                                {order.notes && (
                                  <p className="italic text-foreground/70">Client: {order.notes}</p>
                                )}
                                {order.screenshotUrl && (
                                  <a
                                    href={order.screenshotUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <Image className="h-3 w-3" />
                                    Voir la capture
                                  </a>
                                )}
                                {(order as any).paymentReceiptUrl && (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                                      💳 Reçu de paiement
                                      {(order as any).paymentMethod === 'bank' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">UIB</span>}
                                      {(order as any).paymentMethod === 'mandat' && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Mandat minute</span>}
                                    </span>
                                    <a
                                      href={(order as any).paymentReceiptUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[#28A745] hover:underline text-xs"
                                    >
                                      <Image className="h-3 w-3" />
                                      Voir le reçu
                                    </a>
                                  </div>
                                )}
                                <p className="text-xs opacity-70">
                                  {new Date(order.createdAt).toLocaleString("fr-FR")}
                                </p>
                              </div>
                            </div>

                            {/* Status selector */}
                            <div className="flex-shrink-0">
                              <Select
                                value={order.status}
                                onValueChange={(v) => handleStatusChange(order.id, v)}
                              >
                                <SelectTrigger className="w-44">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">Nouveau</SelectItem>
                                  <SelectItem value="waiting_payment">Attente paiement</SelectItem>
                                  <SelectItem value="processing">En cours</SelectItem>
                                  <SelectItem value="shipped">Expédié</SelectItem>
                                  <SelectItem value="arrived">Arrivé au dépôt</SelectItem>
                                  <SelectItem value="completed">Livré</SelectItem>
                                  <SelectItem value="cancelled">Annulé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Admin notes */}
                          <div className="border-t pt-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Notes internes</span>
                            </div>
                            <div className="flex gap-2">
                              <Textarea
                                value={currentNotes}
                                onChange={(e) =>
                                  setEditingNotes((prev) => ({ ...prev, [order.id]: e.target.value }))
                                }
                                placeholder="Ajouter une note interne..."
                                className="text-sm min-h-[60px] resize-none flex-1"
                                rows={2}
                              />
                              {isEditingNote && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="self-end gap-1"
                                  onClick={() => handleSaveNotes(order.id)}
                                  disabled={updateNotes.isPending}
                                >
                                  <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                                  Sauver
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
