import React, { useState, useEffect } from 'react';
import { BookOpen, Search, AlertCircle, FileText, ChevronRight, Scale, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import initialLawData from '../data/law_articles.json';
import initialRegulationData from '../data/regulation_articles.json';
import initialTebligTicariData from '../data/teblig_ticari.json';
import initialTebligAmatorData from '../data/teblig_amator.json';

const LawArticles = ({ data }) => {
  const [activeTab, setActiveTab] = useState('kanun');
  
  // State for all data
  const [lawData, setLawData] = useState(initialLawData);
  const [regulationData, setRegulationData] = useState(initialRegulationData);
  const [tebligTicariData, setTebligTicariData] = useState(initialTebligTicariData);
  const [tebligAmatorData, setTebligAmatorData] = useState(initialTebligAmatorData);

  const [selectedKanun, setSelectedKanun] = useState(lawData[0] || null);
  const [selectedYonetmelik, setSelectedYonetmelik] = useState(regulationData[0] || null);
  const [selectedTebligTicari, setSelectedTebligTicari] = useState(tebligTicariData[0] || null);
  const [selectedTebligAmator, setSelectedTebligAmator] = useState(tebligAmatorData[0] || null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ madde: '', baslik: '', icerik: '' });

  let currentData, currentSetData, selectedMadde, setSelectedMadde, currentFileName;

  if (activeTab === 'kanun') {
    currentData = lawData; currentSetData = setLawData; 
    selectedMadde = selectedKanun; setSelectedMadde = setSelectedKanun;
    currentFileName = 'law_articles.json';
  } else if (activeTab === 'yonetmelik') {
    currentData = regulationData; currentSetData = setRegulationData; 
    selectedMadde = selectedYonetmelik; setSelectedMadde = setSelectedYonetmelik;
    currentFileName = 'regulation_articles.json';
  } else if (activeTab === 'teblig_ticari') {
    currentData = tebligTicariData; currentSetData = setTebligTicariData; 
    selectedMadde = selectedTebligTicari; setSelectedMadde = setSelectedTebligTicari;
    currentFileName = 'teblig_ticari.json';
  } else {
    currentData = tebligAmatorData; currentSetData = setTebligAmatorData; 
    selectedMadde = selectedTebligAmator; setSelectedMadde = setSelectedTebligAmator;
    currentFileName = 'teblig_amator.json';
  }

  // Save to API
  const saveToServer = async (fileName, dataToSave) => {
    try {
      const response = await fetch('/api/save-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, data: dataToSave })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return true;
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Kaydetme işlemi başarısız oldu! (Sunucu çalışmıyor olabilir)");
      return false;
    }
  };

  const handleDelete = async () => {
    if (!selectedMadde) return;
    if (window.confirm(`${selectedMadde.baslik} silinecek. Emin misiniz?`)) {
      const newData = currentData.filter(item => item.madde !== selectedMadde.madde);
      
      const success = await saveToServer(currentFileName, newData);
      if (success) {
        currentSetData(newData);
        setSelectedMadde(newData[0] || null);
      }
    }
  };

  const handleOpenModal = (mode) => {
    setModalMode(mode);
    if (mode === 'edit' && selectedMadde) {
      setFormData({ ...selectedMadde });
    } else {
      setFormData({ madde: '', baslik: '', icerik: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!formData.madde || !formData.baslik || !formData.icerik) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    let newData;
    if (modalMode === 'add') {
      // Check if exist
      if (currentData.some(i => i.madde === formData.madde)) {
        alert("Bu madde numarası zaten mevcut!");
        return;
      }
      newData = [...currentData, formData];
    } else {
      // Edit
      newData = currentData.map(item => item.madde === selectedMadde.madde ? formData : item);
    }

    const success = await saveToServer(currentFileName, newData);
    if (success) {
      currentSetData(newData);
      setSelectedMadde(formData);
      setIsModalOpen(false);
    }
  };

  const relatedPenalties = selectedMadde ? data.filter(c => {
    if (activeTab === 'kanun') return String(c.kanun_maddesi) === selectedMadde.madde;
    if (activeTab === 'yonetmelik') return String(c.yonetmelik) === selectedMadde.madde;
    return String(c.teblig) === selectedMadde.madde;
  }) : [];

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>
      <div style={{ width: '320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={20} color="#3b82f6" /> Mevzuat Rehberi
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
            {['kanun', 'yonetmelik', 'teblig_ticari', 'teblig_amator'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 0', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                  background: activeTab === tab ? '#3b82f6' : '#e2e8f0',
                  color: activeTab === tab ? '#ffffff' : '#64748b',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'kanun' ? 'Kanun (1380)' : tab === 'yonetmelik' ? 'Yönetmelik' : tab === 'teblig_ticari' ? 'Tebliğ 6/1' : 'Tebliğ 6/2'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 16px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{fontSize: '13px', fontWeight: 'bold', color: '#475569'}}>
            {activeTab === 'kanun' ? 'Kanun (1380)' : activeTab === 'yonetmelik' ? 'Yönetmelik' : activeTab === 'teblig_ticari' ? 'Tebliğ 6/1' : 'Tebliğ 6/2'} Maddeleri
          </span>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
          {currentData.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Kayıtlı madde bulunmuyor.</div>
          ) : currentData.map((law, index) => (
            <div 
              key={`${activeTab}-${law.madde}-${index}`}
              onClick={() => setSelectedMadde(law)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '8px',
                background: selectedMadde?.madde === law.madde ? '#eff6ff' : 'transparent',
                border: `1px solid ${selectedMadde?.madde === law.madde ? '#bfdbfe' : 'transparent'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ fontWeight: selectedMadde?.madde === law.madde ? 'bold' : '500', color: selectedMadde?.madde === law.madde ? '#1d4ed8' : '#334155' }}>
                  Madde {law.madde}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {law.baslik}
                </div>
              </div>
              <ChevronRight size={16} color={selectedMadde?.madde === law.madde ? '#3b82f6' : '#cbd5e1'} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '4px' }}>
        {selectedMadde ? (
          <>
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '32px', right: '32px', display: 'flex', gap: '8px' }}>
                <button onClick={() => handleOpenModal('add')} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
                  <Plus size={14} /> Yeni Ekle
                </button>
                <button onClick={() => handleOpenModal('edit')} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
                  <Edit2 size={14} /> Düzenle
                </button>
                <button onClick={handleDelete} style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
                  <Trash2 size={14} /> Sil
                </button>
              </div>

              <div style={{ display: 'inline-block', padding: '6px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
                Madde {selectedMadde.madde}
              </div>
              <h1 style={{ margin: '0 0 24px', fontSize: '24px', color: '#0f172a', paddingRight: '150px' }}>{selectedMadde.baslik}</h1>
              <div style={{ fontSize: '15px', color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {selectedMadde.icerik}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="#f59e0b" /> Sisteme Kayıtlı İlişkili İhlaller ve Cezalar
              </h2>
              
              {relatedPenalties.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {relatedPenalties.map(ceza => (
                    <div key={ceza.id} style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>{ceza.ihlal_nedeni}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#b45309', marginTop: '8px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                          <div><strong>Ceza Miktarı:</strong> {ceza.para_cezasi_tl ? `${ceza.para_cezasi_tl} ₺` : 'Değişken'}</div>
                          <div><strong>El Koyma:</strong> {ceza.el_koyma_urun === 'Evet' || ceza.el_koyma_vasita === 'Evet' ? 'Var' : 'Yok'}</div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px', border: '1px dashed #fcd34d' }}>
                           {ceza.kanun_maddesi && <><div><strong>İlgili Kanun:</strong> Madde {ceza.kanun_maddesi}</div> <span style={{color: '#d97706'}}>|</span></>}
                           {ceza.yonetmelik && <><div><strong>İlgili Yönetmelik:</strong> Madde {ceza.yonetmelik}</div> <span style={{color: '#d97706'}}>|</span></>}
                           {ceza.teblig && <><div><strong>İlgili Tebliğ:</strong> Madde {ceza.teblig}</div> <span style={{color: '#d97706'}}>|</span></>}
                           <div><strong>İlgili Bent:</strong> {ceza.madde_36_bendi || '-'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                  Sistemde bu maddeyle ilişkilendirilmiş herhangi bir ceza veya ihlal kaydı bulunamadı.
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
            Lütfen sol menüden bir madde seçin.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>
                {modalMode === 'add' ? 'Yeni Madde Ekle' : 'Madde Düzenle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155', fontSize: '14px' }}>Madde No</label>
                <input 
                  type="text" 
                  value={formData.madde}
                  onChange={(e) => setFormData({...formData, madde: e.target.value})}
                  disabled={modalMode === 'edit'}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: modalMode === 'edit' ? '#f1f5f9' : 'white' }}
                  placeholder="Örn: 24, Geçici 1, Ek 2"
                />
                {modalMode === 'edit' && <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>Madde numarası düzenlenemez. Silip yeniden ekleyebilirsiniz.</span>}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155', fontSize: '14px' }}>Başlık</label>
                <input 
                  type="text" 
                  value={formData.baslik}
                  onChange={(e) => setFormData({...formData, baslik: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  placeholder="Örn: MADDE 24 veya Geçici Madde 1"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155', fontSize: '14px' }}>İçerik</label>
                <textarea 
                  value={formData.icerik}
                  onChange={(e) => setFormData({...formData, icerik: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', minHeight: '200px', resize: 'vertical' }}
                  placeholder="Maddenin tam metni..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button 
                  onClick={handleSaveModal}
                  style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} /> Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawArticles;
