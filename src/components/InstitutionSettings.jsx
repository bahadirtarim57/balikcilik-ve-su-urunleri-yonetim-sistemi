import { useState, useEffect } from 'react'
import { Building2, Save, Plus, Trash2, Edit2, X, Power, PowerOff } from 'lucide-react'
import { SUBELER, PERSONELLER } from '../utils/excelData'
import { uploadLocalToSupabase } from '../lib/storage'

export default function InstitutionSettings() {
  const [ministryName, setMinistryName] = useState('TARIM VE ORMAN BAKANLIĞI');
  const [branches, setBranches] = useState([]);
  const [disabledBranches, setDisabledBranches] = useState([]);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  
  const [newBranchText, setNewBranchText] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Bakanlık ismini yükle
    const storedMinistry = localStorage.getItem('systemMinistryName');
    if (storedMinistry) setMinistryName(storedMinistry);

    // Whatsapp ayarını yükle
    const storedWa = localStorage.getItem('systemWhatsappEnabled');
    if (storedWa !== null) {
      setWhatsappEnabled(storedWa === 'true');
    } else {
      setWhatsappEnabled(false);
    }

    // Şubeleri yükle
    const storedBranches = localStorage.getItem('systemBranches');
    if (storedBranches) {
      try {
        setBranches(JSON.parse(storedBranches));
      } catch (e) {
        setBranches(SUBELER);
      }
    } else {
      setBranches(SUBELER);
    }

    // Devre dışı şubeleri yükle
    const storedDisabled = localStorage.getItem('disabledBranches');
    if (storedDisabled) {
      try {
        setDisabledBranches(JSON.parse(storedDisabled));
      } catch (e) {}
    }
  }, []);

  const saveMinistryName = () => {
    if (!ministryName.trim()) return;
    localStorage.setItem('systemMinistryName', ministryName.trim());
    uploadLocalToSupabase();
    showSavedBanner();
  };

  const handleWaToggle = () => {
    const newVal = !whatsappEnabled;
    setWhatsappEnabled(newVal);
    localStorage.setItem('systemWhatsappEnabled', newVal.toString());
    uploadLocalToSupabase();
    showSavedBanner();
  };

  const saveBranchesToStorage = (newBranches) => {
    setBranches(newBranches);
    localStorage.setItem('systemBranches', JSON.stringify(newBranches));
    uploadLocalToSupabase();
  };

  const toggleBranchStatus = (branchName) => {
    let newDisabled;
    if (disabledBranches.includes(branchName)) {
      newDisabled = disabledBranches.filter(b => b !== branchName);
    } else {
      newDisabled = [...disabledBranches, branchName];
    }
    setDisabledBranches(newDisabled);
    localStorage.setItem('disabledBranches', JSON.stringify(newDisabled));
    uploadLocalToSupabase();
    showSavedBanner();
  };

  const handleAddBranch = () => {
    if (!newBranchText.trim()) return;
    const newBranches = [...branches, newBranchText.trim()];
    saveBranchesToStorage(newBranches);
    setNewBranchText('');
  };

  const handleDeleteBranch = (index) => {
    if (!window.confirm('Bu şubeyi silmek istediğinize emin misiniz?')) return;
    const newBranches = branches.filter((_, i) => i !== index);
    saveBranchesToStorage(newBranches);
  };

  const startEdit = (index, text) => {
    setEditingIndex(index);
    setEditText(text);
  };

  const saveEdit = () => {
    if (!editText.trim() || editingIndex === null) return;
    
    const oldBranchName = branches[editingIndex];
    const newBranchName = editText.trim();

    if (oldBranchName !== newBranchName) {
      const hDataStr = localStorage.getItem('personnelHistoryData');
      let hData = {};
      if (hDataStr) {
        try { hData = JSON.parse(hDataStr); } catch(e) {}
      }
      let changed = false;

      // 1. Mevcut transfer geçmişindeki açık (ayrilis tarihi olmayan) kayıtları kapatıp yeni kayıt aç
      Object.keys(hData).forEach(personName => {
        const history = hData[personName];
        if (history && history.length > 0) {
          const lastRecord = history[history.length - 1];
          if (lastRecord.unit === oldBranchName && !lastRecord.ayrilis) {
            // Eski kaydı dün itibariyle kapat
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            lastRecord.ayrilis = yesterday.toISOString().split('T')[0];
            
            // Yeni ismiyle yeni kayıt aç
            const today = new Date().toISOString().split('T')[0];
            history.push({ unit: newBranchName, baslangic: today, ayrilis: '' });
            changed = true;
          }
        }
      });

      // 2. Hiç transfer geçmişi olmayan, sabit listedeki personelleri yeni birime taşı (geçmiş oluşturarak)
      PERSONELLER.forEach(p => {
        if (p.unit === oldBranchName) {
          if (!hData[p.name] || hData[p.name].length === 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const today = new Date().toISOString().split('T')[0];
            
            hData[p.name] = [
              { unit: oldBranchName, baslangic: '', ayrilis: yesterday.toISOString().split('T')[0] },
              { unit: newBranchName, baslangic: today, ayrilis: '' }
            ];
            changed = true;
          }
        }
      });

      if (changed) {
        localStorage.setItem('personnelHistoryData', JSON.stringify(hData));
      }
    }

    const newBranches = [...branches];
    newBranches[editingIndex] = newBranchName;
    saveBranchesToStorage(newBranches);
    setEditingIndex(null);
    setEditText('');
  };

  const showSavedBanner = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="module-container">
      <div className="module-header glass-panel" style={{ marginBottom: '20px' }}>
        <div className="header-left">
          <h2><Building2 size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Kurum Ayarları</h2>
          <p>Bakanlık ismi ve sistemde kullanılan şube (birim) isimlerini buradan güncelleyebilirsiniz.</p>
        </div>
      </div>

      {saved && (
        <div className="success-banner mt-4" style={{ marginBottom: '20px' }}>
          ✅ Ayarlar başarıyla kaydedildi! Sayfayı yenilediğinizde yeni isimler aktif olacaktır.
        </div>
      )}



      {/* WhatsApp Bildirimleri Ayarı */}
      <div className="module-content glass-panel" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
          WhatsApp Bildirim Butonları
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>Görev Listesinde WhatsApp Butonunu Göster</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Kapalı olduğunda sistemdeki hiçbir personel WhatsApp ile bildirim gönderemez.</span>
          </div>
          <button 
            className={`primary-btn ${whatsappEnabled ? 'danger' : 'success'}`} 
            onClick={handleWaToggle}
            style={{ width: '120px', justifyContent: 'center', background: whatsappEnabled ? '#ef4444' : '#10b981', borderColor: 'transparent' }}
          >
            {whatsappEnabled ? 'Kapat' : 'Aktif Et'}
          </button>
        </div>
      </div>

      {/* Bakanlık İsmi Ayarı */}
      <div className="module-content glass-panel" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
          Bakanlık / Üst Kurum Adı
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-control"
            value={ministryName}
            onChange={(e) => setMinistryName(e.target.value)}
            style={{ flex: 1, fontWeight: 'bold' }}
          />
          <button className="primary-btn" onClick={saveMinistryName}>
            <Save size={16} /> Kaydet
          </button>
        </div>
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#6b7280' }}>
          * Sol üst menüde yazan ana bakanlık veya kurum ismini buradan değiştirebilirsiniz. (Değişikliğin her yere yansıması için kaydettikten sonra sayfayı yenileyiniz - F5)
        </p>
      </div>

      {/* Şubeler Ayarı */}
      <div className="module-content glass-panel">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
          Şube İsimleri Listesi
        </h3>
        
        <p style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#4b5563' }}>
          Yeni görev eklerken veya personelleri birimlere ayırırken kullanılan şube listesidir. Bakanlık tarafından şube isimleri değiştirilirse buradan güncelleyebilirsiniz.
        </p>

        <div className="add-form" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Yeni eklenecek şube ismini yazın..."
            value={newBranchText}
            onChange={(e) => setNewBranchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBranch()}
            style={{ flex: 1 }}
          />
          <button className="primary-btn" onClick={handleAddBranch} disabled={!newBranchText.trim()}>
            <Plus size={16} /> Şube Ekle
          </button>
        </div>

        <div className="templates-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {branches.map((text, index) => (
            <div key={index} className="template-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              
              {editingIndex === index ? (
                <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editText} 
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button className="action-btn success" onClick={saveEdit} title="Kaydet"><Save size={16} /></button>
                  <button className="action-btn danger" onClick={() => setEditingIndex(null)} title="İptal"><X size={16} /></button>
                </div>
              ) : (
                <>
                  <div style={{ flex: 1, color: disabledBranches.includes(text) ? '#94a3b8' : '#334155', fontWeight: '500', textDecoration: disabledBranches.includes(text) ? 'line-through' : 'none' }}>
                    {text} {disabledBranches.includes(text) && <span style={{ fontSize: '11px', color: '#ef4444', marginLeft: '5px', fontWeight: 'bold' }}>(Pasif)</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginLeft: '15px' }}>
                    <button 
                      className={`action-btn ${disabledBranches.includes(text) ? 'success' : 'danger'}`} 
                      onClick={() => toggleBranchStatus(text)} 
                      title={disabledBranches.includes(text) ? "Aktif Et" : "Devre Dışı Bırak"}
                    >
                      {disabledBranches.includes(text) ? <Power size={16} /> : <PowerOff size={16} />}
                    </button>
                    <button className="action-btn edit" onClick={() => startEdit(index, text)} title="Düzenle">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn danger" onClick={() => handleDeleteBranch(index)} title="Sil">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </div>
  )
}
