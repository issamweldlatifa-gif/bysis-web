import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminSliders() {
  const { data: sliders = [], refetch } = trpc.sliders.getAll.useQuery();
  const createMutation = trpc.sliders.create.useMutation();
  const updateMutation = trpc.sliders.update.useMutation();
  const deleteMutation = trpc.sliders.delete.useMutation();
  const toggleMutation = trpc.sliders.toggle.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    backgroundColor: "#FFC107",
    countdownEndTime: "",
  });

  const handleOpenDialog = (slider?: any) => {
    if (slider) {
      setEditingId(slider.id);
      setFormData({
        title: slider.title,
        description: slider.description || "",
        videoUrl: slider.videoUrl || "",
        backgroundColor: slider.backgroundColor || "#FFC107",
        countdownEndTime: slider.countdownEndTime ? new Date(slider.countdownEndTime).toISOString().slice(0, 16) : "",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        backgroundColor: "#FFC107",
        countdownEndTime: "",
      });
    }
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          title: formData.title,
          description: formData.description || undefined,
          videoUrl: formData.videoUrl || undefined,
          backgroundColor: formData.backgroundColor,
          countdownEndTime: formData.countdownEndTime ? new Date(formData.countdownEndTime) : undefined,
        });
        toast.success("Slider mis à jour");
      } else {
        await createMutation.mutateAsync({
          title: formData.title,
          description: formData.description || undefined,
          videoUrl: formData.videoUrl || undefined,
          backgroundColor: formData.backgroundColor,
          countdownEndTime: formData.countdownEndTime ? new Date(formData.countdownEndTime) : undefined,
        });
        toast.success("Slider créé");
      }
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce slider?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Slider supprimé");
        refetch();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleMutation.mutateAsync({ id });
      toast.success("Statut mis à jour");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Sliders</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Nouveau Slider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier" : "Créer"} un Slider</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre du slider"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description optionnelle"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">URL Vidéo</label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Couleur de fond</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    placeholder="#FFC107"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Fin du Countdown</label>
                <Input
                  type="datetime-local"
                  value={formData.countdownEndTime}
                  onChange={(e) => setFormData({ ...formData, countdownEndTime: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingId ? "Mettre à jour" : "Créer"}
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sliders.map((slider: any) => (
          <Card key={slider.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{slider.title}</h3>
                {slider.description && (
                  <p className="text-sm text-gray-600 mt-1">{slider.description}</p>
                )}
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  {slider.videoUrl && <span>✓ Vidéo</span>}
                  {slider.countdownEndTime && (
                    <span>⏱ Countdown: {new Date(slider.countdownEndTime).toLocaleString()}</span>
                  )}
                  <span style={{ color: slider.backgroundColor }}>■ {slider.backgroundColor}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(slider.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title={slider.isActive ? "Désactiver" : "Activer"}
                >
                  {slider.isActive ? (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>

                <button
                  onClick={() => handleOpenDialog(slider)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                </button>

                <button
                  onClick={() => handleDelete(slider.id)}
                  className="p-2 hover:bg-red-50 rounded text-red-600"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {sliders.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            Aucun slider créé. Cliquez sur "Nouveau Slider" pour en ajouter un.
          </Card>
        )}
      </div>
    </div>
  );
}
