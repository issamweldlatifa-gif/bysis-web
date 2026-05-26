'use client';

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/AppLayout';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Warehouse,
  CreditCard,
  Search,
  Phone,
  User,
  Image as PhImage,
} from 'lucide-react';
import { useChatContext } from '@/App';

// DB status values
const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  new:             { label: 'جديدة',           icon: Package,     color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  processing:      { label: 'في المعالجة',      icon: Clock,       color: 'text-blue-400', bg: 'bg-blue-500/20' },
  waiting_payment: { label: 'تستنى الدفع',      icon: CreditCard,  color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  shipped:         { label: 'في الطريق 🚢',     icon: Truck,       color: 'text-purple-400', bg: 'bg-purple-500/20' },
  arrived:         { label: 'وصلت للمخزن 📦',   icon: Warehouse,   color: 'text-teal-400',   bg: 'bg-teal-500/20' },
  completed:       { label: 'تسلمت ✅',          icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-500/20' },
  cancelled:       { label: 'ملغية ❌',          icon: XCircle,     color: 'text-blue-400',    bg: 'bg-blue-500/20' },
};

type SearchMode = 'name' | 'phone';

type OrderResult = {
  id: number;
  status: string;
  productUrl: string | null;
  quantity: number;
  createdAt: Date;
  screenshotUrl: string | null;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
};

export default function Orders() {
  const [mode, setMode] = useState<SearchMode>('name');
  const [nameQuery, setNameQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [nameSearched, setNameSearched] = useState(false);
  const [phoneSearched, setPhoneSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { openChat } = useChatContext();

  const { data: ordersByName, isLoading: loadingName, refetch: refetchName } =
    trpc.orders.track.useQuery(
      { query: nameQuery },
      { enabled: nameSearched && nameQuery.trim().length > 0 }
    );

  const { data: ordersByPhone, isLoading: loadingPhone, refetch: refetchPhone } =
    trpc.orders.trackByPhone.useQuery(
      { phone: phoneQuery },
      { enabled: phoneSearched && phoneQuery.trim().length > 0 }
    );

  const orders: OrderResult[] = (mode === 'name' ? ordersByName : ordersByPhone) as any[] || [];
  const isLoading = mode === 'name' ? loadingName : loadingPhone;
  const hasSearched = mode === 'name' ? nameSearched : phoneSearched;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'name') {
      if (!nameQuery.trim()) return;
      setNameSearched(true);
      refetchName();
    } else {
      if (!phoneQuery.trim()) return;
      setPhoneSearched(true);
      refetchPhone();
    }
  };

  return (
    <AppLayout onChatOpen={openChat}>
      <div className="p-4 space-y-5 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            طلباتي
          </h1>
          <p className="text-[#6C7378] text-sm">ابحث عن طلبك بالاسم أو رقم الهاتف</p>
        </motion.div>

        {/* Mode Tabs */}
        <div className="flex gap-2">
          {(['name', 'phone'] as const).map((m) => (
            <motion.button
              key={m}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                mode === m
                  ? 'bg-blue-600 text-white shadow-lg '
                  : 'bg-white text-slate-300 hover:bg-gray-100'
              }`}
            >
              {m === 'name' ? <User size={16} /> : <Phone size={16} />}
              {m === 'name' ? 'بالاسم' : 'بالهاتف'}
            </motion.button>
          ))}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C7378]"
            />
            {mode === 'name' ? (
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="اسم العميل..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#CBD2D9] text-[#1D1D1D] placeholder-[#9DA3A6] focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
            ) : (
              <input
                type="tel"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                placeholder="رقم الهاتف..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#CBD2D9] text-[#1D1D1D] placeholder-[#9DA3A6] focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
            )}
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold  transition-all"
          >
            بحث
          </motion.button>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No results */}
        {!isLoading && hasSearched && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-3"
          >
            <Package size={48} className="mx-auto text-slate-600" />
            <p className="text-[#6C7378] text-lg">ما لقيناش طلبات</p>
            <p className="text-[#9DA3A6] text-sm">تأكد من الاسم أو الرقم وحاول مرة أخرى</p>
          </motion.div>
        )}

        {/* Initial state */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-3"
          >
            <Package size={48} className="mx-auto text-slate-700" />
            <p className="text-[#9DA3A6]">أدخل اسمك أو رقم هاتفك للبحث عن طلباتك</p>
          </motion.div>
        )}

        {/* Orders List */}
        {orders.length > 0 && (
          <AnimatePresence>
            <div className="space-y-3">
              {orders.map((order, index) => {
                const cfg = statusConfig[order.status] || statusConfig.new;
                const Icon = cfg.icon;
                const isExpanded = expandedId === order.id;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all overflow-hidden"
                  >
                    {/* Main row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-bold" style={{color:"#1D1D1D"}}>{order.customerName}</p>
                          <p className="text-sm text-[#6C7378] mt-0.5">
                            طلب #{order.id} • {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                          </p>
                          {order.quantity > 1 && (
                            <p className="text-xs text-[#9DA3A6] mt-0.5">الكمية: {order.quantity}</p>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${cfg.bg} flex-shrink-0`}>
                          <Icon size={14} className={cfg.color} />
                          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-gray-200/50 pt-3">
                            {order.customerPhone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-[#6C7378]" />
                                <span className="text-slate-300">{order.customerPhone}</span>
                              </div>
                            )}
                            {order.customerAddress && (
                              <div className="flex items-start gap-2 text-sm">
                                <Package size={14} className="text-[#6C7378] mt-0.5" />
                                <span className="text-slate-300">{order.customerAddress}</span>
                              </div>
                            )}
                            {order.productUrl && (
                              <a
                                href={order.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Package size={14} />
                                <span className="underline truncate">{order.productUrl}</span>
                              </a>
                            )}
                            {order.screenshotUrl && (
                              <div className="rounded-xl overflow-hidden border border-gray-200">
                                <img
                                  src={order.screenshotUrl}
                                  alt="Screenshot"
                                  className="w-full max-h-48 object-contain bg-[#EEF2F7]"
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  );
}
