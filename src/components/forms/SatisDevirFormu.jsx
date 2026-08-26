import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, ArrowLeft, Save, ClipboardCheck, Navigation, ShieldAlert, Ban } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SatisDevirFormu = () => {
  const navigate = useNavigate();
  
  // Excel şemasındaki alanlar
  const [formData, setFormData] = useState({
    yeniPlakaNo: '',
    hologramNo: '',
    eskiPlakaNo: '',
    gemiAdi: '',
    alanKisiAdiSoyadi: '',
    tc: '',
    telefon: '',
    adresi: '',
    ili: '',
    ilcesi: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Satış / Devir İşlemi Verileri:', formData);
    toast.success('Satış / Devir işlemi başarıyla kaydedildi!');
  };

  const InputField = ({ label, name, type = 'text', placeholder = '', readOnly = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      <input 
        type={type} 
        name={name} 
        value={formData[name]} 
        onChange={handleChange} 
        placeholder={placeholder} 
        readOnly={readOnly}
        style={{ 
          padding: '12px 16px', 
          borderRadius: '10px', 
          border: '1px solid #cbd5e1', 
          background: readOnly ? '#e2e8f0' : '#f8fafc', 
          fontSize: '15px', 
          outline: 'none', 
          transition: 'all 0.2s',
          width: '100%',
          cursor: readOnly ? 'not-allowed' : 'text'
        }} 
        onFocus={(e) => {
          if (!readOnly) {
            e.target.style.borderColor = '#f59e0b'; // Turuncu (Satış Devir Tema Rengi)
            e.target.style.background = '#fff';
            e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
          }
        }} 
        onBlur={(e) => {
          if (!readOnly) {
            e.target.style.borderColor = '#cbd5e1';
            e.target.style.background = '#f8fafc';
            e.target.style.boxShadow = 'none';
          }
        }} 
      />
    </div>
  );

  return (
    <div style={{ padding: '40px 40px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Üst Navigasyon Menüsü */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <button 
          onClick={() => navigate('/ruhsat')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <ArrowLeft size={18} /> Ana Sayfaya Dön
        </button>

        <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '6px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button 
            onClick={() => navigate('/ruhsat/mevcut-islem/vize')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#10b981'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <ClipboardCheck size={16} /> Vize İşlemleri
          </button>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'default' }}
          >
            <ArrowRightLeft size={16} /> Satış / Devir
          </button>
          <button 
            onClick={() => navigate('/ruhsat/mevcut-islem/nakil')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#3b82f6'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <Navigation size={16} /> Nakil
          </button>
          <button 
            onClick={() => navigate('/ruhsat/mevcut-islem/ceza')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#6366f1'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <ShieldAlert size={16} /> Ceza / Elkoyma
          </button>
          <button 
            onClick={() => navigate('/ruhsat/mevcut-islem/iptal')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <Ban size={16} /> Ruhsat İptal
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        
        {/* Üst Kısım / Başlık */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '30px 40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <ArrowRightLeft size={36} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '1px' }}>SATIŞ / DEVİR</h2>
              <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '15px' }}>Ruhsat sahipliğinin başka bir şahsa veya kuruma devri işlemlerini gerçekleştirin.</p>
            </div>
          </div>
        </div>

        {/* Form Alanı (2 Sütunlu Grid) */}
        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '24px 30px' 
          }}>
            
            {/* Gemi/Plaka Bilgileri */}
            <div style={{ gridColumn: '1 / -1', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', margin: 0 }}>Gemi ve Plaka Bilgileri</h3>
            </div>
            <InputField label="YENİ PLAKA NO" name="yeniPlakaNo" placeholder="Örn: 57 D 0001" />
            <InputField label="HOLOGRAM NO" name="hologramNo" placeholder="Hologram Numarası" />
            <InputField label="ESKİ PLAKA NO" name="eskiPlakaNo" placeholder="Örn: 34 D 1234" />
            <InputField label="GEMİ ADI" name="gemiAdi" placeholder="Örn: KAPTAN ALİ" />
            
            {/* Yeni Sahip Bilgileri */}
            <div style={{ gridColumn: '1 / -1', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '10px', marginTop: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', margin: 0 }}>Yeni Sahip / Alan Kişi Bilgileri</h3>
            </div>
            <InputField label="ALAN KİŞİ ADI SOYADI" name="alanKisiAdiSoyadi" placeholder="Ad Soyad" />
            <InputField label="T.C. KİMLİK NO" name="tc" placeholder="11 Haneli TC Kimlik No" />
            <InputField label="TELEFON" name="telefon" placeholder="05XX XXX XX XX" />
            <div /> {/* Layout alignment */}
            
            <div style={{ gridColumn: '1 / -1' }}>
              <InputField label="ADRESİ" name="adresi" placeholder="Açık Adres" />
            </div>
            <InputField label="İLİ" name="ili" placeholder="Örn: SİNOP" />
            <InputField label="İLÇESİ" name="ilcesi" placeholder="Örn: MERKEZ" />
            
          </div>

          <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button 
              type="button"
              onClick={() => navigate('/ruhsat/mevcut-islem')}
              style={{ padding: '14px 28px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              İptal
            </button>
            <button 
              type="submit"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 36px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.35)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.25)'; }}
            >
              <Save size={20} /> İşlemi Kaydet
            </button>
          </div>

        </form>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default SatisDevirFormu;
