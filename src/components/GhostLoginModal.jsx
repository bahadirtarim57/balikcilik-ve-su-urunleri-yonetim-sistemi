import { sortPersonnelByHierarchy } from '../utils/hierarchy';
import React, { useState, useEffect } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PERSONELLER } from '../utils/excelData';

export default function GhostLoginModal({ isOpen, onClose }) {
  const { impersonate } = useAuth();
  const [ghostSearch, setGhostSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [ghostPersonnelList, setGhostPersonnelList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Load from excelData
      const localPersonnel = JSON.parse(localStorage.getItem('personnel_data') || '[]');
      const excelPersonnel = PERSONELLER || [];
      const merged = [...localPersonnel];
      excelPersonnel.forEach(ep => {
        const pName = ep.adSoyad || ep.name;
        const exists = merged.find(mp => (mp.sicil === ep.sicil && ep.sicil) || (mp.adSoyad || mp.name) === pName);
        if (!exists) {
          merged.push({
            ...ep,
            name: pName,
            unit: ep.birim || ep.unit,
            title: ep.unvan || ep.title,
            il: ep.il
          });
        }
      });
      setGhostPersonnelList(sortPersonnelByHierarchy(merged));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGhostLogin = (person) => {
    const activeUnit = person.unit || person.birim;
    const disabledBranches = JSON.parse(localStorage.getItem('disabledBranches')) || [];
    
    if (disabledBranches.includes(activeUnit)) {
      alert("Bu personelin birimi sistem yöneticisi tarafından geçici olarak devre dışı bırakılmıştır. Şu an bu hesaba giriş yapılamaz.");
      return;
    }

    const uRoles = { ...JSON.parse(localStorage.getItem('assignedRolesData') || '{}'), ...JSON.parse(localStorage.getItem('user_roles') || '{}') };

    const personKeySicil = person.sicil || person['SİCİL NO'];
    const personKeyName = person.name || person.adSoyad || person['ADI SOYADI'];
    const personKeyOriginal = person.originalName;

    let role = uRoles[personKeySicil] || uRoles[personKeyName] || uRoles[personKeyOriginal];
    if (!role) {
      const normalize = (s) => (s || '').toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, ' ');
      const sName = normalize(personKeyName);
      const sSicil = normalize(personKeySicil);
      const sOrig = normalize(personKeyOriginal);
      
      for (const [k, v] of Object.entries(uRoles)) {
        const nk = normalize(k);
        if ((sName && nk === sName) || (sSicil && nk === sSicil) || (sOrig && nk === sOrig)) {
          role = v;
          break;
        }
      }
    }
    
    if (!role || role === 'Tanımsız' || role === 'Tanmsz' || role === 'Tan\u0131ms\u0131z') {
      const modulePermissions = JSON.parse(localStorage.getItem('modulePermissionsData') || '{}');
      const perms = modulePermissions[personKeyName] || modulePermissions[personKeyOriginal] || {};
      const hasAnyTask = Object.values(perms).some(v => v === true);
      
      if (hasAnyTask) {
        role = 'Personel'; 
      }
    }

    if (!role || role === 'Tanımsız' || role === 'Tanmsz' || role === 'Tan\u0131ms\u0131z') {
      alert("Bu personelin henüz bir sistem yetkisi veya Personel Listesi'nde işaretlenmiş bir görevi bulunmamaktadır.");
      return;
    }
    
    
    if (window.confirm(`${person.name || person.adSoyad} adlı personelin hesabına giriş yapmak üzeresiniz. Onaylıyor musunuz?`)) {
      impersonate({ email: person.email || 'personel@demo.com', role, name: person.name || person.adSoyad, originalName: person.originalName, unit: activeUnit, il: person.il, sicil: person.sicil, impersonated: true });
      onClose();
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div className="modal-content glass-panel" style={{ width: '500px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', padding: '0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        <div style={{ padding: '20px', background: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px' }}>
            <Users size={24} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Kimliğine Bürün (Ghost Login)</h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>Aşağıdaki listeden yerine geçmek istediğiniz personeli seçin.</p>
          </div>
        </div>

        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Personel Ara..." 
            value={ghostSearch}
            onChange={(e) => setGhostSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: 'white', minWidth: '200px' }}
          >
            <option value="">Tüm Birimler / Şubeler</option>
            {[...new Set(ghostPersonnelList.map(p => p.unit || p.birim || 'Birim Yok').filter(Boolean))].sort().map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
          {ghostPersonnelList.filter(p => {
             const matchSearch = (p.name || p.adSoyad)?.toLowerCase().includes(ghostSearch.toLowerCase()) || (p.title || p.unvan)?.toLowerCase().includes(ghostSearch.toLowerCase());
             const matchUnit = selectedUnit === '' || (p.unit || p.birim || 'Birim Yok') === selectedUnit;
             return matchSearch && matchUnit;
          }).map((person, idx) => (
            <div key={person.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
              <div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{person.name || person.adSoyad}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{person.title || person.unvan || 'Personel'} &bull; {person.unit || person.birim || 'Birim Yok'}</div>
              </div>
              <button 
                onClick={() => handleGhostLogin(person)}
                style={{ background: '#38bdf8', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Giriş Yap <ChevronRight size={14} />
              </button>
            </div>
          ))}
          {ghostPersonnelList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              Yükleniyor veya hiç personel bulunamadı...
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: '500' }}
          >Vazgeç</button>
        </div>
      </div>
    </div>
  );
}
