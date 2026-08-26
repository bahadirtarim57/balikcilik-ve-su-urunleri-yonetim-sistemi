import React, { useState, useEffect } from 'react';
import { Save, UserCog } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PERSONELLER, EXCEL_PROVINCE } from '../utils/excelData';
import { uploadLocalToSupabase } from '../lib/storage';

const ROLES = [
  'Genel Koordinatör',
  'Yetkili Yönetici',
  'İl Müdürü',
  'İl Müdür Yardımcısı',
  'Şube Müdürü',
  'İlçe Müdürü',
  'Birim Sorumlusu',
  'Personel'
];

const RoleAssignments = ({ selectedCity, selectedUnit, selectedUnitType, selectedDistrict, currentRole }) => {
  const [personnelList, setPersonnelList] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const editedData = JSON.parse(localStorage.getItem('editedPersonnelData') || '{}');
    const localPersonnel = JSON.parse(localStorage.getItem('personnel_data') || '[]');
    const excelPersonnel = PERSONELLER || [];
    
    const merged = [];
    const addedNames = new Set();
    
    // 1. Process local personnel (from older personnel_data if any)
    localPersonnel.forEach(p => {
      const pName = p.adSoyad || p.name;
      const edits = editedData[pName] || {};
      if (edits.isDeleted) return;
      
      const personProvince = edits.province || p.province || EXCEL_PROVINCE;
      if (selectedCity && personProvince.toLowerCase() !== selectedCity.toLowerCase()) return;
      
      const personUnit = edits.unit || p.birim || p.unit || '';
      if (selectedUnit && personUnit !== selectedUnit) return;
      
      merged.push({
        ...p,
        adSoyad: pName,
        birim: personUnit,
        unvan: edits.title || p.unvan || p.title,
        sicil: edits.contact || p.sicil
      });
      addedNames.add(pName);
    });

    // 2. Process excel personnel (only if they belong to selectedCity)
    if (!selectedCity || selectedCity.toLowerCase() === EXCEL_PROVINCE.toLowerCase()) {
      excelPersonnel.forEach(ep => {
        const pName = ep.adSoyad || ep.name;
        if (addedNames.has(pName)) return;
        
        const edits = editedData[pName] || {};
        if (edits.isDeleted) return;
        
        const personProvince = edits.province || EXCEL_PROVINCE;
        if (selectedCity && personProvince.toLowerCase() !== selectedCity.toLowerCase()) return;
        
        const personUnit = edits.unit || ep.birim || ep.unit || '';
        if (selectedUnit && personUnit !== selectedUnit) return;
        
        merged.push({
          ...ep,
          adSoyad: pName,
          birim: personUnit,
          unvan: edits.title || ep.unvan || ep.title,
          sicil: edits.contact || ep.sicil
        });
        addedNames.add(pName);
      });
    }

    // 3. Process new personnel from editedData
    Object.keys(editedData).forEach(pName => {
      if (addedNames.has(pName)) return;
      
      const edits = editedData[pName];
      if (edits.isDeleted) return;
      
      const personProvince = edits.province || EXCEL_PROVINCE;
      if (selectedCity && personProvince.toLowerCase() !== selectedCity.toLowerCase()) return;
      
      const personUnit = edits.unit || '';
      if (selectedUnit && personUnit !== selectedUnit) return;
      
      merged.push({
        adSoyad: pName,
        birim: personUnit,
        unvan: edits.title || '',
        sicil: edits.contact || ''
      });
      addedNames.add(pName);
    });

    const savedRoles = JSON.parse(localStorage.getItem('assignedRolesData') || '{}');
    
    merged.sort((a, b) => {
      const roleA = savedRoles[a.adSoyad] || savedRoles[a.sicil] || 'Personel';
      const roleB = savedRoles[b.adSoyad] || savedRoles[b.sicil] || 'Personel';
      
      const indexA = ROLES.indexOf(roleA) !== -1 ? ROLES.indexOf(roleA) : 99;
      const indexB = ROLES.indexOf(roleB) !== -1 ? ROLES.indexOf(roleB) : 99;
      
      if (indexA !== indexB) {
        return indexA - indexB;
      }
      
      const getRank = (p) => {
        const title = (p.unvan || p.title || '').toLocaleUpperCase('tr-TR');
        if (title === 'İL MÜDÜRÜ') return 1;
        if (title === 'İL MÜDÜRÜ V.' || title === 'İL MÜDÜR V.') return 2;
        if (title === 'İL MÜDÜR YARDIMCISI') return 3;
        if (title === 'İL MÜDÜR YARDIMCISI V.' || title === 'İL MÜDÜR YARD. V.') return 4;
        if (title.includes('ŞUBE MÜDÜRÜ') || title.includes('İLÇE MÜDÜRÜ') || title.includes('BİRİM MÜDÜRÜ') || title.includes(' MÜDÜRÜ')) {
          if (title.includes(' V.')) return 6;
          return 5;
        }
        if (title.includes('ŞUBE MÜDÜR V.') || title.includes('İLÇE MÜDÜR V.')) return 6;
        if (title.includes('BİRİM SORUMLUSU')) return 7;
  
        if (title.includes('AVUKAT')) return 8;
        if (title.includes('SAYMAN')) return 9;
        if (title.includes('MÜHENDİS')) return 10;
        if (title.includes('VETERİNER')) return 11;
        if (title.includes('BİYOLOG')) return 12;
        if (title.includes('SU ÜRÜNLERİ')) return 13;
        if (title.includes('TEKNİKER') && !title.includes('TEKNİSYEN')) return 14;
        if (title.includes('TEKNİSYEN')) return 15;
        return 99;
      };

      const rankA = getRank(a);
      const rankB = getRank(b);
      
      if (rankA !== rankB) return rankA - rankB;
      
      if (a.sicil && b.sicil) {
        const sA = parseInt(a.sicil, 10);
        const sB = parseInt(b.sicil, 10);
        if (!isNaN(sA) && !isNaN(sB)) return sA - sB;
        return String(a.sicil).localeCompare(String(b.sicil));
      }
      
      return (a.adSoyad || '').localeCompare(b.adSoyad || '', 'tr-TR');
    });

    setPersonnelList(merged);
    setUserRoles(savedRoles);
  }, [selectedCity, selectedUnit]);

  const handleRoleChange = (personnelId, role) => {
    setUserRoles(prev => ({ ...prev, [personnelId]: role }));
  };

  const saveRoles = async () => {
    localStorage.setItem('user_roles', JSON.stringify(userRoles));
    localStorage.setItem('assignedRolesData', JSON.stringify(userRoles));
    uploadLocalToSupabase();
    toast.success('Değişiklikler kaydedildi.');
  };

  const canEdit = ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü', 'Birim Sorumlusu'].includes(currentRole);
  
  const allowedRolesForUser = ['Genel Koordinatör', 'Yetkili Yönetici'].includes(currentRole) ? ROLES : ['Personel', 'Birim Sorumlusu'];

  const activeUnitName = selectedUnitType === 'İlçe' ? (selectedDistrict ? `${selectedDistrict} İlçe` : '') : (selectedUnitType === 'Şube' ? (selectedUnit || '') : '');

  const filteredPersonnel = personnelList.filter(p => {
    if (searchTerm && !p.adSoyad?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (activeUnitName) {
      const pUnit = (p.birim || p.unit || '').toLowerCase();
      const sUnit = activeUnitName.toLowerCase();
      
      // Some simple logic to match "Balıkçılık ve Su Ürünleri Şube Müdürlüğü" with Excel data which might just be the same or similar
      if (!pUnit.includes(sUnit) && !sUnit.includes(pUnit.replace(' ilçe', '').replace(' şube müdürlüğü', ''))) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const getUnitGroupIndex = (p) => {
      const u = (p.unvan || '').toLowerCase();
      const brm = (p.birim || '').toLowerCase();
      if (u.includes('il müdürü') || u.includes('müdür yardımcısı') || brm === 'müdürler') return 0;
      if (brm.includes('hukuk')) return 1;
      if (brm.includes('şube')) return 2;
      if (brm.includes('ilçe')) return 3;
      return 4;
    };
    
    const groupA = getUnitGroupIndex(a);
    const groupB = getUnitGroupIndex(b);
    
    if (groupA !== groupB) return groupA - groupB;
    
    if (groupA === 2 || groupA === 3) {
       const brmA = (a.birim || '');
       const brmB = (b.birim || '');
       if (brmA !== brmB) return brmA.localeCompare(brmB);
    }
    
    const getRank = (p) => {
      const title = (p.unvan || p.title || '').toLocaleUpperCase('tr-TR');
      if (title === 'İL MÜDÜRÜ') return 1;
      if (title === 'İL MÜDÜRÜ V.' || title === 'İL MÜDÜR V.') return 2;
      if (title === 'İL MÜDÜR YARDIMCISI') return 3;
      if (title === 'İL MÜDÜR YARDIMCISI V.' || title === 'İL MÜDÜR YARD. V.') return 4;
      if (title.includes('ŞUBE MÜDÜRÜ') || title.includes('İLÇE MÜDÜRÜ') || title.includes('BİRİM MÜDÜRÜ') || title.includes(' MÜDÜRÜ')) {
        if (title.includes(' V.')) return 6;
        return 5;
      }
      if (title.includes('ŞUBE MÜDÜR V.') || title.includes('İLÇE MÜDÜR V.')) return 6;
      if (title.includes('BİRİM SORUMLUSU')) return 7;

      if (title.includes('AVUKAT')) return 8;
      if (title.includes('SAYMAN')) return 9;
      if (title.includes('MÜHENDİS')) return 10;
      if (title.includes('VETERİNER')) return 11;
      if (title.includes('BİYOLOG')) return 12;
      if (title.includes('SU ÜRÜNLERİ')) return 13; // Catch some specific cases
      if (title.includes('TEKNİKER') && !title.includes('TEKNİSYEN')) return 14;
      if (title.includes('TEKNİSYEN')) return 15;
      return 99;
    };
    
    const rankA = getRank(a);
    const rankB = getRank(b);
    if (rankA !== rankB) return rankA - rankB;
    
    if (a.sicil && b.sicil) {
       const sA = parseInt(a.sicil, 10);
       const sB = parseInt(b.sicil, 10);
       if (!isNaN(sA) && !isNaN(sB)) return sA - sB;
       return String(a.sicil).localeCompare(String(b.sicil));
    }
    if (a.sicil) return -1;
    if (b.sicil) return 1;
    
    return (a.adSoyad || '').localeCompare(b.adSoyad || '', 'tr');
  });

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Sistem Yetki Yönetimi</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Biriminizdeki personellerin sistem üzerindeki (Yönetici, Personel) rollerini buradan tanımlayabilirsiniz.</p>
          </div>
          {canEdit && (
            <button onClick={saveRoles} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <Save size={18} /> Değişiklikleri Kaydet
            </button>
          )}
        </div>
        
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
           <input 
              type="text" 
              placeholder="Personel Adı ile Ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', width: '300px', outline: 'none' }}
            />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, width: '40%' }}>PERSONEL ADI SOYADI</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, width: '30%' }}>BİRİMİ / ÜNVANI</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, width: '30%' }}>SİSTEM ROLÜ / YETKİSİ</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonnel.map((p, i) => {
              const pId = p.sicil || p.adSoyad;
              
              // Yetki kısıtlama mantığı: Birim Sorumlusu, müdürleri veya üst yöneticileri düzenleyemez
              const title = (p.unvan || p.title || '').toLocaleUpperCase('tr-TR');
              const isIlDisi = p.adSoyad === 'Alpaslan YAVUZCAN' || p.adSoyad?.toLowerCase().includes('alpaslan yavuzcan');
              const targetRole = isIlDisi ? '' : userRoles[pId];
              
              const isHigherRank = isIlDisi || (!['Genel Koordinatör', 'Yetkili Yönetici'].includes(currentRole) && (
                title.includes('MÜDÜR') || 
                title.includes('KAYMAKAM') || 
                title.includes('VALİ') ||
                ['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı', 'Şube Müdürü', 'İlçe Müdürü'].includes(targetRole)
              ));
              
              return (
                <tr key={pId || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500, color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCog size={18} />
                      </div>
                      <span style={{ color: '#3b82f6', textDecoration: isIlDisi ? 'line-through' : 'none' }}>{p.adSoyad}</span>
                      {isIlDisi && <span style={{ fontSize: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>İl Dışı</span>}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{isIlDisi ? 'İl Dışı' : (p.birim || '-')}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.unvan || '-'}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {canEdit ? (
                      <select 
                        value={targetRole || ''}
                        onChange={(e) => handleRoleChange(pId, e.target.value)}
                        disabled={isHigherRank}
                        title={isIlDisi ? "Bu personel il dışına gittiği için yetki verilemez" : (isHigherRank ? "Bu personelin yetkisini değiştirmeye yetkiniz yok" : "")}
                        style={{ 
                          padding: '8px 32px 8px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid #cbd5e1', 
                          fontSize: '13px', 
                          color: isHigherRank ? '#94a3b8' : '#1e293b', 
                          outline: 'none', 
                          cursor: isHigherRank ? 'not-allowed' : 'pointer', 
                          background: isHigherRank ? '#f1f5f9' : 'white', 
                          width: '100%', 
                          maxWidth: '200px', 
                          appearance: 'none', 
                          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', 
                          backgroundRepeat: 'no-repeat', 
                          backgroundPosition: 'right 12px center', 
                          backgroundSize: '10px auto' 
                        }}
                      >
                        <option value="">-- Seçiniz --</option>
                        {allowedRolesForUser.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ fontSize: '13px', color: userRoles[pId] ? '#1e293b' : '#94a3b8', fontWeight: 500 }}>
                        {userRoles[pId] || 'Yetki Tanımlanmamış'}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredPersonnel.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Personel bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleAssignments;
