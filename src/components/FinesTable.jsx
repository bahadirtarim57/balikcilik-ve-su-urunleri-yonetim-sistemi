import React, { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, Plus, Filter, Repeat } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import CezaFormModal from './CezaFormModal';

const FinesTable = ({ data, searchTerm, onSave, onDelete }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'Tümü');

  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  const categories = useMemo(() => {
    const cats = new Set();
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.ana_baslik) cats.add(item.ana_baslik);
      });
    }
    return ['Tümü', ...Array.from(cats)];
  }, [data]);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? data : [];
    
    if (selectedCategory !== 'Tümü') {
      list = list.filter(item => item.ana_baslik === selectedCategory);
    }

    if (searchTerm) {
      const searchWords = searchTerm.toLocaleLowerCase('tr-TR').split(' ').filter(Boolean);
      list = list.filter(item => {
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
            return wordInKanun || wordInMadde36;
          }

          return wordInIhlal || wordInKanun || wordInMadde36 || wordInYonetmelik || wordInTeblig;
        });
      });
    }
    return list;
  }, [data, searchTerm, selectedCategory]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Tüm İdari Para Cezaları <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px' }}>{filteredData.length} Kayıt</span>
        </h2>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280' }} />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: 'white', color: '#374151', fontSize: '14px', cursor: 'pointer' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={18} /> Yeni Kayıt Ekle
          </button>
        </div>
      </div>

      <div className="table-container" style={{ flex: 1, overflow: 'auto', padding: '0 24px 24px 24px' }}>
        <table className="fines-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr>
              <th>Kategori</th>
              <th>İhlal Nedeni</th>
              <th>Kanun/Yön.</th>
              <th>Para Cezası (TL)</th>
              <th>El Koyma (Ürün/Vasıta)</th>
              <th style={{ width: '100px', textAlign: 'center' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  Arama kriterlerinize uygun kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id || index}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>{item.ana_baslik || 'Genel'}</span>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{item.kategori}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: '#1f2937', maxWidth: '300px' }}>
                    {item.ihlal_nedeni}
                    {item.madde_36_bendi && item.madde_36_bendi !== '-' && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>36. Madde Bendi: {item.madde_36_bendi}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', display: 'flex', gap: '4px' }}>
                      <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>K: {item.kanun_maddesi}</span>
                      <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>Y: {item.yonetmelik}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>
                    {item.para_cezasi_tl} ₺
                    {item.tekerrur_ikikat && (
                      <div style={{ fontSize: '11px', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }} title="2 Yıl İçinde Tekrarı Halinde İki Katı Uygulanır">
                        <Repeat size={12} /> Tekerrürde 2x
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      <div style={{ color: item.el_koyma_urun !== 'Hayır' ? '#dc2626' : '#059669' }}>Ürün: {item.el_koyma_urun}</div>
                      <div style={{ color: item.el_koyma_vasita !== 'Hayır' && item.el_koyma_vasita !== 'Hayır -' ? '#dc2626' : '#059669', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={item.el_koyma_vasita}>Vasıta: {item.el_koyma_vasita}</div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(item)} className="btn-icon" title="Düzenle">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="btn-icon btn-icon-danger" title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CezaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          onSave(data);
          setIsModalOpen(false);
        }}
        initialData={editingItem}
      />
    </div>
  );
};

export default FinesTable;
