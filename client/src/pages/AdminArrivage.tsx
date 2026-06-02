import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, ArrowLeft, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";

type ArrivageItem = {
  id: number;
  name: string;
  description: string | null;
  priceTnd: number;
  priceEur: number | null;
  imageUrl: string | null;
  platform: "shein" | "aliexpress" | "temu";
  available: number;
  productLink: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const PLATFORM_LABELS: Record<string, string> = {
  shein: "Shein",
  aliexpress: "AliExpress",
  temu: "Temu",
};

const PLATFORM_COLORS: Record<string, string> = {
  shein: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  aliexpress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  temu: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const emptyForm = {
  name: "",
  description: "",
  priceTnd: "",
  priceEur: "",
  platform: "shein" as "shein" | "aliexpress" | "temu",
  available: 1,
  productLink: "",
  imageBase64: "",
  imagePreview: "",
};

export default function AdminArrivage() {
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.arrivage.listAll.useQuery();
  const createMutation = trpc.arrivage.create.useMutation({
    onSuccess: () => { utils.arrivage.listAll.invalidate(); toast.success("Produit ajouté !"); setShowDialog(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.arrivage.update.useMutation({
    onSuccess: () => { utils.arrivage.listAll.invalidate(); toast.success("Produit modifié !"); setShowDialog(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.arrivage.delete.useMutation({
    onSuccess: () => { utils.arrivage.listAll.invalidate(); toast.success("Produit supprimé !"); },
    onError: (e) => toast.error(e.message),
  });
  const toggleMutation = trpc.arrivage.update.useMutation({
    onSuccess: () => utils.arrivage.listAll.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowDialog(true);
  }

  function openEdit(item: ArrivageItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      priceTnd: String(item.priceTnd),
      priceEur: item.priceEur ? String(item.priceEur) : "",
      platform: item.platform,
      available: item.available,
      productLink: item.productLink || "",
      imageBase64: "",
      imagePreview: item.imageUrl || "",
    });
    setShowDialog(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm(f => ({ ...f, imageBase64: result, imagePreview: result }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.name || !form.priceTnd) { toast.error("الاسم والسعر مطلوبان"); return; }
    const payload = {
      name: form.name,
      description: form.description || undefined,
      priceTnd: parseInt(form.priceTnd),
      priceEur: form.priceEur ? parseInt(form.priceEur) : undefined,
      platform: form.platform,
      available: form.available,
      productLink: form.productLink || undefined,
      imageBase64: form.imageBase64 || undefined,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen" style={{ background: "#EEF2F7" }}>
      {/* Header */}
      <div className="border-b sticky top-0 z-10" style={{ background: "#FFFFFF", borderColor: "#CBD2D9" }}>
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-[#6C7378] hover:text-[#1D1D1D]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#1D1D1D" }}>إدارة الأريفاج</h1>
              <p className="text-[#6C7378] text-sm">{items?.length || 0} منتوج</p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="text-white border-0 gap-2" style={{ background: "#0070BA" }}
          >
            <Plus className="w-4 h-4" />
            إضافة منتوج
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/10 h-72 animate-pulse" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl bg-white/5 border overflow-hidden transition-all ${item.available ? "border-white/10" : "border-white/5 opacity-60"}`}
              >
                {/* Image */}
                <div className="relative h-48" style={{ background: "#EEF2F7" }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${PLATFORM_COLORS[item.platform]}`}>
                      {PLATFORM_LABELS[item.platform]}
                    </span>
                  </div>
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold px-3 py-1 rounded-full" style={{ background: "#0070BA" }}>مخفي</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1" style={{ color: "#1D1D1D" }} dir="rtl">{item.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-cyan-400 font-bold text-lg">{item.priceTnd} <span className="text-sm text-[#6C7378]">دينار</span></span>
                    {item.priceEur && <span className="text-[#9DA3A6] text-sm line-through">{item.priceEur}€</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5" style={{ border: "1px solid #CBD2D9", background: "#FFFFFF", color: "#1D1D1D" }}
                      onClick={() => openEdit(item as ArrivageItem)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="" style={{ border: "1px solid #CBD2D9", background: "#FFFFFF", color: "#6C7378" }}
                      onClick={() => toggleMutation.mutate({ id: item.id, available: item.available ? 0 : 1 })}
                      title={item.available ? "إخفاء" : "إظهار"}
                    >
                      {item.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/20"
                      onClick={() => { if (confirm("تأكيد الحذف؟")) deleteMutation.mutate({ id: item.id }); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-[#9DA3A6]" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#1D1D1D" }}>ما فيه منتجات بعد</h3>
            <p className="text-[#6C7378] mb-6">ابدأ بإضافة أول منتوج للأريفاج</p>
            <Button onClick={openCreate} className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة منتوج
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0d0d20] border border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {editingId ? "تعديل المنتوج" : "إضافة منتوج جديد"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image Upload */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">صورة المنتوج</label>
              <div
                className="relative h-40 rounded-xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/8 transition-all overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.imagePreview ? (
                  <img src={form.imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-[#9DA3A6] mx-auto mb-2" />
                    <span className="text-[#6C7378] text-sm">اضغط لرفع صورة</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">اسم المنتوج *</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="مثال: فستان صيفي أنيق"
                className="bg-white/5 border-white/10 text-white placeholder:text-[#9DA3A6]"
                dir="rtl"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">وصف (اختياري)</label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="وصف قصير للمنتوج..."
                className="bg-white/5 border-white/10 text-white placeholder:text-[#9DA3A6] resize-none"
                rows={2}
                dir="rtl"
              />
            </div>

            {/* Price row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">السعر بالدينار *</label>
                <Input
                  type="number"
                  value={form.priceTnd}
                  onChange={e => setForm(f => ({ ...f, priceTnd: e.target.value }))}
                  placeholder="120"
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#9DA3A6]"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">السعر بالأورو</label>
                <Input
                  type="number"
                  value={form.priceEur}
                  onChange={e => setForm(f => ({ ...f, priceEur: e.target.value }))}
                  placeholder="30"
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#9DA3A6]"
                />
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">المنصة</label>
              <Select value={form.platform} onValueChange={(v: any) => setForm(f => ({ ...f, platform: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d20] border-white/10">
                  <SelectItem value="shein" className="text-white hover:bg-white/10">Shein</SelectItem>
                  <SelectItem value="aliexpress" className="text-white hover:bg-white/10">AliExpress</SelectItem>
                  <SelectItem value="temu" className="text-white hover:bg-white/10">Temu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Link */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">رابط المنتوج (اختياري)</label>
              <Input
                value={form.productLink}
                onChange={e => setForm(f => ({ ...f, productLink: e.target.value }))}
                placeholder="https://..."
                className="bg-white/5 border-white/10 text-white placeholder:text-[#9DA3A6]"
                dir="ltr"
              />
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300 text-sm">ظاهر للعملاء</span>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, available: f.available ? 0 : 1 }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.available ? "bg-cyan-500" : "bg-[#EEF2F7]"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.available ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowDialog(false)} className="text-[#6C7378] hover:text-[#1D1D1D]">
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white border-0"
            >
              {isSaving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة المنتوج"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
