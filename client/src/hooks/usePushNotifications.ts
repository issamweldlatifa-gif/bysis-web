import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: vapidData } = trpc.push.getVapidKey.useQuery(undefined, {
    staleTime: Infinity,
  });

  const subscribeMutation = trpc.push.subscribe.useMutation();

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    }).catch(() => {});
  }, []);

  const subscribe = useCallback(
    async (customerPhone?: string, sessionId?: string) => {
      if (!vapidData?.publicKey) return false;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

      setIsLoading(true);
      try {
        const reg = await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        setPermission(permission as PushPermission);

        if (permission !== "granted") {
          setIsLoading(false);
          return false;
        }

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey).buffer as ArrayBuffer,
        });

        const sub = subscription.toJSON();
        await subscribeMutation.mutateAsync({
          endpoint: sub.endpoint!,
          p256dh: (sub.keys as any)?.p256dh ?? "",
          auth: (sub.keys as any)?.auth ?? "",
          customerPhone,
          sessionId,
        });

        setIsSubscribed(true);
        setIsLoading(false);
        return true;
      } catch (err) {
        console.error("[Push] Subscribe error:", err);
        setIsLoading(false);
        return false;
      }
    },
    [vapidData, subscribeMutation]
  );

  return { permission, isSubscribed, isLoading, subscribe };
}
