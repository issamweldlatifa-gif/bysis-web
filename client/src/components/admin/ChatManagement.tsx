import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ChatManagement() {
  const { data: conversations, isLoading } = trpc.chat.listConversations.useQuery();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const { data: messages } = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConvId || 0 },
    { enabled: !!selectedConvId }
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">
          Conversations ({conversations?.length || 0})
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
                  <TableHead>Session ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations?.map((conv: any) => (
                  <TableRow key={conv.id}>
                    <TableCell className="font-mono text-xs">
                      {conv.sessionId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{conv.customerName || "-"}</TableCell>
                    <TableCell>{conv.customerPhone || "-"}</TableCell>
                    <TableCell>{conv.messageCount}</TableCell>
                    <TableCell>
                      {conv.hasOrder ? (
                        <span className="text-green-600 font-medium">Oui</span>
                      ) : (
                        <span className="text-slate-500">Non</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(conv.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConvId(conv.id)}
                      >
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {selectedConvId && messages && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            Messages de la conversation
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-slate-50 border border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">
                    {msg.role === "user" ? "Client" : "Assistant"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR")}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{msg.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
