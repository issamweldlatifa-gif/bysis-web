import { useState } from "react";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Lock, User, ShieldCheck } from "@phosphor-icons/react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const inputStyle: React.CSSProperties = {
  background: "rgba(0, 112, 186, 0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.9)",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem 0.75rem 2.75rem",
  width: "100%",
  fontSize: "0.9375rem",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
};

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();

  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: () => {
      toast.success("Connexion réussie");
      navigate("/admin");
    },
    onError: (error) => {
      toast.error(error.message || "Identifiants incorrects");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div
          className="glass-card rounded-3xl max-w-md w-full p-8"
          style={{ boxShadow: "0 25px 60px rgba(26, 26, 46, 0.08), 0 0 0 1px rgba(0,212,200,0.1)" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, rgba(0,212,200,0.2), rgba(124,58,237,0.2))", border: "1px solid rgba(0,212,200,0.3)" }}
            >
              <ShieldCheck size={32} weight="fill" className="text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Administration</h1>
            <p className="text-[#9DA3A6] text-sm">Connectez-vous pour accéder au tableau de bord</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DA3A6] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                  autoComplete="username"
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(0,212,200,0.4)";
                    e.target.style.background = "rgba(0,212,200,0.06)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.10)";
                    e.target.style.background = "rgba(0, 112, 186, 0.05)";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DA3A6] pointer-events-none" />
                <input
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  autoComplete="current-password"
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(0,212,200,0.4)";
                    e.target.style.background = "rgba(0,212,200,0.06)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.10)";
                    e.target.style.background = "rgba(0, 112, 186, 0.05)";
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 mt-2"
              style={{ background: "linear-gradient(135deg, #00d4c8, #38bdf8)", boxShadow: "0 4px 20px rgba(0,212,200,0.3)" }}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
