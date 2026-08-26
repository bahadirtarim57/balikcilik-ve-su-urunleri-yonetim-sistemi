import React, { useState } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DenetimFormu = ({ selectedCity, selectedUnit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    denetimTarihi: new Date().toISOString().split('T')[0],
    denetimSaati: new Date().toTimeString().split(' ')[0].substring(0, 5),
    denetimYeri: '',
    denetlenenAdSoyad: '',
    denetlenenTcKimlik: '',
    denetlenenAdres: '',
    denetlenenFaaliyet: 'Amatör Avcılık / Ticari Avcılık',
    tespitler: '',
    alinanOnlemler: '',
    gorevli1Ad: '',
    gorevli1Gorev: 'Su Ürünleri Denetim Görevlisi',
    gorevli2Ad: '',
    gorevli2Gorev: 'Su Ürünleri Denetim Görevlisi',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          <h2>Su Ürünleri Denetim Formu</h2>
          <p>İster boş olarak çıktı alıp sahada doldurun, ister bilgileri girerek dolu halde yazdırın.</p>
        </div>
        <button onClick={handlePrint} className="primary-btn">
          <Printer size={18} /> Formu Yazdır
        </button>
      </div>

      <div className="dashboard-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Form Alanı */}
        <div className="glass-panel no-print" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>Veri Girişi (İsteğe Bağlı)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Denetim Tarihi</label>
              <input type="date" name="denetimTarihi" value={formData.denetimTarihi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Denetim Saati</label>
              <input type="time" name="denetimSaati" value={formData.denetimSaati} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Denetim Yeri / Mahalli</label>
              <input type="text" name="denetimYeri" value={formData.denetimYeri} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Denetlenen Kişi/Firma Adı</label>
              <input type="text" name="denetlenenAdSoyad" value={formData.denetlenenAdSoyad} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>T.C. Kimlik / Vergi No</label>
              <input type="text" name="denetlenenTcKimlik" value={formData.denetlenenTcKimlik} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Faaliyet Türü</label>
              <input type="text" name="denetlenenFaaliyet" value={formData.denetlenenFaaliyet} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Adresi</label>
              <input type="text" name="denetlenenAdres" value={formData.denetlenenAdres} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Yapılan Tespitler</label>
              <textarea name="tespitler" value={formData.tespitler} onChange={handleChange} rows={5} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Alınan Önlemler / Yapılan İşlemler</label>
              <textarea name="alinanOnlemler" value={formData.alinanOnlemler} onChange={handleChange} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Denetim Görevlisi 1 Adı</label>
              <input type="text" name="gorevli1Ad" value={formData.gorevli1Ad} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Denetim Görevlisi 1 Ünvanı</label>
              <input type="text" name="gorevli1Gorev" value={formData.gorevli1Gorev} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Denetim Görevlisi 2 Adı</label>
              <input type="text" name="gorevli2Ad" value={formData.gorevli2Ad} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Denetim Görevlisi 2 Ünvanı</label>
              <input type="text" name="gorevli2Gorev" value={formData.gorevli2Gorev} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Çıktı Alanı */}
        <div className="print-area" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0, position: 'relative' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>T.C.</h2>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{selectedCity ? `${selectedCity.toUpperCase()} VALİLİĞİ` : '................ VALİLİĞİ'}</h3>
            <h4 style={{ fontSize: '14px', fontWeight: 'normal', margin: '0 0 15px 0' }}>İl Tarım ve Orman Müdürlüğü</h4>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid black', display: 'inline-block', paddingBottom: '5px' }}>SU ÜRÜNLERİ DENETİM FORMU</h1>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', width: '30%', fontWeight: 'bold' }}>Denetim Tarihi ve Saati</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {formData.denetimTarihi ? new Date(formData.denetimTarihi).toLocaleDateString('tr-TR') : '...../...../20.....'} - {formData.denetimSaati || '.....:.....'}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Denetim Yeri / Mahalli</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.denetimYeri || '................................................................'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Denetlenen Kişi/Firma</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.denetlenenAdSoyad || '................................................................'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>T.C. Kimlik / Vergi No</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.denetlenenTcKimlik || '................................................................'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Faaliyet Türü</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.denetlenenFaaliyet || '................................................................'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Adresi</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.denetlenenAdres || '........................................................................................................................'}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>YAPILAN TESPİTLER</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', minHeight: '150px', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
                  {formData.tespitler || '\n\n\n\n\n\n\n'}
                </td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ALINAN ÖNLEMLER VE YAPILAN İŞLEMLER</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', minHeight: '100px', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
                  {formData.alinanOnlemler || '\n\n\n\n'}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '30px', textAlign: 'justify' }}>
            İş bu denetim formu mahallinde {formData.denetimTarihi ? new Date(formData.denetimTarihi).toLocaleDateString('tr-TR') : '...../...../20.....'} tarihinde saat {formData.denetimSaati || '.....:.....'} sularında müştereken tanzim edilerek imza altına alınmıştır.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '40px' }}>Denetlenen Kişi/İlgili</p>
              <p>{formData.denetlenenAdSoyad || 'Adı Soyadı / İmza'}</p>
            </div>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '40px' }}>Denetim Görevlisi</p>
              <p>{formData.gorevli1Ad || '....................................'}</p>
              <p>{formData.gorevli1Gorev || '....................................'}</p>
            </div>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '40px' }}>Denetim Görevlisi</p>
              <p>{formData.gorevli2Ad || '....................................'}</p>
              <p>{formData.gorevli2Gorev || '....................................'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DenetimFormu;
