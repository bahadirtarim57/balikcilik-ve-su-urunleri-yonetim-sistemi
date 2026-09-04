export const getUnitGroupIndex = (unit, title) => {
  const u = (title || '').toLowerCase();
  const brm = (unit || '').toLowerCase();
  if (u.includes('il müdürü') || u.includes('müdür yardımcısı') || brm === 'müdürler') return 0;
  if (brm.includes('hukuk')) return 1;
  if (brm.includes('şube')) return 2;
  if (brm.includes('ilçe')) return 3;
  return 4;
};

export const getHierarchyScore = (title, profession) => {
  const t = (title || '').trim().toLocaleUpperCase('tr-TR');
  const p = (profession || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '').toLocaleUpperCase('tr-TR'); 
  const combined = t + ' ' + p;

  // 1. İdari Görevler (Administrative)
  if (t.includes('İL MÜDÜRÜ') && !t.includes('YARDIMCISI')) {
    if (t.includes(' V.') || t.includes('VEKİLİ')) return 1000;
    return 1100;
  }
  if (t.includes('İL MÜDÜR YARDIMCISI') || t.includes('İL MÜDÜRÜ YARDIMCISI')) {
    if (t.includes(' V.') || t.includes('VEKİLİ')) return 800;
    return 900;
  }
  if (t.includes('ŞUBE MÜDÜRÜ') || t.includes('ŞUBE MÜDÜR')) {
    if (t.includes(' V.') || t.includes('VEKİLİ')) return 600;
    return 700;
  }
  if (t.includes('İLÇE MÜDÜRÜ') || t.includes('İLÇE MÜDÜR')) {
    if (t.includes(' V.') || t.includes('VEKİLİ')) return 400;
    return 500;
  }
  if (t.includes('BİRİM SORUMLUSU')) return 300;

  // 2. Mesleki Hiyerarşi (Professional)
  if (combined.includes('MÜHENDİS') || combined.includes('VETERİNER') || combined.includes('AVUKAT') || combined.includes('İNSPEKTÖR') || combined.includes('BIYOLOG') || combined.includes('BİYOLOG')) return 200;
  
  if (combined.includes('ŞEF') || combined.includes('SAYMAN') || combined.includes('SİVİL SAVUNMA')) return 150;
  
  if (combined.includes('TEKNİKER')) return 100;
  
  if (combined.includes('TEKNİSYEN')) return 50;
  
  if (combined.includes('KAPTAN') || combined.includes('GEMİ ADAMI')) return 40;

  if (combined.includes('MEMUR') || combined.includes('VHKİ') || combined.includes('BİLG.İŞLETMENİ') || combined.includes('BÜRO PERSONELİ')) return 30;
  
  if (combined.includes('İŞÇİ') || combined.includes('HİZMETLİ') || combined.includes('ŞOFÖR') || combined.includes('KOR. GÜV.') || combined.includes('BEKÇİ') || combined.includes('DESTEK PERSONELİ')) return 10;
  
  return 1;
};

export const parseSicilYear = (sicil) => {
  if (!sicil) return 9999;
  const str = String(sicil).trim();
  const match = str.match(/^(\d{2,4})/);
  if (match) {
    let year = parseInt(match[1], 10);
    if (year < 100) {
      if (year > 50) {
        year += 1900;
      } else {
        year += 2000;
      }
    }
    return year;
  }
  return 9999;
};

export const sortPersonnelByHierarchy = (personnelList) => {
  return [...personnelList].sort((a, b) => {
    // 1. Birim (Unit) Grubu
    const unitA = a.unit || a.birim || a.activeUnit;
    const unitB = b.unit || b.birim || b.activeUnit;
    const titleA = a.title || a.unvan || a.Görevi;
    const titleB = b.title || b.unvan || b.Görevi;
    
    const groupA = getUnitGroupIndex(unitA, titleA);
    const groupB = getUnitGroupIndex(unitB, titleB);
    
    if (groupA !== groupB) return groupA - groupB;
    
    if ((groupA === 2 || groupA === 3) && unitA && unitB) {
      if (unitA !== unitB) return unitA.localeCompare(unitB, 'tr-TR');
    }

    // 2. Unvan ve Meslek Hiyerarşisi
    const profA = a.profession || a.meslek || a.Unvanı;
    const profB = b.profession || b.meslek || b.Unvanı;
    const scoreA = getHierarchyScore(titleA, profA);
    const scoreB = getHierarchyScore(titleB, profB);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; 
    }
    
    // 3. Kıdem (Sicil Yılı)
    const yearA = parseSicilYear(a.sicil || a["SİCİL NO"]);
    const yearB = parseSicilYear(b.sicil || b["SİCİL NO"]);
    if (yearA !== yearB) {
      return yearA - yearB; 
    }

    // 4. Alfabetik (Ad Soyad)
    const nameA = a.name || a.adSoyad || a["ADI SOYADI"] || '';
    const nameB = b.name || b.adSoyad || b["ADI SOYADI"] || '';
    return nameA.localeCompare(nameB, 'tr-TR');
  });
};
