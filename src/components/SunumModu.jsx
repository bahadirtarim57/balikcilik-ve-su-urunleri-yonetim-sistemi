import { supabase } from '../supabaseClient';
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Presentation, AlertTriangle, Play, X, Target, Activity, Anchor, Download, Droplets, MapPin, BarChart3, Users, Fish, Layers, Building, PieChart as PieChartIcon } from 'lucide-react';
import pptxgen from "pptxgenjs";

const bgImages = {
    genel_1: ['/images/sinop_1.jpg', '/images/sinop_2.jpg', '/images/sinop_3.jpg'],
    genel_2: ['/images/gerze_1.jpg', '/images/gerze_2.jpg', '/images/gerze_3.jpg'],
    genel_3: ['/images/ayancik_1.jpg', '/images/ayancik_2.jpg', '/images/ayancik_3.jpg'],
    genel_4: ['/images/turkeli_1.jpg', '/images/turkeli_2.jpg', '/images/turkeli_3.jpg'],
    sahil_kapanis: '/images/sinop_3.jpg',
    kafes_deniz: '/images/satellite_sea.jpg',
    baraj: '/images/satellite_dam.jpg',
    karasal: '/images/havuz_pro.jpg',
    midye: '/images/midye_pro.jpg',
    fish_levrek: '/images/fish_levrek.jpg',
    fish_somon: '/images/fish_somon.jpg',
    fish_alabalik: '/images/fish_alabalik.jpg',
    fish_midye: '/images/fish_midye.jpg'
};

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#c084fc', '#ec4899', '#14b8a6', '#f97316'];

const parseNumber = (val) => {
    if (!val) return 0;
    let str = String(val).trim();
    if (str.includes('=')) str = str.split('=').pop().trim();
    if (!/\d/.test(str)) return 0;
    str = str.replace(/[^0-9.,-]/g, '');
    if (str.includes('.') && str.includes(',')) str = str.replace(/\./g, '').replace(',', '.');
    else if (str.includes(',') && !str.includes('.')) str = str.replace(',', '.');
    else if (str.includes('.') && !str.includes(',')) {
        const parts = str.split('.');
        if (parts[parts.length - 1].length === 3) str = str.replace(/\./g, '');
    }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
};

const SunumModu = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [apiData, setApiData] = useState([]);
  const totalSlides = 9;

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase.from('tesisler').select('*');
      if (data) setApiData(data);
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const dataList = apiData || [];

    const summary = { aktif: 0, pasif: 0, iptal: 0, devir: 0, toplamKapasite: 0, toplamMevcutBalik: 0 };
    const deniz = { tesis: 0, projeKafes: 0, mevcutKafes: 0, projeHacim: 0, mevcutHacim: 0, kapasite: 0, fiili: 0 };
    const baraj = { tesis: 0, projeKafes: 0, mevcutKafes: 0, projeHacim: 0, mevcutHacim: 0, kapasite: 0, fiili: 0 };
    const karasal = { tesis: 0, projeHavuz: 0, mevcutHavuz: 0, alan: 0, kapasite: 0, fiili: 0 };
    const midye = { tesis: 0, projeSistem: 0, mevcutSistem: 0, kapasite: 0, fiili: 0 };
    
    const firmaMap = {};
    const ilceMap = {};
    const turMap = {};

    
      const cizelge51 = {
        deniz: { faal: {sayi: 0, kap: 0, fiili: 0}, araVeren: {sayi: 0, kap: 0, fiili: 0}, onIzin: {sayi: 0, kap: 0}, iptal: {sayi: 0, kap: 0} },
        midye: { faal: {sayi: 0, kap: 0, fiili: 0}, araVeren: {sayi: 0, kap: 0, fiili: 0}, onIzin: {sayi: 0, kap: 0}, iptal: {sayi: 0, kap: 0} },
        karasal: { faal: {sayi: 0, kap: 0, fiili: 0}, araVeren: {sayi: 0, kap: 0, fiili: 0}, onIzin: {sayi: 0, kap: 0}, iptal: {sayi: 0, kap: 0} },
        baraj: { faal: {sayi: 0, kap: 0, fiili: 0}, araVeren: {sayi: 0, kap: 0, fiili: 0}, onIzin: {sayi: 0, kap: 0}, iptal: {sayi: 0, kap: 0} }
      };
      
const sumAdet = (list) => Array.isArray(list) ? list.reduce((s, i) => s + (Number(i.adet) || 0), 0) : 0;
    const sumHacim = (list) => Array.isArray(list) ? list.reduce((s, i) => s + (Number(i.hacim) || 0), 0) : 0;
    const sumAlan = (list) => Array.isArray(list) ? list.reduce((s, i) => s + ((Number(i.en)||0)*(Number(i.boy)||0)*(Number(i.adet)||0)), 0) : 0;

    dataList.forEach(t => {
        let status = t.finalStatus || 'Aktif';
        if (status === 'Aktif' || status === 'Kiralama Aşamasında' || status.includes('Kiralama')) summary.aktif++;
        else if (status === 'Pasif') summary.pasif++;
        else if (status === 'İptal' || status.includes('iptal') || status === 'ptal') summary.iptal++;
        else if (status === 'Devredildi' || status.includes('Devir')) summary.devir++;

          let t_tur = t.tur === 'Çift Kabuklu Yetiştiriciliği' ? 'midye' : 
                      t.tur === 'Deniz Yetiştiriciliği' ? 'deniz' :
                      t.tur === 'Karasal Üretim' ? 'karasal' : 
                      t.tur === 'Baraj / Göl Üretimi' ? 'baraj' : 'deniz';
          
          let t_stat = 'faal';
          if (status === 'Pasif') t_stat = 'araVeren';
          else if (status.includes('Ön İzin') || status.includes('Belirsiz') || status.includes('Müracaat')) t_stat = 'onIzin';
          else if (status.includes('İptal') || status.includes('iptal') || status.includes('Devir') || status.includes('ptal')) t_stat = 'iptal';

          let kap_c = parseNumber(t.kapasite);
          let fiili_c = parseNumber(t.fiiliKapasite);
          
          if(cizelge51[t_tur] && cizelge51[t_tur][t_stat]) {
              cizelge51[t_tur][t_stat].sayi += 1;
              cizelge51[t_tur][t_stat].kap += kap_c;
              if (cizelge51[t_tur][t_stat].fiili !== undefined) {
                  cizelge51[t_tur][t_stat].fiili += fiili_c;
              }
          }


        if (status === 'Aktif' || status === 'Kiralama Aşamasında' || status.includes('Kiralama')) {
            let kap = parseNumber(t.kapasite);
            let mevcut = parseNumber(t.fiiliKapasite);
            summary.toplamKapasite += kap;
            summary.toplamMevcutBalik += mevcut;
            
            let isKarasal = t.tur === 'Karasal Üretim';
            let isMidye = t.tur === 'Çift Kabuklu Yetiştiriciliği';
            let isDeniz = t.tur && (t.tur.includes('Deniz') || t.tur === 'Deniz Kafesleri');
            let isBaraj = t.tur && (t.tur.includes('Baraj') || t.tur.includes('Göl'));

            if (!isKarasal && !isMidye && !isDeniz && !isBaraj) isDeniz = true; 
            
            if (isDeniz) {
                deniz.tesis++; deniz.kapasite += kap; deniz.fiili += mevcut;
                deniz.projeKafes += sumAdet(t.projeKafesList) || Number(t.projeKafes) || 0;
                deniz.mevcutKafes += sumAdet(t.mevcutKafesList) || Number(t.mevcutKafes) || 0;
                deniz.projeHacim += sumHacim(t.projeKafesList);
                deniz.mevcutHacim += sumHacim(t.mevcutKafesList);
            } else if (isBaraj) {
                baraj.tesis++; baraj.kapasite += kap; baraj.fiili += mevcut;
                baraj.projeKafes += sumAdet(t.projeKafesList) || Number(t.projeKafes) || 0;
                baraj.mevcutKafes += sumAdet(t.mevcutKafesList) || Number(t.mevcutKafes) || 0;
                baraj.projeHacim += sumHacim(t.projeKafesList);
                baraj.mevcutHacim += sumHacim(t.mevcutKafesList);
            } else if (isKarasal) {
                karasal.tesis++; karasal.kapasite += kap; karasal.fiili += mevcut;
                karasal.projeHavuz += sumAdet(t.projeKafesList) || Number(t.projeKafes) || 0;
                karasal.mevcutHavuz += sumAdet(t.mevcutKafesList) || Number(t.mevcutKafes) || 0;
                karasal.alan += sumAlan(t.projeKafesList);
            } else if (isMidye) {
                midye.tesis++; midye.kapasite += kap; midye.fiili += mevcut;
                midye.projeSistem += sumAdet(t.projeKafesList) || Number(t.projeKafes) || 0;
                midye.mevcutSistem += sumAdet(t.mevcutKafesList) || Number(t.mevcutKafes) || 0;
            }
            
            if (t.ilce && t.ilce !== 'Belirsiz / Diğer' && t.ilce !== 'Belirsiz') {
                ilceMap[t.ilce] = (ilceMap[t.ilce] || 0) + 1;
            }
            if (t.tur) {
                let rTur = t.tur;
                if (rTur.includes("Karasal")) rTur = "Karasal Üretim";
                else if (rTur.includes("Deniz") || rTur.includes("Kafes") && isDeniz) rTur = "Deniz Kafesleri";
                else if (rTur.includes("Baraj") || rTur.includes("Göl")) rTur = "Baraj/Göl Üretimi";
                else if (rTur.includes("Kabuklu") || rTur.includes("Midye")) rTur = "Çift Kabuklu (Midye)";
                turMap[rTur] = (turMap[rTur] || 0) + 1;
            }
            
            let rawFirma = t.firmaAdi || 'Bilinmeyen Firma';
            let fName = rawFirma.replace(/\s*\(.*?\)\s*$/, '').replace(/\s+/g, ' ').trim();
            if (!firmaMap[fName]) firmaMap[fName] = { firmaAdi: fName, tesisSayisi: 0, parsedKapasite: 0, ilces: new Set(), turs: new Set() };
            firmaMap[fName].tesisSayisi += 1;
            firmaMap[fName].parsedKapasite += kap;
            if (t.ilce && t.ilce !== 'Belirsiz') firmaMap[fName].ilces.add(t.ilce);
            if (t.tur) firmaMap[fName].turs.add(t.tur);
        }
    });

    const ilceData = Object.keys(ilceMap).map((k, index) => ({ name: k, value: ilceMap[k], fill: COLORS[index % COLORS.length] })).sort((a,b) => b.value - a.value);
    const turData = Object.keys(turMap).map((k, index) => ({ name: k, value: turMap[k], fill: COLORS[index % COLORS.length] })).sort((a,b) => b.value - a.value);
    
    const topFirmalar = Object.values(firmaMap).map(f => ({
        ...f, ilce: Array.from(f.ilces).join(', '), tur: Array.from(f.turs).join(', ')
    })).sort((a,b) => b.parsedKapasite - a.parsedKapasite).slice(0, 10);

    return { summary, deniz, baraj, karasal, midye, topFirmalar, ilceData, turData, cizelge51 };
  }, [apiData]);

    const exportToPPT = () => {
    let pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    // Slide 1: Başlık
    let slide1 = pres.addSlide();
    slide1.background = { color: '0f172a' };
    const cityName = (localStorage.getItem('app-selectedCity') || 'SİNOP').toUpperCase();
    slide1.addText(`${cityName} İLİ SU ÜRÜNLERİ YETİŞTİRİCİLİĞİ`, { x: 1, y: 3.0, w: 8, fontSize: 36, bold: true, color: 'ffffff', align: 'center' });

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
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (!isFullscreen) return;
        if (e.key === 'ArrowRight' || e.key === 'Space') setSlide(s => Math.min(s + 1, totalSlides));
        if (e.key === 'ArrowLeft') setSlide(s => Math.max(s - 1, 0));
        if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, totalSlides]);

  const StatBox = ({ title, value, subtitle, color, icon }) => (
      <div className="stat-box" style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4))`, padding: '25px', borderRadius: '16px', border: `1px solid ${color}40`, borderLeft: `4px solid ${color}`, boxShadow: `0 10px 30px rgba(0,0,0,0.2)` }}>
          <div className="stat-box-title" style={{ color: color, fontSize: '18px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
             {icon} <span style={{marginLeft: '10px'}}>{title}</span>
          </div>
          <div className="stat-box-value" style={{ color: '#fff', fontSize: '48px', fontWeight: '900', lineHeight: '1.1' }}>{value}</div>
          {subtitle && <div className="stat-box-subtitle" style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>{subtitle}</div>}
      </div>
  );

  const SplitSlide = ({ leftContent, rightImgUrl, fishes }) => (
      <div className="anim-fade-in split-slide-container" style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#020617' }}>
          <div className="anim-slide-left split-slide-left" style={{ width: '55%', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
              {leftContent}
          </div>
          <div className="split-slide-right" style={{ width: '45%', position: 'relative', overflow: 'hidden' }}>
              {Array.isArray(rightImgUrl) ? (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '1fr 1fr', gap: '4px', backgroundColor: '#0f172a', boxShadow: 'inset 20px 0 50px #020617' }}>
                      <div style={{ gridColumn: '1 / -1', backgroundImage: `url(${rightImgUrl[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'zoomIn 1.5s ease-out both' }} />
                      <div style={{ backgroundImage: `url(${rightImgUrl[1]})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'zoomIn 1.5s ease-out 0.2s both' }} />
                      <div style={{ backgroundImage: `url(${rightImgUrl[2]})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'zoomIn 1.5s ease-out 0.4s both' }} />
                  </div>
              ) : (
                  <div className="anim-ken-burns" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${rightImgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'inset 20px 0 50px #020617' }} />
              )}
              {fishes && (
                  <div style={{ position: 'absolute', bottom: '40px', right: '40px', display: 'flex', gap: '20px' }}>
                      {fishes.map((f, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <img src={f.img} alt={f.name} style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }} />
                              <span style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.9)', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px' }}>{f.name}</span>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );

  const FullscreenMode = () => {
    const renderSlideContent = () => {
        if (slide === 0) {
            return <SplitSlide 
                rightImgUrl={[bgImages.kafes_deniz, bgImages.karasal, bgImages.midye]}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '32px', borderBottom: '2px solid #3b82f6', paddingBottom: '15px', marginBottom: '30px', color: '#fff', display: 'flex', alignItems: 'center' }}>
                           <Layers size={36} color="#3b82f6" style={{ marginRight: '15px' }}/>
                           SU ÜRÜNLERİ ÜRETİM VE YETİŞTİRİCİLİK FAALİYETLERİ
                       </h2>
                       
                       <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                           {/* DENİZ TESİSLERİ */}
                           <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                               <h3 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', paddingBottom: '10px' }}>DENİZ & BARAJ TESİSLERİ</h3>
                               <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '15px' }}>
                                   <tbody>
                                       <tr><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}><b>FAAL TESİS</b></td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Sayısı: {stats.cizelge51.deniz.faal.sayi + stats.cizelge51.baraj.faal.sayi}</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Proje: {(stats.cizelge51.deniz.faal.kap + stats.cizelge51.baraj.faal.kap).toLocaleString('tr-TR')} Ton</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Fiili: {(stats.cizelge51.deniz.faal.fiili + stats.cizelge51.baraj.faal.fiili).toLocaleString('tr-TR')} Ton</td></tr>
                                       <tr><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}><b>ÜRETİME ARA VEREN</b></td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Sayısı: {stats.cizelge51.deniz.araVeren.sayi + stats.cizelge51.baraj.araVeren.sayi}</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Proje: {(stats.cizelge51.deniz.araVeren.kap + stats.cizelge51.baraj.araVeren.kap).toLocaleString('tr-TR')} Ton</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Fiili: {(stats.cizelge51.deniz.araVeren.fiili + stats.cizelge51.baraj.araVeren.fiili).toLocaleString('tr-TR')} Ton</td></tr>
                                       <tr><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}><b>MÜRACAAT / ÖN İZİN</b></td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Sayısı: {stats.cizelge51.deniz.onIzin.sayi + stats.cizelge51.baraj.onIzin.sayi}</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Proje: {(stats.cizelge51.deniz.onIzin.kap + stats.cizelge51.baraj.onIzin.kap).toLocaleString('tr-TR')} Ton</td><td></td></tr>
                                       <tr><td style={{padding: '8px'}}><b>İPTAL / DEVİR</b></td><td style={{padding: '8px'}}>Sayısı: {stats.cizelge51.deniz.iptal.sayi + stats.cizelge51.baraj.iptal.sayi}</td><td style={{padding: '8px'}}>Proje: {(stats.cizelge51.deniz.iptal.kap + stats.cizelge51.baraj.iptal.kap).toLocaleString('tr-TR')} Ton</td><td></td></tr>
                                   </tbody>
                               </table>
                           </div>

                           {/* ÇİFT KABUKLU */}
                           <div style={{ background: 'rgba(192, 132, 252, 0.1)', border: '1px solid #c084fc', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                               <h3 style={{ color: '#c084fc', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(192, 132, 252, 0.3)', paddingBottom: '10px' }}>ÇİFT KABUKLU (MİDYE) TESİSLERİ</h3>
                               <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '15px' }}>
                                   <tbody>
                                       <tr><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}><b>FAAL TESİS</b></td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Sayısı: {stats.cizelge51.midye.faal.sayi}</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Proje: {stats.cizelge51.midye.faal.kap.toLocaleString('tr-TR')} Ton</td></tr>
                                       <tr><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}><b>ÜRETİME ARA VEREN</b></td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Sayısı: {stats.cizelge51.midye.araVeren.sayi}</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Proje: {stats.cizelge51.midye.araVeren.kap.toLocaleString('tr-TR')} Ton</td></tr>
                                       <tr><td style={{padding: '8px'}}><b>MÜRACAAT / ÖN İZİN</b></td><td style={{padding: '8px'}}>Sayısı: {stats.cizelge51.midye.onIzin.sayi}</td><td style={{padding: '8px'}}>Proje: {stats.cizelge51.midye.onIzin.kap.toLocaleString('tr-TR')} Ton</td></tr>
                                   </tbody>
                               </table>
                           </div>

                           {/* KARASAL */}
                           <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '12px', padding: '20px' }}>
                               <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '10px' }}>KARASAL TESİSLER</h3>
                               <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '15px' }}>
                                   <tbody>
                                       <tr><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}><b>AÇIK TESİS</b></td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Sayısı: {stats.cizelge51.karasal.faal.sayi}</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Proje: {stats.cizelge51.karasal.faal.kap.toLocaleString('tr-TR')} Ton</td></tr>
                                       <tr><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}><b>BELGESİ ASKIDA</b></td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Sayısı: {stats.cizelge51.karasal.araVeren.sayi}</td><td style={{padding: '8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>Proje: {stats.cizelge51.karasal.araVeren.kap.toLocaleString('tr-TR')} Ton</td></tr>
                                       <tr><td style={{padding: '8px'}}><b>MÜRACAAT</b></td><td style={{padding: '8px'}}>Sayısı: {stats.cizelge51.karasal.onIzin.sayi}</td><td style={{padding: '8px'}}>Proje: {stats.cizelge51.karasal.onIzin.kap.toLocaleString('tr-TR')} Ton</td></tr>
                                   </tbody>
                               </table>
                           </div>
                       </div>
                    </>
                }
            />;
        } else if (slide === 1) {
            return <SplitSlide 
                rightImgUrl={bgImages.genel_1}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '42px', color: '#fff', borderBottom: '2px solid #3b82f6', paddingBottom: '20px', marginBottom: '40px', display:'flex', alignItems:'center' }}>
                           <Activity size={42} style={{marginRight: '20px', color: '#3b82f6'}}/> SU ÜRÜNLERİ ÜRETİM VE KAPASİTE İSTATİSTİKLERİ
                       </h2>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '40px' }}>
                           <StatBox title="AKTİF TESİS" value={stats.summary.aktif} color="#10b981" icon={<Target size={24}/>} />
                           <StatBox title="TOPLAM KAPASİTE" value={stats.summary.toplamKapasite.toLocaleString('tr-TR')} subtitle="Ton / Yıl" color="#3b82f6" icon={<BarChart3 size={24}/>} />
                           <StatBox title="FİİLİ ÜRETİM" value={stats.summary.toplamMevcutBalik.toLocaleString('tr-TR')} subtitle="Ton / Yıl" color="#f59e0b" icon={<Fish size={24}/>} />
                           <StatBox title="DOLULUK ORANI" value={`%${((stats.summary.toplamMevcutBalik / (stats.summary.toplamKapasite || 1)) * 100).toFixed(1)}`} color="#ec4899" icon={<Layers size={24}/>} />
                       </div>
                       <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '16px', borderLeft: '4px solid #38bdf8', fontSize: '20px', lineHeight: '1.6', color: '#cbd5e1' }}>
                          <strong style={{color: '#fff', fontSize: '24px'}}>Sistem Analiz Raporu:</strong> <br/><br/>
                          Sinop il sınırları içerisinde şu anda tam <strong style={{color:'#fff'}}>{stats.summary.aktif} aktif tesis</strong> faaliyet göstermektedir. İlimizin toplam su ürünleri projelendirilmiş üretim kapasitesi <strong style={{color:'#fff'}}>{stats.summary.toplamKapasite.toLocaleString('tr-TR')} ton/yıl</strong> iken, sahadaki güncel denetimlere göre fiili üretim kapasitesi <strong style={{color:'#fff'}}>{stats.summary.toplamMevcutBalik.toLocaleString('tr-TR')} ton/yıl</strong> olarak hesaplanmıştır.
                       </div>
                    </>
                }
            />;
        } else if (slide === 2) {
            return <SplitSlide 
                rightImgUrl={bgImages.genel_2}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '42px', color: '#fff', borderBottom: '2px solid #10b981', paddingBottom: '20px', marginBottom: '40px', display:'flex', alignItems:'center' }}>
                           <PieChartIcon size={42} style={{marginRight: '20px', color: '#10b981'}}/> TESİS TÜRÜ DAĞILIMI
                       </h2>
                       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                               <Pie data={stats.turData} cx="50%" cy="50%" outerRadius={180} innerRadius={100} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} (%${(percent * 100).toFixed(1)})`} labelLine={true} style={{fontSize:'18px', fontWeight:'bold'}}>
                                   {stats.turData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                               </Pie>
                               <Tooltip contentStyle={{backgroundColor:'#0f172a', borderColor:'#334155', color:'#fff', fontSize:'20px'}} itemStyle={{color:'#fff'}} />
                               <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '18px', color:'#cbd5e1'}} />
                             </PieChart>
                           </ResponsiveContainer>
                       </div>
                    </>
                }
            />;
        } else if (slide === 3) {
            return <SplitSlide 
                rightImgUrl={bgImages.genel_3}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '42px', color: '#fff', borderBottom: '2px solid #8b5cf6', paddingBottom: '20px', marginBottom: '40px', display:'flex', alignItems:'center' }}>
                           <BarChart3 size={42} style={{marginRight: '20px', color: '#8b5cf6'}}/> İLÇELER BAZLI TESİS DAĞILIMI
                       </h2>
                       <div style={{ height: '60vh' }}>
                           <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={stats.ilceData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                               <XAxis dataKey="name" stroke="#94a3b8" fontSize={18} tickMargin={15} />
                               <YAxis stroke="#94a3b8" fontSize={18} />
                               <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor:'#0f172a', borderColor:'#334155', color:'#fff', fontSize:'20px'}} />
                               <Bar dataKey="value" radius={[10, 10, 0, 0]} label={{ position: 'top', fill: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                                   {stats.ilceData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                               </Bar>
                             </BarChart>
                           </ResponsiveContainer>
                       </div>
                    </>
                }
            />;
        } else if (slide === 4) {
            return <SplitSlide 
                rightImgUrl={bgImages.kafes_deniz}
                fishes={[{name: 'Deniz Levreği', img: bgImages.fish_levrek}, {name: 'Türk Somonu', img: bgImages.fish_somon}]}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '42px', color: '#fff', borderBottom: '2px solid #38bdf8', paddingBottom: '20px', marginBottom: '40px', display:'flex', alignItems:'center' }}>
                           <Anchor size={42} style={{marginRight: '20px', color: '#38bdf8'}}/> DENİZ KAFESLERİ
                       </h2>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '40px' }}>
                           <StatBox title="KAFES TESİSİ" value={stats.deniz.tesis} color="#38bdf8" icon={<Building size={24}/>} />
                           <StatBox title="PROJE KAFES" value={stats.deniz.projeKafes} subtitle="Adet (Ruhsatlı)" color="#8b5cf6" icon={<Target size={24}/>} />
                           <StatBox title="FİİLİ KAFES" value={stats.deniz.mevcutKafes} subtitle="Adet (Sahada Bulunan)" color="#ef4444" icon={<AlertTriangle size={24}/>} />
                           <StatBox title="TOPLAM HACİM" value={stats.deniz.projeHacim.toLocaleString('tr-TR')} subtitle="Metreküp (mÂ³)" color="#14b8a6" icon={<Droplets size={24}/>} />
                       </div>
                       <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '16px', borderLeft: '4px solid #38bdf8', fontSize: '20px', lineHeight: '1.6', color: '#cbd5e1' }}>
                          <strong style={{color: '#fff', fontSize: '24px'}}>Saha Gözlem Özeti:</strong> <br/><br/>
                          Deniz yüzeylerinde faaliyet gösteren toplam <strong style={{color:'#fff'}}>{stats.deniz.tesis} tesis</strong> bulunmaktadır. Ruhsat projelerinde toplam <strong style={{color:'#fff'}}>{stats.deniz.projeKafes} adet</strong> ağ kafes onaylanmış olup, su üzerindeki fiili denetimlerde toplam <strong style={{color:'#fff'}}>{stats.deniz.mevcutKafes} adet</strong> kafes tespit edilmiştir. Deniz kafeslerinin toplam kapasitesi <strong style={{color:'#fff'}}>{stats.deniz.kapasite.toLocaleString('tr-TR')} ton</strong> olarak tescillenmiştir.
                       </div>
                    </>
                }
            />;
        } else if (slide === 5) {
            return <SplitSlide 
                rightImgUrl={bgImages.baraj}
                fishes={[{name: 'Gökkuşağı Alabalığı', img: bgImages.fish_alabalik}]}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '42px', color: '#fff', borderBottom: '2px solid #2dd4bf', paddingBottom: '20px', marginBottom: '40px', display:'flex', alignItems:'center' }}>
                           <Droplets size={42} style={{marginRight: '20px', color: '#2dd4bf'}}/> BARAJ / İÇSU KAFESLERİ
                       </h2>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '40px' }}>
                           <StatBox title="BARAJ TESİSİ" value={stats.baraj.tesis} color="#2dd4bf" icon={<Building size={24}/>} />
                           <StatBox title="PROJE KAFES" value={stats.baraj.projeKafes} subtitle="Adet (Ruhsatlı)" color="#8b5cf6" icon={<Target size={24}/>} />
                           <StatBox title="FİİLİ KAFES" value={stats.baraj.mevcutKafes} subtitle="Adet (Sahada Bulunan)" color="#ef4444" icon={<AlertTriangle size={24}/>} />
                           <StatBox title="TOPLAM HACİM" value={stats.baraj.projeHacim.toLocaleString('tr-TR')} subtitle="Metreküp (mÂ³)" color="#0ea5e9" icon={<Droplets size={24}/>} />
                       </div>
                       <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '16px', borderLeft: '4px solid #2dd4bf', fontSize: '20px', lineHeight: '1.6', color: '#cbd5e1' }}>
                          <strong style={{color: '#fff', fontSize: '24px'}}>Saha Gözlem Özeti:</strong> <br/><br/>
                          İçsular ve baraj göllerinde yetiştiricilik yapan toplam <strong style={{color:'#fff'}}>{stats.baraj.tesis} tesis</strong> konuşlandırılmıştır. Baraj kafeslerinin toplam mühendislik hacmi muazzam bir şekilde <strong style={{color:'#fff'}}>{stats.baraj.projeHacim.toLocaleString('tr-TR')} mÂ³</strong>'e ulaşmış ve kapasite <strong style={{color:'#fff'}}>{stats.baraj.kapasite.toLocaleString('tr-TR')} ton</strong> olarak kaydedilmiştir.
                       </div>
                    </>
                }
            />;
        } else if (slide === 6) {
            return <SplitSlide 
                rightImgUrl={bgImages.karasal}
                fishes={[{name: 'Porsiyonluk Alabalık', img: bgImages.fish_alabalik}]}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '42px', color: '#fff', borderBottom: '2px solid #10b981', paddingBottom: '20px', marginBottom: '40px', display:'flex', alignItems:'center' }}>
                           <MapPin size={42} style={{marginRight: '20px', color: '#10b981'}}/> KARASAL (HAVUZ) TESİSLERİ
                       </h2>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '40px' }}>
                           <StatBox title="KARASAL TESİS" value={stats.karasal.tesis} color="#10b981" icon={<Building size={24}/>} />
                           <StatBox title="TOPLAM HAVUZ" value={stats.karasal.projeHavuz} subtitle="Adet" color="#fcd34d" icon={<Layers size={24}/>} />
                           <StatBox title="FİİLİ KAPASİTE" value={stats.karasal.fiili.toLocaleString('tr-TR')} subtitle="Ton / Yıl" color="#3b82f6" icon={<Fish size={24}/>} />
                       </div>
                       <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '16px', borderLeft: '4px solid #10b981', fontSize: '20px', lineHeight: '1.6', color: '#cbd5e1' }}>
                          <strong style={{color: '#fff', fontSize: '24px'}}>Saha Gözlem Özeti:</strong> <br/><br/>
                          Karada faaliyet gösteren ve beton/toprak havuz sistemleriyle üretim yapan <strong style={{color:'#fff'}}>{stats.karasal.tesis} tesisimiz</strong> mevcuttur. Sistemlerimizde toplam <strong style={{color:'#fff'}}>{stats.karasal.projeHavuz} adet havuz</strong> altyapısı bulunmakta ve bu tesisler yıllık <strong style={{color:'#fff'}}>{stats.karasal.kapasite.toLocaleString('tr-TR')} ton</strong> yüksek kalite su ürünleri üretim potansiyeline sahiptir.
                       </div>
                    </>
                }
            />;
        } else if (slide === 7) {
            return <SplitSlide 
                rightImgUrl={bgImages.midye}
                fishes={[{name: 'Taze Midye', img: bgImages.fish_midye}]}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '42px', color: '#fff', borderBottom: '2px solid #c084fc', paddingBottom: '20px', marginBottom: '40px', display:'flex', alignItems:'center' }}>
                           <Fish size={42} style={{marginRight: '20px', color: '#c084fc'}}/> ÇİFT KABUKLU (MİDYE)
                       </h2>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '40px' }}>
                           <StatBox title="MİDYE TESİSİ" value={stats.midye.tesis} color="#c084fc" icon={<Anchor size={24}/>} />
                           <StatBox title="LONGLINE/HALAT" value={stats.midye.projeSistem || 'Kayıt Yok'} subtitle="Sistem Adedi" color="#f472b6" icon={<Layers size={24}/>} />
                           <StatBox title="PROJE KAPASİTESİ" value={stats.midye.kapasite.toLocaleString('tr-TR')} subtitle="Ton / Yıl" color="#38bdf8" icon={<Target size={24}/>} />
                       </div>
                       <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '16px', borderLeft: '4px solid #c084fc', fontSize: '20px', lineHeight: '1.6', color: '#cbd5e1' }}>
                          <strong style={{color: '#fff', fontSize: '24px'}}>Saha Gözlem Özeti:</strong> <br/><br/>
                          Bölgede <strong style={{color:'#fff'}}>{stats.midye.tesis} adet çift kabuklu (midye) tesisi</strong> longline ve halat sistemleriyle suları filtreleyerek biyo-üretime katkı sağlamaktadır. Toplam <strong style={{color:'#fff'}}>{stats.midye.projeSistem || 'belirtilmemiş sayıda'} halat/sistem</strong> ağı projelendirilmiş ve <strong style={{color:'#fff'}}>{stats.midye.kapasite.toLocaleString('tr-TR')} ton</strong> üretim hedeflenmektedir.
                       </div>
                    </>
                }
            />;
        } else if (slide === 8) {
            return <SplitSlide 
                rightImgUrl={bgImages.genel_4}
                leftContent={
                    <>
                       <h2 style={{ fontSize: '42px', color: '#fff', borderBottom: '2px solid #f59e0b', paddingBottom: '20px', marginBottom: '40px', display:'flex', alignItems:'center' }}>
                           <Target size={42} style={{marginRight: '20px', color: '#f59e0b'}}/> EN YÜKSEK KAPASİTELİ YATIRIMCILAR
                       </h2>
                       <div style={{ height: '65vh', overflowY: 'auto' }}>
                           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '18px' }}>
                              <thead>
                                 <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)', color: '#94a3b8', textAlign: 'left' }}>
                                    <th style={{ padding: '15px' }}>#</th>
                                    <th style={{ padding: '15px' }}>Firma Adı</th>
                                    <th style={{ padding: '15px' }}>İlçe</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Yıllık Kapasite</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {stats.topFirmalar.map((f, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>
                                       <td style={{ padding: '20px 15px', fontWeight: 'bold', color: '#38bdf8' }}>{i + 1}</td>
                                       <td style={{ padding: '20px 15px', fontWeight: '600' }}>{f.firmaAdi}</td>
                                       <td style={{ padding: '20px 15px', color: '#cbd5e1' }}>{f.ilce}</td>
                                       <td style={{ padding: '20px 15px', textAlign: 'right', color: '#10b981', fontWeight: 'bold', fontSize: '22px' }}>{f.parsedKapasite.toLocaleString('tr-TR')} <span style={{fontSize:'14px', color:'#64748b'}}>TON</span></td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                       </div>
                    </>
                }
            />;
        } else {
            return (
                <div className="anim-fade-in split-slide-container" style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#020617' }}>
                    <div className="anim-slide-left split-slide-left" style={{ width: '55%', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
                        <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#fff', margin: 0, textShadow: '0 0 30px rgba(16,185,129,0.8)', textAlign: 'left', lineHeight: '1.2' }}>İzlediğiniz İçin<br/>Teşekkürler.</h1>
                        
                        <div style={{ display: 'flex', gap: '30px', marginTop: '60px' }}>
                            <div className="anim-slide-up" style={{ animationDelay: '0.3s', flex: 1, height: '250px', backgroundImage: `url('/images/satellite_sea.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                <div style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', height: '100%', width: '100%', borderRadius: '16px', display: 'flex', alignItems: 'flex-end', padding: '20px' }}>
                                    <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>Deniz Kafeslerimiz</span>
                                </div>
                            </div>
                            <div className="anim-slide-up" style={{ animationDelay: '0.5s', flex: 1, height: '250px', backgroundImage: `url('/images/fish_somon.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                <div style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', height: '100%', width: '100%', borderRadius: '16px', display: 'flex', alignItems: 'flex-end', padding: '20px' }}>
                                    <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>Türk Somonu</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="split-slide-right" style={{ width: '45%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                             <div className="anim-ken-burns" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url('/images/sinop_gunbatimi.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'inset 20px 0 50px #020617' }} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                             <div className="anim-ken-burns" style={{ animationDelay: '-10s', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url('/images/sinop_3.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'inset 20px 0 50px #020617' }} />
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#020617', zIndex: 9999, fontFamily: "'Inter', sans-serif", color: '#e2e8f0', userSelect: 'none', overflow: 'hidden' }}>
          
          {/* Navigation touch zones */}
          <div onClick={() => setSlide(s => Math.max(s - 1, 0))} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '30%', zIndex: 101, cursor: 'pointer' }} />
          <div onClick={() => setSlide(s => Math.min(s + 1, totalSlides))} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '70%', zIndex: 101, cursor: 'pointer' }} />
          
          {/* Mobile Nav Buttons */}
          <div className="mobile-nav-buttons" style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '20px', zIndex: 102 }}>
             <button onClick={(e) => { e.stopPropagation(); setSlide(s => Math.max(s - 1, 0)); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '12px 30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: 'bold' }}>Önceki Slayt</button>
             <button onClick={(e) => { e.stopPropagation(); setSlide(s => Math.min(s + 1, totalSlides)); }} style={{ background: 'rgba(56,189,248,0.8)', color: 'white', padding: '12px 30px', borderRadius: '30px', border: 'none', fontSize: '16px', fontWeight: 'bold' }}>Sonraki Slayt</button>
          </div>
          
          {/* Progress Bar & Indicators */}
        <div style={{ position: 'absolute', top: '30px', left: '40px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>
               SLAYT {slide + 1} / {totalSlides + 1}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                {Array.from({length: totalSlides + 1}).map((_, i) => (
                    <div key={i} style={{ width: '30px', height: '4px', backgroundColor: i === slide ? '#38bdf8' : 'rgba(255,255,255,0.2)', borderRadius: '2px', transition: 'all 0.3s ease' }} />
                ))}
            </div>
        </div>

        <button onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }} style={{ position: 'absolute', top: '25px', right: '40px', background: 'rgba(15, 23, 42, 0.8)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 'bold', zIndex: 10000 }}>
            <X size={20} style={{ marginRight: '8px' }} /> Kapat
        </button>
        
        {renderSlideContent()}
        
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f4f8', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {isFullscreen && <FullscreenMode />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
         <div style={{ display: 'flex', alignItems: 'center' }}>
            <Presentation size={48} style={{ marginRight: '20px' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>{(localStorage.getItem('app-selectedCity') || 'SİNOP').toUpperCase()} İLİ SU ÜRÜNLERİ YETİŞTİRİCİLİĞİ</h1>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => { setSlide(0); setIsFullscreen(true); }} style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #38bdf8', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '15px', fontWeight: 'bold', boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>
              <Play size={18} style={{ marginRight: '8px' }} /> Sunumu Başlat
            </button>
            <button onClick={exportToPPT} style={{ background: 'white', color: '#1e3a8a', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '15px', fontWeight: 'bold' }}>
              <Download size={18} style={{ marginRight: '8px' }} /> PowerPoint İndir
            </button>
         </div>
      </div>
      <div style={{ background: 'white', padding: '120px 40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <BarChart3 size={120} color="#f1f5f9" />
      </div>
    </div>
  );
}

export default SunumModu;

