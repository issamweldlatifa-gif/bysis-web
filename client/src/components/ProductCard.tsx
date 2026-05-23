'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Copy, Share } from '@phosphor-icons/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProductCardProps {
  image: string;
  name: string;
  model: string;
  priceEUR: number;
  priceTND: number;
  confidence: string;
  confidencePercent: number;
  onOrderNow?: () => void;
  isScanning?: boolean;
  scanProgress?: number;
}

export default function ProductCard({
  image,
  name,
  model,
  priceEUR,
  priceTND,
  confidence,
  confidencePercent,
  onOrderNow,
  isScanning = false,
  scanProgress = 0,
}: ProductCardProps) {
  const [scanLinePosition, setScanLinePosition] = useState(0);

  // Animate scanning line
  React.useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanLinePosition((prev) => (prev + 2) % 100);
    }, 20);

    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto space-y-4"
    >
      {/* Product Image with Scanning Line */}
      <motion.div
        className="relative rounded-3xl overflow-hidden bg-black border-2 border-cyan-500/30 aspect-square"
        whileHover={{ borderColor: 'rgba(0, 212, 200, 0.5)' }}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />

        {/* Scanning Line */}
        {isScanning && (
          <motion.div
            animate={{ top: `${scanLinePosition}%` }}
            transition={{ duration: 0.02 }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-b from-green-400 via-green-500 to-transparent shadow-lg shadow-green-500/50 z-10"
          />
        )}

        {/* Progress Overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 z-20">
            <div className="text-center">
              <p className="text-white font-bold text-3xl">{scanProgress}%</p>
              <p className="text-cyan-400 text-sm">Scanning...</p>
            </div>
            <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden border border-cyan-500/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Product Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div>
          <p className="text-[#6C7378] text-sm font-medium">{name}</p>
          <p className="text-white text-lg font-bold">{model}</p>
        </div>

        {/* Price Display */}
        <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
          <div>
            <p className="text-[#6C7378] text-xs font-medium mb-1">EUR Price</p>
            <p className="text-white text-2xl font-bold">{priceEUR.toFixed(2)}€</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-cyan-400"
          >
            <ArrowRight size={28} weight="bold" />
          </motion.div>
          <div className="text-right">
            <p className="text-cyan-400 text-xs font-medium mb-1">Prix TND</p>
            <p className="text-cyan-400 text-2xl font-bold">{priceTND.toFixed(2)}</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 rounded-2xl p-4 border border-cyan-500/50"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldCheck size={24} weight="fill" className="text-cyan-400" />
          </motion.div>
          <div className="flex-1">
            <p className="text-cyan-400 font-semibold text-sm">{confidence}</p>
            <p className="text-cyan-400/60 text-xs">This is likely to be correct</p>
          </div>
          <div className="text-right">
            <p className="text-cyan-400 font-bold text-lg">{confidencePercent}%</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onOrderNow}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all"
          >
            Order Now
            <ArrowRight size={20} weight="bold" />
          </Button>
        </motion.div>

        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`${priceTND.toFixed(2)} TND`);
                toast.success('Price copied!');
              }}
              variant="outline"
              className="w-full border-white/20 text-[#2C2E2F] hover:bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              Copy
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              onClick={() => {
                const text = `${name} - ${priceTND.toFixed(2)} TND (${priceEUR.toFixed(2)}€)`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(whatsappUrl, '_blank');
              }}
              variant="outline"
              className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Share size={18} />
              Share
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
