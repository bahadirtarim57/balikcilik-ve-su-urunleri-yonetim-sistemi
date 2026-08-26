import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Droplets, LifeBuoy, ArrowLeft, ArrowRight } from 'lucide-react';

const YeniRuhsatSecim = () => {
  const navigate = useNavigate();

  const secenekler = [
    {
      title: 'DENİZ',
      description: 'Deniz sularında faaliyet gösterecek gemi ve tekneler için yeni ruhsat kaydı oluşturun.',
      icon: <Anchor size={32} color="#fff" />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
      shadow: 'rgba(239, 68, 68, 0.4)',
      action: () => navigate('/ruhsat/yeni-kayit/deniz')
    },
    {
      title: 'İÇSU',
      description: 'Göl, baraj ve nehir gibi iç sularda faaliyet gösterecek tekneler için ruhsat kaydı.',
      icon: <Droplets size={32} color="#fff" />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
      shadow: 'rgba(59, 130, 246, 0.4)',
      action: () => navigate('/ruhsat/yeni-kayit/icsu')
    },
    {
      title: 'YEDEK',
      description: 'Ana gemiye bağlı olarak çalışacak yardımcı/yedek tekneler için ruhsat kaydı.',
      icon: <LifeBuoy size={32} color="#fff" />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      shadow: 'rgba(16, 185, 129, 0.4)',
      action: () => navigate('/ruhsat/yeni-kayit/yedek')
    }
  ];

  return (
    <div style={{ padding: '40px 40px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Geri Dön Butonu */}
      <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/ruhsat')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <ArrowLeft size={18} /> Ana Menüye Dön
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInDown 0.8s ease-out' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '10px' }}>
          Yeni Ruhsat Kaydı
        </h2>
        <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Lütfen kayıt oluşturmak istediğiniz ruhsat tipini seçin.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%', maxWidth: '1000px' }}>
        {secenekler.map((item, index) => (
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
              alignItems: 'center',
              textAlign: 'center',
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
            <div style={{ position: 'absolute', top: '-15px', left: '-15px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-30px', right: '-15px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', backdropFilter: 'blur(10px)', marginBottom: '16px', zIndex: 1, boxShadow: '0 6px 12px rgba(0,0,0,0.1)' }}>
              {item.icon}
            </div>
            
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px', zIndex: 1, letterSpacing: '1px' }}>
              {item.title}
            </h3>
            
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', flex: 1, zIndex: 1, marginBottom: '20px' }}>
              {item.description}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: 'white', zIndex: 1, marginTop: 'auto', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '30px' }}>
              Seç <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YeniRuhsatSecim;
