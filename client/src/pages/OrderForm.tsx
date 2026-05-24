import { useState, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { useChatContext } from "@/App";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AuthGateModal from "@/components/AuthGateModal";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import {
  ShoppingCart,
  Link as PhLink,
  UploadSimple,
  CheckCircle,
  User,
  Phone,
  MapPin,
  Hash,
  Note,
  ArrowLeft,
  Bank,
  Money,
  Receipt,
  Image as PhImage,
} from "@phosphor-icons/react";
import { useLocation } from "wouter";

const inputBase: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1.5px solid #E5E5E5",
  color: "#1D1D1D",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  width: "100%",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
};

function PPInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputBase, ...(props.style as React.CSSProperties) }}
      onFocus={(e) => {
        e.target.style.borderColor = "#1A1A1A";
        e.target.style.background = "#FFFFFF";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#E5E5E5";
        e.target.style.background = "#FFFFFF";
        props.onBlur?.(e);
      }}
    />
  );
}

function PPTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...inputBase, resize: "vertical", minHeight: "80px", ...(props.style as React.CSSProperties) }}
      onFocus={(e) => {
        e.target.style.borderColor = "#1A1A1A";
        e.target.style.background = "#FFFFFF";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#E5E5E5";
        e.target.style.background = "#FFFFFF";
      }}
    />
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold mb-1.5" style={{ color: "#666666", fontFamily: "Inter, sans-serif" }}>
      {children}
      {required && <span className="text-blue-400 ml-1">*</span>}
    </label>
  );
}

export default function OrderForm() {
  const [, navigate] = useLocation();
  const { openChat } = useChatContext();
  const { isAuthenticated } = useAuth();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "mandat" | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerSurname: "",
    customerPhone: "",
    gouvernorat: "",
    customerAddress: "",
    productLink: "",
    quantity: 1,
    notes: "",
    screenshot: "",
    paymentReceipt: "",
  });

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      if (data?.trackingCode) {
        sessionStorage.setItem('bysis_order_confirmation', JSON.stringify({
          trackingCode: data.trackingCode,
          customerName: `${form.customerSurname} ${form.customerName}`.trim(),
          orderId: data.orderId,
        }));
        navigate('/confirmation');
      } else {
        setSubmitted(true);
        toast.success('Commande envoyée !');
      }
    },
    onError: (error) => { toast.error('Erreur : ' + error.message); },
  });

  const handleScreenshotUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 10 Mo"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setScreenshotPreview(b64);
      setForm((prev) => ({ ...prev, screenshot: b64 }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReceiptUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 10 Mo"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setReceiptPreview(b64);
      setForm((prev) => ({ ...prev, paymentReceipt: b64 }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { toast.error("Veuillez entrer votre nom"); return; }
    if (!form.customerSurname.trim()) { toast.error("Veuillez entrer votre prénom"); return; }
    if (!form.productLink.trim()) { toast.error("Veuillez entrer le lien du produit"); return; }
    if (!form.customerAddress.trim()) { toast.error("Veuillez entrer votre adresse"); return; }
    // Show auth gate if not authenticated
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    createOrder.mutate({
      customerName: `${form.customerSurname} ${form.customerName}`,
      customerPhone: form.customerPhone || undefined,
      gouvernorat: form.gouvernorat || undefined,
      customerAddress: form.gouvernorat ? `${form.gouvernorat} — ${form.customerAddress}` : form.customerAddress || undefined,
      productLink: form.productLink,
      quantity: form.quantity,
      notes: form.notes || undefined,
      screenshotBase64: form.screenshot || undefined,
      paymentReceiptBase64: form.paymentReceipt || undefined,
      paymentMethod: paymentMethod || undefined,
    });
  };

  const handleReset = () => {
    setSubmitted(false);
    setScreenshotPreview(null);
    setReceiptPreview(null);
    setPaymentMethod(null);
    setForm({ customerName: "", customerSurname: "", customerPhone: "", gouvernorat: "", customerAddress: "", productLink: "", quantity: 1, notes: "", screenshot: "", paymentReceipt: "" });
  };

  if (submitted) {
    return (
      <AppLayout onChatOpen={openChat}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="rounded-3xl max-w-sm w-full text-center p-10 space-y-6" style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", boxShadow: "0 4px 16px rgba(0,0,0,0.09)" }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: "#E6F7EE", border: "1px solid rgba(0,166,81,0.3)" }}>
              <CheckCircle size={44} weight="fill" className="text-[#00A651]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1D1D1D] mb-2">Commande envoyée !</h2>
              <p className="text-[#999999] text-sm leading-relaxed">
                Votre commande a été reçue. Nous vous contacterons bientôt pour confirmer les détails et le prix en TND.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleReset}
                className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                style={{ background: "#1A1A1A", boxShadow: "0 4px 14px rgba(26,26,26,0.35)" }}>
                <ShoppingCart size={18} weight="bold" /> Nouvelle commande
              </button>
              <button onClick={() => navigate('/')}
                className="w-full h-12 rounded-xl font-semibold text-[#999999] flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                style={{ background: "#FFFFFF", border: "1.5px solid #E5E5E5" }}>
                <ArrowLeft size={18} /> Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout onChatOpen={openChat}>
      <div className="px-5 pt-8 pb-28 max-w-lg mx-auto" style={{ background: "#FFFFFF", minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#1A1A1A" }}>
            <ShoppingCart size={20} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1D1D1D]">Passer une commande</h1>
            <p className="text-[#999999] text-xs">Remplissez les champs ci-dessous</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-5 space-y-5" style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>Prénom</FieldLabel>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
                  <PPInput placeholder="Prénom" value={form.customerSurname}
                    onChange={(e) => setForm({ ...form, customerSurname: e.target.value })}
                    style={{ paddingLeft: "2.25rem" }} required />
                </div>
              </div>
              <div>
                <FieldLabel required>Nom</FieldLabel>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
                  <PPInput placeholder="Nom" value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    style={{ paddingLeft: "2.25rem" }} required />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <FieldLabel>Téléphone</FieldLabel>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
                <PPInput type="tel" placeholder="+216 XX XXX XXX" value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  style={{ paddingLeft: "2.25rem" }} />
              </div>
            </div>

            {/* Gouvernorat */}
            <div>
              <FieldLabel required>Gouvernorat</FieldLabel>
              <select
                value={form.gouvernorat}
                onChange={(e) => setForm({ ...form, gouvernorat: e.target.value })}
                required
                style={{
                  background: '#FFFFFF', border: '1.5px solid #E5E5E5',
                  color: form.gouvernorat ? '#1D1D1D' : '#9DA3A6',
                  borderRadius: '0.75rem', padding: '0.75rem 1rem',
                  width: '100%', fontSize: '0.875rem', outline: 'none',
                  fontFamily: 'Inter, sans-serif', appearance: 'none',
                }}
              >
                <option value="">Sélectionner votre gouvernorat</option>
                {['Ariana','Béja','Ben Arous','Bizerte','Gabès','Gafsa','Jendouba','Kairouan','Kasserine','Kébili','Kef','Mahdia','Manouba','Médenine','Monastir','Nabeul','Sfax','Sidi Bouzid','Siliana','Sousse','Tataouine','Tozeur','Tunis','Zaghouan'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <FieldLabel required>Adresse de livraison</FieldLabel>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
                <PPInput placeholder="Ville, rue, numéro..." value={form.customerAddress}
                  onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                  style={{ paddingLeft: "2.25rem" }} required />
              </div>
            </div>

            {/* Product Link */}
            <div>
              <FieldLabel required>Lien du produit</FieldLabel>
              <div className="relative">
                <PhLink size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
                <PPInput placeholder="https://shein.com/... ou aliexpress.com/..." value={form.productLink}
                  onChange={(e) => setForm({ ...form, productLink: e.target.value })}
                  style={{ paddingLeft: "2.25rem" }} required />
              </div>
            </div>

            {/* Screenshot */}
            <div>
              <FieldLabel>Capture d'écran du produit (optionnel)</FieldLabel>
              <label htmlFor="screenshot-upload"
                className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all duration-200"
                style={{ border: "2px dashed #E5E5E5", background: "#FFFFFF" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E5E5"; }}>
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Capture" className="h-full w-full object-contain rounded-xl p-2" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-[#999999]">
                    <PhImage size={26} />
                    <span className="text-sm font-medium text-[#999999]">Ajouter une image</span>
                    <span className="text-xs">PNG, JPG (max 10 Mo)</span>
                  </div>
                )}
                <input id="screenshot-upload" type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
              </label>
            </div>

            {/* Quantity + Notes row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <FieldLabel>Qté</FieldLabel>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
                  <PPInput type="number" min={1} value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                    style={{ paddingLeft: "2.25rem" }} />
                </div>
              </div>
              <div className="col-span-2">
                <FieldLabel>Remarques</FieldLabel>
                <div className="relative">
                  <Note size={14} className="absolute left-3 top-3 text-[#999999] pointer-events-none" />
                  <PPTextarea placeholder="Taille, couleur..." rows={1} value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    style={{ paddingLeft: "2.25rem", minHeight: "46px" }} />
                </div>
              </div>
            </div>

            {/* ─── Payment Section ─── */}
            <div className="rounded-xl p-4 space-y-4" style={{ background: "#FFFFFF", border: "1.5px solid #E5E5E5" }}>
              <div className="flex items-center gap-2 mb-1">
                <Receipt size={18} className="text-[#1A1A1A]" weight="fill" />
                <span className="text-sm font-bold text-[#1D1D1D]">Paiement (optionnel)</span>
              </div>
              <p className="text-xs text-[#999999] -mt-2">
                Si vous avez déjà effectué le paiement, sélectionnez le mode et joignez le reçu.
              </p>

              {/* Payment method selector */}
              <div className="grid grid-cols-2 gap-3">
                {/* Bank UIB */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod(paymentMethod === "bank" ? null : "bank")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  style={{
                    border: paymentMethod === "bank" ? "2px solid #1A1A1A" : "1.5px solid #E5E5E5",
                    background: paymentMethod === "bank" ? "#E8F4FD" : "#FFFFFF",
                    boxShadow: paymentMethod === "bank" ? "0 2px 8px rgba(26,26,26,0.15)" : "none",
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: paymentMethod === "bank" ? "#1A1A1A" : "#FFFFFF" }}>
                    <Bank size={20} weight="fill" className={paymentMethod === "bank" ? "text-white" : "text-[#999999]"} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold" style={{ color: paymentMethod === "bank" ? "#1A1A1A" : "#1D1D1D" }}>Virement bancaire</p>
                    <p className="text-[10px] text-[#999999]">UIB</p>
                  </div>
                  {paymentMethod === "bank" && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#1A1A1A" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>

                {/* Mandat minute */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod(paymentMethod === "mandat" ? null : "mandat")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  style={{
                    border: paymentMethod === "mandat" ? "2px solid #1A1A1A" : "1.5px solid #E5E5E5",
                    background: paymentMethod === "mandat" ? "#E8F4FD" : "#FFFFFF",
                    boxShadow: paymentMethod === "mandat" ? "0 2px 8px rgba(26,26,26,0.15)" : "none",
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: paymentMethod === "mandat" ? "#1A1A1A" : "#FFFFFF" }}>
                    <Money size={20} weight="fill" className={paymentMethod === "mandat" ? "text-white" : "text-[#999999]"} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold" style={{ color: paymentMethod === "mandat" ? "#1A1A1A" : "#1D1D1D" }}>Mandat minute</p>
                    <p className="text-[10px] text-[#999999]">La Poste</p>
                  </div>
                  {paymentMethod === "mandat" && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#1A1A1A" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              </div>

              {/* Bank details */}
              {paymentMethod === "bank" && (
                <div className="rounded-xl p-3 space-y-2" style={{ background: "#FFFFFF", border: "1px solid #E5E5E5" }}>
                  <p className="text-xs font-bold text-[#1A1A1A] mb-1">Coordonnées bancaires UIB</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#999999]">Banque</span>
                      <span className="text-xs font-semibold text-[#1D1D1D]">UIB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#999999]">Bénéficiaire</span>
                      <span className="text-xs font-semibold text-[#1D1D1D]">Nermin Mejrissi</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#999999]">RIB</span>
                      <span className="text-xs font-mono font-bold text-[#1A1A1A]">12067000013314111448</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#999999] pt-1 border-t border-[#FFFFFF]">
                    Indiquez votre nom et code de commande dans le motif du virement.
                  </p>
                </div>
              )}

              {/* Mandat minute instructions */}
              {paymentMethod === "mandat" && (
                <div className="rounded-xl p-3 space-y-2" style={{ background: "#FFFFFF", border: "1px solid #E5E5E5" }}>
                  <p className="text-xs font-bold text-[#1A1A1A] mb-1">Instructions Mandat minute</p>
                  <div className="space-y-1.5 text-xs text-[#666666]">
                    <p>1. Rendez-vous dans n'importe quel bureau de poste tunisien.</p>
                    <p>2. Demandez un <strong>Mandat minute</strong> au nom de <strong>Bysis Shop</strong>.</p>
                    <p>3. Précisez votre nom et numéro de téléphone dans la référence.</p>
                    <p>4. Joignez le reçu ci-dessous après envoi.</p>
                  </div>
                </div>
              )}

              {/* Receipt upload — shown only when a payment method is selected */}
              {paymentMethod && (
                <div>
                  <FieldLabel>Reçu de paiement</FieldLabel>
                  <label htmlFor="receipt-upload"
                    className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all duration-200"
                    style={{ border: "2px dashed #E5E5E5", background: "#FFFFFF" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E5E5"; }}>
                    {receiptPreview ? (
                      <img src={receiptPreview} alt="Reçu" className="h-full w-full object-contain rounded-xl p-2" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-[#999999]">
                        <UploadSimple size={26} />
                        <span className="text-sm font-medium text-[#999999]">Ajouter le reçu</span>
                        <span className="text-xs">Photo du reçu (max 10 Mo)</span>
                      </div>
                    )}
                    <input id="receipt-upload" type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                  </label>
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={createOrder.isPending}
              className="w-full rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
              style={{ height: "52px", background: "#1A1A1A", boxShadow: "0 4px 14px rgba(26,26,26,0.35)" }}>
              {createOrder.isPending ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Envoi...</>
              ) : (
                <><ShoppingCart size={20} weight="bold" /> Envoyer la commande</>
              )}
            </button>
          </form>
        </div>

        {/* Chat alternative */}
        <div className="mt-5 text-center">
          <p className="text-[#999999] text-xs mb-1.5">Ou commandez directement via le chat</p>
          <button onClick={openChat} className="text-sm font-semibold transition-colors" style={{ color: "#1A1A1A" }}>
            Ouvrir le chat →
          </button>
        </div>
      </div>

      {/* Auth Gate Modal — shown when unauthenticated user tries to submit */}
      <AuthGateModal
        open={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        action="order"
        returnPath="/order"
      />
    </AppLayout>
  );
}
