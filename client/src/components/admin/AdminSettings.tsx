import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    companyName: "",
    companyEmail: "",
    defaultMarkup: "2.0",
    minOrderAmount: "0",
  });

  const [isSaving, setIsSaving] = useState(false);
  const setMutation = trpc.settings.set.useMutation();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save each setting
      for (const [key, value] of Object.entries(settings)) {
        await setMutation.mutateAsync({
          key,
          value: String(value),
        });
      }
      toast.success("Paramètres sauvegardés");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6 text-slate-900">
          Paramètres de l'application
        </h2>

        <div className="space-y-6">
          <div>
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) =>
                setSettings({ ...settings, companyName: e.target.value })
              }
              placeholder="Votre nom d'entreprise"
            />
          </div>

          <div>
            <Label htmlFor="companyEmail">Email de l'entreprise</Label>
            <Input
              id="companyEmail"
              type="email"
              value={settings.companyEmail}
              onChange={(e) =>
                setSettings({ ...settings, companyEmail: e.target.value })
              }
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <Label htmlFor="defaultMarkup">
              Coefficient de marge par défaut
            </Label>
            <Input
              id="defaultMarkup"
              type="number"
              step="0.1"
              min="0"
              value={settings.defaultMarkup}
              onChange={(e) =>
                setSettings({ ...settings, defaultMarkup: e.target.value })
              }
              placeholder="2.0"
            />
            <p className="text-xs text-slate-500 mt-1">
              Multiplicateur appliqué au prix source pour calculer le prix final
            </p>
          </div>

          <div>
            <Label htmlFor="minOrderAmount">Montant minimum de commande ($)</Label>
            <Input
              id="minOrderAmount"
              type="number"
              step="0.01"
              min="0"
              value={settings.minOrderAmount}
              onChange={(e) =>
                setSettings({ ...settings, minOrderAmount: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde en cours...
              </>
            ) : (
              "Sauvegarder les paramètres"
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Informations</h3>
        <p className="text-sm text-blue-800">
          Les paramètres de l'application sont utilisés pour configurer le
          comportement global de la plateforme, y compris les calculs de prix
          et les validations de commande.
        </p>
      </Card>
    </div>
  );
}
