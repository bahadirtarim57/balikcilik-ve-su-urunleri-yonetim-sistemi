import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultSections, IconMap } from '../utils/menuConfig';
import masterArsiv from '../data/master_arsiv.json';
import tesisData from '../data/sinopTesisler_Master.json';
import { PERSONELLER } from '../utils/excelData';

const GenelDashboard = ({ data: cezalarData }) => {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const ruhsatCount = masterArsiv.length || 0;
    
    // Yetiştiricilik İstatistiği
    let aktifCount = 0, aktifCap = 0;
    let kiraCount = 0, kiraCap = 0;
    let pasifCount = 0, pasifCap = 0;
    let devirCount = 0, devirCap = 0;
    let iptalCount = 0, iptalCap = 0;

    (tesisData || []).forEach(t => {
      const st = t.finalStatus?.toUpperCase() || '';
      const capVal = typeof t.kapasite === 'string' ? Number(t.kapasite.replace(/[^0-9.-]+/g,'')) : Number(t.kapasite);
      const cap = isNaN(capVal) ? 0 : capVal;

      if (st.includes('AKTIF') || st.includes('AKTİF')) {
        aktifCount++; aktifCap += cap;
      } else if (st.includes('KIRALAMA') || st.includes('KİRALAMA') || st.includes('BELIRSIZ') || st.includes('BELİRSİZ')) {
        kiraCount++; kiraCap += cap;
      } else if (st.includes('PASIF') || st.includes('PASİF')) {
        pasifCount++; pasifCap += cap;
      } else if (st.includes('DEVRE') || st.includes('DEVİR')) {
        devirCount++; devirCap += cap;
      } else if (st.includes('İPTAL') || st.includes('IPTAL')) {
        iptalCount++; iptalCap += cap;
      }
    });

    const tesisList = [
      { name: 'Aktif Tesis', count: aktifCount, cap: aktifCap },
      { name: 'Kiralama Aşamasında Tesis', count: kiraCount, cap: kiraCap },
      { name: 'Pasif Tesis', count: pasifCount, cap: pasifCap },
      { name: 'Devredilen Tesis', count: devirCount, cap: devirCap },
      { name: 'İptal Edilen Tesis', count: iptalCount, cap: iptalCap }
    ];
    
    let stokCount = 0;
    try {
      const storedStudies = JSON.parse(localStorage.getItem('stok_studies') || '[]');
      stokCount = storedStudies.length > 0 ? storedStudies.length : 1; 
    } catch(e) {}
    
    const ihlalCount = cezalarData?.length || 0;
    let kesilenCezaAdet = 0;
    let toplamTL = 0;
    try {
      const arsiv = JSON.parse(localStorage.getItem('ceza_arsivi') || '[]');
      kesilenCezaAdet = arsiv.length;
      toplamTL = arsiv.reduce((acc, curr) => acc + (Number(curr?.penaltyData?.calculatedAmount) || 0), 0);
    } catch(e) {}

    const selectedUnit = localStorage.getItem('app-selectedUnit') || '';
    
    let allPersonnel = [...(PERSONELLER || [])];
    try {
        const lp = JSON.parse(localStorage.getItem('personnel_data') || '[]');
        allPersonnel = [...allPersonnel, ...lp];
    } catch(e) {}
    
    const uniquePersonnelMap = new Map();
    allPersonnel.forEach(p => {
       const key = p.sicil || p.adSoyad || p.name;
       if(key) uniquePersonnelMap.set(key, p);
    });
    const uniquePersonnel = Array.from(uniquePersonnelMap.values());

    let personelCount = 0;
    if (selectedUnit && selectedUnit !== 'Tüm Birimler' && selectedUnit !== 'Tüm İlçeler' && selectedUnit !== 'Birim Seçilmedi') {
       personelCount = uniquePersonnel.filter(p => (p.birim || p.unit || '') === selectedUnit).length;
    } else {
       personelCount = uniquePersonnel.length;
    }

    return {
      'section-ruhsat': { label: 'Kayıtlı Gemi/Ruhsat', value: ruhsatCount, subValue: 'adet' },
      'section-tesis': { 
        label: 'Tesis Yönetimi', 
        isTesisList: true,
        tesisList: tesisList
      },
      'section-stok': { label: 'Kayıtlı Çalışma', value: stokCount, subValue: 'adet' },
      'section-ipc': { 
        label: 'Kayıtlı İhlal Maddesi', 
        value: ihlalCount, 
        subValue: 'adet',
        extra: { label: 'Kesilen Ceza:', value: `${kesilenCezaAdet} Adet`, subLabel: 'Toplam Tutar:', subValue2: `${toplamTL.toLocaleString('tr-TR')} ₺` }
      },
      'section-ayarlar': { 
        label: selectedUnit && selectedUnit !== 'Birim Seçilmedi' ? `${selectedUnit} Personeli` : 'Kayıtlı Personel', 
        value: personelCount, 
        subValue: 'kişi',
        isBranch: false
      }
    };
  }, [cezalarData]);

  
  const currentRole = (() => {
    let appUser = null;
    try { appUser = JSON.parse(localStorage.getItem('appUser')); } catch(e) {}
    if (!appUser) return 'Personel';
    
    let userRoles = {};
    try { userRoles = JSON.parse(localStorage.getItem('user_roles') || '{}'); } catch(e) {}

    const realRole = appUser?.sicil === 'admin' ? 'Genel Koordinatör' : (userRoles[appUser?.sicil || appUser?.adSoyad || appUser?.name] || 'Personel');
    return appUser?.impersonated ? appUser.role : realRole;
  })();

  const moduleSections = defaultSections.filter(sec => {
    if (sec.id === 'section-genel') return false;
    
    if (currentRole === 'Genel Koordinatör') return true;

    // Check specific modulePermissions for Everyone except Genel Koordinatör
    let appUser = null;
    try { appUser = JSON.parse(localStorage.getItem('appUser')); } catch(e) {}
    
    const modulePermissions = JSON.parse(localStorage.getItem('modulePermissionsData') || '{}');
    const pName = appUser?.originalName || appUser?.name || appUser?.adSoyad;
    const perms = modulePermissions[pName] || {};

    if (sec.id === 'section-ruhsat') return !!perms.ruhsat;
    if (sec.id === 'section-stok') return !!perms.stok;
    if (sec.id === 'section-tesis') return !!perms.yetistiricilik;
    if (sec.id === 'section-ipc') return !!perms.ihlaller;
    
    // section-ayarlar is based on role and perms
    if (sec.id === 'section-ayarlar') {
       if (perms.ayarlar) return true;
       if (currentRole === 'Personel') return false;
       return true; 
    }
    
    return true; 
  });


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
          const sectionIconName = section.items && section.items.length > 0 ? section.items[0].iconName : 'Archive';
          const IconComponent = IconMap[sectionIconName] || IconMap['Archive'];
          const stat = stats[section.id] || { label: 'Erişim', value: '→', subValue: 'Modüle Git' };
          const mainLink = section.items && section.items.length > 0 ? section.items[0].link : '/';
          
          const colors = [
            { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }, 
            { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }, 
            { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }, 
            { bg: '#fdf4ff', text: '#c026d3', border: '#fbcfe8' }, 
            { bg: '#fffbeb', text: '#d97706', border: '#fde68a' }  
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
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  {stat.label}
                </div>
                
                {stat.isTesisList ? (
                  <div style={{ marginTop: '-4px' }}>
                    {stat.tesisList.map((tl, i) => (
                      <div key={i} style={{ paddingBottom: '6px', marginBottom: '6px', borderBottom: i < stat.tesisList.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>{tl.name}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                          <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{tl.count} Adet</span> tesis - Toplam Kapasite: <span style={{ fontWeight: 'bold', color: '#10b981' }}>{tl.cap.toLocaleString('tr-TR')} Ton/Yıl</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stat.isBranch ? (
                    <div style={{ fontSize: '16px', fontWeight: '600', color: color.text, lineHeight: '1.3' }}>
                      {stat.subValue}
                    </div>
                ) : (
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
                )}
                
                {!stat.isTesisList && stat.topExtra && (
                  <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: '600', color: color.text }}>
                    {stat.topExtra}
                  </div>
                )}

                {!stat.isTesisList && stat.extra && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e5e7eb', fontSize: '13px', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                    <div>{stat.extra.label} <span style={{fontWeight: 'bold', color: '#1f2937'}}>{stat.extra.value}</span></div>
                    <div>{stat.extra.subLabel} <span style={{fontWeight: 'bold', color: color.text}}>{stat.extra.subValue2}</span></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenelDashboard;
