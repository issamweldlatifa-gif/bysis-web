import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersManagement from "@/components/admin/OrdersManagement";
import ArrivageManagement from "@/components/admin/ArrivageManagement";
import ChatManagement from "@/components/admin/ChatManagement";
import AdminSettings from "@/components/admin/AdminSettings";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard Administrateur
          </h1>
          <p className="text-slate-600 mt-2">
            Gérez vos commandes, arrivages et paramètres
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="arrivage">Arrivages</TabsTrigger>
            <TabsTrigger value="chat">Conversations</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="arrivage" className="space-y-4">
            <ArrivageManagement />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <ChatManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
