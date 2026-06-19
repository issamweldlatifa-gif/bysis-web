import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus, Pencil, Trash2, GripVertical, Image, Eye, EyeOff, Loader2, ChevronUp, ChevronDown,
} from "lucide-react";

const WHITE = "#FFFFFF";
const BG = "#F4F6F9";
const BORDER = "#E2E8F0";
const TEXT = "#1A202C";
const MUTED = "#718096";
const BLUE = "#1A1A1A";
const RED = "#E53E3E";

type Slide = {
  id: number;
  title: string;
  subtitle: string | null;
  bgColor: string;
  textColor: string | null;
  imageUrl: string | null;
  card1Label: string | null; card1Image: string | null; card1Link: string | null;
  card2Label: string | null; card2Image: string | null; card2Link: string | null;
  card3Label: string | null; card3Image: string | null; card3Link: string | null;
  card4Label: string | null; card4Image: string | null; card4Link: string | null;
  displayOrder: number;
  active: number;
};

const defaultForm = {
  title: "",
  subtitle: "",
  bgColor: "#E8192C",
  textColor: "#ffffff",
  imageUrl: "",
  card1Label: "", card1Image: "", card1Link: "",
  card2Label: "", card2Image: "", card2Link: "",
  card3Label: "", card3Image: "", card3Link: "",
  card4Label: "", card4Image: "", card4Link: "",
  displayOrder: 0,
  active: 1,
};

export default function AdminSlides() {
  const utils = trpc.useUtils();
  const { data: slides = [], isLoading } = trpc.carousel.adminList.useQuery();
  const createSlide = trpc.carousel.create.useMutation({
    onSuccess: () => { utils.carousel.adminList.invalidate(); toast.success("Slide créé ✅"); setDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateSlide = trpc.carousel.update.useMutation({
    onSuccess: () => { utils.carousel.adminList.invalidate(); toast.success("Slide mis à jour ✅"); setDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteSlide = trpc.carousel.delete.useMutation({
    onSuccess: () => { utils.carousel.adminList.invalidate(); toast.success("Slide supprimé"); },
    onError: (e) => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadField, setActiveUploadField] = useState<string>("");

  const openCreate = () => {
    setEditingSlide(null);
    setForm({ ...defaultForm, displayOrder: slides.length });
    setDialogOpen(true);
  };

  const openEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle || "",
      bgColor: slide.bgColor,
      textColor: slide.textColor || "#ffffff",
      imageUrl: slide.imageUrl || "",
      card1Label: slide.card1Label || "", card1Image: slide.card1Image || "", card1Link: slide.card1Link || "",
      card2Label: slide.card2Label || "", card2Image: slide.card2Image || "", card2Link: slide.card2Link || "",
      card3Label: slide.card3Label || "", card3Image: slide.card3Image || "", card3Link: slide.card3Link || "",
      card4Label: slide.card4Label || "", card4Image: slide.card4Image || "", card4Link: slide.card4Link || "",
      displayOrder: slide.displayOrder,
      active: slide.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      subtitle: form.subtitle || undefined,
      imageUrl: form.imageUrl || undefined,
      card1Label: form.card1Label || undefined, card1Image: form.card1Image || undefined, card1Link: form.card1Link || undefined,
      card2Label: form.card2Label || undefined, card2Image: form.card2Image || undefined, card2Link: form.card2Link || undefined,
      card3Label: form.card3Label || undefined, card3Image: form.card3Image || undefined, card3Link: form.card3Link || undefined,
      card4Label: form.card4Label || undefined, card4Image: form.card4Image || undefined, card4Link: form.card4Link || undefined,
    };
    if (editingSlide) {
      updateSlide.mutate({ id: editingSlide.id, ...payload });
    } else {
      createSlide.mutate(payload);
    }
  };

  const handleMoveUp = (slide: Slide) => {
    const sorted = [...slides].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex(s => s.id === slide.id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    updateSlide.mutate({ id: slide.id, displayOrder: prev.displayOrder });
    updateSlide.mutate({ id: prev.id, displayOrder: slide.displayOrder });
  };

  const handleMoveDown = (slide: Slide) => {
    const sorted = [...slides].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex(s => s.id === slide.id);
    if (idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    updateSlide.mutate({ id: slide.id, displayOrder: next.displayOrder });
    updateSlide.mutate({ id: next.id, displayOrder: slide.displayOrder });
  };

  const handleToggleActive = (slide: Slide) => {
    updateSlide.mutate({ id: slide.id, active: slide.active === 1 ? 0 : 1 });
  };

  // Image upload via base64
  const handleImageUpload = async (field: string, file: File) => {
    setUploadingField(field);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const res = await fetch("/api/trpc/products.uploadImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json: { base64, filename: file.name, mimeType: file.type } }),
        });
        const data = await res.json();
        const url = data?.result?.data?.json?.url;
        if (url) {
          setForm(f => ({ ...f, [field]: url }));
          toast.success("Image uploadée ✅");
        } else {
          toast.error("Erreur upload image");
        }
        setUploadingField(null);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Erreur upload image");
      setUploadingField(null);
    }
  };

  const triggerUpload = (field: string) => {
    setActiveUploadField(field);
    fileInputRef.current?.click();
  };

  const sorted = [...slides].sort((a, b) => a.displayOrder - b.displayOrder);

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
          <h2 className="text-lg font-bold" style={{ color: TEXT }}>Slides du Carousel</h2>
          <p className="text-sm" style={{ color: MUTED }}>{slides.length} slide(s) configuré(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: BLUE }}>
          <Plus size={16} /> Nouveau Slide
        </button>
      </div>

      {/* Slides list */}
      <div className="space-y-3">
        {sorted.map((slide, idx) => (
          <div key={slide.id} className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
            {/* Color preview */}
            <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
              style={{ background: slide.bgColor }}>
              {slide.displayOrder + 1}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: TEXT }}>{slide.title}</p>
              {slide.subtitle && <p className="text-xs truncate" style={{ color: MUTED }}>{slide.subtitle}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: slide.active === 1 ? "#D1FAE5" : "#FEE2E2", color: slide.active === 1 ? "#065F46" : "#991B1B" }}>
                  {slide.active === 1 ? "Actif" : "Inactif"}
                </span>
                <span className="text-xs" style={{ color: MUTED }}>Ordre: {slide.displayOrder}</span>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => handleMoveUp(slide)} disabled={idx === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronUp size={14} style={{ color: MUTED }} />
              </button>
              <button onClick={() => handleMoveDown(slide)} disabled={idx === sorted.length - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronDown size={14} style={{ color: MUTED }} />
              </button>
              <button onClick={() => handleToggleActive(slide)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                {slide.active === 1 ? <Eye size={14} style={{ color: "#10B981" }} /> : <EyeOff size={14} style={{ color: MUTED }} />}
              </button>
              <button onClick={() => openEdit(slide)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Pencil size={14} style={{ color: BLUE }} />
              </button>
              <button onClick={() => { if (confirm("Supprimer ce slide ?")) deleteSlide.mutate({ id: slide.id }); }}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={14} style={{ color: RED }} />
              </button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
            <p className="text-sm" style={{ color: MUTED }}>Aucun slide configuré. Créez votre premier slide !</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activeUploadField) handleImageUpload(activeUploadField, file);
          e.target.value = "";
        }}
      />

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: WHITE }}>
          <DialogHeader>
            <DialogTitle style={{ color: TEXT }}>
              {editingSlide ? "Modifier le Slide" : "Nouveau Slide"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Preview */}
            <div className="rounded-xl p-4 text-white relative overflow-hidden h-24 flex items-center"
              style={{ background: form.bgColor, color: form.textColor }}>
              <div>
                <p className="font-bold text-lg">{form.title || "Titre du slide"}</p>
                <p className="text-sm opacity-80">{form.subtitle || "Sous-titre"}</p>
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Titre *</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Ventes Flash" className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Sous-titre</label>
                <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Ex: Jusqu'à -50%" className="rounded-xl" style={{ background: BG, borderColor: BORDER }} />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Couleur de fond</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border cursor-pointer" style={{ borderColor: BORDER }} />
                  <Input value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                    className="rounded-xl flex-1" style={{ background: BG, borderColor: BORDER }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Couleur du texte</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border cursor-pointer" style={{ borderColor: BORDER }} />
                  <Input value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                    className="rounded-xl flex-1" style={{ background: BG, borderColor: BORDER }} />
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Image principale (URL ou upload)</label>
              <div className="flex gap-2">
                <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..." className="rounded-xl flex-1" style={{ background: BG, borderColor: BORDER }} />
                <button onClick={() => triggerUpload("imageUrl")} disabled={uploadingField === "imageUrl"}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1"
                  style={{ background: BLUE }}>
                  {uploadingField === "imageUrl" ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
                </button>
              </div>
            </div>

            {/* Cards 1-4 */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: MUTED }}>Cartes (2×2 grid)</label>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="rounded-xl p-3 space-y-2" style={{ background: BG, border: `1px solid ${BORDER}` }}>
                    <p className="text-xs font-semibold" style={{ color: TEXT }}>Carte {n}</p>
                    <Input
                      value={(form as any)[`card${n}Label`]}
                      onChange={e => setForm(f => ({ ...f, [`card${n}Label`]: e.target.value }))}
                      placeholder="Label" className="rounded-lg text-xs h-8" style={{ background: WHITE, borderColor: BORDER }} />
                    <div className="flex gap-1">
                      <Input
                        value={(form as any)[`card${n}Image`]}
                        onChange={e => setForm(f => ({ ...f, [`card${n}Image`]: e.target.value }))}
                        placeholder="Image URL" className="rounded-lg text-xs h-8 flex-1" style={{ background: WHITE, borderColor: BORDER }} />
                      <button onClick={() => triggerUpload(`card${n}Image`)} disabled={uploadingField === `card${n}Image`}
                        className="px-2 rounded-lg text-white flex items-center"
                        style={{ background: BLUE }}>
                        {uploadingField === `card${n}Image` ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
                      </button>
                    </div>
                    <Input
                      value={(form as any)[`card${n}Link`]}
                      onChange={e => setForm(f => ({ ...f, [`card${n}Link`]: e.target.value }))}
                      placeholder="Lien (/produits)" className="rounded-lg text-xs h-8" style={{ background: WHITE, borderColor: BORDER }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Order + Active */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Ordre d'affichage</label>
                <Input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
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
            <button
              onClick={handleSubmit}
              disabled={!form.title || createSlide.isPending || updateSlide.isPending}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
              style={{ background: BLUE }}>
              {(createSlide.isPending || updateSlide.isPending) && <Loader2 size={14} className="animate-spin" />}
              {editingSlide ? "Mettre à jour" : "Créer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
