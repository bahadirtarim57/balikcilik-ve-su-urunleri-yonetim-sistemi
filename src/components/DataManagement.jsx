import React, { useState, useRef } from 'react'
import { Database, Download, TrendingUp, UploadCloud, FileJson, FileSpreadsheet, FileArchive, Upload, Cloud } from 'lucide-react'
import { uploadLocalToSupabase } from '../lib/storage';
import * as XLSX from 'xlsx';

export default function DataManagement() {
  const [folderSyncStatus, setFolderSyncStatus] = useState('');
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState('');

  const currentUserStr = localStorage.getItem('currentUser');
  let currentUser = null;
  if (currentUserStr) {
    try { currentUser = JSON.parse(currentUserStr); } catch(e) {}
  }
  const uRoles = JSON.parse(localStorage.getItem('user_roles') || '{}');
  const userIdentifier = currentUser?.sicil || currentUser?.adSoyad || currentUser?.name;
  const role = currentUser?.sicil === 'admin' ? 'Genel Koordinatör' : (uRoles[userIdentifier] || 'Personel');
  

  const handleSyncFolder = async () => {
    try {
      setFolderSyncStatus('Eşitleniyor...');
      const response = await fetch('/api/sync-folder', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setFolderSyncStatus('Başarılı! Alınan dosyalar: ' + data.copied.join(', '));
        setTimeout(() => setFolderSyncStatus(''), 5000);
      } else {
        setFolderSyncStatus('Bilgi: ' + (data.message || data.error));
      }
    } catch (e) {
      setFolderSyncStatus('Hata: ' + e.message);
    }
  };


  const handleSupabaseSync = async () => {
    try {
      setSupabaseSyncStatus('Buluta gönderiliyor...');
      await uploadLocalToSupabase();
      setSupabaseSyncStatus('Başarılı! Veriler buluta (Supabase) yedeklendi.');
      setTimeout(() => setSupabaseSyncStatus(''), 5000);
    } catch (e) {
      setSupabaseSyncStatus('Hata: ' + e.message);
    }
  };

  const handleDownloadJSON = () => {
    try {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ayarlar_Yedek_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  const handleDownloadExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      const cezalarRaw = localStorage.getItem('cezalarData2026_excel_v3');
      if (cezalarRaw) {
        const cezalar = JSON.parse(cezalarRaw);
        const wsCezalar = XLSX.utils.json_to_sheet(cezalar);
        XLSX.utils.book_append_sheet(wb, wsCezalar, "Cezalar");
      }
      
      const personelRaw = localStorage.getItem('editedPersonnelData');
      if (personelRaw) {
        const personel = JSON.parse(personelRaw);
        const wsPersonel = XLSX.utils.json_to_sheet(personel);
        XLSX.utils.book_append_sheet(wb, wsPersonel, "Personel");
      }
      
      XLSX.writeFile(wb, `Veri_Yedek_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  const handleDownloadZip = () => {
    window.open('/api/download-zip', '_blank');
  };

  const handleRestoreJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!window.confirm("Uyarı: Mevcut tüm ayarlarınız, yükleyeceğiniz dosyadaki ayarlarla değiştirilecektir. Onaylıyor musunuz?")) {
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        for (const key in data) {
          localStorage.setItem(key, data[key]);
        }
        alert("Ayarlar başarıyla geri yüklendi! Sayfa yenilenecektir.");
        window.location.reload();
      } catch (error) {
        alert("Dosya okuma hatası: Geçersiz JSON formatı.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  

  return (
    <div className="module-container">
      <div className="module-header glass-panel" style={{ marginBottom: '20px' }}>
        <div className="header-left">
          <h2><Database size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Veri ve Mevzuat Yönetimi</h2>
          <p>Masaüstünüzdeki klasörden verileri eşitleyin ve ceza oranlarını topluca güncelleyin.</p>
        </div>
      </div>

      <div className="module-content glass-panel" style={{ border: '2px solid #3b82f6' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1d4ed8', borderBottom: '2px solid #bfdbfe', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} /> Veri Eşitleme Merkezi
        </h3>
        <p style={{ marginBottom: '15px', fontSize: '0.95rem', color: '#334155' }}>
          Bilgisayarınızın masaüstündeki <strong>"1380 Sayılı Yasa İşlemleri"</strong> klasöründen yeni veri dosyalarını sisteme aktarabilir ve tüm ceza oranlarını güncelleyebilirsiniz. Bu alan sadece yetkili yöneticilere açıktır.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Klasör Eşitleme */}
          <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={18} /> Yeni Verileri Alınız
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
              Masaüstünüzdeki klasörde bulunan JSON verilerini sisteme kopyalar.
            </p>
            <button 
              onClick={handleSyncFolder}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              <Download size={18} /> {folderSyncStatus === 'Eşitleniyor...' ? 'İşlem Sürüyor...' : 'Klasörden İçeri Aktar'}
            </button>
            {folderSyncStatus && (
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: folderSyncStatus.includes('Hata') ? '#ef4444' : '#10b981', fontWeight: '500', background: folderSyncStatus.includes('Hata') ? '#fef2f2' : '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
                {folderSyncStatus}
              </div>
            )}
          </div>

          {/* Zam Uygulama Kaldırıldı (Yeni Sayfaya Taşındı) */}
        </div>
      </div>

      {/* Veri Yedekleme Kartı */}
      <div className="module-content glass-panel" style={{ border: '2px solid #6366f1', marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#4338ca', borderBottom: '2px solid #c7d2fe', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cloud size={20} /> Veri Yedekleme ve Bulut Eşitleme
        </h3>
        <p style={{ marginBottom: '15px', fontSize: '0.95rem', color: '#334155' }}>
          Kurum ayarlarını, verileri ve kaynak kodlarını bilgisayarınıza veya buluta kaydedebilirsiniz.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <button onClick={handleSupabaseSync} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            <UploadCloud size={18} /> Tüm Ayarları Buluta (Supabase) Gönder
          </button>
          <button onClick={handleDownloadJSON} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#475569', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            <FileJson size={18} /> Yedek İndir (.json)
          </button>
          <button onClick={handleDownloadExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#059669', padding: '10px 16px', border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            <FileSpreadsheet size={18} /> Yedek İndir (Excel)
          </button>
          <button onClick={handleDownloadZip} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#ef4444', padding: '10px 16px', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            <FileArchive size={18} /> Tüm Kaynak Kodları (ZIP) İndir
          </button>
          
          <div style={{ position: 'relative' }}>
            <input type="file" id="restore-json" accept=".json" onChange={handleRestoreJSON} style={{ display: 'none' }} />
            <label htmlFor="restore-json" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', color: '#475569', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
              <Upload size={18} /> Yedekten Yükle
            </label>
          </div>
        </div>

        {supabaseSyncStatus && (
          <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: supabaseSyncStatus.includes('Hata') ? '#ef4444' : '#10b981', fontWeight: '500', background: supabaseSyncStatus.includes('Hata') ? '#fef2f2' : '#ecfdf5', padding: '12px', borderRadius: '8px', border: `1px solid ${supabaseSyncStatus.includes('Hata') ? '#fca5a5' : '#6ee7b7'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={18} /> {supabaseSyncStatus}
          </div>
        )}

        <div style={{ background: '#f0f9ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Bilgilendirme
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <li><strong>Buluta Gönder:</strong> Tüm ayarlarınızı internet üzerindeki veritabanına yedekler. Program başka bilgisayarda açıldığında otomatik geri yükler.</li>
            <li><strong>Lokal Yedek Al (.json/.excel):</strong> Ayarlarınızı veya veri tablosunu dosya olarak indirir. İnternet bağlantısı olmayan durumlarda veya manuel yedekleme için kullanabilirsiniz.</li>
            <li><strong>Kaynak Kodları İndir (ZIP):</strong> Projenin tüm kaynak kodlarını klasör yapısıyla sıkıştırıp (.zip) indirir.</li>
            <li><strong>Yedekten Yükle:</strong> Daha önce indirdiğiniz ".json" dosyasını sisteme geri yükler.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
