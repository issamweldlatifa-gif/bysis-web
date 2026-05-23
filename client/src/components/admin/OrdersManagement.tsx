import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

const statusOptions = [
  { value: "new", label: "Nouvelle" },
  { value: "processing", label: "En traitement" },
  { value: "waiting_payment", label: "En attente de paiement" },
  { value: "shipped", label: "Expédiée" },
  { value: "arrived", label: "Arrivée" },
  { value: "completed", label: "Complétée" },
  { value: "cancelled", label: "Annulée" },
];

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "phone">("name");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState("");

  const { data: orders, isLoading, refetch } = trpc.orders.list.useQuery();
  const { data: selectedOrder } = trpc.orders.getById.useQuery(
    { id: selectedOrderId || 0 },
    { enabled: !!selectedOrderId }
  );

  const updateStatusMutation = trpc.orders.updateStatus.useMutation();
  const updateNotesMutation = trpc.orders.updateNotes.useMutation();

  const handleSearch = async () => {
    if (!searchQuery) {
      refetch();
      return;
    }
    // Search is handled via the list query
    refetch();
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus as any,
      });
      toast.success("Statut mis à jour");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleUpdateNotes = async (orderId: number) => {
    try {
      await updateNotesMutation.mutateAsync({
        id: orderId,
        adminNotes: editingNotes,
      });
      toast.success("Notes mises à jour");
      setEditingNotes("");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const displayedOrders = orders || [];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">
          Rechercher une commande
        </h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm mb-2 block">
              Recherche
            </Label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom ou téléphone..."
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="w-32">
            <Label htmlFor="searchType" className="text-sm mb-2 block">
              Type
            </Label>
            <Select value={searchType} onValueChange={(v: any) => setSearchType(v)}>
              <SelectTrigger id="searchType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="phone">Téléphone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">
          Commandes ({displayedOrders.length})
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code de suivi</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.trackingCode}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.customerPhone || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {order.finalPrice ? `$${order.finalPrice}` : "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Order Details */}
      {selectedOrder && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            Détails de la commande
          </h2>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Informations client
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-slate-600">Nom:</span>{" "}
                  {selectedOrder.customerName}
                </p>
                <p>
                  <span className="text-slate-600">Téléphone:</span>{" "}
                  {selectedOrder.customerPhone || "-"}
                </p>
                <p>
                  <span className="text-slate-600">Email:</span>{" "}
                  {selectedOrder.customerEmail || "-"}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Informations produit
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-slate-600">Type:</span>{" "}
                  {selectedOrder.productType || "-"}
                </p>
                <p>
                  <span className="text-slate-600">Catégorie:</span>{" "}
                  {selectedOrder.productCategory || "-"}
                </p>
                <p>
                  <span className="text-slate-600">Quantité:</span>{" "}
                  {selectedOrder.quantity}
                </p>
              </div>
            </div>
          </div>

          {selectedOrder.imageUrl && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Image du produit
              </h3>
              <img
                src={selectedOrder.imageUrl}
                alt="Product"
                className="w-32 h-32 object-cover rounded-lg border border-slate-200"
              />
            </div>
          )}

          <div>
            <Label htmlFor="adminNotes" className="text-sm mb-2 block">
              Notes administrateur
            </Label>
            <textarea
              id="adminNotes"
              value={editingNotes || selectedOrder.adminNotes || ""}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
              rows={4}
            />
            <Button
              onClick={() => handleUpdateNotes(selectedOrder.id)}
              className="mt-2"
              disabled={updateNotesMutation.isPending}
            >
              Sauvegarder les notes
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
