import React, { useState } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TutanakVeTebligat = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    seriNo: '',
    siraNo: '',
    tarih: new Date().toISOString().split('T')[0],
    
    adSoyad: '',
    unvan: '',
    vergiKimlikNo: '',
    adres: '',
    
    yonetmelikTarih: '',
    sirkulerNo: '',
    sirkulerMadde: '',
    islenenSuc: '',
    kanunBendi: '',
    kanunFikrasi: '',
    cezaTutari: '',
    malmudurlugu: '',
    
    tebligEden1Ad: '',
    tebligEden2Ad: '',
    tebellugEdenAd: ''
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
          <h2>EK-11: Tutanak ve Tebligat</h2>
          <p>Kanun ve yönetmelikteki EK-11 formuna birebir uygundur.</p>
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
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Sıra No</label>
              <input type="text" name="siraNo" value={formData.siraNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Tarih</label>
              <input type="date" name="tarih" value={formData.tarih} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Cezanın Muhatabı</label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Adı Soyadı</label>
              <input type="text" name="adSoyad" value={formData.adSoyad} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Adresi</label>
              <input type="text" name="adres" value={formData.adres} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Unvanı</label>
              <input type="text" name="unvan" value={formData.unvan} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Vergi Kimlik No</label>
              <input type="text" name="vergiKimlikNo" value={formData.vergiKimlikNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>İhlal Detayları</label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Yönetmeliğin (Tarih)</label>
              <input type="text" name="yonetmelikTarih" value={formData.yonetmelikTarih} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Sirkülerin Numarası</label>
              <input type="text" name="sirkulerNo" value={formData.sirkulerNo} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Sirkülerin Maddesi</label>
              <input type="text" name="sirkulerMadde" value={formData.sirkulerMadde} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>İşlenen Suç</label>
              <input type="text" name="islenenSuc" value={formData.islenenSuc} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Ceza Detayları</label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Kanun 36. Madde Bendi</label>
              <input type="text" name="kanunBendi" value={formData.kanunBendi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Kanun 36. Madde Fıkrası</label>
              <input type="text" name="kanunFikrasi" value={formData.kanunFikrasi} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Ceza Tutarı (TL)</label>
              <input type="text" name="cezaTutari" value={formData.cezaTutari} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Malmüdürlüğü / Vergi Dairesi</label>
              <input type="text" name="malmudurlugu" value={formData.malmudurlugu} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>İmzalar</label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Tebliğ Eden 1 (Adı Soyadı/Unvanı)</label>
              <input type="text" name="tebligEden1Ad" value={formData.tebligEden1Ad} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Tebliğ Eden 2 (Adı Soyadı/Unvanı)</label>
              <input type="text" name="tebligEden2Ad" value={formData.tebligEden2Ad} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>Tebellüğ Eden (Adı Soyadı/Unvanı)</label>
              <input type="text" name="tebellugEdenAd" value={formData.tebellugEdenAd} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Çıktı Alanı - A4 Formatında */}
        <div className="print-area" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0, position: 'relative', color: 'black', fontFamily: '"Times New Roman", Times, serif' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>EK-11</div>
            <div style={{ fontSize: '14px' }}>(Ek:RG-15/2/2004-25374)²</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, marginTop: '20px' }}>TUTANAK VE TEBLİGAT</h1>
            <div style={{ textAlign: 'left', fontSize: '14px', fontWeight: 'bold', minWidth: '150px' }}>
              <div>Seri No: {formData.seriNo || '....................'}</div>
              <div>Sıra No: {formData.siraNo || '....................'}</div>
              <div>Tarih : {formData.tarih ? new Date(formData.tarih).toLocaleDateString('tr-TR') : '..../..../........'}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', fontSize: '14px', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td rowSpan="3" style={{ width: '20%', border: '1px solid black', padding: '10px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }}>
                  CEZANIN<br/>MUHATABI
                </td>
                <td style={{ width: '20%', border: '1px solid black', padding: '8px' }}>Adı Soyadı</td>
                <td style={{ width: '30%', border: '1px solid black', padding: '8px' }}>{formData.adSoyad || ''}</td>
                <td rowSpan="3" style={{ width: '30%', border: '1px solid black', padding: '8px', verticalAlign: 'top' }}>
                  Adresi:<br/>
                  <span style={{ fontWeight: 'normal', display: 'block', marginTop: '10px' }}>{formData.adres || ''}</span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Unvanı</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.unvan || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>Vergi Kimlik No</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{formData.vergiKimlikNo || ''}</td>
              </tr>

              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '16px 8px', lineHeight: '1.8' }}>
                  1380 sayılı Su Ürünleri Kanununun {formData.yonetmelikTarih || '............/............'} Yönetmeliğinin {formData.sirkulerNo || '............/............'} Numaralı Sirkülerin {formData.sirkulerMadde || '....................'} maddesinde yer alan hükme aykırı olarak {formData.islenenSuc || '....................................................................................'} suçu işlediğiniz tespit edilmiştir.<br/><br/>
                  
                  Bu nedenle hakkınızda 1380 sayılı Su Ürünleri Kanununun 36'ncı maddesinin {formData.kanunBendi || '....................'} bendinin {formData.kanunFikrasi || '....................'} fıkrasına göre {formData.cezaTutari || '........................................'} tutarında idari para cezası kesilmiş ve aşağıda adı soyadı ve imzaları bulunan heyet huzurunda tarafınıza tebliğ edilmiştir.<br/><br/>
                  
                  Bahse konu idari para cezasını 30 gün içinde {formData.malmudurlugu || '.........................................................................'} Malmüdürlüğü/Vergi Dairesine ödemeniz gerekmektedir. Ödemediğiniz takdirde, para cezası 6183 sayılı Amme Alacakları Tahsil Usulü Hakkında Kanun hükümlerine göre tahsil edilmektedir.<br/><br/>
                  
                  İdari para cezalarına karşı tebliğ tarihinden itibaren en geç 7 gün içerisinde yetkili İdare Mahkemesine itiraz hakkınız bulunmaktadır.<br/><br/>
                  
                  İtiraz, verilen bu para cezasının yerine getirilmesini durdurmaz.
                </td>
              </tr>

              <tr>
                <td rowSpan="2" style={{ border: '1px solid black', padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                  TEBLİĞ<br/>EDEN
                </td>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Adı ve Soyadı/ Unvanı<br/>{formData.tebligEden1Ad || ''}</td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Adı ve Soyadı/ Unvanı<br/>{formData.tebligEden2Ad || ''}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', height: '60px', verticalAlign: 'bottom' }}>İmza/Mühür</td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', height: '60px', verticalAlign: 'bottom' }}>İmza/Mühür</td>
              </tr>

              <tr>
                <td rowSpan="2" style={{ border: '1px solid black', padding: '10px', verticalAlign: 'middle' }}>
                  TEBELLÜĞ EDEN*
                </td>
                <td colSpan="3" style={{ border: '1px solid black', padding: '8px' }}>
                  Adı ve Soyadı / Unvanı<br/>{formData.tebellugEdenAd || ''}
                </td>
              </tr>
              <tr>
                <td colSpan="3" style={{ border: '1px solid black', padding: '8px', height: '50px' }}>İmza</td>
              </tr>
              
              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '12px 8px', minHeight: '100px', verticalAlign: 'top' }}>
                  İfadesi:<br/><br/><br/><br/><br/>
                </td>
              </tr>
              
              <tr>
                <td colSpan="4" style={{ border: '1px solid black', padding: '12px 8px', fontSize: '13px' }}>
                  *Suçlu tebellüğ etmediği takdirde, bu durum kontrol görevlileri tarafından belirtilerek imzalanacaktır.<br/>
                  Not: İfadenin daha uzun olması halinde başka bir kağıda devam edilecektir.
                </td>
              </tr>
              
              <tr>
                <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>EKİ</td>
                <td colSpan="3" style={{ border: '1px solid black', padding: '12px 8px', lineHeight: '1.6' }}>
                  İdari Para Cezası Kararı ( ) adet<br/>
                  Zapt Tutanağı ( ) adet
                </td>
              </tr>

            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
};

export default TutanakVeTebligat;
