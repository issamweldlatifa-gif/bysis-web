'use client';
import { motion } from 'framer-motion';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/_core/hooks/useAuth';
import { useChatContext } from '@/App';
import { Bell, Lock, Globe, SignOut, User, Info } from '@phosphor-icons/react';
import { ChevronRight } from 'lucide-react';

const PP = { bg:'#FFFFFF', white:'#FFFFFF', navy:'#1A1A1A', blue:'#1A1A1A', text:'#1D1D1D', sub:'#666666', muted:'#999999', border:'#E5E5E5', green:'#00A651' };

export default function Settings() {
  const { user, logout } = useAuth();
  const { openChat } = useChatContext();
  const items = [
    { icon: User,  label:'الملف الشخصي',       desc:'تحديث معلومات الملف الشخصي',         ibg:'#F5F5F5', ic:PP.blue  },
    { icon: Bell,  label:'الإشعارات',           desc:'إدارة تنبيهات التطبيق',               ibg:'#EDF3FF', ic:PP.navy  },
    { icon: Lock,  label:'الخصوصية والأمان',    desc:'تحديث كلمة المرور والأمان',           ibg:'#F5F5F5', ic:PP.blue  },
    { icon: Globe, label:'اللغة والمنطقة',      desc:'تغيير اللغة والإعدادات الإقليمية',    ibg:'#E6F7EE', ic:PP.green },
    { icon: Info,  label:'حول التطبيق',         desc:'Bysis v1.0.0 — جميع الحقوق محفوظة',  ibg:'#F5F7FA', ic:PP.muted },
  ];
  return (
    <AppLayout onChatOpen={openChat}>
      <div className="pb-28" style={{background:PP.bg,minHeight:'100vh'}}>
        {/* Profile card */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}
          className="mx-4 mt-6 mb-5 rounded-2xl p-5 flex items-center gap-4"
          style={{background:PP.navy,boxShadow:'0 4px 18px rgba(26,26,26,0.25)'}}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white"
            style={{background:PP.blue,fontFamily:'Inter,sans-serif'}}>
            {user?.email ? user.email[0].toUpperCase() : 'B'}
          </div>
          <div>
            <p className="font-extrabold text-white text-lg leading-tight" style={{fontFamily:'Inter,sans-serif'}}>
              {user?.email || 'المستخدم'}
            </p>
            <p className="text-sm mt-0.5" style={{color:'rgba(255,255,255,0.65)'}}>عميل Bysis</p>
          </div>
        </motion.div>
        {/* List */}
        <div className="mx-4 rounded-2xl overflow-hidden"
          style={{background:PP.white,border:`1px solid ${PP.border}`,boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
          {items.map((item,i) => {
            const Icon = item.icon;
            return (
              <motion.button key={item.label} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}}
                transition={{delay:i*0.05}} whileTap={{scale:0.98}}
                className="w-full flex items-center gap-4 px-5 py-4 text-right transition-colors active:bg-[#FFFFFF]"
                style={{borderBottom:i<items.length-1?`1px solid ${PP.border}`:'none'}}
                onClick={()=>{}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:item.ibg}}>
                  <Icon size={20} weight="duotone" style={{color:item.ic}} />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-semibold text-sm" style={{color:PP.text,fontFamily:'Inter,sans-serif'}}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{color:PP.muted}}>{item.desc}</p>
                </div>
                <ChevronRight size={16} style={{color:PP.muted}} />
              </motion.button>
            );
          })}
        </div>
        {/* Logout */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="mx-4 mt-4">
          <button onClick={()=>logout()}
            className="w-full h-12 rounded-3xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{background:'#FEF2F2',color:'#DC2626',border:'1.5px solid #FECACA'}}>
            <SignOut size={18} />
            تسجيل الخروج
          </button>
        </motion.div>
        <p className="text-center text-xs mt-6" style={{color:PP.muted}}>Bysis v1.0.0 · © 2026 جميع الحقوق محفوظة</p>
      </div>
    </AppLayout>
  );
}
