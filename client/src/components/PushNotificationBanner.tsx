import { useState } from "react";
import { Bell, BellSlash, X } from "@phosphor-icons/react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { motion, AnimatePresence } from "framer-motion";

interface PushNotificationBannerProps {
  customerPhone?: string;
  sessionId?: string;
  onDismiss?: () => void;
}

export default function PushNotificationBanner({
  customerPhone,
  sessionId,
  onDismiss,
}: PushNotificationBannerProps) {
  const { permission, isSubscribed, isLoading, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Don't show if: unsupported, already subscribed, dismissed, or permission denied
  if (
    permission === "unsupported" ||
    permission === "denied" ||
    isSubscribed ||
    dismissed ||
    subscribed
  ) {
    return null;
  }

  const handleSubscribe = async () => {
    const ok = await subscribe(customerPhone, sessionId);
    if (ok) {
      setSubscribed(true);
      setTimeout(() => {
        setDismissed(true);
        onDismiss?.();
      }, 2000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: "rgba(0,212,200,0.08)",
            border: "1px solid rgba(0,212,200,0.2)",
          }}
        >
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(0,212,200,0.15)" }}
          >
            {subscribed ? (
              <Bell size={18} weight="fill" className="text-blue-400" />
            ) : (
              <Bell size={18} weight="duotone" className="text-blue-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {subscribed ? (
              <>
                <p className="text-sm font-semibold text-blue-400">تم التفعيل ✅</p>
                <p className="text-xs text-[#6C7378] mt-0.5">
                  سيوصلك إشعار لما تتغير حالة كومندتك
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#2C2E2F]">
                  فعّل إشعارات الكومند 🔔
                </p>
                <p className="text-xs text-white/55 mt-0.5 leading-relaxed">
                  نعلمك مباشرة لما تتغير حالة كومندتك — بدون ما تسأل
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, #0070BA, #fbbf24)",
                      color: "#2C2E2F",
                    }}
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Bell size={12} weight="fill" />
                    )}
                    {isLoading ? "جاري..." : "فعّل الإشعارات"}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-[#9DA3A6] hover:text-[#6C7378] transition-colors"
                  >
                    <BellSlash size={12} />
                    لاحقاً
                  </button>
                </div>
              </>
            )}
          </div>

          {!subscribed && (
            <button
              onClick={handleDismiss}
              className="text-[#9DA3A6] hover:text-[#6C7378] transition-colors flex-shrink-0"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
