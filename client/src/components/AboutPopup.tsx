'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
// Note: X icon is available from @phosphor-icons/react
import { Button } from '@/components/ui/button';

interface AboutPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutPopup({ isOpen, onClose }: AboutPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-blue-400 hover:bg-blue-500/10"
              >
                <X size={24} />
              </Button>

              {/* Content */}
              <div className="overflow-y-auto max-h-[80vh]">
                {/* Image */}
                <div className="relative w-full aspect-square overflow-hidden">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663681326913/gJ2Tct6mF3AgWWNReCWAjN/about-popup-35V5cBPcDgMgyBD8xGt4g9.webp"
                    alt="Bysis Smart Shopping"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      Smart Shopping
                    </h2>
                    <p className="text-blue-400 font-semibold text-lg">احسبها بـ Bysis</p>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    Bysis is your trusted shopping intermediary in Tunisia. We help you find the best prices on products from Shein, AliExpress, and Temu, delivered directly to your door.
                  </p>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        📷
                      </div>
                      <div>
                        <p className="font-semibold text-blue-400">Scan Products</p>
                        <p className="text-[#9DA3A6] text-sm">Use your camera to scan any product</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                        💰
                      </div>
                      <div>
                        <p className="font-semibold text-purple-400">Compare Prices</p>
                        <p className="text-[#9DA3A6] text-sm">Find the best prices in EUR & TND</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        🚚
                      </div>
                      <div>
                        <p className="font-semibold text-blue-400">Fast Shipping</p>
                        <p className="text-[#9DA3A6] text-sm">We handle it and deliver to your door</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={onClose}
                    className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Got it!
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
