import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/contexts/I18nContext';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useChatContext } from '@/App';

function EmptyCart() {
  const [, navigate] = useLocation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: '#F3F3F3', border: '2px solid #EAEDED' }}
      >
        <ShoppingCart size={36} color="#D5D9D9" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-bold mb-2" style={{ color: '#0F1111' }}>Votre panier est vide</h2>
      <p className="text-sm mb-6" style={{ color: '#565959' }}>
        Parcourez nos boutiques et ajoutez des produits à votre panier
      </p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/arrivage')}
        className="px-8 py-3 rounded-full text-sm font-bold"
        style={{
          background: 'linear-gradient(to bottom, #FFE082, #FFD814)',
          border: '1px solid #C8A600',
          color: '#0F1111',
        }}
      >
        Voir les boutiques
      </motion.button>
    </div>
  );
}

export default function Panier() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { t } = useI18n();
  const { openChat } = useChatContext();
  const [, navigate] = useLocation();

  const handleCommander = () => {
    if (items.length === 0) return;
    const first = items[0];
    const params = new URLSearchParams({
      productLink: first.productLink || '',
      quantity: String(first.quantity),
      productName: first.name,
    });
    navigate(`/order?${params.toString()}`);
  };

  return (
    <AppLayout onChatOpen={openChat}>
      <div style={{ background: '#F3F3F3', minHeight: '100vh' }}>

        {/* ── Page Header ── */}
        <div className="bg-white px-4 py-3" style={{ borderBottom: '1px solid #EAEDED' }}>
          <h1 className="text-lg font-bold" style={{ color: '#0F1111' }}>
            Panier ({totalItems} article{totalItems !== 1 ? 's' : ''})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white">
            <EmptyCart />
          </div>
        ) : (
          <>
            {/* ── Items List ── */}
            <div className="bg-white mb-2">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3 px-4 py-4"
                    style={{ borderBottom: '1px solid #EAEDED' }}
                  >
                    {/* Image */}
                    <div
                      className="flex-shrink-0 rounded"
                      style={{ width: '80px', height: '80px', background: '#F8F8F8', border: '1px solid #EAEDED' }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={28} color="#D5D9D9" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 mb-1" style={{ color: '#0F1111' }}>
                        {item.name}
                      </p>
                      {item.platform && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm mr-1"
                          style={{ background: '#F3F3F3', color: '#565959', border: '1px solid #D5D9D9' }}>
                          {item.platform}
                        </span>
                      )}
                      <p className="text-base font-bold mt-1.5" style={{ color: '#B12704' }}>
                        {(item.priceTnd * item.quantity).toFixed(2)} TND
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#007600', fontWeight: 600 }}>
                        Livraison GRATUITE
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="flex items-center rounded"
                          style={{ border: '1px solid #D5D9D9', background: '#F3F3F3' }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-base font-bold"
                            style={{ color: '#0F1111' }}
                          >
                            −
                          </button>
                          <span
                            className="w-8 h-8 flex items-center justify-center text-sm font-bold"
                            style={{ color: '#0F1111', borderLeft: '1px solid #D5D9D9', borderRight: '1px solid #D5D9D9' }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-base font-bold"
                            style={{ color: '#0F1111' }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs font-semibold"
                          style={{ color: '#CC0C39', background: 'transparent', border: 'none' }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clear cart */}
              <div className="px-4 py-2">
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold"
                  style={{ color: '#007185', background: 'transparent', border: 'none' }}
                >
                  Vider le panier
                </button>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div className="bg-white mb-2 px-4 py-4">
              <h2 className="text-sm font-bold mb-3" style={{ color: '#0F1111' }}>Récapitulatif de la commande</h2>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: '#565959' }}>
                  Articles ({totalItems}) :
                </span>
                <span className="text-sm font-semibold" style={{ color: '#0F1111' }}>
                  {totalPrice.toFixed(2)} TND
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm" style={{ color: '#565959' }}>Livraison :</span>
                <span className="text-sm font-semibold" style={{ color: '#007600' }}>GRATUITE</span>
              </div>
              <div style={{ height: '1px', background: '#EAEDED', marginBottom: '12px' }} />
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold" style={{ color: '#0F1111' }}>Total de la commande :</span>
                <span className="text-xl font-black" style={{ color: '#B12704' }}>
                  {totalPrice.toFixed(2)} TND
                </span>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCommander}
                className="w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(to bottom, #FFE082, #FFD814)',
                  border: '1px solid #C8A600',
                  color: '#0F1111',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                Passer la commande
                <ChevronRight size={16} strokeWidth={2.5} />
              </motion.button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={13} color="#007600" strokeWidth={2} />
                  <span className="text-[10px]" style={{ color: '#565959' }}>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck size={13} color="#007185" strokeWidth={2} />
                  <span className="text-[10px]" style={{ color: '#565959' }}>Livraison rapide</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ height: '16px' }} />
      </div>
    </AppLayout>
  );
}
