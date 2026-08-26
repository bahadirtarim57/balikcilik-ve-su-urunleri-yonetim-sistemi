import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, FilePlus, FileEdit, ArrowRight, Anchor } from 'lucide-react';

const RuhsatAnaSayfa = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'RUHSAT KAYIT ARŞİVİ',
      description: 'Mevcut ruhsatların detaylı listesi, excel tablosu ve arama işlemleri.',
      icon: <Ship size={32} color="#fff" />,
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
      shadow: 'rgba(59, 130, 246, 0.4)',
      action: () => navigate('/ruhsat/liste')
    },
    {
      title: 'YENİ RUHSAT KAYDI',
      description: 'Sisteme yeni bir gemi, tekne veya plaka ruhsatı tanımlama işlemleri.',
      icon: <FilePlus size={32} color="#fff" />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadow: 'rgba(16, 185, 129, 0.4)',
      action: () => navigate('/ruhsat/yeni-kayit')
    },
    {
      title: 'MEVCUT RUHSATA İŞLEM',
      description: 'Ruhsat yenileme, vize işlemleri, ceza veya el koyma gibi durum güncellemeleri.',
      icon: <FileEdit size={32} color="#fff" />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      shadow: 'rgba(245, 158, 11, 0.4)',
      action: () => navigate('/ruhsat/mevcut-islem')
    }
  ];

  return (
    <div style={{ padding: '60px 40px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeInDown 0.8s ease-out' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5', marginBottom: '20px', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.2)' }}>
          <Anchor size={40} color="#059669" />
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          RUHSAT KAYIT İŞLEMLERİ
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%', maxWidth: '1000px' }}>
        {menuItems.map((item, index) => (
          <div 
            key={index}
            onClick={item.action}
            style={{
              position: 'relative',
              background: item.gradient,
              borderRadius: '20px',
              padding: '30px 20px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: `0 15px 30px -10px ${item.shadow}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = `0 20px 40px -12px ${item.shadow}`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = `0 15px 30px -10px ${item.shadow}`;
            }}
          >
            {/* Dekoratif Arka Plan Çemberleri */}
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-15px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', backdropFilter: 'blur(10px)', marginBottom: '16px', zIndex: 1 }}>
              {item.icon}
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px', zIndex: 1, letterSpacing: '0.5px' }}>
              {item.title}
            </h3>
            
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', flex: 1, zIndex: 1, marginBottom: '20px' }}>
              {item.description}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.95)', zIndex: 1, marginTop: 'auto' }}>
              İşleme Başla <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Keyframe animasyonları eklemek için (eğer CSS dosyasında yoksa inline olarak inject ediyoruz) */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default RuhsatAnaSayfa;
