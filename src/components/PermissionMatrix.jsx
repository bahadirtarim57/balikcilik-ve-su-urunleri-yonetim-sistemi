import React, { useState, useEffect } from 'react';
import { Save, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DEFAULT_SIDEBAR = [
  {
    id: 'main_menu',
    title: '1380 Sayılı Yasa İhlalleri Menüsü',
    roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu', 'Personel'],
    items: [
      { id: 'dashboard', label: 'Ana Sayfa', path: '/', roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu', 'Personel'] },
      { id: 'cezalar', label: 'Cezalar', path: '/cezalar', roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu', 'Personel'] },
      { id: 'kanun', label: 'Kanun Maddeleri', path: '/kanun-maddeleri', roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu', 'Personel'] },
      { id: 'hesaplama', label: 'Ceza Hesaplama', path: '/hesaplama', roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu', 'Personel'] },
      { id: 'arsiv', label: 'Arşiv', path: '/arsiv', roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu', 'Personel'] },
      { id: 'raporlar', label: 'Raporlar', path: '/raporlar', roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu'] },
      { id: 'veri', label: 'Veri Yönetimi', path: '/veri-yonetimi', roles: ['Genel Koordinatör', 'Birim Sorumlusu'] },
      { id: 'personel', label: 'Personel', path: '/personel', roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu'] },
      { id: 'ayarlar', label: 'Kurum Ayarları', path: '/ayarlar', roles: ['Genel Koordinatör', 'Yetkili Yönetici'] },
      { id: 'rol', label: 'Rol Atamaları', path: '/rol-atamalari', roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'Birim Sorumlusu'] },
      { id: 'yetki', label: 'Yetki Matrisi', path: '/yetki-matrisi', roles: ['Genel Koordinatör', 'Yetkili Yönetici'] }
    ]
  }
];

const ALL_ROLES = [
  'Genel Koordinatör',
  'Yetkili Yönetici',
  'İl Müdürü',
  'İl Müdür Yardımcısı',
  'Şube Müdürü',
  'İlçe Müdürü',
  'Birim Sorumlusu',
  'Personel'
];

export default function PermissionMatrix() {
  const [sections, setSections] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('customSidebarMenu');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration check for old flat structure
        if (parsed.length > 0 && !parsed[0].items) {
          setSections([{
            id: 'main_menu',
            title: '1380 Sayılı Yasa İhlalleri Menüsü',
            roles: ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu', 'Personel'],
            items: parsed
          }]);
        } else {
          setSections(parsed);
        }
      } catch (e) {
        setSections(JSON.parse(JSON.stringify(DEFAULT_SIDEBAR)));
      }
    } else {
      setSections(JSON.parse(JSON.stringify(DEFAULT_SIDEBAR)));
    }
  }, []);

  const handleToggleRole = (sectionId, itemId, role) => {
    if (role === 'Genel Koordinatör') return; // Cannot toggle Genel Koordinatör

    setSections(prevSections => {
      const newSections = JSON.parse(JSON.stringify(prevSections)); // Deep copy
      const section = newSections.find(s => s.id === sectionId);
      if (!section) return prevSections;

      if (itemId === null) {
        // Toggle for section itself
        let currentRoles = section.roles || [];
        if (currentRoles.includes('ALL')) {
          currentRoles = [...ALL_ROLES];
        }

        if (currentRoles.includes(role)) {
          section.roles = currentRoles.filter(r => r !== role);
        } else {
          section.roles = [...currentRoles, role];
        }
      } else {
        // Toggle for specific item
        const item = section.items.find(i => i.id === itemId);
        if (!item) return prevSections;

        let currentRoles = item.roles || [];
        if (currentRoles.includes('ALL')) {
          currentRoles = [...ALL_ROLES];
        }

        if (currentRoles.includes(role)) {
          item.roles = currentRoles.filter(r => r !== role);
        } else {
          item.roles = [...currentRoles, role];
        }
      }

      return newSections;
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('customSidebarMenu', JSON.stringify(sections));
      
      const permissionsObj = {};
      ALL_ROLES.forEach(role => {
        const allowedPaths = [];
        sections.forEach(section => {
          if (section.items) {
            section.items.forEach(item => {
              if (item.roles && item.roles.includes(role)) {
                if (item.path) allowedPaths.push(item.path);
              }
            });
          }
        });
        permissionsObj[role] = allowedPaths;
      });
      localStorage.setItem('role_permissions', JSON.stringify(permissionsObj));
      
      toast.success('Yetki matrisi başarıyla kaydedildi.');
    } catch (error) {
      toast.error('Kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const isRoleHasAccess = (rolesArray, targetRole) => {
    if (!rolesArray) return true;
    if (rolesArray.includes('ALL')) return true;
    return rolesArray.includes(targetRole);
  };

  return (
    <div className="module-container">
      <div className="module-header glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="header-left">
          <h2><Shield size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: '#1a73e8' }} /> Detaylı Yetki Matrisi</h2>
          <p>Hangi makamın sol menüde hangi işlemlere ve cetvellere erişebileceğini detaylı olarak yapılandırın.</p>
        </div>
        <button className="primary-btn" onClick={handleSave} disabled={isSaving}>
          <Save size={18} /> {isSaving ? 'Kaydediliyor...' : 'Matrisi Kaydet ve Uygula'}
        </button>
      </div>

      <div className="module-content glass-panel mt-4" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: '1200px' }}>
          <thead>
            <tr>
              <th style={{ width: '250px', background: '#f8f9fa' }}>Menü / İşlem</th>
              {ALL_ROLES.map(role => (
                <th key={role} style={{ textAlign: 'center', fontSize: '11px', padding: '12px 4px' }}>
                  <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '120px', margin: '0 auto' }}>
                    {role}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map(section => (
              <React.Fragment key={section.id}>
                {/* Section Row */}
                <tr style={{ background: '#eef2ff' }}>
                  <td style={{ fontWeight: 'bold', color: '#4f46e5' }}>{section.title} (Ana Başlık)</td>
                  {ALL_ROLES.map(role => {
                    const hasAccess = isRoleHasAccess(section.roles, role);
                    const isSuperAdmin = role === 'Genel Koordinatör';
                    return (
                      <td key={role} style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={hasAccess}
                          disabled={isSuperAdmin}
                          onChange={() => handleToggleRole(section.id, null, role)}
                          style={{ width: '16px', height: '16px', cursor: isSuperAdmin ? 'not-allowed' : 'pointer', accentColor: '#4f46e5' }}
                        />
                      </td>
                    );
                  })}
                </tr>

                {/* Items Rows */}
                {section.items.map(item => (
                  <tr key={item.id}>
                    <td style={{ paddingLeft: '30px' }}>
                      {item.type === 'subtitle' ? <span style={{ fontWeight: 'bold', color: '#6b7280' }}>{item.title}</span> : item.label}
                    </td>
                    {ALL_ROLES.map(role => {
                      const hasAccess = isRoleHasAccess(item.roles, role);
                      const isSuperAdmin = role === 'Genel Koordinatör';
                      return (
                        <td key={role} style={{ textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={hasAccess}
                            disabled={isSuperAdmin}
                            onChange={() => handleToggleRole(section.id, item.id, role)}
                            style={{ width: '16px', height: '16px', cursor: isSuperAdmin ? 'not-allowed' : 'pointer' }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
        * Not: Genel Koordinatör, sistemin teknik yöneticisi olduğundan tüm menülere her zaman erişim hakkına sahiptir (Kilitli).<br/>
        * Bir Ana Başlık için yetki kapatılırsa, içindeki alt menüler yetkili olsa bile o makama gösterilmeyebilir.
      </div>
    </div>
  );
}
