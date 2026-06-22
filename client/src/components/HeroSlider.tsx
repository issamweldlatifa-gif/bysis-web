import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  backgroundColor: string;
  backgroundGradient?: string;
  countdownEndTime?: Date;
}

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function CountdownTimer({ endTime }: { endTime?: Date }) {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!endTime) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex gap-4 justify-center items-center">
      <div className="text-center">
        <div
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            fontWeight: 900,
            color: "#fff",
            fontFamily: '"Barlow Condensed", Poppins, sans-serif',
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {countdown.days}
        </div>
        <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)" }}>
          Jours
        </div>
      </div>

      <div className="text-center">
        <div
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            fontWeight: 900,
            color: "#fff",
            fontFamily: '"Barlow Condensed", Poppins, sans-serif',
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {countdown.hours}
        </div>
        <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)" }}>
          Heures
        </div>
      </div>

      <div className="text-center">
        <div
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            fontWeight: 900,
            color: "#fff",
            fontFamily: '"Barlow Condensed", Poppins, sans-serif',
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {countdown.minutes}
        </div>
        <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)" }}>
          Minutes
        </div>
      </div>

      <div className="text-center">
        <div
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            fontWeight: 900,
            color: "#fff",
            fontFamily: '"Barlow Condensed", Poppins, sans-serif',
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {countdown.seconds}
        </div>
        <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)" }}>
          Secondes
        </div>
      </div>
    </div>
  );
}

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bgColor, setBgColor] = useState(slides[0]?.backgroundColor || "#FFC107");

  const currentSlide = slides[currentIndex];

  useEffect(() => {
    if (currentSlide) {
      setBgColor(currentSlide.backgroundColor);
    }
  }, [currentSlide]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <motion.div
      animate={{ backgroundColor: bgColor }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ minHeight: "400px", background: bgColor }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
        >
          {/* Video Background */}
          {currentSlide.videoUrl && (
            <video
              autoPlay
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.6 }}
            >
              <source src={currentSlide.videoUrl} type="video/mp4" />
            </video>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="relative z-10 text-center space-y-6 max-w-2xl">
            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "clamp(2rem, 8vw, 3.5rem)",
                fontWeight: 900,
                color: "#fff",
                fontFamily: '"Barlow Condensed", Poppins, sans-serif',
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                textShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
            >
              {currentSlide.title}
            </motion.h1>

            {/* Description */}
            {currentSlide.description && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: "1.125rem",
                  color: "rgba(255,255,255,0.95)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {currentSlide.description}
              </motion.p>
            )}

            {/* Countdown Timer */}
            {currentSlide.countdownEndTime && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CountdownTimer endTime={currentSlide.countdownEndTime} />
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all"
            style={{ backdropFilter: "blur(10px)" }}
          >
            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all"
            style={{ backdropFilter: "blur(10px)" }}
          >
            <ChevronRight className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              animate={{
                scale: index === currentIndex ? 1.2 : 1,
                opacity: index === currentIndex ? 1 : 0.5,
              }}
              className="w-2 h-2 rounded-full bg-white transition-all"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
