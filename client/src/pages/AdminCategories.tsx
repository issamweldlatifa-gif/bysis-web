import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Loader2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";

const WHITE = "#FFFFFF";
const BG = "#F4F6F9";
const BORDER = "#E2E8F0";
const TEXT = "#1A202C";
const MUTED = "#718096";
const BLUE = "#1A1A1A";
const RED = "#E53E3E";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  icon: "",
  displayOrder: 0,
  active: 1,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminCategories() {
  const utils = trpc.useUtils();
  const { data: categories = [], isLoading } = trpc.categories.adminList.useQuery();

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => { utils.categories.adminList.invalidate(); toast.success("Catégorie créée ✅"); setDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateCategory = trpc.categories.update.useMutation({
    onSuccess: () => { utils.categories.adminList.invalidate(); toast.success("Catégorie mise à jour ✅"); setDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => { utils.categories.adminList.invalidate(); toast.success("Catégorie supprimée"); },
    onError: (e) => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm, displayOrder: categories.length });
    setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      icon: cat.icon || "",
      displayOrder: cat.displayOrder,
      active: cat.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.slug) { toast.error("Nom et slug sont requis"); return; }
    const payload = {
      ...form,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      icon: form.icon || undefined,
    };
    if (editingId) {
      updateCategory.mutate({ id: editingId, ...payload });
    } else {
      createCategory.mutate(payload);
    }
  };

  const handleMoveUp = (cat: any) => {
    const idx = sorted.findIndex(c => c.id === cat.id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    updateCategory.mutate({ id: cat.id, displayOrder: prev.displayOrder });
    updateCategory.mutate({ id: prev.id, displayOrder: cat.displayOrder });
  };

  const handleMoveDown = (cat: any) => {
    const idx = sorted.findIndex(c => c.id === cat.id);
    if (idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    updateCategory.mutate({ id: cat.id, displayOrder: next.displayOrder });
    updateCategory.mutate({ id: next.id, displayOrder: cat.displayOrder });
  };

  const handleToggleActive = (cat: any) => {
    updateCategory.mutate({ id: cat.id, active: cat.active === 1 ? 0 : 1 });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: BLUE }} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: TEXT }}>Catégories</h2>
          <p className="text-sm" style={{ color: MUTED }}>{categories.length} catégorie(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: BLUE }}>
          <Plus size={16} /> Nouvelle Catégorie
        </button>
      </div>

      {/* Categories list */}
      <div className="space-y-2">
        {sorted.map((cat, idx) => (
          <div key={cat.id} className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
            {/* Icon/Image */}
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
              style={{ background: BG }}>
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <span>{cat.icon || "📦"}</span>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: TEXT }}>{cat.name}</p>
              <p className="text-xs" style={{ color: MUTED }}>/{cat.slug}</p>
            </div>
            {/* Status */}
            <span className="text-xs px-2 py-0.5 rounded-full hidden sm:block"
              style={{ background: cat.active === 1 ? "#D1FAE5" : "#FEE2E2", color: cat.active === 1 ? "#065F46" : "#991B1B" }}>
              {cat.active === 1 ? "Actif" : "Inactif"}
            </span>
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => handleMoveUp(cat)} disabled={idx === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronUp size={14} style={{ color: MUTED }} />
              </button>
              <button onClick={() => handleMoveDown(cat)} disabled={idx === sorted.length - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronDown size={14} style={{ color: MUTED }} />
              </button>
              <button onClick={() => handleToggleActive(cat)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                {cat.active === 1 ? <Eye size={14} style={{ color: "#10B981" }} /> : <EyeOff size={14} style={{ color: MUTED }} />}
              </button>
              <button onClick={() => openEdit(cat)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Pencil size={14} style={{ color: BLUE }} />
              </button>
              <button onClick={() => { if (confirm("Supprimer cette catégorie ?")) deleteCategory.mutate({ id: cat.id }); }}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={14} style={{ color: RED }} />
              </button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
            <p className="text-sm" style={{ color: MUTED }}>Aucune catégorie. Créez votre première catégorie !</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: WHITE }}>
          <DialogHeader>
            <DialogTitle style={{ color: TEXT }}>{editingId ? "Modifier la Catégorie" : "Nouvelle Catégorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Nom *</label>
                <Input value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editingId ? f.slug : slugify(e.target.value) }))}
                  placeholder="Ex: Mode Femme" className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Slug *</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="mode-femme" className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} className="rounded-xl resize-none" style={{ background: BG, borderColor: BORDER }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Image URL</label>
                <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..." className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Icône (emoji)</label>
                <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="👗" className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Ordre</label>
                <Input type="number" value={form.displayOrder}
                  onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                  className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch checked={form.active === 1} onCheckedChange={v => setForm(f => ({ ...f, active: v ? 1 : 0 }))} />
                <Label className="text-sm" style={{ color: TEXT }}>Actif</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: BG, color: TEXT }}>
              Annuler
            </button>
            <button onClick={handleSubmit}
              disabled={createCategory.isPending || updateCategory.isPending}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
              style={{ background: BLUE }}>
              {(createCategory.isPending || updateCategory.isPending) && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Mettre à jour" : "Créer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
