import React, { useState } from 'react';
import { Printer, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ElKoymaTutanagi = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    no: '',
    tarih: new Date().toISOString().split('T')[0],
    urunler: [{ id: 1, turu: '', miktari: '', ozelligi: '' }],
    kalemSayisi: '',
    kanunMaddesi: '',
    sirkulerNo: '',
    sirkulerMadde: '',
    yasalDayanakBendi: '',
    yasalDayanakFikrasi: '',
    teslimAlanAd: '',
    teslimAlanUnvan: '',
    teslimEdenAd: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUrunChange = (id, field, value) => {
    setFormData({
      ...formData,
      urunler: formData.urunler.map(u => u.id === id ? { ...u, [field]: value } : u)
    });
  };

  const addUrun = () => {
    setFormData({
      ...formData,
      urunler: [...formData.urunler, { id: Date.now(), turu: '', miktari: '', ozelligi: '' }]
    });
  };

  const removeUrun = (id) => {
    if (formData.urunler.length > 1) {
      setFormData({
        ...formData,
        urunler: formData.urunler.filter(u => u.id !== id)
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-container" style={{ paddingBottom: '100px' }}>
      <div className="dashboard-header no-print">
        <div>
          <button onClick={() => navigate(-1)} className="secondary-btn" style={{ marginBottom: '16px' }}>
            <ArrowLeft size={16} /> Geri Dön
          </button>
          <h2>EK-12: Zaptetme (Elkoyma) Tutanağı</h2>
          <p>Kanun ve yönetmelikteki EK-12 formuna birebir uygundur.</p>
        </div>
        <button onClick={handlePrint} className="primary-btn">
          <Printer size={18} /> Formu Yazdır
        </button>
      </div>

      <div className="dashboard-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Form Alanı */}
        <div className="glass-panel no-print" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>Veri Girişi</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Tutanağı No</label>
              <input type="text" name="no" value={formData.no} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Tarih</label>
              <input type="date" name="tarih" value={formData.tarih} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Zaptedilen Su Ürünleri ve İstihsal Vasıtaları</label>
                <button onClick={addUrun} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <Plus size={14} /> Satır Ekle
                </button>
              </div>
              {formData.urunler.map((urun, index) => (
                <div key={urun.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" placeholder="Türü" value={urun.turu} onChange={(e) => handleUrunChange(urun.id, 'turu', e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                  <input type="text" placeholder="Miktarı" value={urun.miktari} onChange={(e) => handleUrunChange(urun.id, 'miktari', e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                  <input type="text" placeholder="Özelliği" value={urun.ozelligi} onChange={(e) => handleUrunChange(urun.id, 'ozelligi', e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                  {formData.urunler.length > 1 && (
                    <button onClick={() => removeUrun(urun.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Toplam Kalem Sayısı (Yazı ile)</label>
              <input type="text" name="kalemSayisi" value={formData.kalemSayisi} onChange={handleChange} placeholder="Örn: İKİ" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Zaptetme Gerekçesi</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px' }}>Sirkülerin</span>
                <input type="text" name="sirkulerNo" value={formData.sirkulerNo} onChange={handleChange} placeholder="Numarası" style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                <span style={{ fontSize: '13px' }}>Numaralı Sirkülerin</span>
                <input type="text" name="sirkulerMadde" value={formData.sirkulerMadde} onChange={handleChange} placeholder="Maddesi" style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                <span style={{ fontSize: '13px' }}>maddesi hükümlerine...</span>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Yasal Dayanak (1380 SK 36. Madde)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" name="yasalDayanakBendi" value={formData.yasalDayanakBendi} onChange={handleChange} placeholder="Bendi" style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                <span style={{ fontSize: '13px' }}>bendi /</span>
                <input type="text" name="yasalDayanakFikrasi" value={formData.yasalDayanakFikrasi} onChange={handleChange} placeholder="Fıkrası" style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                <span style={{ fontSize: '13px' }}>fıkrası</span>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>İmzalar</label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Teslim Alan Adı Soyadı</label>
              <input type="text" name="teslimAlanAd" value={formData.teslimAlanAd} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Teslim Alan Unvanı</label>
              <input type="text" name="teslimAlanUnvan" value={formData.teslimAlanUnvan} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Teslim Eden Adı Soyadı</label>
              <input type="text" name="teslimEdenAd" value={formData.teslimEdenAd} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Çıktı Alanı - A4 Formatında */}
        <div className="print-area" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0, position: 'relative', color: 'black', fontFamily: '"Times New Roman", Times, serif' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>EK-12</div>
            <div style={{ fontSize: '14px' }}>(Ek:RG-15/2/2004-25374)</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>ZAPTETME (ELKOYMA) TUTANAĞI</h1>
            <div style={{ textAlign: 'left', fontSize: '14px', fontWeight: 'bold', minWidth: '150px' }}>
              <div>No : {formData.no || '....................'}</div>
              <div>Tarih: {formData.tarih ? new Date(formData.tarih).toLocaleDateString('tr-TR') : '..../..../........'}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', fontSize: '14px', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td rowSpan={Math.max(5, formData.urunler.length + 1)} style={{ width: '30%', border: '1px solid black', padding: '10px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }}>
                  ZAPTEDİLEN SU<br/>ÜRÜNLERİ VE<br/>İSTİHSAL<br/>VASITALARININ
                </td>
                <td style={{ width: '20%', border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Türü</td>
                <td style={{ width: '20%', border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Miktarı</td>
                <td style={{ width: '30%', border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Özelliği</td>
              </tr>
              
              {Array.from({ length: Math.max(4, formData.urunler.length) }).map((_, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid black', padding: '12px 8px' }}>{formData.urunler[i]?.turu || ''}</td>
                  <td style={{ border: '1px solid black', padding: '12px 8px' }}>{formData.urunler[i]?.miktari || ''}</td>
                  <td style={{ border: '1px solid black', padding: '12px 8px' }}>{formData.urunler[i]?.ozelligi || ''}</td>
                </tr>
              ))}

              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '12px 8px', textAlign: 'center' }}>
                  YALNIZ {formData.kalemSayisi ? formData.kalemSayisi : '....................'} KALEMDİR.
                </td>
              </tr>
              
              <tr>
                <td style={{ border: '1px solid black', padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                  ZAPTETME<br/>GEREKÇESİ
                </td>
                <td colSpan="3" style={{ border: '1px solid black', padding: '12px 8px', lineHeight: '1.6' }}>
                  1380 sayılı Su Ürünleri Kanunu/Yönetmeliği/ {formData.sirkulerNo ? formData.sirkulerNo : '..............................'} Numaralı<br/>
                  Sirkülerin {formData.sirkulerMadde ? formData.sirkulerMadde : '.................'} maddesi hükümlerine aykırı olarak hareket edildiğinden
                </td>
              </tr>
              
              <tr>
                <td style={{ border: '1px solid black', padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                  YASAL DAYANAK
                </td>
                <td colSpan="3" style={{ border: '1px solid black', padding: '12px 8px' }}>
                  1380 sayılı Su Ürünleri Kanununun 36/ {formData.yasalDayanakBendi || '.......'} bendi/ {formData.yasalDayanakFikrasi || '.........'} fıkrası
                </td>
              </tr>

              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '16px 8px' }}>
                  Yukarıda belirtilen su ürünlerine / istihsal vasıtalarına Su Ürünleri Kanununa aykırılık nedeniyle el konulmuştur.
                </td>
              </tr>
            </tbody>
          </table>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td colSpan="2" style={{ width: '60%', border: '1px solid black', padding: '12px 8px', textAlign: 'center' }}>Teslim Alanlar</td>
                <td style={{ width: '40%', border: '1px solid black', padding: '12px 8px', textAlign: 'center' }}>Teslim Eden</td>
              </tr>
              <tr>
                <td style={{ width: '20%', border: '1px solid black', padding: '12px 8px' }}>Adı Soyadı</td>
                <td style={{ width: '40%', border: '1px solid black', padding: '12px 8px' }}>{formData.teslimAlanAd}</td>
                <td rowSpan="3" style={{ width: '40%', border: '1px solid black', padding: '12px 8px', verticalAlign: 'top', textAlign: 'center' }}>
                  Adı Soyadı/ İmza
                  <div style={{ marginTop: '10px', textAlign: 'left', paddingLeft: '10px' }}>{formData.teslimEdenAd}</div>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '12px 8px' }}>Unvanı</td>
                <td style={{ border: '1px solid black', padding: '12px 8px' }}>{formData.teslimAlanUnvan}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '12px 8px', height: '100px', verticalAlign: 'top' }}>Mühür/İmza</td>
                <td style={{ border: '1px solid black', padding: '12px 8px' }}></td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
};

export default ElKoymaTutanagi;
