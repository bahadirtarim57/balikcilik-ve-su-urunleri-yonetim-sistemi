import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle, AlertCircle, Save, AlertTriangle, Clock, BookOpen, X } from 'lucide-react';
import { getPersonnelByUnit } from '../utils/excelData';
import { useAuth } from '../context/AuthContext';
import lawData from '../data/law_articles.json';
import regulationData from '../data/regulation_articles.json';
import tebligTicariData from '../data/teblig_ticari.json';
import tebligAmatorData from '../data/teblig_amator.json';

const FormGenerator = ({ selectedCity, selectedUnit, institutionSettings = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const penaltyData = location.state || null;

  const [articleModal, setArticleModal] = useState({ isOpen: false, title: '', content: '' });

  const handleShowArticle = (type) => {
    let sourceData = [];
    let searchValue = '';
    let titlePrefix = '';

    if (type === 'kanun') {
      sourceData = lawData;
      searchValue = formData.kanunMaddesi?.trim();
      titlePrefix = 'Kanun Maddesi: ';
    } else if (type === 'yonetmelik') {
      sourceData = regulationData;
      searchValue = formData.yonetmelik?.trim();
      titlePrefix = 'Yönetmelik Maddesi: ';
    } else if (type === 'teblig') {
      sourceData = formData.tebligNo === '6/2' ? tebligAmatorData : tebligTicariData;
      searchValue = formData.teblig?.trim();
      titlePrefix = `Tebliğ (${formData.tebligNo}) Maddesi: `;
    } else if (type === 'madde36') {
      sourceData = lawData;
      searchValue = '36';
      titlePrefix = 'Kanun Maddesi: ';
    }

    if (!searchValue || searchValue === '-') {
      setArticleModal({
        isOpen: true,
        title: titlePrefix + (searchValue || 'Boş'),
        content: 'Bu alan için bir madde numarası girilmemiş veya tire (-) kullanılmış.'
      });
      return;
    }

    const found = sourceData.find(item => String(item.madde) === searchValue);
    if (found) {
      let finalContent = found.icerik;
      let finalTitle = titlePrefix + found.madde + (found.baslik && found.baslik !== found.madde ? ` - ${found.baslik}` : '');

      if (type === 'madde36' && formData.bendi) {
        const bend = formData.bendi.trim().toLowerCase();
        try {
          const regex = new RegExp(`(?:^|\\n)\\s*${bend}\\)\\s*([\\s\\S]*?)(?=(?:\\n\\s*[a-zğüşöçı]+\\)\\s*)|$)`, 'i');
          const match = found.icerik.match(regex);
          if (match) {
            finalContent = `${bend}) ${match[1].trim()}`;
            finalTitle = finalTitle + ` (${bend.toUpperCase()} Bendi)`;
          }
        } catch (e) {
          console.error("Regex error:", e);
        }
      }

      setArticleModal({
        isOpen: true,
        title: finalTitle,
        content: finalContent
      });
    } else {
      setArticleModal({
        isOpen: true,
        title: titlePrefix + searchValue,
        content: 'Bu madde numarasına ait metin sistemde bulunamadı. Lütfen numarayı kontrol ediniz (Örn: Sadece rakam veya "1/A" gibi tam eşleşecek şekilde arayınız).'
      });
    }
  };

  const [formData, setFormData] = useState(() => {
    const base = penaltyData?.existingFormData || {};
    const isAmateur = penaltyData?.fine?.kategori?.toLowerCase().includes('amatör') || penaltyData?.fine?.ihlal_nedeni?.toLowerCase().includes('amatör');
    const defaultTebligNo = isAmateur ? '6/2' : '6/1';

    return {
      id: base.id || Date.now().toString(),
      seriNo: base.seriNo || '',
      kararNo: base.kararNo || '',
      tarih: base.tarih || new Date().toISOString().split('T')[0],
      saat: base.saat || new Date().toTimeString().split(' ')[0].substring(0, 5),
      
      kisiTipi: base.kisiTipi || 'Gerçek Kişi',
      kimlikNo: base.kimlikNo || '',
      adSoyadUnvan: base.adSoyadUnvan || '',
      babaAdi: base.babaAdi || '',
      anaAdi: base.anaAdi || '',
      dogumYeriTarihi: base.dogumYeriTarihi || '',
      adres: base.adres || '',
      vergiDairesi: base.vergiDairesi || '',
      kanuniTemsilciAdSoyad: base.kanuniTemsilciAdSoyad || '',
      kanuniTemsilciGorev: base.kanuniTemsilciGorev || '',
      kanuniTemsilciKimlik: base.kanuniTemsilciKimlik || '',

      gemiAdi: base.gemiAdi || '',
      ruhsatKodNo: base.ruhsatKodNo || '',
      baglamaLimani: base.baglamaLimani || '',
      teknikKutukNo: base.teknikKutukNo || '',

      sucYeri: base.sucYeri || '',
      
      odenecekKurum: base.odenecekKurum || '........................ Malmüdürlüğü / Vergi Dairesi',
      itirazMercii: base.itirazMercii || 'Yetkili İdare Mahkemesi',
      
      gorevli1Ad: base.gorevli1Ad || user?.adSoyad || '',
      gorevli1Gorev: base.gorevli1Gorev || user?.unvan || 'Su Ürünleri Denetim Görevlisi',
      gorevli2Ad: base.gorevli2Ad || '',
      gorevli2Gorev: base.gorevli2Gorev || 'Su Ürünleri Denetim Görevlisi',
      
      elKonulanUrun: base.elKonulanUrun || '',
      elKonulanMiktar: base.elKonulanMiktar || '',
      elKonulanOzellik: base.elKonulanOzellik || '',

      kanunMaddesi: base.kanunMaddesi || penaltyData?.fine?.kanun_maddesi || '',
      bendi: base.bendi || penaltyData?.fine?.madde_36_bendi || '',
      yonetmelik: base.yonetmelik || penaltyData?.fine?.yonetmelik || '',
      teblig: base.teblig || penaltyData?.fine?.teblig || '',
      tebligNo: base.tebligNo || defaultTebligNo,
      elKoymaUrun: base.elKoymaUrun || penaltyData?.fine?.el_koyma_urun || '',
      elKoymaVasita: base.elKoymaVasita || penaltyData?.fine?.el_koyma_vasita || '',
      icsu: base.icsu || false,
      deniz: base.deniz || false,
      kisi: base.kisi || false,
      gemiSahibi: base.gemiSahibi || false,
      gemi: base.gemi || false,
      isGirgir: base.isGirgir || false,
      boyM: base.boyM || '',
      ihlalNedeni: base.ihlalNedeni || penaltyData?.fine?.ihlal_nedeni || '',
      cezaTutari: base.cezaTutari || penaltyData?.calculatedAmount || 0,
      hasElKoyma: base.hasElKoyma !== undefined ? base.hasElKoyma : (penaltyData?.hasElKoyma || false),
      hasEK11: base.hasEK11 !== undefined ? base.hasEK11 : true,
      ifade: base.ifade || '',
    };
  });

  const [warnings, setWarnings] = useState({
    isRepeat: false,
    isFirstOffenseWithSeizure: false,
    repeatCount: 0,
    message: '',
    ruhsatMessage: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!penaltyData) {
      navigate('/hesaplama');
    }
  }, [penaltyData, navigate]);

  useEffect(() => {
    if (!formData.kimlikNo && !formData.ruhsatKodNo) {
      setWarnings({ isRepeat: false, repeatCount: 0, message: '', ruhsatMessage: '' });
      return;
    }

    try {
      const archive = JSON.parse(localStorage.getItem('ceza_arsivi') || '[]');
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const currentRuhsat = formData.ruhsatKodNo?.trim();
      const currentTC = formData.kimlikNo?.trim();

      const pastOffenses = archive.filter(item => {
        const itemRuhsat = item.formData?.ruhsatKodNo?.trim();
        const itemTC = item.formData?.kimlikNo?.trim();
        const isSameRule = item.formData?.kanunMaddesi === formData.kanunMaddesi;
        
        const currentOffenseDate = new Date(formData.tarih || new Date());
        const offenseDate = new Date(item.formData?.tarih || new Date());
        const withinTwoYears = offenseDate >= twoYearsAgo;
        const isBeforeCurrent = offenseDate <= currentOffenseDate;

        let isMatch = false;
        
        if (itemRuhsat) {
          // Arşivdeki ceza bir tekneye kesilmiş. 
          // Bu durumda tekerrür SADECE ruhsat kodu aynıysa tetiklenir, TC kimlik numarası dikkate alınmaz.
          if (currentRuhsat && itemRuhsat === currentRuhsat) {
            isMatch = true;
          }
        } else if (itemTC) {
          // Arşivdeki ceza bir şahsa (teknesiz) kesilmiş.
          // Bu durumda tekerrür TC kimlik numarasına göre tetiklenir.
          if (currentTC && itemTC === currentTC) {
            isMatch = true;
          }
        }

        return isMatch && isSameRule && withinTwoYears && isBeforeCurrent && item.formData?.id !== formData.id;
      });

      const ruhsat = penaltyData?.fine?.ruhsat_geri_alma;
      
      if (pastOffenses.length > 0) {
        const count = pastOffenses.length;
        let rMsg = '';
        let mainMsg = '';
        
        if (count === 1) {
          if (ruhsat && ruhsat.kez_2 && ruhsat.kez_2 !== "-") {
            rMsg = `Ruhsata ${ruhsat.kez_2} süre ile el koyunuz.`;
          } else {
            rMsg = 'Ruhsata 3 ay süre ile el koyunuz.';
          }
          mainMsg = "Son 2 yıl içinde 1 kez aynı ceza tespit edildi. İkinci ihlalin ceza miktarını 2 katına çıkarınız.";
        } else if (count === 2) {
          if (ruhsat && ruhsat.kez_3 && ruhsat.kez_3 !== "-") {
            rMsg = `Ruhsata El Koyarak RUHSATI ${ruhsat.kez_3} ediniz.`;
          } else {
            rMsg = 'Son iki yıl içinde 3.ncü kez ihlal suçundan dolayı Ruhsata El Koyarak RUHSATI İPTAL ediniz.';
          }
          mainMsg = "Son 2 yıl içinde 2 kez aynı ceza tespit edildi. Üçüncü ihlalin ceza miktarını 2 katına çıkarınız.";
        } else {
          if (ruhsat && ruhsat.kez_3 && ruhsat.kez_3 !== "-") {
            rMsg = `Ruhsata El Koyarak RUHSATI ${ruhsat.kez_3} ediniz.`;
          } else {
            rMsg = `Son iki yıl içinde ${count + 1}.ncü kez ihlal suçundan dolayı Ruhsata El Koyarak RUHSATI İPTAL ediniz.`;
          }
          mainMsg = `Son 2 yıl içinde ${count} kez aynı ceza tespit edildi. ${count + 1}. ihlalin ceza miktarını 2 katına çıkarınız.`;
        }

        setWarnings({
          isRepeat: true,
          isFirstOffenseWithSeizure: false,
          repeatCount: count,
          message: mainMsg,
          ruhsatMessage: rMsg
        });
      } else {
        let rMsg = '';
        if (ruhsat && ruhsat.kez_1 && ruhsat.kez_1 !== "-") {
           rMsg = `Ruhsata ${ruhsat.kez_1} süre ile el koyunuz.`;
        }
        
        if (rMsg) {
          setWarnings({ 
            isRepeat: false, 
            isFirstOffenseWithSeizure: true,
            repeatCount: 0, 
            message: "Bu ihlal için ilk cezada ruhsat el koyma yaptırımı bulunmaktadır.", 
            ruhsatMessage: rMsg 
          });
        } else {
          setWarnings({ isRepeat: false, isFirstOffenseWithSeizure: false, repeatCount: 0, message: '', ruhsatMessage: '' });
        }
      }
    } catch (error) {
      console.error("Archive parse error", error);
    }
  }, [formData.kimlikNo, formData.ruhsatKodNo, formData.kanunMaddesi, formData.id]);

  if (!penaltyData) return null;

  const extractBaseAmount = (text) => {
    if (!text) return 0;
    const match = String(text).match(/(\d{1,3}(?:\.\d{3})+|\d+)/);
    if (match) {
      return parseInt(match[0].replace(/\./g, ''), 10);
    }
    return 0;
  };

  const baseAmount = extractBaseAmount(penaltyData?.fine?.para_cezasi_tl) || formData.cezaTutari || 0;

  const unitPersonnel = getPersonnelByUnit(selectedUnit);

  const handleOfficerChange = (e, officerKey, titleKey) => {
    const name = e.target.value;
    const person = unitPersonnel.find(p => p.name === name);
    setFormData(prev => ({
      ...prev,
      [officerKey]: name,
      [titleKey]: person ? (person.profession || person.title) : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: val };

      // Auto calculate penalty if boat parameters or ID change
      if (['boyM', 'isGirgir', 'kimlikNo', 'ruhsatKodNo'].includes(name)) {
        const base = extractBaseAmount(penaltyData?.fine?.para_cezasi_tl);
        if (base > 0) {
          let multiplier = 1;
          
          if (newData.isGirgir) {
            multiplier = 3;
          } else if (newData.boyM) {
            const boy = parseFloat(String(newData.boyM).replace(',', '.'));
            if (!isNaN(boy)) {
              if (boy >= 12 && boy <= 22) multiplier = 2;
              else if (boy > 22) multiplier = 3;
            }
          }

          const archive = JSON.parse(localStorage.getItem('ceza_arsivi') || '[]');
          const twoYearsAgo = new Date();
          twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

          const currentRuhsat = newData.ruhsatKodNo?.trim();
          const currentTC = newData.kimlikNo?.trim();

          const pastOffenses = archive.filter(item => {
            const itemRuhsat = item.formData?.ruhsatKodNo?.trim();
            const itemTC = item.formData?.kimlikNo?.trim();
            const isSameRule = item.formData?.kanunMaddesi === newData.kanunMaddesi;
            const currentOffenseDate = new Date(newData.tarih || new Date());
            const offenseDate = new Date(item.formData?.tarih || new Date());
            const withinTwoYears = offenseDate >= twoYearsAgo;
            const isBeforeCurrent = offenseDate <= currentOffenseDate;

            let isMatch = false;
            if (itemRuhsat) {
              if (currentRuhsat && itemRuhsat === currentRuhsat) isMatch = true;
            } else if (itemTC) {
              if (currentTC && itemTC === currentTC) isMatch = true;
            }

            return isMatch && isSameRule && withinTwoYears && isBeforeCurrent && item.formData?.id !== newData.id;
          });

          if (pastOffenses.length > 0) {
            multiplier *= 2;
          }

          newData.cezaTutari = base * multiplier;
        }
      }

      return newData;
    });
  };

  const getAppliedBasePenalty = () => {
    let multiplier = 1;
    if (formData.isGirgir) {
      multiplier = 3;
    } else if (formData.boyM) {
      const boy = parseFloat(String(formData.boyM).replace(',', '.'));
      if (!isNaN(boy)) {
        if (boy >= 12 && boy <= 22) multiplier = 2;
        else if (boy > 22) multiplier = 3;
      }
    }
    return baseAmount * multiplier;
  };
  const appliedBasePenalty = getAppliedBasePenalty();

  const doublePenalty = () => {
    setFormData(prev => ({ ...prev, cezaTutari: prev.cezaTutari * 2 }));
  };

  const handleMultiplierChange = (e) => {
    const val = parseInt(e.target.value);
    const baseAmount = penaltyData?.calculatedAmount || 0;
    setFormData(prev => ({ ...prev, cezaTutari: baseAmount * val }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    try {
      const archive = JSON.parse(localStorage.getItem('ceza_arsivi') || '[]');
      
      const savedPenaltyData = { ...penaltyData };
      delete savedPenaltyData.existingFormData;

      const newRecord = {
        formData,
        penaltyData: {
          ...savedPenaltyData,
          calculatedAmount: formData.cezaTutari 
        },
        timestamp: new Date().toISOString()
      };
      
      const existingIndex = archive.findIndex(item => item.formData?.id === formData.id);
      if (existingIndex >= 0) {
        archive[existingIndex] = newRecord;
      } else {
        archive.push(newRecord);
      }
      
      localStorage.setItem('ceza_arsivi', JSON.stringify(archive));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert("Kaydedilirken bir hata oluştu!");
    }
  };

  const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) return '₺ 0';
    const formatted = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0 }).format(amount);
    return `₺ ${formatted}`;
  };

  const safeSplit = (str, char) => {
    if (!str || typeof str !== 'string') return '';
    return str.split(char).reverse().join('.');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#fff'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px'
  };

  const hasBoatRates = penaltyData?.fine?.ceza_oranlari && (
    penaltyData.fine.ceza_oranlari.boy_12_alti !== "-" ||
    penaltyData.fine.ceza_oranlari.boy_12_22 !== "-" ||
    penaltyData.fine.ceza_oranlari.boy_22_ustu !== "-" ||
    penaltyData.fine.ceza_oranlari.girgir !== "-"
  );
  
  const hasRuhsatIptal = penaltyData?.fine?.ruhsat_geri_alma && (
    penaltyData.fine.ruhsat_geri_alma.kez_1 !== "-" ||
    penaltyData.fine.ruhsat_geri_alma.kez_2 !== "-" ||
    penaltyData.fine.ruhsat_geri_alma.kez_3 !== "-"
  );

  const hasTekerrur = penaltyData?.fine?.tekerrur_ikikat === true || penaltyData?.fine?.tekerrur_ikikat === "Evet";

  return (
    <div className="form-generator-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Geri Dön
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Resmi Evrak Oluşturucu & Düzenleyici</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Tüm alanları serbestçe düzenleyebilir, sicile kaydedebilir ve yazdırabilirsiniz.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSave} style={{ background: isSaved ? '#10b981' : '#f59e0b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', transition: 'all 0.2s' }}>
            {isSaved ? <CheckCircle size={18} /> : <Save size={18} />} {isSaved ? 'Kaydedildi!' : (penaltyData?.existingFormData ? 'Değişiklikleri Kaydet' : 'Arşive Kaydet')}
          </button>
          <button onClick={handlePrint} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)' }}>
            <Printer size={18} /> Yazdır
          </button>
        </div>
      </div>

      {warnings.isRepeat && (
        <div className="no-print" style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '50%', color: '#dc2626' }}>
            <AlertTriangle size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#b91c1c', fontSize: '18px', fontWeight: 800 }}>DİKKAT! TEKERRÜR TESPİT EDİLDİ</h3>
            <p style={{ margin: '0 0 4px 0', color: '#991b1b', fontSize: '15px', fontWeight: 600 }}>{warnings.message}</p>
            <p style={{ margin: 0, color: '#dc2626', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
               <Clock size={16} /> YAPTIRIM: {warnings.ruhsatMessage}
            </p>
          </div>
          <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            <label style={{ ...labelStyle, color: '#b91c1c', fontSize: '12px' }}>Ceza Oranı Seçin</label>
            <select onChange={handleMultiplierChange} style={{ ...inputStyle, borderColor: '#fca5a5', fontWeight: 'bold' }}>
              <option value="1">1 Katı (Normal: {formatMoney(penaltyData?.calculatedAmount)})</option>
              <option value="2">2 Katı (Tekerrür: {formatMoney((penaltyData?.calculatedAmount || 0) * 2)})</option>
            </select>
          </div>
        </div>
      )}

      {warnings.isFirstOffenseWithSeizure && !warnings.isRepeat && (
        <div className="no-print" style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '50%', color: '#d97706' }}>
            <AlertTriangle size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#b45309', fontSize: '18px', fontWeight: 800 }}>DİKKAT! YAPTIRIM UYARISI</h3>
            <p style={{ margin: '0 0 4px 0', color: '#92400e', fontSize: '15px', fontWeight: 600 }}>{warnings.message}</p>
            <p style={{ margin: 0, color: '#d97706', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
               <Clock size={16} /> YAPTIRIM: {warnings.ruhsatMessage}
            </p>
          </div>
        </div>
      )}

      <div className="no-print" style={{ flex: 1, overflowY: 'auto', background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> Düzenlenebilir Ceza Detayları Tablosu
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#e2e8f0', padding: '8px 16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>EK-11 (Tebligat) Üretilsin Mi?</label>
                <select name="hasEK11" value={formData.hasEK11} onChange={(e) => setFormData(p => ({...p, hasEK11: e.target.value === 'true'}))} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 'bold' }}>
                  <option value="false">Hayır</option>
                  <option value="true">Evet</option>
                </select>
              </div>
              <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>EK-12 (El Koyma) Üretilsin Mi?</label>
                <select name="hasElKoyma" value={formData.hasElKoyma} onChange={(e) => setFormData(p => ({...p, hasElKoyma: e.target.value === 'true'}))} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 'bold' }}>
                  <option value="false">Hayır</option>
                  <option value="true">Evet</option>
                </select>
              </div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <style>{`
              .ceza-detay-table {
                width: 100%;
                border-collapse: collapse;
                text-align: center;
                font-size: 13px;
                background: white;
                border: 2px solid #334155;
              }
              .ceza-detay-table th, .ceza-detay-table td {
                border: 1px solid #1e293b;
                padding: 6px;
                vertical-align: middle;
              }
              .ceza-detay-table .header-row td {
                font-weight: 700;
                color: #1e293b;
                font-size: 14px;
              }
              .ceza-detay-table .sub-header td {
                font-weight: 600;
              }
              .ceza-input {
                width: 100%;
                border: 1px solid transparent;
                text-align: center;
                font-size: 13px;
                font-family: inherit;
                background: transparent;
                outline: none;
                padding: 4px;
              }
              .ceza-input:focus {
                border: 1px solid #4f46e5;
                background: #fff;
                border-radius: 4px;
              }
              .ceza-checkbox {
                width: 18px;
                height: 18px;
                cursor: pointer;
              }
              .ceza-textarea {
                width: 100%;
                border: 1px solid transparent;
                resize: vertical;
                font-family: inherit;
                font-size: 13px;
                outline: none;
                background: transparent;
                text-align: left;
                padding: 4px;
              }
              .ceza-textarea:focus {
                border: 1px solid #4f46e5;
                background: #fff;
                border-radius: 4px;
              }
            `}</style>
            <table className="ceza-detay-table">
              <tbody>
                <tr>
                  <td colSpan="6" style={{ fontSize: '15px', fontWeight: 'bold' }}>Düzenlenebilir Ceza Detayları</td>
                </tr>
                <tr>
                  <td style={{ width: '16%' }}>İhlal Nedeni</td>
                  <td colSpan="5">
                    <textarea name="ihlalNedeni" className="ceza-textarea" rows="2" value={formData.ihlalNedeni} onChange={handleChange}></textarea>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: '16%' }}>İçsu</td>
                  <td style={{ width: '16%' }}>Deniz</td>
                  <td style={{ width: '16%' }}>Kişi</td>
                  <td style={{ width: '16%' }}>Gemi Sahibi</td>
                  <td style={{ width: '16%' }}>Gemi</td>
                  <td style={{ width: '16%' }}>Boy (m)</td>
                </tr>
                <tr>
                  <td><input type="checkbox" name="icsu" className="ceza-checkbox" checked={formData.icsu} onChange={handleChange} /></td>
                  <td><input type="checkbox" name="deniz" className="ceza-checkbox" checked={formData.deniz} onChange={handleChange} /></td>
                  <td><input type="checkbox" name="kisi" className="ceza-checkbox" checked={formData.kisi} onChange={handleChange} /></td>
                  <td><input type="checkbox" name="gemiSahibi" className="ceza-checkbox" checked={formData.gemiSahibi} onChange={handleChange} /></td>
                  <td><input type="checkbox" name="gemi" className="ceza-checkbox" checked={formData.gemi} onChange={handleChange} /></td>
                  <td><input type="number" step="0.01" name="boyM" className="ceza-input" value={formData.boyM} onChange={handleChange} placeholder="-" /></td>
                </tr>
                <tr>
                  <td colSpan="3">İHLAL MADDESİ</td>
                  <td rowSpan="2">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <span>Kanunun 36.<br/>Maddesinin</span>
                      <button type="button" onClick={() => handleShowArticle('madde36')} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 0, display: 'flex' }} title="36. Maddeyi Gör"><BookOpen size={14} /></button>
                    </div>
                  </td>
                  <td colSpan="2">El Koyma</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      Kanun Maddesi
                      <button type="button" onClick={() => handleShowArticle('kanun')} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 0, display: 'flex' }} title="Kanun Metnini Gör"><BookOpen size={14} /></button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      Yönetmelik
                      <button type="button" onClick={() => handleShowArticle('yonetmelik')} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 0, display: 'flex' }} title="Yönetmelik Metnini Gör"><BookOpen size={14} /></button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      Tebliğ
                      <button type="button" onClick={() => handleShowArticle('teblig')} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 0, display: 'flex' }} title="Tebliğ Metnini Gör"><BookOpen size={14} /></button>
                    </div>
                  </td>
                  <td>Ürüne</td>
                  <td>İstihsal Vasıtasına</td>
                </tr>
                <tr>
                  <td><input type="text" name="kanunMaddesi" className="ceza-input" value={formData.kanunMaddesi} onChange={handleChange}/></td>
                  <td><input type="text" name="yonetmelik" className="ceza-input" value={formData.yonetmelik} onChange={handleChange} placeholder="-" /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <select name="tebligNo" className="ceza-input" value={formData.tebligNo} onChange={handleChange} style={{ width: '50px', padding: '0 2px' }}>
                        <option value="6/1">6/1</option>
                        <option value="6/2">6/2</option>
                      </select>
                      <input type="text" name="teblig" className="ceza-input" value={formData.teblig} onChange={handleChange} placeholder="-" style={{ width: 'calc(100% - 54px)' }} />
                    </div>
                  </td>
                  <td><input type="text" name="bendi" className="ceza-input" value={formData.bendi} onChange={handleChange}/></td>
                  <td><input type="text" name="elKoymaUrun" className="ceza-input" value={formData.elKoymaUrun} onChange={handleChange} placeholder="Evet/Hayır"/></td>
                  <td><input type="text" name="elKoymaVasita" className="ceza-input" value={formData.elKoymaVasita} onChange={handleChange} placeholder="Evet/Hayır"/></td>
                </tr>
                <tr>
                  <td colSpan="6">İPC Miktarı (TL)</td>
                </tr>
                {hasBoatRates ? (
                  <>
                    <tr>
                      <td rowSpan="3" colSpan={hasTekerrur ? 1 : 2} style={{ backgroundColor: '#fff', verticalAlign: 'middle' }}>
                        <input type="number" name="cezaTutari" className="ceza-input" style={{fontSize: '18px', fontWeight: 'bold'}} value={formData.cezaTutari} onChange={handleChange}/>
                      </td>
                      <td rowSpan="2" style={{ verticalAlign: 'middle', cursor: 'pointer', background: formData.isGirgir ? '#e0e7ff' : 'transparent' }}>
                        <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" name="isGirgir" className="ceza-checkbox" checked={formData.isGirgir} onChange={handleChange} />
                          <span style={{ fontWeight: formData.isGirgir ? 'bold' : 'normal' }}>Gırgır<br/>(3 katı)</span>
                        </label>
                      </td>
                      <td colSpan="3">Tekne Boyu</td>
                      {hasTekerrur && <td rowSpan="2" style={{ verticalAlign: 'middle' }}>Suçun 2 yıl içinde<br/>tekrarı halinde 2<br/>katı uygulanır</td>}
                    </tr>
                    <tr>
                      <td>&lt;12</td>
                      <td>12-22<br/>(2 Katı)</td>
                      <td>22&lt;<br/>(3 Katı)</td>
                    </tr>
                    <tr>
                      <td style={{ background: '#f8fafc' }}>{formatMoney(baseAmount * 3)}</td>
                      <td style={{ background: '#f8fafc' }}>{formatMoney(baseAmount)}</td>
                      <td style={{ background: '#f8fafc' }}>{formatMoney(baseAmount * 2)}</td>
                      <td style={{ background: '#f8fafc' }}>{formatMoney(baseAmount * 3)}</td>
                      {hasTekerrur && <td style={{ background: '#f8fafc', fontWeight: 'bold', color: '#dc2626' }}>{formatMoney(appliedBasePenalty * 2)}</td>}
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={hasTekerrur ? 3 : 6} style={{ backgroundColor: '#fff', verticalAlign: 'middle', textAlign: 'center', height: '60px' }}>
                      <input type="number" name="cezaTutari" className="ceza-input" style={{fontSize: '24px', fontWeight: 'bold', textAlign: 'center'}} value={formData.cezaTutari} onChange={handleChange}/>
                    </td>
                    {hasTekerrur && (
                      <td colSpan={3} style={{ verticalAlign: 'middle', textAlign: 'center', background: '#f8fafc' }}>
                        Suçun 2 yıl içinde tekrarı halinde 2 katı uygulanır:<br/>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>{formatMoney(appliedBasePenalty * 2)}</span>
                      </td>
                    )}
                  </tr>
                )}
                {hasRuhsatIptal && (
                  <>
                    <tr>
                      <td colSpan="6">Ruhsat Geri Alma</td>
                    </tr>
                    <tr>
                      <td colSpan="2">1.Kez</td>
                      <td colSpan="2">2.Kez</td>
                      <td colSpan="2">3.Kez</td>
                    </tr>
                    <tr>
                      <td colSpan="2">1 Ay</td>
                      <td colSpan="2">3 Ay</td>
                      <td colSpan="2" style={{ fontWeight: 'bold' }}>İPTAL</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '24px' }}>Değişken Bilgileri Doldurun</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div><label style={labelStyle}>Seri No / Karar No</label><div style={{ display: 'flex', gap: '8px' }}><input type="text" name="seriNo" value={formData.seriNo} onChange={handleChange} placeholder="Seri" style={inputStyle} /><input type="text" name="kararNo" value={formData.kararNo} onChange={handleChange} placeholder="Karar No" style={inputStyle} /></div></div>
          <div><label style={labelStyle}>Tarih</label><input type="date" name="tarih" value={formData.tarih} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Saat</label><input type="time" name="saat" value={formData.saat} onChange={handleChange} style={inputStyle} /></div>
        </div>

        <h4 style={{ color: '#334155', marginBottom: '16px' }}>Cezanın Muhatabı</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
          <div>
            <label style={labelStyle}>Kişi Tipi</label>
            <select name="kisiTipi" value={formData.kisiTipi} onChange={handleChange} style={inputStyle}>
              <option value="Gerçek Kişi">Gerçek Kişi</option>
              <option value="Tüzel Kişilik">Tüzel Kişilik (Şirket)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Vergi / TC Kimlik No</label>
            <input type="text" name="kimlikNo" value={formData.kimlikNo} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Adı ve Soyadı / Unvanı</label>
            <input type="text" name="adSoyadUnvan" value={formData.adSoyadUnvan} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Adresi</label>
            <textarea name="adres" value={formData.adres} onChange={handleChange} style={{...inputStyle, height: '60px'}} />
          </div>
          
          {formData.kisiTipi === 'Gerçek Kişi' ? (
            <>
              <div><label style={labelStyle}>Baba Adı</label><input type="text" name="babaAdi" value={formData.babaAdi} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Ana Adı</label><input type="text" name="anaAdi" value={formData.anaAdi} onChange={handleChange} style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Doğum Tarihi ve Yeri</label><input type="text" name="dogumYeriTarihi" value={formData.dogumYeriTarihi} onChange={handleChange} style={inputStyle} /></div>
            </>
          ) : (
            <>
              <div><label style={labelStyle}>Bağlı Olduğu Vergi Dairesi</label><input type="text" name="vergiDairesi" value={formData.vergiDairesi} onChange={handleChange} style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Kanuni Temsilcisinin Adı Soyadı</label><input type="text" name="kanuniTemsilciAdSoyad" value={formData.kanuniTemsilciAdSoyad} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Görevi</label><input type="text" name="kanuniTemsilciGorev" value={formData.kanuniTemsilciGorev} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Vergi/TC Kimlik No</label><input type="text" name="kanuniTemsilciKimlik" value={formData.kanuniTemsilciKimlik} onChange={handleChange} style={inputStyle} /></div>
            </>
          )}
        </div>

        <h4 style={{ color: '#334155', marginBottom: '16px' }}>Balıkçı Gemisi / Vasıta Bilgileri</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div><label style={labelStyle}>Gemi Adı</label><input type="text" name="gemiAdi" value={formData.gemiAdi} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Ruhsat Kod No / Plaka</label><input type="text" name="ruhsatKodNo" value={formData.ruhsatKodNo} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Bağlama Limanı</label><input type="text" name="baglamaLimani" value={formData.baglamaLimani} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Teknik Kütük No</label><input type="text" name="teknikKutukNo" value={formData.teknikKutukNo} onChange={handleChange} style={inputStyle} /></div>
        </div>

        <h4 style={{ color: '#334155', marginBottom: '16px' }}>Olay ve Diğer Bilgiler</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '32px' }}>
          <div><label style={labelStyle}>Suçun İşlendiği Yer (Mevki)</label><input type="text" name="sucYeri" value={formData.sucYeri} onChange={handleChange} style={inputStyle} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ color: '#334155', margin: '0 0 16px 0' }}>Düzenleyen Görevli 1</h4>
            <div>
              <label style={labelStyle}>Adı Soyadı</label>
              <input type="text" name="gorevli1Ad" value={formData.gorevli1Ad} readOnly style={{...inputStyle, marginBottom:'12px', background: '#e2e8f0', cursor: 'not-allowed', color: '#64748b'}} />
            </div>
            <div><label style={labelStyle}>Görevi</label><input type="text" name="gorevli1Gorev" value={formData.gorevli1Gorev} readOnly style={{...inputStyle, background: '#e2e8f0', cursor: 'not-allowed', color: '#64748b'}} /></div>
          </div>
          <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ color: '#334155', margin: '0 0 16px 0' }}>Düzenleyen Görevli 2</h4>
            <div>
              <label style={labelStyle}>Adı Soyadı</label>
              <select name="gorevli2Ad" value={formData.gorevli2Ad} onChange={(e) => handleOfficerChange(e, 'gorevli2Ad', 'gorevli2Gorev')} style={{...inputStyle, marginBottom:'12px'}}>
                <option value="">Seçiniz...</option>
                {unitPersonnel.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Görevi</label><input type="text" name="gorevli2Gorev" value={formData.gorevli2Gorev} onChange={handleChange} style={inputStyle} /></div>
          </div>
        </div>

        {formData.hasEK11 && (
          <>
            <h4 style={{ color: '#0ea5e9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> EK-11: Tebligat ve İfade Bilgileri
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '32px', border: '1px solid #bae6fd', padding: '20px', borderRadius: '12px', background: '#f0f9ff' }}>
              <div>
                <label style={labelStyle}>Suçlunun İfadesi (Tebellüğ Edenin İfadesi)</label>
                <textarea name="ifade" value={formData.ifade} onChange={handleChange} style={{...inputStyle, height: '80px', resize: 'vertical'}} placeholder="İfadeyi buraya giriniz veya suçlu tebellüğ etmediyse durumu belirtiniz..." />
              </div>
            </div>
          </>
        )}

        {formData.hasElKoyma && (
          <>
            <h4 style={{ color: '#dc2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> Zaptedilen (El Konulan) Ürün/Vasıta Bilgileri
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px', border: '1px solid #fca5a5', padding: '20px', borderRadius: '12px', background: '#fef2f2' }}>
              <div><label style={labelStyle}>Türü (Balık, Ağ, vs.)</label><input type="text" name="elKonulanUrun" value={formData.elKonulanUrun} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Miktarı (Kg, Adet, Kutu)</label><input type="text" name="elKonulanMiktar" value={formData.elKonulanMiktar} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Özelliği (Boy, Cins vb.)</label><input type="text" name="elKonulanOzellik" value={formData.elKonulanOzellik} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </>
        )}

      </div>

      <div className="printable-area-container" style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px dashed #cbd5e1' }}>
        <h3 className="no-print" style={{ color: '#1e293b', marginBottom: '24px', textAlign: 'center', fontSize: '20px' }}>📄 CANLI BELGE ÖNİZLEME (Yazdırılacak Çıktı)</h3>
        <div className="printable-area">
        
        {/* EK-10 PAGE */}
        <div className="print-page">
          <div className="form-header">
            <div style={{ fontSize: '10px', textDecoration: 'underline' }}>{`${selectedCity ? selectedCity + ' Tarım ve Orman İl Müdürlüğü' : '.............. Tarım ve Orman İl Müdürlüğü'} - ${selectedUnit || '................................'}`}</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>SU ÜRÜNLERİ YÖNETMELİĞİ</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold' }}>EK-10</div>
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>Seri No:</span> <span>{formData.seriNo || ''}</span></div>
              <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>Karar No:</span> <span>{formData.kararNo || ''}</span></div>
              <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>Karar Tarihi:</span> <span>{safeSplit(formData.tarih, '-')}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '15px' }}>
            İDARİ PARA CEZASI KARARI
          </div>

          <table className="print-table">
            <tbody>
              <tr>
                <td colSpan="4" style={{ fontWeight: 'bold', background: '#f9f9f9' }}>İDARİ PARA CEZASININ MUHATABI</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ width: '50%', textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>Gerçek Kişi</td>
                <td colSpan="2" style={{ width: '50%', textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>Tüzel Kişilik</td>
              </tr>
              <tr>
                <td style={{ width: '25%' }}>Vergi/Kimlik No</td>
                <td style={{ width: '25%' }}>{formData.kisiTipi === 'Gerçek Kişi' ? formData.kimlikNo : ''}</td>
                <td style={{ width: '25%' }}>Vergi/Kimlik No</td>
                <td style={{ width: '25%' }}>{formData.kisiTipi === 'Tüzel Kişilik' ? formData.kimlikNo : ''}</td>
              </tr>
              <tr>
                <td>Adı ve Soyadı</td>
                <td>{formData.kisiTipi === 'Gerçek Kişi' ? formData.adSoyadUnvan : ''}</td>
                <td rowSpan="3" style={{ verticalAlign: 'top' }}>Unvanı</td>
                <td rowSpan="3" style={{ verticalAlign: 'top' }}>{formData.kisiTipi === 'Tüzel Kişilik' ? formData.adSoyadUnvan : ''}</td>
              </tr>
              <tr>
                <td>Baba Adı</td>
                <td>{formData.kisiTipi === 'Gerçek Kişi' ? formData.babaAdi : ''}</td>
              </tr>
              <tr>
                <td>Ana Adı</td>
                <td>{formData.kisiTipi === 'Gerçek Kişi' ? formData.anaAdi : ''}</td>
              </tr>
              <tr>
                <td>Doğum Tarihi ve Yeri</td>
                <td>{formData.kisiTipi === 'Gerçek Kişi' ? formData.dogumYeriTarihi : ''}</td>
                <td rowSpan="3" style={{ verticalAlign: 'top' }}>Kanuni Temsilcisinin</td>
                <td><span style={{ fontSize:'9px' }}>Adı ve Soyadı:</span> {formData.kisiTipi === 'Tüzel Kişilik' ? formData.kanuniTemsilciAdSoyad : ''}</td>
              </tr>
              <tr>
                <td rowSpan="2" style={{ verticalAlign: 'top' }}>Adresi</td>
                <td rowSpan="2" style={{ verticalAlign: 'top' }}>{formData.adres || ''}</td>
                <td><span style={{ fontSize:'9px' }}>Görevi:</span> {formData.kisiTipi === 'Tüzel Kişilik' ? formData.kanuniTemsilciGorev : ''}</td>
              </tr>
              <tr>
                <td><span style={{ fontSize:'9px' }}>Vergi/Kimlik No:</span> {formData.kisiTipi === 'Tüzel Kişilik' ? formData.kanuniTemsilciKimlik : ''}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ fontWeight: 'bold', background: '#f9f9f9', textAlign: 'center' }}>Balıkçı Gemisi</td>
                <td>Vergi Dairesi Adı</td>
                <td>{formData.vergiDairesi || ''}</td>
              </tr>
              <tr>
                <td>Adı</td>
                <td>{formData.gemiAdi || ''}</td>
                <td rowSpan="4" style={{ verticalAlign: 'top' }}>Adresi</td>
                <td rowSpan="4" style={{ verticalAlign: 'top' }}>{formData.kisiTipi === 'Tüzel Kişilik' ? formData.adres : ''}</td>
              </tr>
              <tr>
                <td>Ruhsat Kod No</td>
                <td>{formData.ruhsatKodNo || ''}</td>
              </tr>
              <tr>
                <td>Bağlama Limanı</td>
                <td>{formData.baglamaLimani || ''}</td>
              </tr>
              <tr>
                <td>Teknik Kütük No</td>
                <td>{formData.teknikKutukNo || ''}</td>
              </tr>
              <tr>
                <td rowSpan="2" style={{ verticalAlign: 'top' }}>İdari Para Cezasının</td>
                <td>Yasal Dayanağı</td>
                <td colSpan="2">1380 sayılı Su Ürünleri Kanunu'nun {formData.kanunMaddesi || ''} maddesi ve Yönetmeliği</td>
              </tr>
              <tr>
                <td>Nedeni</td>
                <td colSpan="2" style={{ fontSize: '11px' }}>{formData.ihlalNedeni || ''}</td>
              </tr>
              <tr>
                <td colSpan="2">Suçun İşlendiği Yer</td>
                <td colSpan="2">{formData.sucYeri || ''}</td>
              </tr>
              <tr>
                <td colSpan="2">Tarih ve Saat</td>
                <td colSpan="2">{`${safeSplit(formData.tarih, '-')} - ${formData.saat || ''}`}</td>
              </tr>
              <tr>
                <td colSpan="2">Cezanın Miktarı</td>
                <td colSpan="2" style={{ fontWeight: 'bold' }}>{formatMoney(formData.cezaTutari)}</td>
              </tr>
              <tr>
                <td colSpan="2">Ödeneceği Kuruluş</td>
                <td colSpan="2">{formData.odenecekKurum || ''}</td>
              </tr>
              <tr>
                <td colSpan="2">İDARİ PARA CEZASINA İTİRAZ MERCİİ</td>
                <td colSpan="2">{formData.itirazMercii || ''}</td>
              </tr>
              <tr>
                <td colSpan="2">SON İTİRAZ TARİHİ</td>
                <td colSpan="2">Tebliğ tarihinden itibaren 15 gündür.</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ fontWeight: 'bold', background: '#f9f9f9', textAlign: 'center' }}>DÜZENLEYEN KONTROL GÖREVLİLERİ</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ width: '50%', padding: '0', borderRight: 'none' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                    <tbody>
                      <tr><td style={{ border: 'none', width: '40%', padding: '6px' }}>Adı Soyadı</td><td style={{ border: 'none', padding: '6px' }}>{formData.gorevli1Ad || ''}</td></tr>
                      <tr><td style={{ border: 'none', padding: '6px' }}>Görevi</td><td style={{ border: 'none', padding: '6px' }}>{formData.gorevli1Gorev || ''}</td></tr>
                      <tr><td style={{ border: 'none', padding: '6px' }}>Görev Yeri</td><td style={{ border: 'none', padding: '6px' }}>{selectedCity ? `${selectedCity} Tarım ve Orman İl Md.` : '........ Tarım ve Orman İl Md.'}</td></tr>
                      <tr><td style={{ border: 'none', height: '60px', verticalAlign: 'bottom', padding: '6px' }}>İmza</td><td style={{ border: 'none' }}></td></tr>
                    </tbody>
                  </table>
                </td>
                <td colSpan="2" style={{ width: '50%', padding: '0', borderLeft: 'none' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                    <tbody>
                      <tr><td style={{ border: 'none', width: '40%', padding: '6px' }}>Adı Soyadı</td><td style={{ border: 'none', padding: '6px' }}>{formData.gorevli2Ad || ''}</td></tr>
                      <tr><td style={{ border: 'none', padding: '6px' }}>Görevi</td><td style={{ border: 'none', padding: '6px' }}>{formData.gorevli2Gorev || ''}</td></tr>
                      <tr><td style={{ border: 'none', padding: '6px' }}>Görev Yeri</td><td style={{ border: 'none', padding: '6px' }}>{selectedCity ? `${selectedCity} Tarım ve Orman İl Md.` : '........ Tarım ve Orman İl Md.'}</td></tr>
                      <tr><td style={{ border: 'none', height: '60px', verticalAlign: 'bottom', padding: '6px' }}>İmza</td><td style={{ border: 'none' }}></td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* EK-11 PAGE */}
        {formData.hasEK11 && (
        <div className="print-page" style={{ pageBreakBefore: 'always' }}>
          <div className="form-header">
            <div style={{ fontSize: '10px', textDecoration: 'underline' }}>{`${selectedCity ? selectedCity + ' Tarım ve Orman İl Müdürlüğü' : '.............. Tarım ve Orman İl Müdürlüğü'} - ${selectedUnit || '................................'}`}</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>SU ÜRÜNLERİ YÖNETMELİĞİ</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold' }}>EK-11</div>
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>Seri No:</span> <span>{formData.seriNo || ''}</span></div>
              <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>Sıra No:</span> <span>{formData.kararNo || ''}</span></div>
              <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>Tarih:</span> <span>{safeSplit(formData.tarih, '-')}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '20px' }}>
            TUTANAK VE TEBLİGAT
          </div>

          <table className="print-table" style={{ marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td rowSpan="3" style={{ width: '25%', fontWeight: 'bold', textAlign: 'center' }}>CEZANIN MUHATABI</td>
                <td style={{ width: '25%' }}>Adı Soyadı</td>
                <td colSpan="2">{formData.kisiTipi === 'Gerçek Kişi' ? formData.adSoyadUnvan : formData.kanuniTemsilciAdSoyad}</td>
              </tr>
              <tr>
                <td>Unvanı</td>
                <td colSpan="2">{formData.kisiTipi === 'Tüzel Kişilik' ? formData.adSoyadUnvan : ''}</td>
              </tr>
              <tr>
                <td>Vergi/Kimlik No</td>
                <td colSpan="2">{formData.kimlikNo || ''}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ fontWeight: 'bold', textAlign: 'center' }}>Adresi</td>
                <td colSpan="2">{formData.adres || ''}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '12px', lineHeight: '1.8', textAlign: 'justify', marginBottom: '30px' }}>
            <p style={{ margin: '0 0 10px 0', textIndent: '60px' }}>
              1380 sayılı Su Ürünleri Kanununun <strong>{formData.kanunMaddesi || '......'}</strong> / Yönetmeliğinin <strong>{formData.yonetmelik || '......'}</strong> / <strong>{formData.tebligNo || '6/1'}</strong> Numaralı Tebliğin <strong>{formData.teblig || 'ilgili'}</strong> maddesinde yer alan hükme aykırı olarak 
              <span style={{ textDecoration: 'underline', fontWeight: 'bold', margin: '0 8px' }}>{formData.ihlalNedeni || '................................................................'}</span> 
              suçu işlediğiniz tespit edilmiştir.
            </p>
            <p style={{ margin: '0 0 10px 0', textIndent: '60px' }}>
              Bu nedenle hakkınızda 1380 sayılı Su Ürünleri Kanununun 36'ncı maddesinin <strong>{formData.bendi || '......'}</strong> bendinin ....... fıkrasına göre 
              <strong style={{ margin: '0 10px' }}>{formatMoney(formData.cezaTutari)}</strong> tutarında idari para cezası kesilmiş ve aşağıdaki adı soyadı ve imzaları bulunan heyet huzurunda tarafınıza tebliğ edilmiştir.
            </p>
            <p style={{ margin: '0 0 10px 0', textIndent: '60px' }}>
              Bahse konu idari para cezasını tebliğ tarihinden itibaren 30 gün içinde .............................................................. Malmüdürlüğü / Vergi Dairesine ödemeniz gerekmektedir. Ödemediğiniz takdirde, para cezası 6183 sayılı Amme Alacaklarının Tahsil Usulü Hakkında Kanun hükümlerine göre tahsil edilecektir.
            </p>
            <p style={{ margin: '0 0 10px 0', textIndent: '60px' }}>
              İdari para cezalarına karşı tebliğ tarihinden itibaren en geç 15 gün içerisinde yetkili İdare Mahkemesine itiraz hakkınız bulunmaktadır. İtiraz, verilen bu para cezasının yerine getirilmesini durdurmaz.
            </p>
          </div>

          <table className="print-table">
            <tbody>
              <tr>
                <td rowSpan="2" style={{ width: '20%', fontWeight: 'bold', verticalAlign: 'top', textAlign: 'center' }}>TEBLİĞ EDEN</td>
                <td style={{ width: '40%', padding: '10px', borderRight: 'none' }}>Adı ve Soyadı / Unvanı<br/><br/><strong>{formData.gorevli1Ad || ''}</strong></td>
                <td style={{ width: '40%', padding: '10px', borderLeft: 'none' }}>Adı ve Soyadı / Unvanı<br/><br/><strong>{formData.gorevli2Ad || ''}</strong></td>
              </tr>
              <tr>
                <td style={{ height: '50px', verticalAlign: 'top', padding: '10px', borderRight: 'none' }}>İmza/Mühür</td>
                <td style={{ height: '50px', verticalAlign: 'top', padding: '10px', borderLeft: 'none' }}>İmza/Mühür</td>
              </tr>
              <tr>
                <td rowSpan="2" style={{ fontWeight: 'bold', verticalAlign: 'top' }}>TEBELLÜĞ EDEN*</td>
                <td colSpan="2">Adı ve Soyadı / Unvanı<br/><br/>{formData.kisiTipi === 'Gerçek Kişi' ? formData.adSoyadUnvan : formData.kanuniTemsilciAdSoyad}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ height: '50px', verticalAlign: 'top' }}>İmza</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ height: '60px', verticalAlign: 'top' }}>
                  <span style={{ fontSize: '10px', display: 'block', marginBottom: '4px' }}>İfadesi:</span>
                  <div style={{ fontSize: '12px', whiteSpace: 'pre-wrap', paddingLeft: '8px' }}>{formData.ifade || ''}</div>
                </td>
              </tr>
              <tr>
                <td colSpan="3" style={{ fontSize: '10px', fontStyle: 'italic' }}>
                  * Suçlu tebellüğ etmediği takdirde, bu durum kontrol görevlileri tarafından belirtilerek imzalanacaktır.<br/>
                  Not: İfadenin daha uzun olması halinde başka bir kağıda devam edilecektir.
                </td>
              </tr>
            </tbody>
          </table>

          <table className="print-table" style={{ width: '60%', marginTop: '10px' }}>
            <tbody>
              <tr>
                <td style={{ width: '20%', fontWeight: 'bold' }}>Eki</td>
                <td>
                  İdari Para Cezası Kararı: ( 1 ) adet<br/>
                  Zapt Tutanağı: ( {formData.hasElKoyma ? '1' : '_'} ) adet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        )}

        {/* EK-12 PAGE */}
        {formData.hasElKoyma && (
          <div className="print-page" style={{ pageBreakBefore: 'always' }}>
            <div className="form-header">
              <div style={{ fontSize: '10px', textDecoration: 'underline' }}>{`${selectedCity ? selectedCity + ' Tarım ve Orman İl Müdürlüğü' : '.............. Tarım ve Orman İl Müdürlüğü'} - ${selectedUnit || '................................'}`}</div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>SU ÜRÜNLERİ YÖNETMELİĞİ</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold' }}>EK-12</div>
              <div style={{ width: '200px' }}>
                <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>No:</span> <span>{`${formData.seriNo || ''}-${formData.kararNo || ''}`}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '80px' }}>Tarih:</span> <span>{safeSplit(formData.tarih, '-')}</span></div>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '20px', fontSize: '13px' }}>
              ZAPTETME ( ELKOYMA ) TUTANAĞI
            </div>

            <table className="print-table" style={{ marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>ZAPTEDİLEN SU ÜRÜNLERİ VE İSTİHSAL VASITALARININ</th>
                  <th>Türü</th>
                  <th>Miktarı</th>
                  <th>Özelliği</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: '40px' }}>
                  <td></td>
                  <td>{formData.elKonulanUrun || ''}</td>
                  <td>{formData.elKonulanMiktar || ''}</td>
                  <td>{formData.elKonulanOzellik || ''}</td>
                </tr>
                <tr style={{ height: '40px' }}>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr style={{ height: '40px' }}>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="4">YALNIZ .......................... ( {formData.elKonulanUrun ? '1' : '_'} ) .......................... KALEMDİR.</td>
                </tr>
              </tbody>
            </table>

            <table className="print-table" style={{ marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '25%', fontWeight: 'bold' }}>ZAPTETME GEREKÇESİ</td>
                  <td>
                    1380 sayılı Su Ürünleri Kanunu / Yönetmeliği / ........... Numaralı Sirkülerin <strong>{formData.kanunMaddesi || '...........'}</strong> maddesi hükümlerine aykırı olarak hareket edildiğinden
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>YASAL DAYANAK</td>
                  <td>
                    1380 sayılı Su Ürünleri Kanunu'nun 36/ <strong>{formData.bendi || '.......'}</strong> Bendi / ...........fıkrası
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ padding: '15px 5px', textAlign: 'center' }}>
                    Yukarıda belirtilen su ürünlerine / istihsal vasıtalarına Su Ürünleri Kanununa aykırılık nedeniyle el konulmuştur.
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="print-table">
              <tbody>
                <tr>
                  <td colSpan="3" style={{ width: '70%', fontWeight: 'bold', textAlign: 'center' }}>Teslim Alanlar</td>
                  <td style={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>Teslim Eden</td>
                </tr>
                <tr>
                  <td style={{ width: '15%', fontWeight: 'bold' }}>Adı Soyadı</td>
                  <td style={{ width: '27.5%' }}>{formData.gorevli1Ad || ''}</td>
                  <td style={{ width: '27.5%' }}>{formData.gorevli2Ad || ''}</td>
                  <td rowSpan="3" style={{ verticalAlign: 'top', padding: '5px' }}>
                    <div style={{ paddingBottom: '20px' }}>Adı Soyadı / İmza</div><br/>
                    <div>{formData.kisiTipi === 'Gerçek Kişi' ? formData.adSoyadUnvan : formData.kanuniTemsilciAdSoyad}</div>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Unvanı</td>
                  <td>{formData.gorevli1Gorev || ''}</td>
                  <td>{formData.gorevli2Gorev || ''}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', height: '60px', verticalAlign: 'top' }}>Mühür / İmza</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        </div>
      </div>

      <style>{`
        @media screen {
          .printable-area-container {
            background: #cbd5e1;
            padding: 32px 16px;
            border-radius: 16px;
          }
          .printable-area { 
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 32px;
          }
          .print-page {
             width: 210mm;
             min-height: 297mm;
             background: white;
             padding: 15mm;
             box-shadow: 0 10px 25px rgba(0,0,0,0.2);
             color: black;
             font-family: "Times New Roman", Times, serif; 
             font-size: 12px;
             position: relative;
          }
        }
        @media print {
          @page { size: A4; margin: 15mm; }
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white; color: black; font-family: "Times New Roman", Times, serif; font-size: 12px;
          }
          .print-page { width: 100%; height: 297mm; background: white; }
          .form-header { text-align: center; margin-bottom: 20px; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table th, .print-table td { border: 1px solid black; padding: 6px 8px; vertical-align: middle; }
          .no-print { display: none !important; }
          .printable-area-container { padding: 0 !important; margin: 0 !important; border: none !important; background: transparent !important; }
        }
      `}</style>

      {/* Article Modal */}
      {articleModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={18} color="#4f46e5" /> {articleModal.title}</h3>
              <button onClick={() => setArticleModal({ ...articleModal, isOpen: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, fontSize: '14px', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap', textAlign: 'left' }} className="custom-scrollbar">
              {articleModal.content}
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'right', backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <button onClick={() => setArticleModal({ ...articleModal, isOpen: false })} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormGenerator;
