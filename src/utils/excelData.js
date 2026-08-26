// Bu dosya excelData.js scripti tarafindan otomatik uretilmistir.
export const EXCEL_PROVINCE = "Sinop";

export const SUBELER = [
  "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
  "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
  "Çayır, Mera ve Yem Bitkileri Şube Müdürlüğü",
  "Gıda ve Yem Şube Müdürlüğü",
  "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
  "İdari ve Mali İşler Şube Müdürlüğü",
  "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
  "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
  "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü"
];

export const getBranches = () => {
  const stored = localStorage.getItem('systemBranches');
  if (stored) {
    try { 
      const parsed = JSON.parse(stored); 
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  return SUBELER;
};

export const getMinistryName = () => {
  const stored = localStorage.getItem('systemMinistryName');
  if (stored && typeof stored === 'string' && stored.trim() !== '') return stored;
  return 'TARIM VE ORMAN BAKANLIĞI';
};

export const getDefaultSigners = (unitName) => {
  const stored = localStorage.getItem('systemDefaultSigners');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (unitName && parsed[unitName]) {
        return parsed[unitName];
      }
      // Geriye dönük uyumluluk (eski yapı varsa ve unit bazlı değilse)
      if (parsed.duzenleyen && !parsed[unitName]) {
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing systemDefaultSigners", e);
    }
  }
  return {
    duzenleyen: { name: '', title: '' },
    kontrolEden: { name: '', title: '' },
    onaylayan: { name: '', title: '' },
    onaylayan2: { name: '', title: '' },
    onaylayan3: { name: '', title: '' }
  };
};

export const sortPersonnelHierarchy = (personnelArray) => {
  const getRank = (person) => {
    const title = (person.title || '').toLocaleUpperCase('tr-TR');
    const prof = (person.profession || '').toLocaleUpperCase('tr-TR');

    if (title === 'İL MÜDÜRÜ') return 1;
    if (title === 'İL MÜDÜRÜ V.' || title === 'İL MÜDÜR V.') return 2;
    if (title === 'İL MÜDÜR YARDIMCISI') return 3;
    if (title === 'İL MÜDÜR YARDIMCISI V.' || title === 'İL MÜDÜR YARD. V.') return 4;
    if (title.includes('ŞUBE MÜDÜRÜ') || title.includes('İLÇE MÜDÜRÜ') || title.includes('BİRİM MÜDÜRÜ') || title.includes(' MÜDÜRÜ')) {
      if (title.includes(' V.')) return 6;
      return 5;
    }
    if (title.includes('ŞUBE MÜDÜR V.') || title.includes('İLÇE MÜDÜR V.')) return 6;

    const t = prof || title;
    if (t.includes('AVUKAT')) return 7;
    if (t.includes('SAYMAN')) return 8;
    if (t.includes('MÜHENDİS')) return 9;
    if (t.includes('VETERİNER')) return 10;
    if (t.includes('TEKNİKER') && !t.includes('TEKNİSYEN')) return 11;
    if (t.includes('TEKNİSYEN')) return 12;
    return 99;
  };

  return [...personnelArray].sort((a, b) => {
    const rankA = getRank(a);
    const rankB = getRank(b);
    
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    
    // Same rank, sort by sicilNo
    const sicilA = (a.sicil || a.sicilNo || '').toString().trim();
    const sicilB = (b.sicil || b.sicilNo || '').toString().trim();
    
    const numA = parseInt(sicilA, 10);
    const numB = parseInt(sicilB, 10);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    }
    
    const sicilCompare = sicilA.localeCompare(sicilB);
    if (sicilCompare !== 0) return sicilCompare;

    // Fallback to alphabetical sort by name
    const nameA = (a.name || '').toString().trim();
    const nameB = (b.name || '').toString().trim();
    return nameA.localeCompare(nameB, 'tr');
  });
};

export const getPersonnelByUnit = (unitName) => {
  // Basit filter: Sadece PERSONELLER arrayini ve localStorage'daki güncel verileri kontrol et
  let historyData = {};
  try { historyData = JSON.parse(localStorage.getItem('personnelHistoryData') || '{}'); } catch(e) {}
  
  let editedData = {};
  try { editedData = JSON.parse(localStorage.getItem('editedPersonnelData') || '{}'); } catch(e) {}

  let allNames = new Set(PERSONELLER.map(p => p.name));
  Object.keys(editedData).forEach(n => allNames.add(n));
  Object.keys(historyData).forEach(n => allNames.add(n));

  const result = [];
  allNames.forEach(name => {
    const personEdited = editedData[name] || {};
    const personHistory = historyData[name] || [];
    const personBase = PERSONELLER.find(p => p.name === name) || { unit: '', name, title: '', profession: '' };
    
    // Personelin şu anki birimini bul (history varsa en yenisi, yoksa base unit veya edited unit)
    let activeUnit = personEdited.unit || personBase.unit;
    if (personHistory && personHistory.length > 0) {
      const currentRecord = personHistory.find(h => !h.ayrilis);
      if (currentRecord) {
        activeUnit = currentRecord.unit;
      } else {
        activeUnit = null; // Tümü ayrılış tarihli ise, şu an aktif olduğu birim yok.
      }
    }
    
    // Eğer isDeleted true ise atla
    if (personEdited.isDeleted) return;

    if (!unitName || activeUnit === unitName) {
      result.push({
        name: personEdited.name || personBase.name,
        title: personEdited.title || personBase.title,
        profession: personEdited.profession || personBase.profession,
        unit: activeUnit
      });
    }
  });

  return sortPersonnelHierarchy(result);
};


export const PERSONELLER = [
  {
    "unit": "Müdürler",
    "name": "Fatih ÖNLEM",
    "title": "İl Müdürü",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Müdürler",
    "name": "Haci Yusuf PARLAK",
    "title": "İl Müdürü Yardımcısı",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Müdürler",
    "name": "Çiğdem TUNCAY",
    "title": "İl Müdürü Yardımcısı",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Selçuk YİĞİT",
    "title": "Şube Müdür V.",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Alev BİNGÖL ÇELİK",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Ayla BAYKAL",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Bahadır ŞENOĞLU",
    "title": "",
    "profession": "Mühendis",
    "contact": "88-1061"
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Bahar ERBAY",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Damla ÇELİK GÖK",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Dr.Oral DİNLER",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Emine AKKOCA",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Gökhan ZORLU",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "İbrahim TOPAL",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Kamilhan KARAKURT",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Nurdan TEZEL",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gıda ve Yem Şube Müdürlüğü",
    "name": "Pınar KARABEKİR",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Çayır, Mera ve Yem Bitkileri Şube Müdürlüğü",
    "name": "Fatih ÜNSAL",
    "title": "Şube Müdür V.",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Çayır, Mera ve Yem Bitkileri Şube Müdürlüğü",
    "name": "Abdülmecit CANPOLAT",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Çayır, Mera ve Yem Bitkileri Şube Müdürlüğü",
    "name": "Burak DEMİR",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Çayır, Mera ve Yem Bitkileri Şube Müdürlüğü",
    "name": "Ceyhan KÖKDEMİR",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Çayır, Mera ve Yem Bitkileri Şube Müdürlüğü",
    "name": "Ethemcan TEMİZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Çayır, Mera ve Yem Bitkileri Şube Müdürlüğü",
    "name": "Fazilet GÜCÜK",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Çayır, Mera ve Yem Bitkileri Şube Müdürlüğü",
    "name": "Hüseyin UZUNBACAK",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Ümit YILDIRIM",
    "title": "Şube Müdür V.",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Akif ÖZEREN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Alaettin KURT",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Alişan FİL",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Alpaslan YAVUZCAN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Ayşe Turkay YİĞİT",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Bülent YILMAZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Çiğdem Karabulut",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Ersin İNCEKARA",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Gökay ULUTAŞ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Hasan TÜYÜBOZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Kübra EKŞİ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Mustafa Batuhan BAŞ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Nurullah NAMDAR",
    "title": "",
    "profession": "İşci",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "Tayfun KURUOĞLU",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Balıkçılık ve Su Ürünleri Şube Müdürlüğü",
    "name": "UMUT YELESEN",
    "title": "",
    "profession": "Memur",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Hüseyin DALDAL",
    "title": "Şube Müdürü",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Fatih DANACIOĞLU",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Ercan ARSLAN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Rıza Buğrahan ÖNERBAY",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Hatice Ece BAŞ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Özgür ÇAKMAK",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Cem USTAOĞLU",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Ahmet KURUOĞLU",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Sertaç SARIHAN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Cihan KARASU",
    "title": "",
    "profession": "Hizmetli",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Erol ÖZÇELİK",
    "title": "",
    "profession": "Formen",
    "contact": ""
  },
  {
    "unit": "Koordinasyon ve Tarımsal Veriler Şube Müdürlüğü",
    "name": "Dilek BİLİR",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Murat YEMİNİCİ",
    "title": "Şube Müdür V.",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Çetin ŞAHİN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Ferda BIÇAKCI",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Aslıhan YAVUZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Atilla DEMİRCİ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Necat DEMİRBAŞ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "İbrahim ERDOĞAN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Taner YILDIZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Zafer KURT",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Mehmet Akif KAPLAN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Melih MICIK",
    "title": "",
    "profession": "inspektör",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Erdoğan ÖZAYDIN",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Orhan SEZER",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Cem SÖNMEZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Erdal UÇAR",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Bitkisel Üretim ve Bitki Sağlığı Şube Müdürlüğü",
    "name": "Serpil ÖZER",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Faruk ÜRESİN",
    "title": "Şube Müdürü",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Kazım ÜSTÜN",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Günhan ÇELİK",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Erdal ÖZEL",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Özgür CEBECİ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Hüseyin SARÇOĞLU",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Adem KOÇAK",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Hüseyin ​Avni EKŞİ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Hasan Aykut URAL",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Fikret KARADUMAN",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Hikmet ÇOŞKUN",
    "title": "",
    "profession": "Vet.Sağ.Teknikeri",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Serdar GÜLER",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Şaban Suat AYDIN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Emine ÇAKIRTAŞ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "Berker ŞAHİN",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Hayvan Sağlığı ve Yetiştiriciliği Şube Müdürlüğü",
    "name": "İsmail BAŞ",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "Cumaali ÖZCAN",
    "title": "Şube Müdürü",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "İbrahim TUNCAY",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "Melek ÖZTÜRK",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "İlkay ŞANLI",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "Hayri PAKSOYLU",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "Ahmet YALIM",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "Hamdi ÜSTÜN",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "Ramazan DEMİRAL",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "Güneri YAŞAR",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Kırsal Kalkınma ve Örgütlenme Şube Müdürlüğü",
    "name": "Ayhan KALAY",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Hasan Şahin KORKMAZ",
    "title": "Şube Müdür V.",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Samet ÖZYAVUZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Duygu ŞENOĞLU",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Sezgin BOSTANCI",
    "title": "",
    "profession": "Harita Teknikeri",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Mehmet Şükrü AYKUN",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Elif ERCAN",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Fatih YILMAZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Orkun ERGÖZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Tarımsal Altyapı ve Arazi Değerlendirme Şube Müdürlüğü",
    "name": "Nevim YALÇIN",
    "title": "",
    "profession": "İşçi",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Yakup AYAR",
    "title": "Şube Müdürü",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Ahmet YILMAZ",
    "title": "",
    "profession": "​Destek Personeli​",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Birol AYGAN",
    "title": "",
    "profession": "​Kaptan",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Burhan SEZER",
    "title": "",
    "profession": "​Memur",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Cemil KARGA",
    "title": "",
    "profession": "​Destek Personeli​",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Cengiz YILMAZ",
    "title": "",
    "profession": "​Tekniker",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Ceren ÇAKIRCI",
    "title": "",
    "profession": "Destek Personeli​​",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Damla BAYRAK",
    "title": "",
    "profession": "Memur",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Doğan KOCA",
    "title": "",
    "profession": "​VHKİ",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Ender BİLGİCİ",
    "title": "",
    "profession": "Sivil Savunma",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Hakan ADALI",
    "title": "",
    "profession": "​Tekniker",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Hakan Selim YAZICI",
    "title": "",
    "profession": "​Tekniker",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Harun KİZEK",
    "title": "",
    "profession": "​Sayman",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Hasan BAYRAK",
    "title": "",
    "profession": "​Kor. Güv. Görevlisi",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Hasan YENER",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Hüseyin TAŞTUTAN",
    "title": "",
    "profession": "​Şoför",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Kadir KARAASLAN",
    "title": "",
    "profession": "​Bekçi",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Kenan KILIÇ",
    "title": "",
    "profession": "Şef",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Merve DEMİRPOLAT",
    "title": "",
    "profession": "​Memur",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Mesut YAŞAR",
    "title": "",
    "profession": "Memur",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Murat ÜNCÜER",
    "title": "",
    "profession": "​Hizmetli",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Mustafa KÖSE",
    "title": "",
    "profession": "​Kor. Güv. Görevlisi",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Mustafa ÖZGEN",
    "title": "",
    "profession": "Şoför",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Mustafa PEKCAN",
    "title": "",
    "profession": "Hizmetli",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Nermin AĞIL",
    "title": "",
    "profession": "​Memur",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Osman URHAN",
    "title": "",
    "profession": "Teknisyen​",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Ömer Özgür BAŞER",
    "title": "",
    "profession": "​Memur",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Ramazan ÇETİN",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Rumeysa Begüm CEYLAN",
    "title": "",
    "profession": "​Destek Personeli​​",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Salih ELVER",
    "title": "",
    "profession": "Şoför",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Samet AZGUN",
    "title": "",
    "profession": "​Memur",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Şazimet DİVARCI",
    "title": "",
    "profession": "​Tekniker",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Şenol KORKMAZ",
    "title": "",
    "profession": "Teknisyen",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Ümit Yaşar GÜNER",
    "title": "",
    "profession": "​VHKİ",
    "contact": ""
  },
  {
    "unit": "İdari ve Mali İşler Şube Müdürlüğü",
    "name": "Zafer KAYA",
    "title": "",
    "profession": "Kor. Güv. Görevlisi",
    "contact": ""
  },
  {
    "unit": "Hukuk Birimi",
    "name": "Bahar İNCE YAŞAR",
    "title": "Avukat",
    "profession": "Avukat",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Yunus ÜNAL",
    "title": "İlçe Müdür V.",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Alim GENÇ",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Ayteki AKYÜZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Derya AKSOY ATLAMAZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Elif IRGIN",
    "title": "",
    "profession": "Memur",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Esra GÜLSEVEN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Hasip ATLAMAZ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Mustafa BAYRAKCI",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Mustafa Emre KAYALI",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Nezaket AKIN",
    "title": "",
    "profession": "Hizmetli",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Osman DURAN",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Selçuk DEMİR",
    "title": "",
    "profession": "Teknisyen",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Selma TURAL",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Ayancık İlçe Müdürlüğü",
    "name": "Selvi Özge KAYALI",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Murat USTA",
    "title": "İlçe Müdürü",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Ahmet EKEN",
    "title": "",
    "profession": "​Destek Personeli (Şoför)",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Ali TEPELİ",
    "title": "",
    "profession": "​İşçi",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Aslıhan KÜÇÜK",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Ayşe İpek ÖZSOY",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Elmas ÖZYARIM KARAYEL",
    "title": "",
    "profession": "​Hizmetli",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Enescan AKSOY",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Ergün TERZİ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Erol KARAKİRAZ",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Fatma Gül AKAR",
    "title": "",
    "profession": "​​Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Gülseren DURMAZ",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Hacere KEMALOĞLU",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Hasan YÜRÜK",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Hilmi ÇELİK",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Hülya DEDE",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Hüseyin Coşkun GÜVEN",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Hüseyin Rahmi SOMUNCU",
    "title": "",
    "profession": "Sağlık Memuru",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "İlksen KARA",
    "title": "",
    "profession": "Büro Personeli",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Mehmet AYDIN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Mustafa TAŞTEKİN",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Mustafa AKKAYA",
    "title": "",
    "profession": "Hizmetli​",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Mustafa YALMAN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Naci DEMİR",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Rüveyda ÖZGEN",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Sabri DEMİRCAN",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Sevda NUR ALAŞ",
    "title": "",
    "profession": "​Büro Personeli",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Taşkın ERKEÇ",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Boyabat İlçe Müdürlüğü",
    "name": "Yunus ÖZDEMİR",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Dikmen İlçe Müdürlüğü",
    "name": "Menderes SAĞLAM",
    "title": "İlçe Müdür V.",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Dikmen İlçe Müdürlüğü",
    "name": "Ali YILDIRIM",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Dikmen İlçe Müdürlüğü",
    "name": "Çiğdem Aydın CEYLAN",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Dikmen İlçe Müdürlüğü",
    "name": "Fatma YILDIRIM",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Dikmen İlçe Müdürlüğü",
    "name": "Hatice Kübra BİLDİRİCİ",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Dikmen İlçe Müdürlüğü",
    "name": "Hüseyin Soner ÇOBANOĞLU",
    "title": "",
    "profession": "Hizmetli",
    "contact": ""
  },
  {
    "unit": "Dikmen İlçe Müdürlüğü",
    "name": "Rabia ÜNAL",
    "title": "",
    "profession": "​Büro Personeli",
    "contact": ""
  },
  {
    "unit": "Dikmen İlçe Müdürlüğü",
    "name": "Ünal ÖKSÜZÖMER",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Recep ÇALIŞKAN",
    "title": "İlçe Müdür V.",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Ahmet TUNÇ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Derya İNAN",
    "title": "",
    "profession": "​​Mühendis",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Kamil EMİN TAŞAN",
    "title": "",
    "profession": "Vet.Teknisyen",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Kemal AYDIN",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Mehmet BULUT​",
    "title": "",
    "profession": "Hizmetli",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Mustafa DEMİREL",
    "title": "",
    "profession": "Teknisyen",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Pelin KANDEMİR",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Recep KALYONCUOĞLU",
    "title": "",
    "profession": "​Tekniker",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Şeref ALTINBAŞ",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Yasin BİLİR",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Durağan İlçe Müdürlüğü",
    "name": "Zekeriya YAŞAR",
    "title": "",
    "profession": "​Memur",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "Hayriye ÖZGÜL DAĞDEVİREN",
    "title": "İlçe Müdürü",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "​Banur YILMAZ",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "Fatih HAVUTCU",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "Fatih TANRIVERDİ",
    "title": "",
    "profession": "​Destek Personeli (Şoför)",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "İbrahim BİLİR",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "İlknur SÖNMEZ",
    "title": "",
    "profession": "Bilg.İşletmeni",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "Nurcan ALTAŞ",
    "title": "",
    "profession": "​Büro Personeli",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "Rıfat KOCATEPE",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "Savaş ÖZDEMİR",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Erfelek İlçe Müdürlüğü",
    "name": "Tuba AVŞAR",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Fatih SAZAK",
    "title": "İlçe Müdür V.",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Abdullah SİPAHİ",
    "title": "",
    "profession": "​Vet.Sağ.Teknisyeni",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Abdullah YÜTÜK",
    "title": "",
    "profession": "​İşçi",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Adem ORAL",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Ahmet BUTAKIN",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Bade SÜREL",
    "title": "",
    "profession": "​Büro Personeli",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Bayram Ali DALMAN",
    "title": "",
    "profession": "​​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Betül KARA",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Burak ÇALIŞICI",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Çağlar EKŞİOĞLU",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Emirhan CİBELİK",
    "title": "",
    "profession": "​Destek Personeli",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Fatma TÜYLÜ",
    "title": "",
    "profession": "​Hizmetli",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Gökhan ERİK",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Güven GEMİCİOĞLU",
    "title": "",
    "profession": "​​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Hakan AYDIN",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Hasan Ferhat KAYA",
    "title": "",
    "profession": "​Hizmetli",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Hatice ERİK",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Hüseyin KARABUT",
    "title": "",
    "profession": "​Teknisyen",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "İrfan BATU",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Kenan YALDIZ",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Mahir Deniz ÇİMEN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Merve KAYA",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Murat ÇELİK",
    "title": "",
    "profession": "​Teknisyen",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Onur MUŞTALI",
    "title": "",
    "profession": "​Vet. Sağ. Teknikeri",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Recep KOÇYİĞİT",
    "title": "",
    "profession": "​Tekniker",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Recep Ragıp ÇELEBİ",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Secep RAGIP ÇELEBİ",
    "title": "",
    "profession": "​Şoför",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Serhat Bilsay ASLAN",
    "title": "",
    "profession": "Mühendis",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Soner BAŞER",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Songül SEME",
    "title": "",
    "profession": "​İşçi",
    "contact": ""
  },
  {
    "unit": "Gerze İlçe Müdürlüğü",
    "name": "Yeşim KALENDER",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Sibel GÜMÜŞTAŞ",
    "title": "İlçe Müdür V.",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Ahmet DUMAN",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Cafer SAVAŞ",
    "title": "",
    "profession": "Şoför",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Ebru ATEŞER",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Esra CANOĞLU",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Fatih KAHRAMAN",
    "title": "",
    "profession": "​Büro Personeli",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Gülveren ÇELİK",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Hatice DEVECİ",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "İsa ÖZSARI",
    "title": "",
    "profession": "Tekniker",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Muhammed Emir AYDIK",
    "title": "",
    "profession": "​ Destek Personeli",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Mustafa GÜLTEKİN",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Saraydüzü İlçe Müdürlüğü",
    "name": "Safer SAVAŞ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Mediha ELMAS",
    "title": "İlçe Müdür V.",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Ecevit YILMAZ",
    "title": "",
    "profession": "Mühendis​",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Erdoğan DEMİREL",
    "title": "",
    "profession": "İşçi",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Fatih AKGÜL",
    "title": "",
    "profession": "​Destek Personeli",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Fatma İLGİN",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Filiz ALATLI",
    "title": "",
    "profession": "​Mühendis",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Muhammet KILIÇ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Onur İlham GÜNDOĞDU",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Şenol ŞENTÜRK",
    "title": "",
    "profession": "İşçi",
    "contact": ""
  },
  {
    "unit": "Türkeli İlçe Müdürlüğü",
    "name": "Ufuk DEVECİ",
    "title": "",
    "profession": "Veteriner",
    "contact": ""
  }
];

export const KONULAR = [
  "GÖREV YERLERİ",
  "8 İlçe ve Merkez dahil köyler"
];
