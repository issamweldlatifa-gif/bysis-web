/**
 * StoreSlider Component — Swiper carousel for store logos
 */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface StoreItem {
  id: number;
  name: string;
  logo: string;
  active: boolean;
}

interface StoreSliderProps {
  stores: StoreItem[];
}

export default function StoreSlider({ stores }: StoreSliderProps) {
  return (
    <div className="w-full py-8">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={12}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 6 },
        }}
        className="w-full"
      >
        {stores.map((store) => (
          <SwiperSlide key={store.id}>
            <div className="flex items-center justify-center h-24 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all cursor-pointer">
              <div className="text-4xl">{store.logo}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
