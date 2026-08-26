import sys

with open('src/components/SunumModu.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the exportToPPT function
old_func = """  const exportToPPT = () => {
      let pres = new pptxgen();
      let slide = pres.addSlide();
      slide.addText("Sinop Su Ürünleri Dashboard", { x: 1, y: 1, fontSize: 24, bold: true });
      pres.writeFile({ fileName: "Sinop_Dashboard.pptx" });
  };"""

# Wait, the exact text might have encoding issues with 'Ürünleri' in the file.
# Let's use regex or split to find it.
import re
match = re.search(r'const exportToPPT = \(\) => \{.*?\n\s*\};', text, re.DOTALL)
if match:
    old_func_exact = match.group(0)
else:
    print("Could not find exportToPPT")
    sys.exit(1)

new_func = """  const exportToPPT = () => {
    let pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    // Slide 1: Başlık
    let slide1 = pres.addSlide();
    slide1.background = { color: '0f172a' };
    slide1.addText("SİNOP İLİ SU ÜRÜNLERİ YETİŞTİRİCİLİĞİ", { x: 1, y: 2.5, w: 8, fontSize: 36, bold: true, color: 'ffffff', align: 'center' });
    slide1.addText("SİSTEM ANALİZ RAPORU (DİNAMİK VERİ MOTORU)", { x: 1, y: 3.5, w: 8, fontSize: 24, color: '38bdf8', align: 'center' });

    // Slide 2: Genel Durum (Yönetim Özeti)
    let slide2 = pres.addSlide();
    slide2.background = { color: 'f0f4f8' };
    slide2.addText("GENEL DURUM (YÖNETİM ÖZETİ)", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '1e3a8a' });
    
    let rows2 = [
      [{ text: "AKTİF TESİS", options: { bold: true, fill: '10b981', color: 'ffffff' } }, { text: "TOPLAM KAPASİTE", options: { bold: true, fill: '3b82f6', color: 'ffffff' } }],
      [stats.summary.aktif.toString(), stats.summary.toplamKapasite.toLocaleString('tr-TR') + " Ton/Yıl"],
      [{ text: "FİİLİ ÜRETİM", options: { bold: true, fill: 'f59e0b', color: 'ffffff' } }, { text: "DOLULUK ORANI", options: { bold: true, fill: 'ec4899', color: 'ffffff' } }],
      [stats.summary.toplamMevcutBalik.toLocaleString('tr-TR') + " Ton/Yıl", "%" + ((stats.summary.toplamMevcutBalik / (stats.summary.toplamKapasite || 1)) * 100).toFixed(1)]
    ];
    slide2.addTable(rows2, { x: 0.5, y: 1.5, w: 9, rowH: 0.8, fontSize: 20, align: 'center', border: { type: 'solid', pt: 1, color: 'cccccc' } });

    // Slide 3: Çizelge 51
    let slide3 = pres.addSlide();
    slide3.background = { color: 'f0f4f8' };
    slide3.addText("SU ÜRÜNLERİ ÜRETİM VE YETİŞTİRİCİLİK FAALİYETLERİ", { x: 0.5, y: 0.3, fontSize: 24, bold: true, color: '1e3a8a' });
    
    let rows3 = [
      [{ text: "TESİS TÜRÜ / STATÜ", options: { bold: true, fill: '1e293b', color: 'ffffff' } }, { text: "SAYISI", options: { bold: true, fill: '1e293b', color: 'ffffff' } }, { text: "PROJE KAPASİTESİ (Ton)", options: { bold: true, fill: '1e293b', color: 'ffffff' } }]
    ];
    // Deniz
    rows3.push([{ text: "DENİZ VE BARAJ - FAAL", options: { bold: true, fill: 'e2e8f0' } }, String(stats.cizelge51.deniz.faal.sayi + stats.cizelge51.baraj.faal.sayi), (stats.cizelge51.deniz.faal.kap + stats.cizelge51.baraj.faal.kap).toLocaleString('tr-TR')]);
    rows3.push([{ text: "DENİZ VE BARAJ - ARA VEREN", options: { bold: true, fill: 'e2e8f0' } }, String(stats.cizelge51.deniz.araVeren.sayi + stats.cizelge51.baraj.araVeren.sayi), (stats.cizelge51.deniz.araVeren.kap + stats.cizelge51.baraj.araVeren.kap).toLocaleString('tr-TR')]);
    // Karasal
    rows3.push([{ text: "KARASAL - FAAL", options: { bold: true, fill: 'f1f5f9' } }, String(stats.cizelge51.karasal.faal.sayi), stats.cizelge51.karasal.faal.kap.toLocaleString('tr-TR')]);
    rows3.push([{ text: "KARASAL - ASKIDA", options: { bold: true, fill: 'f1f5f9' } }, String(stats.cizelge51.karasal.araVeren.sayi), stats.cizelge51.karasal.araVeren.kap.toLocaleString('tr-TR')]);
    // Midye
    rows3.push([{ text: "ÇİFT KABUKLU - FAAL", options: { bold: true, fill: 'f8fafc' } }, String(stats.cizelge51.midye.faal.sayi), stats.cizelge51.midye.faal.kap.toLocaleString('tr-TR')]);
    
    slide3.addTable(rows3, { x: 0.5, y: 1.0, w: 9, rowH: 0.5, fontSize: 16, align: 'center', border: { type: 'solid', pt: 1, color: 'cbd5e1' } });

    // Slide 4: En Büyük 10 İşletme
    let slide4 = pres.addSlide();
    slide4.background = { color: 'f0f4f8' };
    slide4.addText("EN BÜYÜK 10 İŞLETME", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '1e3a8a' });
    
    let rows4 = [
      [{ text: "FİRMA ADI", options: { bold: true, fill: '3b82f6', color: 'ffffff' } }, { text: "TÜR", options: { bold: true, fill: '3b82f6', color: 'ffffff' } }, { text: "KAPASİTE (Ton)", options: { bold: true, fill: '3b82f6', color: 'ffffff' } }]
    ];
    stats.topFirmalar.forEach(f => {
       rows4.push([f.firmaAdi, f.tur, f.parsedKapasite.toLocaleString('tr-TR')]);
    });
    slide4.addTable(rows4, { x: 0.5, y: 1.5, w: 9, rowH: 0.4, fontSize: 14, align: 'center', border: { type: 'solid', pt: 1, color: 'e2e8f0' } });

    pres.writeFile({ fileName: "Sinop_Su_Urunleri_Raporu.pptx" });
  };"""

text = text.replace(old_func_exact, new_func)

with open('src/components/SunumModu.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("exportToPPT updated.")
