import React, { useState } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IdariParaCezasiKarari = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    seriNo: '',
    kararNo: '',
    kararTarihi: new Date().toISOString().split('T')[0],
    
    kisiTipi: 'Gerçek Kişi', // 'Gerçek Kişi' veya 'Tüzel Kişilik'
    vergiKimlikNo: '',
    adSoyad: '',
    babaAdi: '',
    anaAdi: '',
    dogumTarihiYeri: '',
    adres: '',
    
    kanuniTemsilciAd: '',
    kanuniTemsilciGorevi: '',
    kanuniTemsilciVergiNo: '',
    
    gemiAdi: '',
    ruhsatKodNo: '',
    baglamaLimani: '',
    teknikKutukNo: '',
    vergiDairesi: '',
    gemiAdresi: '',
    
    yasalDayanak: '1380 sayılı Su Ürünleri Kanunu\'nun 36\'ncı maddesi ve Yönetmeliği',
    nedeni: '',
    sucYeri: '',
    sucTarihSaat: '',
    cezaMiktari: '',
    odenecekKurulus: '',
    
    gorevli1Ad: '',
    gorevli1Gorev: '',
    gorevli1Yer: '',
    gorevli2Ad: '',
    gorevli2Gorev: '',
    gorevli2Yer: ''
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
          <h2>EK-10: İdari Para Cezası Kararı</h2>
          <p>Kanun ve yönetmelikteki EK-10 formuna birebir uygundur.</p>
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
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Seri No</label>
              <input type="text" name="seriNo" value={formData.seriNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Karar No</label>
              <input type="text" name="kararNo" value={formData.kararNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Karar Tarihi</label>
              <input type="date" name="kararTarihi" value={formData.kararTarihi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>İdari Para Cezasının Muhatabı</label>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="kisiTipi" value="Gerçek Kişi" checked={formData.kisiTipi === 'Gerçek Kişi'} onChange={handleChange} />
                  Gerçek Kişi
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="kisiTipi" value="Tüzel Kişilik" checked={formData.kisiTipi === 'Tüzel Kişilik'} onChange={handleChange} />
                  Tüzel Kişilik
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>T.C. / Vergi Kimlik No</label>
              <input type="text" name="vergiKimlikNo" value={formData.vergiKimlikNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Adı Soyadı / Unvanı</label>
              <input type="text" name="adSoyad" value={formData.adSoyad} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>

            {formData.kisiTipi === 'Gerçek Kişi' ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Baba Adı</label>
                  <input type="text" name="babaAdi" value={formData.babaAdi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Ana Adı</label>
                  <input type="text" name="anaAdi" value={formData.anaAdi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Doğum Tarihi ve Yeri</label>
                  <input type="text" name="dogumTarihiYeri" value={formData.dogumTarihiYeri} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Kanuni Temsilcisinin Adı Soyadı</label>
                  <input type="text" name="kanuniTemsilciAd" value={formData.kanuniTemsilciAd} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Görevi</label>
                  <input type="text" name="kanuniTemsilciGorevi" value={formData.kanuniTemsilciGorevi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Temsilci Vergi Kimlik No</label>
                  <input type="text" name="kanuniTemsilciVergiNo" value={formData.kanuniTemsilciVergiNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>
              </>
            )}

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Adresi</label>
              <input type="text" name="adres" value={formData.adres} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Balıkçı Gemisi Bilgileri (Varsa)</label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Gemi Adı</label>
              <input type="text" name="gemiAdi" value={formData.gemiAdi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Vergi Dairesi Adı</label>
              <input type="text" name="vergiDairesi" value={formData.vergiDairesi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Ruhsat Kod No</label>
              <input type="text" name="ruhsatKodNo" value={formData.ruhsatKodNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Adresi</label>
              <input type="text" name="gemiAdresi" value={formData.gemiAdresi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Bağlama Limanı</label>
              <input type="text" name="baglamaLimani" value={formData.baglamaLimani} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Teknik Kütük No</label>
              <input type="text" name="teknikKutukNo" value={formData.teknikKutukNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Ceza Detayları</label>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Cezanın Nedeni</label>
              <input type="text" name="nedeni" value={formData.nedeni} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Suçun İşlendiği Yer</label>
              <input type="text" name="sucYeri" value={formData.sucYeri} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Tarih ve Saat</label>
              <input type="text" name="sucTarihSaat" value={formData.sucTarihSaat} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Cezanın Miktarı</label>
              <input type="text" name="cezaMiktari" value={formData.cezaMiktari} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Ödeneceği Kuruluş</label>
              <input type="text" name="odenecekKurulus" value={formData.odenecekKurulus} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} placeholder="... Malmüdürlüğü /Vergi Dairesi" />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Düzenleyen Kontrol Görevlileri</label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', gridColumn: '1 / -1' }}>
              <input type="text" name="gorevli1Ad" value={formData.gorevli1Ad} onChange={handleChange} placeholder="Görevli 1 Adı Soyadı" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              <input type="text" name="gorevli1Gorev" value={formData.gorevli1Gorev} onChange={handleChange} placeholder="Görevi" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              <input type="text" name="gorevli1Yer" value={formData.gorevli1Yer} onChange={handleChange} placeholder="Görev Yeri" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', gridColumn: '1 / -1' }}>
              <input type="text" name="gorevli2Ad" value={formData.gorevli2Ad} onChange={handleChange} placeholder="Görevli 2 Adı Soyadı" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              <input type="text" name="gorevli2Gorev" value={formData.gorevli2Gorev} onChange={handleChange} placeholder="Görevi" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              <input type="text" name="gorevli2Yer" value={formData.gorevli2Yer} onChange={handleChange} placeholder="Görev Yeri" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>

          </div>
        </div>

        {/* Çıktı Alanı - A4 Formatında */}
        <div className="print-area" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0, position: 'relative', color: 'black', fontFamily: '"Times New Roman", Times, serif' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>EK-10</div>
            <div style={{ fontSize: '14px' }}>(Mülga:RG-18/10/2001-24557)</div>
            <div style={{ fontSize: '14px' }}>(Yeniden düzenleme:RG-15/2/2004-25374)¹</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, textAlign: 'center', flex: 1 }}>İDARİ PARA CEZASI KARARI</h1>
            <div style={{ textAlign: 'left', fontSize: '14px', fontWeight: 'bold', width: '250px' }}>
              <div>Seri No : {formData.seriNo || ''}</div>
              <div>Karar No : {formData.kararNo || ''}</div>
              <div>Karar Tarihi : {formData.kararTarihi ? new Date(formData.kararTarihi).toLocaleDateString('tr-TR') : ''}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', fontSize: '13px', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '10px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                  İDARİ PARA CEZASININ MUHATABI
                </td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '50%' }}>
                  {formData.kisiTipi === 'Gerçek Kişi' ? 'Gerçek Kişi' : 'Gerçek Kişi'}
                </td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '50%' }}>
                  {formData.kisiTipi === 'Tüzel Kişilik' ? 'Tüzel Kişilik' : 'Tüzel Kişilik'}
                </td>
              </tr>
              
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Vergi Kimlik No</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.kisiTipi === 'Gerçek Kişi' ? formData.vergiKimlikNo : ''}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>Vergi Kimlik No</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.kisiTipi === 'Tüzel Kişilik' ? formData.vergiKimlikNo : ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Adı ve Soyadı</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.kisiTipi === 'Gerçek Kişi' ? formData.adSoyad : ''}</td>
                <td rowSpan="2" style={{ border: '1px solid black', padding: '8px' }}>Unvanı</td>
                <td rowSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.kisiTipi === 'Tüzel Kişilik' ? formData.adSoyad : ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Baba Adı</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.babaAdi || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Ana Adı</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.anaAdi || ''}</td>
                <td rowSpan="4" colSpan="2" style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', width: '40%' }}>Kanuni<br/>Temsilcisinin</td>
                        <td style={{ borderBottom: '1px solid black', padding: '8px', width: '60%' }}>
                          Adı ve<br/>Soyadı<br/>{formData.kanuniTemsilciAd || ''}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px' }}>Görevi</td>
                        <td style={{ borderBottom: '1px solid black', padding: '8px' }}>{formData.kanuniTemsilciGorevi || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ borderRight: '1px solid black', padding: '8px' }}>Vergi Kimlik No</td>
                        <td style={{ padding: '8px' }}>{formData.kanuniTemsilciVergiNo || ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Doğum Tarihi ve<br/>Yeri</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.dogumTarihiYeri || ''}</td>
              </tr>
              <tr>
                <td rowSpan="2" style={{ border: '1px solid black', padding: '8px', verticalAlign: 'top' }}>Adresi</td>
                <td rowSpan="2" style={{ border: '1px solid black', padding: '8px', verticalAlign: 'top' }}>{formData.adres || ''}</td>
              </tr>
              <tr></tr>

              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', backgroundColor: '#f3f4f6' }}>Balıkçı Gemisi</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f3f4f6' }}>Vergi Dairesi Adı: <span style={{ fontWeight: 'normal', marginLeft: '10px' }}>{formData.vergiDairesi || ''}</span></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Adı</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.gemiAdi || ''}</td>
                <td rowSpan="3" style={{ border: '1px solid black', padding: '8px', verticalAlign: 'top' }}>Adresi</td>
                <td rowSpan="3" style={{ border: '1px solid black', padding: '8px', verticalAlign: 'top' }}>{formData.gemiAdresi || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Ruhsat Kod No</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.ruhsatKodNo || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Bağlama Limanı</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.baglamaLimani || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Teknik Kütük No</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.teknikKutukNo || ''}</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}></td>
              </tr>

              <tr>
                <td rowSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>İdari Para<br/>Cezasının</td>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Yasal Dayanağı</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.yasalDayanak || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Nedeni</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.nedeni || ''}</td>
              </tr>
              
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Suçun İşlendiği Yer</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.sucYeri || ''}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Tarih ve Saat</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.sucTarihSaat || ''}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Cezanın Miktarı</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.cezaMiktari || ''}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Ödeneceği Kuruluş</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{formData.odenecekKurulus ? formData.odenecekKurulus + ' Malmüdürlüğü /Vergi Dairesi' : '................................................... Malmüdürlüğü /Vergi Dairesi'}</td>
              </tr>

              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>İDARİ PARA CEZASINA İTİRAZ MERCİİ</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Yetkili İdare Mahkemesi</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>SON İTİRAZ TARİHİ</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Tebliğ tarihinden itibaren 7 gündür.</td>
              </tr>

              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '10px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>DÜZENLEYEN KONTROL GÖREVLİLERİ</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Adı Soyadı</td>
                <td colSpan="1" style={{ border: '1px solid black', padding: '8px' }}>{formData.gorevli1Ad || ''}</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.gorevli2Ad || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Görevi</td>
                <td colSpan="1" style={{ border: '1px solid black', padding: '8px' }}>{formData.gorevli1Gorev || ''}</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.gorevli2Gorev || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Görev Yeri</td>
                <td colSpan="1" style={{ border: '1px solid black', padding: '8px' }}>{formData.gorevli1Yer || ''}</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px' }}>{formData.gorevli2Yer || ''}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', height: '60px', textAlign: 'center', verticalAlign: 'bottom' }}>Mühür /İmza</td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', height: '60px', textAlign: 'center', verticalAlign: 'bottom' }}>Mühür /İmza</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ fontSize: '11px', marginTop: '10px', borderTop: '1px solid black', paddingTop: '5px' }}>
            ¹ Bu değişiklik 29/1/2004 tarihinden itibaren geçerli olmak üzere yayımı tarihinde yürürlüğe girer.
          </div>

        </div>
      </div>
    </div>
  );
};

export default IdariParaCezasiKarari;
