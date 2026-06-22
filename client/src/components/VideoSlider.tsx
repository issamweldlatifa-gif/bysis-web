/**
 * VideoSlider Component — Swiper carousel for video cards with lazy loading
 */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import OptimizedVideo from './OptimizedVideo';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface VideoItem {
  id: number;
  title: string;
  videoUrl: string;
  link: string;
  active: boolean;
}

interface VideoSliderProps {
  videos: VideoItem[];
}

export default function VideoSlider({ videos }: VideoSliderProps) {
  return (
    <div className="w-full py-8">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={12}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="w-full"
      >
        {videos.map((video) => (
          <SwiperSlide key={video.id}>
            <div className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer">
              <OptimizedVideo
                src={video.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-lg font-bold text-center px-4">
                  {video.title}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
