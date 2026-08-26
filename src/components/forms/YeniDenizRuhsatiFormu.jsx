import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, ArrowLeft, Save, Calendar, Droplets, LifeBuoy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const YeniDenizRuhsatiFormu = () => {
  const navigate = useNavigate();
  
  // Görseldeki tüm alanları içeren state
  const [formData, setFormData] = useState({
    siraNo: '', sayfaNo: '', yeniDefterSayfaNo: '',
    plakasi: '', gemiAdi: '', eskiPlakasi: '',
    baglamaNumarasi: '', baglamaLimani: '', gemiTuru: '',
    yapimMalzemesi: '', yapimYili: '', avAraci: '',
    tamBoy: '', tescilBoy: '', kutukBoy: '',
    en: '', derinlik: '', grostonaj: '',
    boyHakki: '', aski: '',
    gemiSahibi: '', tcKimlikNo: '', telefon: '',
    adresi: '', il: '', ilce: '',
    vizeTarihi: '', vizeSuresi: '', ruhsatSuresi: ''
  });

  const parseDateStr = (str) => {
    if (!str) return null;
    const parts = str.split(/[\.\-\/]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      if (day > 0 && day <= 31 && month >= 0 && month <= 11 && year > 1900) return new Date(year, month, day);
    }
    const nativeDate = new Date(str);
    if (!isNaN(nativeDate.getTime())) return nativeDate;
    return null;
  };

  const formatDateStr = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  };

  const handleVizeTarihiChange = (value) => {
    let parsedDate = null;
    if (value.includes('-') && value.length === 10 && value.split('-')[0].length === 4) {
      parsedDate = new Date(value);
      value = formatDateStr(parsedDate);
    } else {
      parsedDate = parseDateStr(value);
    }

    if (parsedDate) {
      const vizeDate = new Date(parsedDate);
      vizeDate.setFullYear(vizeDate.getFullYear() + 2);
      const ruhsatDate = new Date(parsedDate);
      ruhsatDate.setFullYear(ruhsatDate.getFullYear() + 5);

      setFormData(prev => ({ 
        ...prev, 
        vizeTarihi: value,
        vizeSuresi: formatDateStr(vizeDate),
        ruhsatSuresi: formatDateStr(ruhsatDate)
      }));
    } else {
      setFormData(prev => ({ ...prev, vizeTarihi: value, vizeSuresi: '', ruhsatSuresi: '' }));
    }
  };

  const handleVizeTarihiBlur = () => {
    const parsedDate = parseDateStr(formData.vizeTarihi);
    if (parsedDate) {
      setFormData(prev => ({ ...prev, vizeTarihi: formatDateStr(parsedDate) }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vizeTarihi') {
      handleVizeTarihiChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Deniz Ruhsat Form Verileri:', formData);
    toast.success('Deniz ruhsat kaydı başarıyla oluşturuldu!');
  };

  // Form inputları için yardımcı bileşen
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
          padding: '10px 14px', 
          borderRadius: '8px', 
          border: '1px solid #cbd5e1', 
          background: readOnly ? '#e2e8f0' : '#f8fafc', 
          fontSize: '14px', 
          outline: 'none', 
          transition: 'all 0.2s',
          width: '100%',
          cursor: readOnly ? 'not-allowed' : 'text'
        }} 
        onFocus={(e) => {
          if (!readOnly) {
            e.target.style.borderColor = '#ef4444';
            e.target.style.background = '#fff';
            e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
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
    <div style={{ padding: '40px 40px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'default' }}
          >
            <Anchor size={16} /> Deniz
          </button>
          <button 
            onClick={() => navigate('/ruhsat/yeni-kayit/icsu')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#3b82f6'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <Droplets size={16} /> İçsu
          </button>
          <button 
            onClick={() => navigate('/ruhsat/yeni-kayit/yedek')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#10b981'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <LifeBuoy size={16} /> Yedek
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        
        {/* Üst Kısım / Başlık */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', padding: '30px 40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Anchor size={32} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '1px' }}>DENİZ RUHSAT KAYDI</h2>
              <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '15px' }}>Deniz araçları için yeni ruhsat bilgilerini eksiksiz doldurunuz.</p>
            </div>
          </div>
        </div>

        {/* Form Alanı (3 Sütunlu Grid) */}
        <form onSubmit={handleSubmit} style={{ padding: '30px 40px 40px 40px' }}>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px 30px' 
          }}>
            
            {/* Satır 1 */}
            <InputField label="SIRA NO" name="siraNo" />
            <InputField label="SAYFA NO" name="sayfaNo" />
            <InputField label="YENİ DEFTER SAYFA NO" name="yeniDefterSayfaNo" />
            
            {/* Satır 2 */}
            <InputField label="PLAKASI" name="plakasi" />
            <InputField label="GEMİ ADI" name="gemiAdi" />
            <InputField label="ESKİ PLAKASI" name="eskiPlakasi" />
            
            {/* Satır 3 */}
            <InputField label="BAĞLAMA NUMARASI" name="baglamaNumarasi" />
            <InputField label="BAĞLAMA LİMANI" name="baglamaLimani" />
            <InputField label="GEMİ TÜRÜ" name="gemiTuru" />

            {/* Satır 4 */}
            <InputField label="YAPIM MALZEMESİ" name="yapimMalzemesi" />
            <InputField label="YAPIM YILI" name="yapimYili" />
            <InputField label="AV ARACI" name="avAraci" />

            {/* Satır 5 */}
            <InputField label="TAM BOY" name="tamBoy" />
            <InputField label="TESCİL BOY" name="tescilBoy" />
            <InputField label="KÜTÜK BOY" name="kutukBoy" />

            {/* Satır 6 */}
            <InputField label="EN" name="en" />
            <InputField label="DERİNLİK" name="derinlik" />
            <InputField label="GROSTONAJ" name="grostonaj" />

            {/* Satır 7 */}
            <InputField label="BOY HAKKI" name="boyHakki" />
            <InputField label="ASKI" name="aski" />
            <div /> {/* 3. Sütunu boş geçmek için */}

            {/* Satır 8 */}
            <InputField label="GEMİ SAHİBİ" name="gemiSahibi" />
            <InputField label="TC KİMLİK NO" name="tcKimlikNo" />
            <InputField label="TELEFON" name="telefon" />

            {/* Satır 9 */}
            <InputField label="ADRESİ" name="adresi" />
            <InputField label="İL" name="il" />
            <InputField label="İLÇE" name="ilce" />

            {/* Satır 10 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                VİZE TARİHİ
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  name="vizeTarihi" 
                  value={formData.vizeTarihi} 
                  onChange={(e) => handleVizeTarihiChange(e.target.value)} 
                  placeholder="GG.AA.YYYY" 
                  style={{ 
                    padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', 
                    background: '#f8fafc', fontSize: '14px', outline: 'none', transition: 'all 0.2s', width: '100%', paddingRight: '40px'
                  }} 
                  onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)'; }}
                  onBlur={(e) => { 
                    e.target.style.borderColor = '#cbd5e1'; 
                    e.target.style.background = '#f8fafc'; 
                    e.target.style.boxShadow = 'none'; 
                    handleVizeTarihiBlur();
                  }}
                />
                <input 
                  type="date"
                  onChange={(e) => { if(e.target.value) handleVizeTarihiChange(e.target.value); }}
                  style={{ position: 'absolute', right: '10px', opacity: 0, width: '24px', height: '24px', cursor: 'pointer' }}
                />
                <Calendar size={20} color="#94a3b8" style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }} />
              </div>
            </div>
            
            <InputField label="VİZE SÜRESİ" name="vizeSuresi" readOnly={true} />
            <InputField label="RUHSAT SÜRESİ" name="ruhsatSuresi" readOnly={true} />
            
          </div>

          <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button 
              type="button"
              onClick={() => navigate('/ruhsat/yeni-kayit')}
              style={{ padding: '14px 28px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Vazgeç
            </button>
            <button 
              type="submit"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 36px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)'; }}
            >
              <Save size={20} /> Kaydı Tamamla
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

export default YeniDenizRuhsatiFormu;
