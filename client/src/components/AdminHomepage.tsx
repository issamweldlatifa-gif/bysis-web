/**
 * AdminHomepage — Full CMS control for homepage content
 * Controls: Hero video, Slider videos, Stores, Colors, Fonts, Texts
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, Edit2, Video, Store, Settings, Palette } from "lucide-react";
import { toast } from "sonner";

export default function AdminHomepage() {
  const { data, refetch } = trpc.homepage.getData.useQuery();
  const { data: adminVideos = [], refetch: refetchVideos } = trpc.homepage.getVideos.useQuery();
  const { data: adminStores = [], refetch: refetchStores } = trpc.homepage.getStores.useQuery();
  const { data: settings } = trpc.homepage.getSettings.useQuery();

  const updateSettingsMut = trpc.homepage.updateSettings.useMutation();
  const createVideoMut = trpc.homepage.createVideo.useMutation();
  const updateVideoMut = trpc.homepage.updateVideo.useMutation();
  const deleteVideoMut = trpc.homepage.deleteVideo.useMutation();
  const createStoreMut = trpc.homepage.createStore.useMutation();
  const updateStoreMut = trpc.homepage.updateStore.useMutation();
  const deleteStoreMut = trpc.homepage.deleteStore.useMutation();

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    heroButtonText: settings?.heroButtonText ?? "DÉCOUVRIR ••",
    heroButtonLink: settings?.heroButtonLink ?? "/arrivage",
    heroButtonColor: settings?.heroButtonColor ?? "#D4AF37",
    heroButtonTextColor: settings?.heroButtonTextColor ?? "#1C2B33",
    adminHeadline: settings?.adminHeadline ?? "DESTOCKAGE EUROPE ••",
    adminButtonText: settings?.adminButtonText ?? "VOIR LES OFFRES ••",
    adminButtonLink: settings?.adminButtonLink ?? "/arrivage",
    storesSectionTitle: settings?.storesSectionTitle ?? "نشريو منهم مباشرة ليك ••",
    primaryColor: settings?.primaryColor ?? "#1C2B33",
    accentColor: settings?.accentColor ?? "#D4AF37",
    fontFamily: settings?.fontFamily ?? "Inter",
    footerFacebook: settings?.footerFacebook ?? "",
    footerInstagram: settings?.footerInstagram ?? "",
    footerWhatsapp: settings?.footerWhatsapp ?? "",
    footerEmail: settings?.footerEmail ?? "",
  });

  // Video form
  const [videoDialog, setVideoDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [videoForm, setVideoForm] = useState({ type: "slider" as "hero" | "slider", title: "", videoUrl: "", linkUrl: "/", displayOrder: 0 });

  // Store form
  const [storeDialog, setStoreDialog] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [storeForm, setStoreForm] = useState({ name: "", logoUrl: "", linkUrl: "/", backgroundColor: "#F5F5F0", isDark: 0, displayOrder: 0 });

  // ── Settings ──────────────────────────────────────────────────────────────
  const saveSettings = async () => {
    try {
      await updateSettingsMut.mutateAsync(settingsForm);
      toast.success("Paramètres sauvegardés ✓");
      refetch();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  // ── Videos ────────────────────────────────────────────────────────────────
  const openVideoDialog = (video?: any) => {
    if (video) {
      setEditingVideo(video);
      setVideoForm({ type: video.type, title: video.title, videoUrl: video.videoUrl, linkUrl: video.linkUrl ?? "/", displayOrder: video.displayOrder ?? 0 });
    } else {
      setEditingVideo(null);
      setVideoForm({ type: "slider", title: "", videoUrl: "", linkUrl: "/", displayOrder: adminVideos.length });
    }
    setVideoDialog(true);
  };

  const saveVideo = async () => {
    try {
      if (editingVideo) {
        await updateVideoMut.mutateAsync({ id: editingVideo.id, ...videoForm });
        toast.success("Vidéo mise à jour ✓");
      } else {
        await createVideoMut.mutateAsync(videoForm);
        toast.success("Vidéo ajoutée ✓");
      }
      setVideoDialog(false);
      refetchVideos();
      refetch();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const deleteVideo = async (id: number) => {
    if (!confirm("Supprimer cette vidéo ?")) return;
    await deleteVideoMut.mutateAsync({ id });
    toast.success("Vidéo supprimée");
    refetchVideos();
    refetch();
  };

  const toggleVideoActive = async (video: any) => {
    await updateVideoMut.mutateAsync({ id: video.id, isActive: video.isActive ? 0 : 1 });
    refetchVideos();
  };

  // ── Stores ────────────────────────────────────────────────────────────────
  const openStoreDialog = (store?: any) => {
    if (store) {
      setEditingStore(store);
      setStoreForm({ name: store.name, logoUrl: store.logoUrl ?? "", linkUrl: store.linkUrl ?? "/", backgroundColor: store.backgroundColor ?? "#F5F5F0", isDark: store.isDark ?? 0, displayOrder: store.displayOrder ?? 0 });
    } else {
      setEditingStore(null);
      setStoreForm({ name: "", logoUrl: "", linkUrl: "/", backgroundColor: "#F5F5F0", isDark: 0, displayOrder: adminStores.length + 1 });
    }
    setStoreDialog(true);
  };

  const saveStore = async () => {
    try {
      if (editingStore) {
        await updateStoreMut.mutateAsync({ id: editingStore.id, ...storeForm });
        toast.success("Magasin mis à jour ✓");
      } else {
        await createStoreMut.mutateAsync(storeForm);
        toast.success("Magasin ajouté ✓");
      }
      setStoreDialog(false);
      refetchStores();
      refetch();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const deleteStore = async (id: number) => {
    if (!confirm("Supprimer ce magasin ?")) return;
    await deleteStoreMut.mutateAsync({ id });
    toast.success("Magasin supprimé");
    refetchStores();
  };

  const toggleStoreActive = async (store: any) => {
    await updateStoreMut.mutateAsync({ id: store.id, isActive: store.isActive ? 0 : 1 });
    refetchStores();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="videos">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="videos"><Video size={14} className="mr-1" />Vidéos</TabsTrigger>
          <TabsTrigger value="stores"><Store size={14} className="mr-1" />Magasins</TabsTrigger>
          <TabsTrigger value="texts"><Settings size={14} className="mr-1" />Textes</TabsTrigger>
          <TabsTrigger value="colors"><Palette size={14} className="mr-1" />Couleurs</TabsTrigger>
        </TabsList>

        {/* ── VIDEOS TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="videos" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Gestion des Vidéos</h3>
            <Button size="sm" onClick={() => openVideoDialog()}>
              <Plus size={16} className="mr-1" /> Ajouter
            </Button>
          </div>

          {/* Hero video */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">🎬 Vidéo Hero (85vh)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {adminVideos.filter(v => v.type === "hero").map(video => (
                <div key={video.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{video.videoUrl}</p>
                  </div>
                  <Switch checked={!!video.isActive} onCheckedChange={() => toggleVideoActive(video)} />
                  <Button variant="ghost" size="sm" onClick={() => openVideoDialog(video)}><Edit2 size={14} /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteVideo(video.id)}><Trash2 size={14} /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Slider videos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">🎞️ Vidéos Slider (Portrait)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {adminVideos.filter(v => v.type === "slider").map(video => (
                <div key={video.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">{video.displayOrder}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{video.linkUrl}</p>
                  </div>
                  <Switch checked={!!video.isActive} onCheckedChange={() => toggleVideoActive(video)} />
                  <Button variant="ghost" size="sm" onClick={() => openVideoDialog(video)}><Edit2 size={14} /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteVideo(video.id)}><Trash2 size={14} /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── STORES TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="stores" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Gestion des Magasins</h3>
            <Button size="sm" onClick={() => openStoreDialog()}>
              <Plus size={16} className="mr-1" /> Ajouter
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Titre section: <strong>{settingsForm.storesSectionTitle}</strong></p>

          <div className="space-y-2">
            {adminStores.map(store => (
              <div key={store.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: store.backgroundColor ?? "#ccc" }}>
                  {store.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{store.name}</p>
                  <p className="text-xs text-muted-foreground">{store.linkUrl} · Ordre: {store.displayOrder}</p>
                </div>
                <Switch checked={!!store.isActive} onCheckedChange={() => toggleStoreActive(store)} />
                <Button variant="ghost" size="sm" onClick={() => openStoreDialog(store)}><Edit2 size={14} /></Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteStore(store.id)}><Trash2 size={14} /></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── TEXTS TAB ──────────────────────────────────────────────────── */}
        <TabsContent value="texts" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Section Hero</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Texte du bouton</label>
                <Input value={settingsForm.heroButtonText} onChange={e => setSettingsForm(p => ({ ...p, heroButtonText: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Lien du bouton</label>
                <Input value={settingsForm.heroButtonLink} onChange={e => setSettingsForm(p => ({ ...p, heroButtonLink: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Section Admin (sous le Hero)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Titre H2</label>
                <Input value={settingsForm.adminHeadline} onChange={e => setSettingsForm(p => ({ ...p, adminHeadline: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Texte du bouton</label>
                <Input value={settingsForm.adminButtonText} onChange={e => setSettingsForm(p => ({ ...p, adminButtonText: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Lien du bouton</label>
                <Input value={settingsForm.adminButtonLink} onChange={e => setSettingsForm(p => ({ ...p, adminButtonLink: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Section Magasins</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Titre de la section</label>
                <Input value={settingsForm.storesSectionTitle} onChange={e => setSettingsForm(p => ({ ...p, storesSectionTitle: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Footer — Réseaux Sociaux</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Facebook URL</label>
                <Input value={settingsForm.footerFacebook} onChange={e => setSettingsForm(p => ({ ...p, footerFacebook: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Instagram URL</label>
                <Input value={settingsForm.footerInstagram} onChange={e => setSettingsForm(p => ({ ...p, footerInstagram: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">WhatsApp (numéro)</label>
                <Input value={settingsForm.footerWhatsapp} onChange={e => setSettingsForm(p => ({ ...p, footerWhatsapp: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={settingsForm.footerEmail} onChange={e => setSettingsForm(p => ({ ...p, footerEmail: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={saveSettings} disabled={updateSettingsMut.isPending}>
            {updateSettingsMut.isPending ? "Sauvegarde..." : "💾 Enregistrer tous les textes"}
          </Button>
        </TabsContent>

        {/* ── COLORS TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Couleurs & Police</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Couleur Primaire</label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={settingsForm.primaryColor} onChange={e => setSettingsForm(p => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border" />
                    <Input value={settingsForm.primaryColor} onChange={e => setSettingsForm(p => ({ ...p, primaryColor: e.target.value }))} className="font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Couleur Accent (Or)</label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={settingsForm.accentColor} onChange={e => setSettingsForm(p => ({ ...p, accentColor: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border" />
                    <Input value={settingsForm.accentColor} onChange={e => setSettingsForm(p => ({ ...p, accentColor: e.target.value }))} className="font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Couleur Bouton Hero</label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={settingsForm.heroButtonColor} onChange={e => setSettingsForm(p => ({ ...p, heroButtonColor: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border" />
                    <Input value={settingsForm.heroButtonColor} onChange={e => setSettingsForm(p => ({ ...p, heroButtonColor: e.target.value }))} className="font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Texte Bouton Hero</label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={settingsForm.heroButtonTextColor} onChange={e => setSettingsForm(p => ({ ...p, heroButtonTextColor: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border" />
                    <Input value={settingsForm.heroButtonTextColor} onChange={e => setSettingsForm(p => ({ ...p, heroButtonTextColor: e.target.value }))} className="font-mono" />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl border" style={{ background: settingsForm.primaryColor }}>
                <p className="text-xs mb-2" style={{ color: settingsForm.accentColor }}>Aperçu</p>
                <button className="px-6 py-3 rounded-xl font-semibold" style={{ background: settingsForm.heroButtonColor, color: settingsForm.heroButtonTextColor }}>
                  {settingsForm.heroButtonText}
                </button>
              </div>

              <div>
                <label className="text-sm font-medium">Police (Font Family)</label>
                <select
                  value={settingsForm.fontFamily}
                  onChange={e => setSettingsForm(p => ({ ...p, fontFamily: e.target.value }))}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="Inter">Inter (défaut)</option>
                  <option value="'Barlow Condensed', sans-serif">Barlow Condensed</option>
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="'Playfair Display', serif">Playfair Display</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: settingsForm.fontFamily }}>
                  Aperçu: BYSIS •• Qualité Française
                </p>
              </div>

              <Button className="w-full" onClick={saveSettings} disabled={updateSettingsMut.isPending}>
                {updateSettingsMut.isPending ? "Sauvegarde..." : "🎨 Enregistrer les couleurs & police"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── VIDEO DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={videoDialog} onOpenChange={setVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVideo ? "Modifier la vidéo" : "Ajouter une vidéo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={videoForm.type}
                onChange={e => setVideoForm(p => ({ ...p, type: e.target.value as "hero" | "slider" }))}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="hero">🎬 Hero (grande vidéo)</option>
                <option value="slider">🎞️ Slider (portrait)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Arrivage Europe" />
            </div>
            <div>
              <label className="text-sm font-medium">URL de la vidéo (MP4)</label>
              <Input value={videoForm.videoUrl} onChange={e => setVideoForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium">Lien (clic sur la vidéo)</label>
              <Input value={videoForm.linkUrl} onChange={e => setVideoForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="/arrivage" />
            </div>
            <div>
              <label className="text-sm font-medium">Ordre d'affichage</label>
              <Input type="number" value={videoForm.displayOrder} onChange={e => setVideoForm(p => ({ ...p, displayOrder: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={saveVideo} disabled={createVideoMut.isPending || updateVideoMut.isPending}>
                {createVideoMut.isPending || updateVideoMut.isPending ? "..." : "💾 Enregistrer"}
              </Button>
              <Button variant="outline" onClick={() => setVideoDialog(false)}>Annuler</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── STORE DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={storeDialog} onOpenChange={setStoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStore ? "Modifier le magasin" : "Ajouter un magasin"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom du magasin</label>
              <Input value={storeForm.name} onChange={e => setStoreForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: SHEIN ••" />
            </div>
            <div>
              <label className="text-sm font-medium">URL du logo (image)</label>
              <Input value={storeForm.logoUrl} onChange={e => setStoreForm(p => ({ ...p, logoUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium">Lien du magasin</label>
              <Input value={storeForm.linkUrl} onChange={e => setStoreForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="/store/shein" />
            </div>
            <div>
              <label className="text-sm font-medium">Couleur de fond</label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={storeForm.backgroundColor} onChange={e => setStoreForm(p => ({ ...p, backgroundColor: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border" />
                <Input value={storeForm.backgroundColor} onChange={e => setStoreForm(p => ({ ...p, backgroundColor: e.target.value }))} className="font-mono" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={!!storeForm.isDark} onCheckedChange={v => setStoreForm(p => ({ ...p, isDark: v ? 1 : 0 }))} />
              <label className="text-sm">Texte blanc (fond sombre)</label>
            </div>
            <div>
              <label className="text-sm font-medium">Ordre</label>
              <Input type="number" value={storeForm.displayOrder} onChange={e => setStoreForm(p => ({ ...p, displayOrder: Number(e.target.value) }))} />
            </div>
            {/* Preview */}
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: storeForm.backgroundColor }}>
              <span className="font-semibold text-lg" style={{ color: storeForm.isDark ? "#fff" : "#1C2B33" }}>{storeForm.name || "Nom"}</span>
              {storeForm.logoUrl && <img src={storeForm.logoUrl} alt="" className="h-12 object-contain" />}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={saveStore} disabled={createStoreMut.isPending || updateStoreMut.isPending}>
                {createStoreMut.isPending || updateStoreMut.isPending ? "..." : "💾 Enregistrer"}
              </Button>
              <Button variant="outline" onClick={() => setStoreDialog(false)}>Annuler</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
