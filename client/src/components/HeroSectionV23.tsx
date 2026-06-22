/**
 * HeroSectionV23.tsx — Hero Section from Bysis Master V23
 * 
 * Displays promotional hero video with animated background,
 * title, subtitle, and CTA button.
 */

import React from 'react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  videoUrl?: string;
  backgroundColor?: string;
}

export function HeroSectionV23({
  title = "Bysis",
  subtitle = "Découvrez une nouvelle façon de magasiner",
  ctaText = "Découvrir",
  ctaLink = "/catalogue",
  videoUrl,
  backgroundColor = "#111418",
}: HeroSectionProps) {
  return (
    <section className="hero-section" style={{ background: backgroundColor }}>
      {/* Video Surface with animated background */}
      <div className="hero-video-surface">
        {videoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Top Bar with Logo */}
      <div className="hero-topbar">
        <div className="brand-logo">BYSIS</div>
      </div>

      {/* Hero Copy - Title and Subtitle */}
      <div className="hero-copy">
        <div className="hero-kicker">
          <span>✨ NOUVEAU</span>
        </div>
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        
        {/* CTA Button */}
        <a
          href={ctaLink}
          style={{
            display: 'inline-block',
            marginTop: '20px',
            paddingLeft: '32px',
            paddingRight: '32px',
            paddingTop: '14px',
            paddingBottom: '14px',
            background: '#FFD700',
            color: '#111418',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '16px',
            textDecoration: 'none',
            transition: 'transform 160ms ease-out, box-shadow 160ms ease-out',
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)';
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}

export default HeroSectionV23;
