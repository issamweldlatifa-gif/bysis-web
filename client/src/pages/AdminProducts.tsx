import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus, Pencil, Trash2, Search, Image, Loader2, Package, Tag,
} from "lucide-react";

const WHITE = "#FFFFFF";
const BG = "#F4F6F9";
const BORDER = "#E2E8F0";
const TEXT = "#1A202C";
const MUTED = "#718096";
const BLUE = "#1A1A1A";
const RED = "#E53E3E";
const GREEN = "#00A651";

const PLATFORM_LABELS: Record<string, string> = {
  shein: "Shein", aliexpress: "AliExpress", temu: "Temu", local: "Local",
};

const defaultForm = {
  categoryId: 0,
  name: "",
  slug: "",
  description: "",
  priceTnd: 0,
  priceEur: 0,
  originalPrice: 0,
  discount: 0,
  imageUrl: "",
  platform: "local" as "shein" | "aliexpress" | "temu" | "local",
  platformLink: "",
  stock: 0,
  active: 1,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(0);
  const limit = 20;
  const { data: productsData, isLoading } = trpc.products.adminList.useQuery({ limit, offset: page * limit });
  const { data: categories = [] } = trpc.categories.adminList.useQuery();

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); toast.success("Produit créé ✅"); setDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); toast.success("Produit mis à jour ✅"); setDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); toast.success("Produit supprimé"); },
    onError: (e) => toast.error(e.message),
  });
  const uploadImage = trpc.products.uploadImage.useMutation({
    onSuccess: (data) => { setForm(f => ({ ...f, imageUrl: data.url })); toast.success("Image uploadée ✅"); },
    onError: (e) => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const products = productsData?.items ?? [];
  const total = productsData?.total ?? 0;

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm, categoryId: categories[0]?.id ?? 0 });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      categoryId: p.categoryId,
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      priceTnd: p.priceTnd,
      priceEur: p.priceEur || 0,
      originalPrice: p.originalPrice || 0,
      discount: p.discount || 0,
      imageUrl: p.imageUrl || "",
      platform: p.platform || "local",
      platformLink: p.platformLink || "",
      stock: p.stock || 0,
      active: p.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.slug || !form.categoryId || form.priceTnd <= 0) {
      toast.error("Remplissez les champs obligatoires");
      return;
    }
    const payload = {
      ...form,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      platformLink: form.platformLink || undefined,
      priceEur: form.priceEur || undefined,
      originalPrice: form.originalPrice || undefined,
    };
    if (editingId) {
      updateProduct.mutate({ id: editingId, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      uploadImage.mutate({ base64, filename: file.name, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name ?? "—";

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: BLUE }} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: TEXT }}>Catalogue Produits</h2>
          <p className="text-sm" style={{ color: MUTED }}>{total} produit(s) au total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: BLUE }}>
          <Plus size={16} /> Nouveau Produit
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: WHITE, border: `1px solid ${BORDER}`, color: TEXT }}
        />
      </div>

      {/* Products table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
              <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: MUTED }}>Produit</th>
              <th className="text-left px-4 py-3 font-semibold text-xs hidden md:table-cell" style={{ color: MUTED }}>Catégorie</th>
              <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: MUTED }}>Prix TND</th>
              <th className="text-left px-4 py-3 font-semibold text-xs hidden md:table-cell" style={{ color: MUTED }}>Stock</th>
              <th className="text-left px-4 py-3 font-semibold text-xs hidden md:table-cell" style={{ color: MUTED }}>Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}` }} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: BG }}>
                        <Package size={16} style={{ color: MUTED }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[150px]" style={{ color: TEXT }}>{p.name}</p>
                      <p className="text-xs" style={{ color: MUTED }}>{PLATFORM_LABELS[p.platform] || p.platform}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: BG, color: MUTED }}>
                    {getCategoryName(p.categoryId)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold" style={{ color: TEXT }}>{p.priceTnd} DT</span>
                  {p.discount > 0 && <span className="text-xs ml-1" style={{ color: RED }}>-{p.discount}%</span>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span style={{ color: p.stock > 0 ? GREEN : RED }}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{ background: p.active === 1 ? "#D1FAE5" : "#FEE2E2", color: p.active === 1 ? "#065F46" : "#991B1B" }}>
                    {p.active === 1 ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <Pencil size={14} style={{ color: BLUE }} />
                    </button>
                    <button onClick={() => { if (confirm("Supprimer ce produit ?")) deleteProduct.mutate({ id: p.id }); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} style={{ color: RED }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: MUTED }}>
                  Aucun produit trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: MUTED }}>
            {page * limit + 1}–{Math.min((page + 1) * limit, total)} sur {total}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: BG, color: TEXT }}>Précédent</button>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= total}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: BG, color: TEXT }}>Suivant</button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: WHITE }}>
          <DialogHeader>
            <DialogTitle style={{ color: TEXT }}>{editingId ? "Modifier le Produit" : "Nouveau Produit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Image */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Image du produit</label>
              <div className="flex gap-2 items-center">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="w-16 h-16 rounded-xl object-cover" />
                )}
                <div className="flex-1 flex gap-2">
                  <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="URL de l'image" className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadImage.isPending}
                    className="px-3 py-2 rounded-xl text-white flex items-center gap-1 text-sm"
                    style={{ background: BLUE }}>
                    {uploadImage.isPending ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Name + Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Nom *</label>
                <Input value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editingId ? f.slug : slugify(e.target.value) }))}
                  placeholder="Nom du produit" className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Slug *</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="nom-du-produit" className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
            </div>

            {/* Category + Platform */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Catégorie *</label>
                <Select value={String(form.categoryId)} onValueChange={v => setForm(f => ({ ...f, categoryId: parseInt(v) }))}>
                  <SelectTrigger className="rounded-xl" style={{ background: BG, borderColor: BORDER }}>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Plateforme</label>
                <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v as any }))}>
                  <SelectTrigger className="rounded-xl" style={{ background: BG, borderColor: BORDER }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="shein">Shein</SelectItem>
                    <SelectItem value="aliexpress">AliExpress</SelectItem>
                    <SelectItem value="temu">Temu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Prix TND *</label>
                <Input type="number" value={form.priceTnd} onChange={e => setForm(f => ({ ...f, priceTnd: parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Prix EUR</label>
                <Input type="number" value={form.priceEur} onChange={e => setForm(f => ({ ...f, priceEur: parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Remise %</label>
                <Input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: parseInt(e.target.value) || 0 }))}
                  min={0} max={100} className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
            </div>

            {/* Stock + Active */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Stock</label>
                <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                  className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch checked={form.active === 1} onCheckedChange={v => setForm(f => ({ ...f, active: v ? 1 : 0 }))} />
                <Label className="text-sm" style={{ color: TEXT }}>Actif</Label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Description du produit..." className="rounded-xl resize-none"
                style={{ background: BG, borderColor: BORDER }} />
            </div>

            {/* Platform link */}
            {form.platform !== "local" && (
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Lien {PLATFORM_LABELS[form.platform]}</label>
                <Input value={form.platformLink} onChange={e => setForm(f => ({ ...f, platformLink: e.target.value }))}
                  placeholder="https://..." className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
            )}
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: BG, color: TEXT }}>
              Annuler
            </button>
            <button onClick={handleSubmit}
              disabled={createProduct.isPending || updateProduct.isPending}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
              style={{ background: BLUE }}>
              {(createProduct.isPending || updateProduct.isPending) && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Mettre à jour" : "Créer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
