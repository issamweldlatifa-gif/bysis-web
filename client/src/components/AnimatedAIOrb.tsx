import React, { useEffect, useRef } from "react";

interface AnimatedAIOrbProps {
  isThinking?: boolean;
  isListening?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function AnimatedAIOrb({
  isThinking = false,
  isListening = false,
  size = "md",
}: AnimatedAIOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([] as Particle[]);

  const sizeMap = {
    sm: 60,
    md: 100,
    lg: 150,
  };

  const orbSize = sizeMap[size];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
  }

  const createParticles = (count: number, colors: string[]): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      particles.push({
        x: orbSize / 2,
        y: orbSize / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1 + Math.random() * 2,
      });
    }
    return particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = orbSize;
    canvas.height = orbSize;

    const colors = isListening
      ? ["#06b6d4", "#a855f7", "#ec4899"] // Cyan, Purple, Pink
      : ["#a855f7", "#ec4899", "#ff1493"]; // Purple, Pink, Magenta

    let frameCount = 0;

    const animate = () => {
      ctx.clearRect(0, 0, orbSize, orbSize);

      // Draw glassmorphism background
      const gradient = ctx.createRadialGradient(
        orbSize / 2,
        orbSize / 2,
        0,
        orbSize / 2,
        orbSize / 2,
        orbSize / 2
      );
      gradient.addColorStop(0, "rgba(168, 85, 247, 0.3)");
      gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.2)");
      gradient.addColorStop(1, "rgba(6, 182, 212, 0.1)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orbSize / 2, orbSize / 2, orbSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw neon border
      ctx.strokeStyle = isThinking
        ? "rgba(236, 72, 153, 0.8)"
        : "rgba(168, 85, 247, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(orbSize / 2, orbSize / 2, orbSize / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = isThinking ? "#ec4899" : "#a855f7";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw inner rotating gradient
      const rotationAngle = (frameCount * 2) % 360;
      const innerGradient = ctx.createLinearGradient(
        orbSize / 2 - orbSize / 4,
        orbSize / 2 - orbSize / 4,
        orbSize / 2 + orbSize / 4,
        orbSize / 2 + orbSize / 4
      );
      innerGradient.addColorStop(0, "rgba(168, 85, 247, 0.6)");
      innerGradient.addColorStop(0.5, "rgba(236, 72, 153, 0.6)");
      innerGradient.addColorStop(1, "rgba(6, 182, 212, 0.6)");

      ctx.save();
      ctx.translate(orbSize / 2, orbSize / 2);
      ctx.rotate((rotationAngle * Math.PI) / 180);
      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(0, 0, orbSize / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Generate particles on thinking/listening
      if ((isThinking || isListening) && frameCount % 5 === 0) {
        const newParticles = createParticles(3, colors);
        particlesRef.current.push(...newParticles);
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw listening waves if listening
      if (isListening) {
        for (let i = 1; i <= 3; i++) {
          const waveRadius = (orbSize / 2) * (0.7 + (frameCount % 20) / 20) * (i / 3);
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.6 - i * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(orbSize / 2, orbSize / 2, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      frameCount++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isThinking, isListening, orbSize]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="drop-shadow-2xl"
        style={{
          filter: isThinking
            ? "drop-shadow(0 0 20px rgba(236, 72, 153, 0.6))"
            : "drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))",
        }}
      />
    </div>
  );
}
