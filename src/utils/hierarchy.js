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

  // Titles
  if (t.includes('İL MÜDÜRÜ') && !t.includes('YARDIMCISI')) {
    if (t.includes(' V.') || t.includes('VEKİLİ')) return 100;
    return 110;
  }
  if (t.includes('İL MÜDÜR YARDIMCISI') || t.includes('İL MÜDÜRÜ YARDIMCISI')) {
    if (t.includes(' V.') || t.includes('VEKİLİ')) return 80;
    return 90;
  }
  if (t.includes('ŞUBE MÜDÜRÜ') || t.includes('ŞUBE MÜDÜR')) {
    if (t.includes(' V.') || t.includes('VEKİLİ')) return 60;
    return 70;
  }
  if (t.includes('İLÇE MÜDÜRÜ') || t.includes('İLÇE MÜDÜR')) {
    if (t.includes(' V.') || t.includes('VEKİLİ')) return 40;
    return 50;
  }
  if (t.includes('BİRİM SORUMLUSU')) return 30;
  
  if (t && t.trim() !== '' && t !== '-') return 25;

  // Professions
  if (p.includes('MÜHENDİS') || p.includes('VETERİNER') || p.includes('AVUKAT') || p.includes('İNSPEKTÖR') || p.includes('BIYOLOG') || p.includes('BİYOLOG')) return 20;
  if (p.includes('ŞEF') || p.includes('SAYMAN') || p.includes('SİVİL SAVUNMA')) return 15;
  if (p.includes('TEKNİKER')) return 10;
  if (p.includes('TEKNİSYEN')) return 5;
  if (p.includes('MEMUR') || p.includes('VHKİ') || p.includes('BİLG.İŞLETMENİ') || p.includes('BÜRO PERSONELİ')) return 4;
  if (p.includes('İŞÇİ') || p.includes('HİZMETLİ') || p.includes('ŞOFÖR') || p.includes('KOR. GÜV.') || p.includes('BEKÇİ') || p.includes('DESTEK PERSONELİ')) return 2;
  
  return 1;
};

export const sortPersonnelByHierarchy = (personnelList) => {
  return [...personnelList].sort((a, b) => {
    // 1. Birim (Unit) Grubu (İl Müdürlüğü > Şube > İlçe vs)
    const unitA = a.unit || a.birim || a.activeUnit;
    const unitB = b.unit || b.birim || b.activeUnit;
    const titleA = a.title || a.unvan;
    const titleB = b.title || b.unvan;
    
    const groupA = getUnitGroupIndex(unitA, titleA);
    const groupB = getUnitGroupIndex(unitB, titleB);
    
    if (groupA !== groupB) return groupA - groupB;
    
    // Aynı grup içindeyse (örn: iki farklı şube ise) önce şube adına göre diz
    if ((groupA === 2 || groupA === 3) && unitA && unitB) {
      if (unitA !== unitB) return unitA.localeCompare(unitB, 'tr-TR');
    }

    // 2. Unvan ve Meslek Hiyerarşisi
    const profA = a.profession || a.meslek;
    const profB = b.profession || b.meslek;
    const scoreA = getHierarchyScore(titleA, profA);
    const scoreB = getHierarchyScore(titleB, profB);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; 
    }
    
    // 3. Alfabetik (Ad Soyad)
    const nameA = a.name || a.adSoyad || '';
    const nameB = b.name || b.adSoyad || '';
    return nameA.localeCompare(nameB, 'tr-TR');
  });
};