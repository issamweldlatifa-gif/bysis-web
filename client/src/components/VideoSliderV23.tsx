/**
 * VideoSliderV23.tsx — Video Slider Section
 * 
 * Horizontal scrolling carousel of video cards with dots navigation.
 */

import React, { useState, useRef, useEffect } from 'react';

interface VideoCard {
  id: string;
  title: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  backgroundColor?: string;
}

interface VideoSliderProps {
  title?: string;
  sectionNote?: string;
  videos?: VideoCard[];
}

export function VideoSliderV23({
  title = "Nos Dernières Vidéos",
  sectionNote = "Voir tout",
  videos = [],
}: VideoSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleDotClick = (index: number) => {
    if (sliderRef.current) {
      const cards = sliderRef.current.querySelectorAll('.video-card');
      const card = cards[index] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        setActiveIndex(index);
      }
    }
  };

  return (
    <section className="video-slider-section section">
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <button
          className="section-note"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {sectionNote} →
        </button>
      </div>

      {/* Video Slider */}
      <div className="video-slider" ref={sliderRef}>
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <div
              key={video.id}
              className="video-card"
              style={{
                backgroundColor: video.backgroundColor || '#f0f0f0',
              }}
            >
              {/* Motion background */}
              <div className="motion" />

              {/* Video or Image */}
              {video.videoUrl ? (
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
                    zIndex: 0,
                  }}
                >
                  <source src={video.videoUrl} type="video/mp4" />
                </video>
              ) : video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                  }}
                />
              ) : null}

              {/* Title */}
              <h3 className="video-card-title">{video.title}</h3>
            </div>
          ))
        ) : (
          <div
            style={{
              flex: '0 0 min(74vw, 360px)',
              height: 'min(118vw, 560px)',
              borderRadius: '32px',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '14px',
            }}
          >
            Aucune vidéo disponible
          </div>
        )}
      </div>

      {/* Slider Dots */}
      {videos.length > 0 && (
        <div className="slider-dots">
          {videos.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to video ${index + 1}`}
              style={{
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default VideoSliderV23;
