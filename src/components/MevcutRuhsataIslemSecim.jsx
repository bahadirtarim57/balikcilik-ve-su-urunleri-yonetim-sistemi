import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, ArrowRightLeft, Navigation, ShieldAlert, Ban, ArrowLeft, ArrowRight } from 'lucide-react';

const MevcutRuhsataIslemSecim = () => {
  const navigate = useNavigate();

  const secenekler = [
    {
      title: 'VİZE İŞLEMLERİ',
      description: 'Mevcut ruhsatların periyodik vize yenileme işlemleri.',
      icon: <ClipboardCheck size={28} color="#fff" />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
      shadow: 'rgba(16, 185, 129, 0.4)',
      action: () => navigate('/ruhsat/mevcut-islem/vize')
    },
    {
      title: 'SATIŞ / DEVİR',
      description: 'Ruhsat sahipliğinin başka bir şahsa veya kuruma devri.',
      icon: <ArrowRightLeft size={28} color="#fff" />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
      shadow: 'rgba(245, 158, 11, 0.4)',
      action: () => navigate('/ruhsat/mevcut-islem/satis')
    },
    {
      title: 'NAKİL',
      description: 'Ruhsatlı aracın farklı bir il/ilçeye kayıt nakil işlemleri.',
      icon: <Navigation size={28} color="#fff" />,
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', 
      shadow: 'rgba(14, 165, 233, 0.4)',
      action: () => navigate('/ruhsat/mevcut-islem/nakil')
    },
    {
      title: 'CEZA / ELKOYMA',
      description: 'Ruhsatla ilişkili cezai yaptırımlar, uyarılar veya elkoyma kayıtları.',
      icon: <ShieldAlert size={28} color="#fff" />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
      shadow: 'rgba(59, 130, 246, 0.4)',
      action: () => navigate('/ruhsat/mevcut-islem/ceza')
    },
    {
      title: 'RUHSAT İPTAL',
      description: 'Mevcut ruhsatın kalıcı veya geçici olarak iptal edilmesi.',
      icon: <Ban size={28} color="#fff" />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
      shadow: 'rgba(239, 68, 68, 0.4)',
      action: () => navigate('/ruhsat/mevcut-islem/iptal')
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

      <div style={{ textAlign: 'center', marginBottom: '30px', animation: 'fadeInDown 0.8s ease-out' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Mevcut Ruhsata İşlem
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
          Lütfen yapmak istediğiniz işlemi seçin.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', width: '100%', maxWidth: '1200px' }}>
        {secenekler.map((item, index) => (
          <div 
            key={index}
            onClick={item.action}
            style={{
              position: 'relative',
              background: item.gradient,
              borderRadius: '16px',
              padding: '20px 16px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: `0 10px 20px -8px ${item.shadow}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              overflow: 'hidden',
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = `0 15px 30px -10px ${item.shadow}`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = `0 10px 20px -8px ${item.shadow}`;
            }}
          >
            {/* Dekoratif Arka Plan Çemberleri */}
            <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-20px', right: '-10px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', backdropFilter: 'blur(10px)', marginBottom: '12px', zIndex: 1, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              {item.icon}
            </div>
            
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px', zIndex: 1, letterSpacing: '0.5px' }}>
              {item.title}
            </h3>
            
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4', flex: 1, zIndex: 1, marginBottom: '12px' }}>
              {item.description}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: 'white', zIndex: 1, marginTop: 'auto', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '30px' }}>
              Seç <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MevcutRuhsataIslemSecim;
