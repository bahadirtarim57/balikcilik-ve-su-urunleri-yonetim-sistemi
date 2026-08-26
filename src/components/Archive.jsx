import React, { useState, useEffect } from 'react';
import { Search, Archive as ArchiveIcon, Trash2, Calendar, FileText, Edit, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Archive = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let data = JSON.parse(localStorage.getItem('ceza_arsivi') || '[]');
    let modified = false;
    
    data = data.map((item, index) => {
      if (!item.formData) item.formData = {};
      if (!item.formData.id) {
        item.formData.id = `arch-${Date.now()}-${index}`;
        modified = true;
      }
      return item;
    });

    if (modified) {
      localStorage.setItem('ceza_arsivi', JSON.stringify(data));
    }

    // Sort by newest first
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setArchiveData(data);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bu sicil kaydını silmek istediğinize emin misiniz?')) {
      const updated = archiveData.filter(item => item.formData.id !== id);
      setArchiveData(updated);
      localStorage.setItem('ceza_arsivi', JSON.stringify(updated));
    }
  };

  const handleEdit = (record) => {
    navigate('/form', {
      state: {
        fine: record.penaltyData.fine,
        calculatedAmount: record.penaltyData.calculatedAmount,
        hasElKoyma: record.penaltyData.hasElKoyma,
        existingFormData: record.formData
      }
    });
  };

  const filteredData = archiveData.filter(item => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const fd = item.formData;
    
    if (searchCategory === 'tc') return (fd.kimlikNo || '').toLowerCase().includes(search);
    if (searchCategory === 'isim') return (fd.adSoyadUnvan || '').toLowerCase().includes(search);
    if (searchCategory === 'plaka') return (fd.gemiAdi || '').toLowerCase().includes(search) || (fd.ruhsatKodNo || '').toLowerCase().includes(search);
    
    // Default 'all'
    return (
      (fd.kimlikNo || '').toLowerCase().includes(search) ||
      (fd.adSoyadUnvan || '').toLowerCase().includes(search) ||
      (fd.ruhsatKodNo || '').toLowerCase().includes(search) ||
      (fd.gemiAdi || '').toLowerCase().includes(search)
    );
  });

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatOffenseDate = (tarih, saat) => {
    if (!tarih) return '-';
    const parts = tarih.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]} ${saat || ''}`;
    }
    return tarih;
  };

  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Tarih;Saat;Kişi/Firma Tipi;TC Kimlik/Vergi No;Ad Soyad/Unvan;Gemi Adı;Ruhsat Kod No;İhlal Nedeni;Kanun Maddesi;Uygulanan Ceza (TL);El Koyma\n";
    
    filteredData.forEach(record => {
      const fd = record.formData || {};
      const pd = record.penaltyData?.fine || {};
      const row = [
        fd.tarih || "",
        fd.saat || "",
        fd.kisiTipi || "",
        fd.kimlikNo || "",
        `"${(fd.adSoyadUnvan || "").replace(/"/g, '""')}"`,
        `"${(fd.gemiAdi || "").replace(/"/g, '""')}"`,
        fd.ruhsatKodNo || "",
        `"${(pd.ihlal_nedeni || "").replace(/"/g, '""')}"`,
        pd.kanun_maddesi || "",
        record.penaltyData?.calculatedAmount || 0,
        record.penaltyData?.hasElKoyma ? "Evet" : "Hayır"
      ];
      csvContent += row.join(";") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ceza_arsivi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArchiveIcon size={28} color="#4f46e5" /> Ceza Arşivi ve Sicil Kayıtları
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Geçmiş cezaları görüntüleyin. Yeni ceza keserken sistem bu listeyi tarayıp tekerrür uyarısı verir.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', background: 'white', cursor: 'pointer', color: '#475569', fontWeight: 500 }}
          >
            <option value="all">Genel Arama</option>
            <option value="tc">Sadece TC Kimlik</option>
            <option value="isim">Sadece Ad Soyad</option>
            <option value="plaka">Sadece Plaka / Ruhsat</option>
          </select>

          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Aranacak kelimeyi yazın..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px 10px 38px', borderRadius: '12px',
                border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px'
              }}
            />
          </div>
          
          <button style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}>
            <Search size={16} /> Ara
          </button>
          
          <button onClick={handleExportExcel} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 20px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)', marginLeft: '8px' }}>
            <Download size={16} /> Excel'e Aktar
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
            <ArchiveIcon size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>Arşivde kayıt bulunmuyor veya aramanıza uygun sonuç yok.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>Tarih</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>Kişi / Firma (TC)</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>Gemi (Ruhsat No)</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>İhlal (Kanun Md.)</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: 600 }}>Uygulanan Ceza</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredData.map(record => (
                  <motion.tr 
                    key={record.formData.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ padding: '16px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#1e293b' }}>
                        <Calendar size={14} /> {formatOffenseDate(record.formData.tarih, record.formData.saat)}
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.6 }}>Kayıt: {formatDate(record.timestamp)}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{record.formData.adSoyadUnvan || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{record.formData.kimlikNo || '-'}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{record.formData.gemiAdi || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{record.formData.ruhsatKodNo || '-'}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {record.penaltyData.fine.ihlal_nedeni}
                      </div>
                      <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600, marginTop: '4px' }}>
                        Md. {record.penaltyData.fine.kanun_maddesi} ({record.penaltyData.fine.madde_36_bendi})
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#dc2626' }}>
                      {formatMoney(record.penaltyData.calculatedAmount)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleEdit(record)}
                        style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                        title="Kaydı Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.formData.id)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                        title="Kaydı Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Archive;
