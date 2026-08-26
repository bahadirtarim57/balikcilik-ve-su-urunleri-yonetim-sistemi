import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const CezaFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    kategori: 'Genel',
    ihlal_nedeni: '',
    kanun_maddesi: '',
    yonetmelik: '',
    teblig: '',
    madde_36_bendi: '',
    para_cezasi_tl: '',
    el_koyma_urun: 'Hayır',
    el_koyma_vasita: 'Hayır',
    // We simplify the nested objects for the form, preserving them if they exist
    _original_ceza_oranlari: null,
    _original_ruhsat_geri_alma: null
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        kategori: initialData.kategori || 'Genel',
        ihlal_nedeni: initialData.ihlal_nedeni || '',
        kanun_maddesi: initialData.kanun_maddesi || '',
        yonetmelik: initialData.yonetmelik || '',
        teblig: initialData.teblig || '',
        madde_36_bendi: initialData.madde_36_bendi || '',
        para_cezasi_tl: initialData.para_cezasi_tl || '',
        el_koyma_urun: initialData.el_koyma_urun || 'Hayır',
        el_koyma_vasita: initialData.el_koyma_vasita || 'Hayır',
        _original_ceza_oranlari: initialData.ceza_oranlari || null,
        _original_ruhsat_geri_alma: initialData.ruhsat_geri_alma || null
      });
    } else {
      setFormData({
        kategori: 'Genel',
        ihlal_nedeni: '',
        kanun_maddesi: '',
        yonetmelik: '',
        teblig: '',
        madde_36_bendi: '',
        para_cezasi_tl: '',
        el_koyma_urun: 'Hayır',
        el_koyma_vasita: 'Hayır',
        _original_ceza_oranlari: null,
        _original_ruhsat_geri_alma: null
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      id: initialData?.id || `ceza-new-${Date.now()}`,
      ceza_oranlari: formData._original_ceza_oranlari || { girgir: "-", boy_12_alti: "-", boy_12_22: "-", boy_22_ustu: "-" },
      ruhsat_geri_alma: formData._original_ruhsat_geri_alma || { kez_1: "-", kez_2: "-", kez_3: "-" }
    };
    
    // Remove the temporary fields
    delete submitData._original_ceza_oranlari;
    delete submitData._original_ruhsat_geri_alma;

    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="modal-content glass-panel" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
            {initialData ? 'Cezayı Düzenle' : 'Yeni Ceza Ekle'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f9fafb' }} className="custom-scrollbar">
          <form id="ceza-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={labelStyle}>Kategori</label>
              <input required type="text" name="kategori" value={formData.kategori} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>İhlal Nedeni</label>
              <textarea required name="ihlal_nedeni" value={formData.ihlal_nedeni} onChange={handleChange} style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Kanun</label>
                <input type="text" name="kanun_maddesi" value={formData.kanun_maddesi} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Yönetmelik</label>
                <input type="text" name="yonetmelik" value={formData.yonetmelik} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tebliğ</label>
                <input type="text" name="teblig" value={formData.teblig} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>36. Bendi</label>
                <input type="text" name="madde_36_bendi" value={formData.madde_36_bendi} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Para Cezası Tutarı (TL)</label>
              <input required type="text" name="para_cezasi_tl" value={formData.para_cezasi_tl} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Su Ürünlerine El Koyma</label>
                <select name="el_koyma_urun" value={formData.el_koyma_urun} onChange={handleChange} style={inputStyle}>
                  <option value="Hayır">Hayır</option>
                  <option value="Evet">Evet</option>
                  <option value="Evet (Kum, Çakıl vb.)">Evet (Kum, Çakıl vb.)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Vasıtaya El Koyma</label>
                <input type="text" name="el_koyma_vasita" value={formData.el_koyma_vasita} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff7ed', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fdba74' }}>
              <input 
                type="checkbox" 
                id="tekerrur" 
                name="tekerrur_ikikat" 
                checked={formData.tekerrur_ikikat || false} 
                onChange={(e) => setFormData(prev => ({ ...prev, tekerrur_ikikat: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: '#ea580c' }}
              />
              <label htmlFor="tekerrur" style={{ fontSize: '13px', fontWeight: 600, color: '#9a3412', cursor: 'pointer' }}>
                İhlalin 2 yıl içinde tekrarı halinde iki katı uygulanır (Tekerrür)
              </label>
            </div>
            
          </form>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'white' }}>
          <button type="button" onClick={onClose} className="btn" style={{ background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' }}>
            İptal
          </button>
          <button type="submit" form="ceza-form" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={16} /> {initialData ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>

      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' };

export default CezaFormModal;
