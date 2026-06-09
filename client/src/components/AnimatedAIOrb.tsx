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
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const sizeMap = {
    sm: 60,
    md: 100,
    lg: 150,
  };

  const orbSize = sizeMap[size];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create SVG for better performance and compatibility
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${orbSize} ${orbSize}`);
    svg.setAttribute("width", orbSize.toString());
    svg.setAttribute("height", orbSize.toString());
    svg.style.filter = isThinking
      ? "drop-shadow(0 0 20px rgba(236, 72, 153, 0.6))"
      : "drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))";

    // Create defs for gradients and filters
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Radial gradient
    const radialGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "radialGradient"
    );
    radialGradient.setAttribute("id", "orbGradient");
    radialGradient.setAttribute("cx", "50%");
    radialGradient.setAttribute("cy", "50%");
    radialGradient.setAttribute("r", "50%");

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute(
      "stop-color",
      isThinking ? "rgba(236, 72, 153, 0.8)" : "rgba(168, 85, 247, 0.8)"
    );
    radialGradient.appendChild(stop1);

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute(
      "stop-color",
      isListening ? "rgba(6, 182, 212, 0.3)" : "rgba(236, 72, 153, 0.3)"
    );
    radialGradient.appendChild(stop2);

    defs.appendChild(radialGradient);

    // Glow filter
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "glow");
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    const feGaussianBlur = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feGaussianBlur"
    );
    feGaussianBlur.setAttribute("stdDeviation", "3");
    feGaussianBlur.setAttribute("result", "coloredBlur");
    filter.appendChild(feGaussianBlur);

    const feMerge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
    const feMergeNode1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feMergeNode"
    );
    feMergeNode1.setAttribute("in", "coloredBlur");
    feMerge.appendChild(feMergeNode1);

    const feMergeNode2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feMergeNode"
    );
    feMergeNode2.setAttribute("in", "SourceGraphic");
    feMerge.appendChild(feMergeNode2);

    filter.appendChild(feMerge);
    defs.appendChild(filter);

    svg.appendChild(defs);

    // Background circle
    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", (orbSize / 2).toString());
    bgCircle.setAttribute("cy", (orbSize / 2).toString());
    bgCircle.setAttribute("r", (orbSize / 2 - 2).toString());
    bgCircle.setAttribute("fill", "url(#orbGradient)");
    bgCircle.setAttribute("filter", "url(#glow)");
    svg.appendChild(bgCircle);

    // Border circle
    const borderCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    borderCircle.setAttribute("cx", (orbSize / 2).toString());
    borderCircle.setAttribute("cy", (orbSize / 2).toString());
    borderCircle.setAttribute("r", (orbSize / 2 - 2).toString());
    borderCircle.setAttribute("fill", "none");
    borderCircle.setAttribute(
      "stroke",
      isThinking ? "rgba(236, 72, 153, 0.8)" : "rgba(168, 85, 247, 0.8)"
    );
    borderCircle.setAttribute("stroke-width", "2");
    svg.appendChild(borderCircle);

    // Rotating inner circle
    const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    innerCircle.setAttribute("cx", (orbSize / 2).toString());
    innerCircle.setAttribute("cy", (orbSize / 2).toString());
    innerCircle.setAttribute("r", (orbSize / 3).toString());
    innerCircle.setAttribute("fill", "none");
    innerCircle.setAttribute(
      "stroke",
      isListening ? "rgba(6, 182, 212, 0.6)" : "rgba(236, 72, 153, 0.6)"
    );
    innerCircle.setAttribute("stroke-width", "1.5");
    innerCircle.style.animation = "rotate 3s linear infinite";
    svg.appendChild(innerCircle);

    // Add animation keyframes if not already present
    if (!document.getElementById("orbAnimationStyle")) {
      const style = document.createElement("style");
      style.id = "orbAnimationStyle";
      style.textContent = `
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Listening waves
    if (isListening) {
      for (let i = 1; i <= 3; i++) {
        const waveCircle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        waveCircle.setAttribute("cx", (orbSize / 2).toString());
        waveCircle.setAttribute("cy", (orbSize / 2).toString());
        waveCircle.setAttribute("r", ((orbSize / 2) * (0.5 + i * 0.15)).toString());
        waveCircle.setAttribute("fill", "none");
        waveCircle.setAttribute(
          "stroke",
          `rgba(6, 182, 212, ${0.6 - i * 0.15})`
        );
        waveCircle.setAttribute("stroke-width", "1");
        waveCircle.style.animation = `pulse 1.5s ease-in-out infinite`;
        waveCircle.style.animationDelay = `${i * 0.3}s`;
        svg.appendChild(waveCircle);
      }
    }

    // Clear previous SVG
    container.innerHTML = "";
    container.appendChild(svg);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isThinking, isListening, orbSize]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center"
      style={{
        width: orbSize,
        height: orbSize,
      }}
    />
  );
}
