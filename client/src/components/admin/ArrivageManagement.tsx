import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function ArrivageManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "1",
    available: "1",
  });

  const { data: items, isLoading, refetch } = trpc.arrivage.listAll.useQuery();
  const createMutation = trpc.arrivage.create.useMutation();
  const updateMutation = trpc.arrivage.update.useMutation();
  const deleteMutation = trpc.arrivage.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
          price: formData.price,
          quantity: parseInt(formData.quantity),
          available: parseInt(formData.available),
        });
        toast.success("Article mis à jour");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
          price: formData.price,
          quantity: parseInt(formData.quantity),
          available: parseInt(formData.available),
        });
        toast.success("Article créé");
      }
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        quantity: "1",
        available: "1",
      });
      setEditingId(null);
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      price: item.price,
      quantity: item.quantity.toString(),
      available: item.available.toString(),
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Article supprimé");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      quantity: "1",
      available: "1",
    });
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            {editingId ? "Modifier l'article" : "Ajouter un article"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nom du produit"
              />
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Catégorie"
              />
            </div>
            <div>
              <Label htmlFor="price">Prix ($) *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description du produit"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Mettre à jour" : "Créer"}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {/* List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Articles en arrivage ({items?.length || 0})
          </h2>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category || "-"}</TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          item.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.available ? "Oui" : "Non"}
                      </span>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
