import React, { useState } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MulkiyetinKamuya = ({ selectedCity, selectedUnit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    kararNo: '',
    kararTarihi: new Date().toISOString().split('T')[0],
    kisiAdSoyad: '',
    tcKimlik: '',
    adres: '',
    olayTarihi: '',
    olayYeri: '',
    elKonulanUrunler: '',
    kararNedeni: '1380 Sayılı Su Ürünleri Kanununa Muhalefet ve izinsiz avcılık',
    kararOzeti: 'Yukarıda cinsi ve miktarı belirtilen su ürünlerinin / istihsal vasıtalarının mülkiyetinin kamuya geçirilmesine karar verilmiştir.',
    onaylayanAd: '',
    onaylayanGorev: 'İl / İlçe Müdürü'
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
          <h2>Mülkiyetin Kamuya Geçirilmesi Kararı</h2>
          <p>İster boş olarak çıktı alıp doldurun, ister bilgileri girerek dolu halde yazdırın.</p>
        </div>
        <button onClick={handlePrint} className="primary-btn">
          <Printer size={18} /> Kararı Yazdır
        </button>
      </div>

      <div className="dashboard-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Form Alanı */}
        <div className="glass-panel no-print" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>Veri Girişi (İsteğe Bağlı)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Karar No</label>
              <input type="text" name="kararNo" value={formData.kararNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Karar Tarihi</label>
              <input type="date" name="kararTarihi" value={formData.kararTarihi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>İlgilinin Adı Soyadı</label>
              <input type="text" name="kisiAdSoyad" value={formData.kisiAdSoyad} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>T.C. Kimlik No</label>
              <input type="text" name="tcKimlik" value={formData.tcKimlik} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Adresi</label>
              <input type="text" name="adres" value={formData.adres} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Olay Yeri</label>
              <input type="text" name="olayYeri" value={formData.olayYeri} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Olay Tarihi</label>
              <input type="date" name="olayTarihi" value={formData.olayTarihi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Mülkiyeti Kamuya Geçirilen Ürünler</label>
              <textarea name="elKonulanUrunler" value={formData.elKonulanUrunler} onChange={handleChange} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Karar Nedeni</label>
              <textarea name="kararNedeni" value={formData.kararNedeni} onChange={handleChange} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Onaylayan Adı Soyadı</label>
              <input type="text" name="onaylayanAd" value={formData.onaylayanAd} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Onaylayan Ünvanı</label>
              <input type="text" name="onaylayanGorev" value={formData.onaylayanGorev} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Çıktı Alanı */}
        <div className="print-area" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0, position: 'relative' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>T.C.</h2>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{selectedCity ? `${selectedCity.toUpperCase()} VALİLİĞİ` : '................ VALİLİĞİ'}</h3>
            <h4 style={{ fontSize: '14px', fontWeight: 'normal', margin: '0 0 15px 0' }}>İl Tarım ve Orman Müdürlüğü</h4>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid black', display: 'inline-block', paddingBottom: '5px' }}>MÜLKİYETİN KAMUYA GEÇİRİLMESİ KARARI</h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            <div>Karar No: {formData.kararNo || '................'}</div>
            <div>Karar Tarihi: {formData.kararTarihi ? new Date(formData.kararTarihi).toLocaleDateString('tr-TR') : '...../...../20.....'}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', width: '30%', fontWeight: 'bold' }}>İlgilinin Adı Soyadı</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.kisiAdSoyad || '................................................................'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>T.C. Kimlik / Vergi No</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.tcKimlik || '................................................................'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Adresi</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.adres || '........................................................................................................................'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Olay Yeri ve Tarihi</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {formData.olayYeri || '...........................................'} / {formData.olayTarihi ? new Date(formData.olayTarihi).toLocaleDateString('tr-TR') : '...../...../20.....'}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Mülkiyeti Kamuya Geçirilen Ürünler / Vasfı</td>
                <td style={{ border: '1px solid black', padding: '8px', minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                  {formData.elKonulanUrunler || '........................................................................................................................\n........................................................................................................................'}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Kararın Hukuki Dayanağı (Nedeni)</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.kararNedeni}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '40px', textAlign: 'justify' }}>
            <p style={{ textIndent: '30px' }}>
              Yukarıda açık kimliği ve adresi belirtilen şahsın / şirketin {formData.olayTarihi ? new Date(formData.olayTarihi).toLocaleDateString('tr-TR') : '...../...../20.....'} tarihinde, {formData.olayYeri || '...........................'} mevkiinde yapılan denetimlerde, 1380 Sayılı Su Ürünleri Kanunu ve ilgili mevzuat hükümlerine aykırı hareket ettiği tespit edilmiştir.
            </p>
            <p style={{ textIndent: '30px', marginTop: '10px' }}>
              Bu nedenle, suça konu olan ve özellikleri yukarıda belirtilen su ürünlerinin / istihsal vasıtalarının 1380 Sayılı Su Ürünleri Kanunu'nun ilgili maddeleri uyarınca <strong>MÜLKİYETİNİN KAMUYA GEÇİRİLMESİNE</strong> karar verilmiştir.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '50px' }}>
            <div style={{ textAlign: 'center', width: '40%' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '40px' }}>KARARI VEREN MAKAM</p>
              <p>{formData.onaylayanAd || '....................................'}</p>
              <p>{formData.onaylayanGorev || 'İl / İlçe Müdürü'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MulkiyetinKamuya;
