import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultSections, IconMap } from '../utils/menuConfig';
import masterArsiv from '../data/master_arsiv.json';
import tesisData from '../data/sinopTesisler_Master.json';
import { PERSONELLER } from '../utils/excelData';

const GenelDashboard = ({ data: cezalarData }) => {
  const navigate = useNavigate();

  // Hesaplamalar
  const stats = useMemo(() => {
    // Ruhsat İstatistiği
    const ruhsatCount = masterArsiv.length || 0;
    
    // Yetiştiricilik İstatistiği
    const tesisCount = tesisData?.tesisler?.length || 0;
    const kapasite = tesisData?.tesisler?.reduce((acc, t) => acc + (t.kapasite || 0), 0) || 0;
    
    // Stok İstatistiği
    let stokCount = 0;
    try {
      const storedStudies = JSON.parse(localStorage.getItem('stok_studies') || '[]');
      stokCount = storedStudies.length > 0 ? storedStudies.length : 1; // Default Boyabat var
    } catch(e) {}
    
    // İhlal İstatistiği
    const ihlalCount = cezalarData?.length || 0;
    
    // Personel İstatistiği
    let personelCount = PERSONELLER?.length || 0;
    try {
        const lp = JSON.parse(localStorage.getItem('personnel_data') || '[]');
        personelCount += lp.length;
    } catch(e) {}

    return {
      'section-ruhsat': { label: 'Kayıtlı Gemi/Ruhsat', value: ruhsatCount, subValue: 'adet' },
      'section-tesis': { label: 'Aktif Tesis', value: tesisCount, subValue: `${kapasite} Ton/Yıl` },
      'section-stok': { label: 'Kayıtlı Çalışma', value: stokCount, subValue: 'adet' },
      'section-ipc': { label: 'Toplam Ceza/İhlal', value: ihlalCount, subValue: 'kayıt' },
      'section-ayarlar': { label: 'Kayıtlı Personel', value: personelCount, subValue: 'kişi' }
    };
  }, [cezalarData]);

  // Sadece Genel menüsü hariç diğerlerini filtrele
  const moduleSections = defaultSections.filter(sec => sec.id !== 'section-genel');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Genel Kontrol Paneli</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Tüm Balıkçılık ve Su Ürünleri Yönetim Sistemi modüllerinin genel özeti ve hızlı erişim panosu.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {moduleSections.map((section, index) => {
          // Eğer section iconName varsa IconMap'ten al, yoksa varsayılan klasör ikonu
          const sectionIconName = section.items && section.items.length > 0 ? section.items[0].iconName : 'Archive';
          const IconComponent = IconMap[sectionIconName] || IconMap['Archive'];
          const stat = stats[section.id] || { label: 'Erişim', value: '→', subValue: 'Modüle Git' };
          const mainLink = section.items && section.items.length > 0 ? section.items[0].link : '/';
          
          // Renk paleti
          const colors = [
            { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }, // blue
            { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }, // green
            { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }, // red
            { bg: '#fdf4ff', text: '#c026d3', border: '#fbcfe8' }, // fuchsia
            { bg: '#fffbeb', text: '#d97706', border: '#fde68a' }  // amber
          ];
          const color = colors[index % colors.length];

          return (
            <div 
              key={section.id}
              onClick={() => navigate(mainLink)}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: `1px solid ${color.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  backgroundColor: color.bg, 
                  color: color.text,
                  padding: '12px',
                  borderRadius: '12px'
                }}>
                  <IconComponent size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0, lineHeight: '1.2' }}>
                  {section.title}
                </h3>
              </div>
              
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: color.text }}>
                    {stat.value}
                  </span>
                  {stat.subValue && (
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#9ca3af' }}>
                      {stat.subValue}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenelDashboard;
