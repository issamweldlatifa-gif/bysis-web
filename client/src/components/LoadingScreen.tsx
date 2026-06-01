import { motion } from 'framer-motion';

export default function LoadingScreen() {
  const colors = ['#FF4444', '#4444FF', '#FF9900']; // أحمر، أزرق، برتقالي

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Logo container with rotation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex items-center justify-center"
        >
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-black border-r-black"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Logo */}
            <img
              src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_7e8b089f.png"
              alt="Bysis AI"
              className="w-12 h-12 object-contain"
            />
          </div>
        </motion.div>

        {/* Loading text with fade animation */}
        <motion.div
          className="flex items-center gap-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          <span className="text-sm font-medium text-gray-700">Chargement</span>
          <motion.span
            animate={{ opacity: [0, 1] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            ...
          </motion.span>
        </motion.div>

        {/* Animated colored dots */}
        <div className="flex gap-3">
          {colors.map((color, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ background: color }}
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
