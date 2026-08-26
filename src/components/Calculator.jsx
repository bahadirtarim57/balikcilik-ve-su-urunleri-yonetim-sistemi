import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator as CalcIcon, AlertCircle, Info, ShieldAlert, Anchor, CheckCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Calculator = ({ data }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFineId, setSelectedFineId] = useState('');
  const [boatSize, setBoatSize] = useState('none');
  const [isGirgir, setIsGirgir] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);

  // Flatten all categories into a single array for searching
  const allFines = useMemo(() => {
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const selectedFine = useMemo(() => {
    return allFines.find(f => f.id === selectedFineId) || null;
  }, [allFines, selectedFineId]);

  // Reset modifiers when fine changes
  useEffect(() => {
    setBoatSize('none');
    setIsGirgir(false);
    setIsRepeated(false);
  }, [selectedFineId]);

  const filteredFines = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length < 3) return [];
    const searchWords = searchTerm.toLocaleLowerCase('tr-TR').split(' ').filter(Boolean);
    
    return allFines.filter(item => {
      const kanun = String(item.kanun_maddesi || '').toLocaleLowerCase('tr-TR').replace(/[\s\-\/]+/g, '');
      const ihlal = String(item.ihlal_nedeni || '').toLocaleLowerCase('tr-TR');
      const yonetmelik = String(item.yonetmelik || '').toLocaleLowerCase('tr-TR');
      const teblig = String(item.teblig || '').toLocaleLowerCase('tr-TR');
      const madde36 = String(item.madde_36_bendi || '').toLocaleLowerCase('tr-TR');

      return searchWords.every(word => {
        const wordInKanun = kanun.includes(word);
        const wordInIhlal = ihlal.includes(word);
        const wordInYonetmelik = yonetmelik.includes(word);
        const wordInTeblig = teblig.includes(word);
        const wordInMadde36 = madde36.includes(word);

        if (word.length === 1 && word.match(/[a-zçğıöşü]/)) {
          // Tek harfli aramaları (örn: a, b bendi) sadece kanun maddesi ve 36. maddede ara
          // Aksi takdirde ihlal nedenindeki her 'a' harfi eşleşmeye sebep olur
          return wordInKanun || wordInMadde36;
        }

        return wordInIhlal || wordInKanun || wordInMadde36 || wordInYonetmelik || wordInTeblig;
      });
    }).slice(0, 15); // Limit to top 15 results
  }, [searchTerm, allFines]);

  // Try to parse base amount
  const extractBaseAmount = (text) => {
    if (!text) return 0;
    // Extract first number (with dots for thousands)
    const match = text.match(/(\d{1,3}(?:\.\d{3})+|\d+)/);
    if (match) {
      return parseInt(match[0].replace(/\./g, ''), 10);
    }
    return 0;
  };

  const calculateFinalAmount = () => {
    if (!selectedFine) return 0;
    
    let base = extractBaseAmount(selectedFine.para_cezasi_tl);
    if (base === 0) return 0; // Couldn't parse

    let multiplier = 1;

    // Check if the text implies variable pricing based on boat
    const hasBoatRules = selectedFine.para_cezasi_tl.toLowerCase().includes('boy');
    const hasGirgirRules = selectedFine.para_cezasi_tl.toLowerCase().includes('gırgır');

    if (hasBoatRules || hasGirgirRules || selectedFine.kanun_maddesi?.includes('23-b')) {
      if (isGirgir) multiplier = 3;
      else if (boatSize === '12-22') multiplier = 2; // 12-22m
      else if (boatSize === 'large') multiplier = 3; // >22m
    }

    let finalAmount = base * multiplier;

    if (isRepeated) {
      finalAmount = finalAmount * 2;
    }

    return finalAmount;
  };

  const handleSelect = (fine) => {
    setSelectedFineId(fine.id);
    setSearchTerm('');
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="calculator-module" style={{ display: 'flex', gap: '24px', height: '100%', alignItems: 'flex-start' }}>
      
      {/* LEFT PANEL: Search */}
      <div className="glass-panel" style={{ width: '380px', flexShrink: 0, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '12px', color: '#4f46e5' }}>
            <CalcIcon size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>İhlal Karşılığı İPC Hazırlama</h2>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>İhlal nedenini arayın</p>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Anahtar kelime girin..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px 12px 38px', borderRadius: '12px',
              border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', transition: 'border 0.2s',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }} className="custom-scrollbar">
          <AnimatePresence>
            {searchTerm.length > 0 && filteredFines.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                Sonuç bulunamadı.
              </motion.div>
            )}
            
            {filteredFines.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '12px 16px', background: 'white', borderRadius: '10px',
                  border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', lineHeight: 1.4 }}>
                  {item.ihlal_nedeni}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                    Kanun: {item.kanun_maddesi || '-'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Seç</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT PANEL: Calculator Dashboard */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }} className="custom-scrollbar">
        {!selectedFine ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
            <Anchor size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px' }}>Hesaplama yapmak için sol taraftan bir ihlal seçin.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            key={selectedFine.id}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Header Card */}
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                    <Info size={14} /> Kanun: {selectedFine.kanun_maddesi} | Bendi: {selectedFine.madde_36_bendi}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, lineHeight: 1.4, margin: 0, opacity: 0.9 }}>
                    {selectedFine.ihlal_nedeni}
                  </h3>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                  {selectedFine.ortam}
                </div>
              </div>
            </div>

            {/* Main Interactive Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
              
              {/* Modifiers / Inputs */}
              <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#4f46e5" /> İhlal Parametreleri
                </h4>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '10px' }}>
                    Tekne Tipi ve Boyu
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={() => { setBoatSize('none'); setIsGirgir(false); }} className={`modifier-btn ${boatSize === 'none' && !isGirgir ? 'active' : ''}`}>Standart / <br/>&lt; 12m (Taban)</button>
                    <button onClick={() => { setBoatSize('none'); setIsGirgir(true); }} className={`modifier-btn ${isGirgir ? 'active' : ''}`}>Gırgır <br/>(x3 Katı)</button>
                    <button onClick={() => { setBoatSize('12-22'); setIsGirgir(false); }} className={`modifier-btn ${boatSize === '12-22' && !isGirgir ? 'active' : ''}`}>12 - 22m <br/>(x2 Katı)</button>
                    <button onClick={() => { setBoatSize('large'); setIsGirgir(false); }} className={`modifier-btn ${boatSize === 'large' && !isGirgir ? 'active' : ''}`}>&gt; 22m <br/>(x3 Katı)</button>
                  </div>
                </div>

                {selectedFine.tekerrur_ikikat && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '10px' }}>
                      Tekerrür Durumu (2 Yıl İçinde)
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setIsRepeated(false)} className={`modifier-btn ${!isRepeated ? 'active' : ''}`} style={{ flex: 1 }}>İlk Kez İhlal</button>
                      <button onClick={() => setIsRepeated(true)} className={`modifier-btn ${isRepeated ? 'active-red' : ''}`} style={{ flex: 1 }}>Tekerrür (x2 Katı)</button>
                    </div>
                  </div>
                )}

              </div>

              {/* Total Amount Panel */}
              <div className="glass-panel" style={{ borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: '#f8fafc', border: '2px solid #e2e8f0' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  UYGULANACAK İDARİ PARA CEZASI
                </p>
                <div style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
                  {calculateFinalAmount() > 0 ? formatMoney(calculateFinalAmount()) : selectedFine.para_cezasi_tl}
                </div>
                {calculateFinalAmount() > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
                     <div style={{ fontSize: '13px', color: '#10b981', background: '#d1fae5', padding: '6px 16px', borderRadius: '20px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} /> Otomatik Hesaplandı
                     </div>
                     <button 
                      onClick={() => {
                        navigate('/form', { 
                          state: { 
                            fine: selectedFine, 
                            calculatedAmount: calculateFinalAmount(), 
                            hasElKoyma: (selectedFine.el_koyma_urun !== 'Hayır' || selectedFine.el_koyma_vasita !== 'Hayır') 
                          } 
                        });
                      }}
                      style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)', transition: 'transform 0.1s' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                     >
                        <FileText size={18} /> Resmi Formları Doldur ve Yazdır
                     </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sanctions Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', borderLeft: '4px solid #ef4444' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>El Koyma Durumu</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Su Ürünlerine:</span>
                    <span style={{ fontWeight: 600, color: selectedFine.el_koyma_urun !== 'Hayır' ? '#dc2626' : '#10b981' }}>{selectedFine.el_koyma_urun}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>İstihsal Vasıtasına:</span>
                    <span style={{ fontWeight: 600, color: selectedFine.el_koyma_vasita !== 'Hayır' ? '#dc2626' : '#10b981' }}>{selectedFine.el_koyma_vasita}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', borderLeft: '4px solid #f59e0b' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Ruhsat İptali & Diğer Notlar</h4>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
                  {selectedFine.para_cezasi_2_kez && selectedFine.para_cezasi_2_kez !== '-' && selectedFine.para_cezasi_2_kez !== 'nan' ? (
                    <span style={{ display: 'block', marginBottom: '8px' }}><strong>Tekerrür Notu:</strong> {selectedFine.para_cezasi_2_kez}</span>
                  ) : null}
                  <span style={{ display: 'block', padding: '8px', background: '#fef3c7', borderRadius: '8px', color: '#92400e', fontSize: '13px' }}>
                    36. maddede sayılan kabahatlerin tekrarı halinde, idari para cezaları iki katı olarak uygulanır. (*) Özel durumlar için vasıta el koyma detaylarını kontrol ediniz.
                  </span>
                </p>
              </div>
            </div>

          </motion.div>
        )}
      </div>
      
      <style>{`
        .modifier-btn {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .modifier-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        .modifier-btn.active {
          background: #e0e7ff;
          border-color: #4f46e5;
          color: #4f46e5;
          font-weight: 600;
          box-shadow: 0 0 0 1px #4f46e5;
        }
        .modifier-btn.active-red {
          background: #fee2e2;
          border-color: #ef4444;
          color: #b91c1c;
          font-weight: 600;
          box-shadow: 0 0 0 1px #ef4444;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Calculator;
