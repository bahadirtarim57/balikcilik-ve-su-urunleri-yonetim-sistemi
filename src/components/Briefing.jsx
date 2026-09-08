import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Maximize, Minimize, X, Play, Pause, 
  BarChart3, PieChart as PieIcon, TrendingUp, Layers, Activity, 
  Film, Sparkles, Shield, Fish, Award, Eye, EyeOff, Volume2, VolumeX
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const TOTAL_SLIDES = 28;

const SLIDE_TITLES = [
  'Kapak — Sinop İl Tarım ve Orman Müdürlüğü (2026 Antalya)',
  'Sunum İçeriği',
  'Sinop İl Tanıtımı (175 km Sahil Şeridi & Sektörel Yapı)',
  'Kurumsal Yapı ve Vizyon (Personel Dağılımı)',
  'Kontrol Gemisi Varlığı (Kuzey Yıldızı & Kontrol 57)',
  'Görüntüleme Ekipmanları (Hava ve Saha Gözetimi - Drone & Kamera)',
  'Bölgesel Potansiyel ve Mevcut Durum (Üretici ve Tesis Verileri)',
  '1. ve 2. Potansiyel Yetiştiricilik Tesis Alanları (Uydu Haritası)',
  'Sinop Su Ürünleri Yetiştiriciliği Tesis Varlığı (İcmal Tablosu)',
  'Gümüşdoğa Yetiştiricilik Tesisi',
  'Gümüşdoğa Balık Çiftliği Yemleme Dubası (BARCH)',
  'Açık Deniz Kafesleri ve Somon Hasat Operasyonu',
  'Deniz Ağ Kafes Tesisleri (Hava Çekimi)',
  'Uğursun Su Ürünleri Midye Tesisi',
  'Midye Yetiştiriciliği Denetim ve Hasat Görüntüleri',
  'Hasat ve Saha Operasyon Canlı Videosu',
  'Midye Numune Alma ve Hasat İnceleme',
  'Karasal Tabanlı (Deniz Suyu) Yetiştiricilik Mevcut Durumu',
  'Beton Havuzlarda (İç Su) Yetiştiricilik Mevcut Durumu',
  'Boyabat Baraj Gölü Yetiştiricilik Tesis Alanı (Uydu Haritası)',
  'İç Sular Yetiştiriciliği Mevcut Durumu (Saraydüzü Boyabat Baraj Gölü)',
  'Boyabat Baraj Gölü Tesisleri (Hava Çekimi)',
  'Ilgaz Su Ürünleri Yetiştiricilik Tesisi',
  'Su Ürünleri Yetiştiriciliği Üretim Miktarları (2022-2026 Tablosu)',
  'Desteklemeler ve Teşvikler (Su Ürünleri Üretiminin Desteklenmesi)',
  'Eğitim ve Yayım Faaliyetleri (SUBİS & Biyoçeşitlilik)',
  'İç Su Hayalet Ağ Projesi Çalışmaları (Saraydüzü)',
  'Teşekkürler ve Kapanış (İnceburun Feneri)'
];

// --- GRAFİK & İSTATİSTİK VERİLERİ ---
const productionData = [
  { year: '2022', turkSomonu: 17333, alabalik: 186, midye: 0, Toplam: 17519 },
  { year: '2023', turkSomonu: 26631, alabalik: 126, midye: 64, Toplam: 26821 },
  { year: '2024', turkSomonu: 20541, alabalik: 620, midye: 35, Toplam: 21196 },
  { year: '2025', turkSomonu: 34470, alabalik: 612, midye: 148, Toplam: 35230 },
  { year: '2026', turkSomonu: 42609, alabalik: 276, midye: 122, Toplam: 43007 },
];

const facilityData = [
  { name: 'Deniz Ağ Kafes', value: 35, capacity: '70.620 Ton', color: '#3b82f6' },
  { name: 'İç Su Ağ Kafes', value: 8, capacity: '3.450 Ton', color: '#10b981' },
  { name: 'Midye Çiftliği', value: 5, capacity: '4.940 Ton', color: '#f59e0b' },
  { name: 'Karasal / Kuluçka', value: 3, capacity: '40 Milyon Adet', color: '#8b5cf6' },
];

const supportData = [
  { year: '2023', miktar: 6.21, tesis: 21 },
  { year: '2024', miktar: 6.32, tesis: 18 },
  { year: '2025', miktar: 5.02, tesis: 15 },
  { year: '2026', miktar: 7.14, tesis: 20 },
];

export default function Briefing() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSlideHUD, setShowSlideHUD] = useState(false);
  const [showSinopVideoModal, setShowSinopVideoModal] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setSlideIndex((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : 0));
    setShowSlideHUD(false);
  }, []);

  const prevSlide = useCallback(() => {
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : TOTAL_SLIDES - 1));
    setShowSlideHUD(false);
  }, []);

  // Klavye / Kumanda dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSinopVideoModal) {
        if (e.key === 'Escape') setShowSinopVideoModal(false);
        return;
      }

      if (showDashboard) {
        if (e.key === 'Escape') setShowDashboard(false);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setSlideIndex(TOTAL_SLIDES - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setShowDashboard((prev) => !prev);
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowSlideHUD((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          navigate('/');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, showDashboard, navigate]);

  // Fare hareketinde kontrolleri göster / gizle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const isVideoSlide = slideIndex === 15; // 16. Slayt Video Slaytı
  const hasHudGraph = [6, 7, 10, 14, 16, 17, 19, 25].includes(slideIndex);

  // Ekrana tıklayınca bir sonraki slayta geçiş (PowerPoint usulü)
  const handleStageClick = (e) => {
    // Eğer tıklanan öğe buton, video, hud veya link ise doğrudan geçiş yapma
    if (e.target.closest('button') || e.target.closest('video') || e.target.closest('.hud-container') || e.target.closest('.no-advance')) {
      return;
    }
    nextSlide();
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onClick={handleStageClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at 50% 25%, #0f2b48 0%, #081726 50%, #020617 100%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: 'pointer',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.99); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUpHUD {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* --- ANA 16:9 SİNEMATİK SAHNE --- */}
      <div 
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '16px'
        }}
      >
        {/* 16:9 Çerçeve Tutucu */}
        <div
          style={{
            position: 'relative',
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: '16 / 9',
            width: 'calc(100vh * (16 / 9) - 32px)',
            height: 'calc(100vw * (9 / 16) - 32px)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 40px rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isVideoSlide ? (
            /* 16. Slayt: Sinematik Dev Video */
            <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video 
                ref={videoRef}
                src="/images/sunu_2026/video_slide_16.mp4"
                controls
                autoPlay
                loop
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '14px'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '20px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  pointerEvents: 'none'
                }}
              >
                <Film size={16} color="#38bdf8" />
                <span>Türk Somonu Hasat ve Kafes Operasyonları • Saha Canlı Kaydı</span>
              </div>
            </div>
          ) : (
            /* 28 Slaytın Birebir Orijinal HD Görseli */
            <img 
              key={slideIndex}
              src={`/images/sunu_2026/slide_${slideIndex + 1}.png`} 
              alt={SLIDE_TITLES[slideIndex]}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                animation: 'fadeIn 0.25s ease-out'
              }}
            />
          )}

          {/* --- CANLI HUD GRAFİK KATMANI --- */}
          {showSlideHUD && (
            <div 
              className="hud-container"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                bottom: '12px',
                width: '42%',
                background: 'rgba(15, 23, 42, 0.94)',
                backdropFilter: 'blur(16px)',
                borderRadius: '14px',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(59,130,246,0.3)',
                padding: '24px',
                color: '#fff',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animation: 'slideUpHUD 0.3s ease-out',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', pb: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#38bdf8' }}>CANLI VERİ ANALİZİ</h3>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowSlideHUD(false); }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {[14, 17].includes(slideIndex) ? (
                  <>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 10px 0', fontWeight: 600 }}>2022-2026 Somon Üretim Artış Eğrisi (Ton):</p>
                    <div style={{ height: '200px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '8px', fontSize: '12px' }} />
                          <Bar dataKey="turkSomonu" name="Türk Somonu" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : [6, 7, 10, 16].includes(slideIndex) ? (
                  <>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 10px 0', fontWeight: 600 }}>Tesis Sayıları & Proje Kapasiteleri:</p>
                    <div style={{ height: '180px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={facilityData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value">
                            {facilityData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '8px', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px' }}>
                      {facilityData.map((f, i) => (
                        <div key={i} style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }} />
                          <span>{f.name}: <b>{f.value}</b></span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 10px 0', fontWeight: 600 }}>Yıllık Destekleme Ödemeleri (Milyon TL):</p>
                    <div style={{ height: '200px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={supportData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '8px', fontSize: '12px' }} />
                          <Line type="monotone" dataKey="miktar" name="Destek (Milyon TL)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '10px' }}>
                Sinop Balıkçılık ve Su Ürünleri Şube Müdürlüğü • 2026 Antalya
              </div>
            </div>
          )}

          {/* Slayt Üzerinde Parlayan "Canlı Veri Grafiği" Düğmesi */}
          {hasHudGraph && !showSlideHUD && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowSlideHUD(true); }}
              style={{
                position: 'absolute',
                bottom: '18px',
                right: '18px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '30px',
                padding: '8px 18px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 0 20px rgba(56,189,248,0.3)',
                transition: 'all 0.2s',
                zIndex: 40
              }}
              title="Bu slayt için canlı grafikleri göster (H)"
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
              <Activity size={15} color="#38bdf8" />
              <span>Canlı Grafik Analizi</span>
            </button>
          )}
        </div>
      </div>

      {/* --- SOL KENAR KÜÇÜK OKU (DİKEY ORTALI & ZARİF) --- */}
      <button
        className="no-advance"
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        disabled={slideIndex === 0}
        style={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: slideIndex === 0 ? '#475569' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: slideIndex === 0 ? 'not-allowed' : 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
          zIndex: 999999,
          opacity: showControls && slideIndex > 0 ? 0.9 : (showControls ? 0.3 : 0),
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { if (slideIndex > 0) e.currentTarget.style.background = '#1d4ed8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)'; }}
        title="Önceki Slayt (Sol Ok)"
      >
        <ChevronLeft size={24} />
      </button>

      {/* --- SAĞ KENAR KÜÇÜK OKU (DİKEY ORTALI & ZARİF) --- */}
      <button
        className="no-advance"
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        disabled={slideIndex === TOTAL_SLIDES - 1}
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: slideIndex === TOTAL_SLIDES - 1 ? '#475569' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: slideIndex === TOTAL_SLIDES - 1 ? 'not-allowed' : 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
          zIndex: 999999,
          opacity: showControls && slideIndex < TOTAL_SLIDES - 1 ? 0.9 : (showControls ? 0.3 : 0),
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { if (slideIndex < TOTAL_SLIDES - 1) e.currentTarget.style.background = '#1d4ed8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)'; }}
        title="Sonraki Slayt (Sağ Ok / Tıklama)"
      >
        <ChevronRight size={24} />
      </button>

      {/* --- SAĞ ÜST YÖNETİCİ KONTROL KÜMESİ (GLASSMORPHIC) --- */}
      <div 
        className="no-advance"
        style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 999999,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.35s ease',
          pointerEvents: showControls ? 'auto' : 'none'
        }}
      >
        {/* Slayt Sayaç Rozeti */}
        <div 
          style={{
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 800,
            background: 'rgba(15, 23, 42, 0.88)',
            padding: '7px 18px',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ color: '#38bdf8', fontWeight: 900 }}>{slideIndex + 1} / {TOTAL_SLIDES}</span>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ color: '#e2e8f0', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {SLIDE_TITLES[slideIndex]}
          </span>
        </div>

        {/* Sinop Tanıtım Filmi Butonu */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowSinopVideoModal(true); }}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '30px',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '7px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 800,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 25px rgba(2, 132, 199, 0.5)',
            transition: 'all 0.2s'
          }}
          title="Sinop Tanıtım Filmini İzle"
        >
          <Film size={16} color="#38bdf8" />
          <span>Tanıtım Filmi</span>
        </button>

        {/* Dashboard Butonu */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowDashboard(true); }}
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '30px',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '7px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 800,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 25px rgba(29, 78, 216, 0.5)',
            transition: 'all 0.2s'
          }}
          title="İnteraktif Yönetici Dashboard Paneli (D)"
        >
          <BarChart3 size={16} />
          <span>Dashboard</span>
        </button>

        {/* Tam Ekran Butonu */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '50%',
            color: '#ffffff',
            cursor: 'pointer',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
            transition: 'all 0.2s'
          }}
          title={isFullscreen ? 'Tam Ekrandan Çık (F)' : 'Tam Ekran (F)'}
        >
          {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
        </button>

        {/* Kapat / Çıkış Butonu */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (document.fullscreenElement && document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
            navigate('/');
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            color: '#ffffff',
            cursor: 'pointer',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.2s'
          }}
          title="Sunumdan Çık (ESC)"
        >
          <X size={18} />
        </button>
      </div>

      {/* =========================================================================
         TAM EKRAN ULTRA PREMİUM YÖNETİCİ DASHBOARD MODALI
         ========================================================================= */}
      {showDashboard && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(2, 6, 23, 0.96)',
            backdropFilter: 'blur(20px)',
            zIndex: 9999999,
            overflowY: 'auto',
            padding: '30px',
            color: '#fff',
            cursor: 'default'
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', spaceY: '24px' }}>
            
            {/* Dashboard Başlık Çubuğu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', padding: '24px 32px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(30,58,138,0.5)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Fish size={28} color="#fff" />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900 }}>Sinop Balıkçılık ve Su Ürünleri İstatistik Paneli</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#bfdbfe' }}>2026 Antalya Sunumu • Güncel Kapasite ve Üretim İcmalleri</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowDashboard(false)}
                  style={{ background: '#fff', color: '#1e3a8a', border: 'none', borderRadius: '12px', padding: '10px 22px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                >
                  <Play size={16} /> Sunuma Dön
                </button>
              </div>
            </div>

            {/* 4 Ana Metrik Kartı */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '16px', padding: '20px', borderLeft: '5px solid #38bdf8', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Kıyı Şeridi Uzunluğu</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>175 km</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Karadeniz'in en uzun kıyısı</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '16px', padding: '20px', borderLeft: '5px solid #34d399', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Deniz Kafes Kapasitesi</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>70.620 Ton</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>35 Deniz Tesisi (28 Faal)</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '16px', padding: '20px', borderLeft: '5px solid #fbbf24', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>2026 Somon Üretimi</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>42.609 Ton</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Türkiye Üretim Lideri</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '16px', padding: '20px', borderLeft: '5px solid #a78bfa', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Denetim Filosu</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#a78bfa', marginTop: '4px' }}>2 Gemi + 2 Drone</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Kuzey Yıldızı & Kontrol 57</div>
              </div>
            </div>

            {/* Grafikler Alanı */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} /> Yıllara Göre Su Ürünleri Üretimi (Ton)
                </h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '8px', color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="turkSomonu" name="Türk Somonu" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="alabalik" name="Alabalık" fill="#34d399" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="midye" name="Midye" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} /> Tesis Türü Dağılımı
                </h3>
                <div style={{ height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={facilityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                        {facilityData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#34d399', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  {facilityData.map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }} />
                        {f.name}
                      </span>
                      <b>{f.value} Tesis ({f.capacity})</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 28 Slayt Hızlı Atlama Kataloğu */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800, color: '#fff' }}>
                28 Slaytlık Sunum Kataloğuna Hızlı Atlama
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {SLIDE_TITLES.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSlideIndex(idx);
                      setShowDashboard(false);
                    }}
                    style={{
                      background: slideIndex === idx ? '#1d4ed8' : 'rgba(30, 41, 59, 0.6)',
                      border: slideIndex === idx ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      textAlign: 'left',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontWeight: 900, color: '#38bdf8' }}>#{idx + 1}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
         SİNOP İL TANITIM FİLMİ ULTRA HD VİDEO MODALI
         ========================================================================= */}
      {showSinopVideoModal && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(25px)',
            zIndex: 99999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: '#fff',
            cursor: 'default',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Üst Başlık ve Kapat Butonu */}
          <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(2,132,199,0.5)' }}>
                <Film size={22} color="#fff" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Sinop Tanıtım Filmi • Mutluluk Sinop'ta
                  <span style={{ fontSize: '11px', background: '#e11d48', padding: '2px 8px', borderRadius: '10px', color: '#fff', fontWeight: 700 }}>4K ULTRA HD</span>
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Sinop Ticaret ve Sanayi Odası Resmi Tanıtım Prodüksiyonu</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a 
                href="https://www.youtube.com/watch?v=4UpE03DQctg" 
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                YouTube'da Aç
              </a>
              <button 
                onClick={() => setShowSinopVideoModal(false)}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  color: '#fca5a5',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <X size={16} /> Kapat (ESC)
              </button>
            </div>
          </div>

          {/* 16:9 4K YouTube Video Oynatıcı */}
          <div 
            style={{
              width: '100%',
              maxWidth: '1200px',
              aspectRatio: '16 / 9',
              background: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 40px rgba(2, 132, 199, 0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative'
            }}
          >
            <iframe 
              src="https://www.youtube-nocookie.com/embed/4UpE03DQctg?autoplay=1&rel=0&modestbranding=1"
              title="Sinop Tanıtım Filmi - Mutluluk Sinop'ta"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>

          {/* Lokasyon Rozetleri ve Alt Bilgi */}
          <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', maxWidth: '1200px' }}>
            {[
              { name: 'Hamsilos Doğal Fiyordu', color: '#10b981' },
              { name: 'Tarihi Sinop Cezaevi', color: '#f59e0b' },
              { name: 'Karakum Volkanik Kumsalı', color: '#06b6d4' },
              { name: 'Erfelek 28 Şelaleleri', color: '#22c55e' },
              { name: 'İnceburun En Kuzey Uç', color: '#ef4444' },
              { name: 'Gerze (Cittaslow)', color: '#d946ef' },
              { name: 'Boyabat Kalesi & Bazalt', color: '#f59e0b' },
              { name: 'Ayancık Akgöl & İnaltı', color: '#14b8a6' },
              { name: 'Sinop Mantısı & Lezzetler', color: '#f97316' },
              { name: 'Türk Somonu & Mavi Vatan', color: '#38bdf8' }
            ].map((loc, idx) => (
              <span 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${loc.color}55`,
                  color: '#e2e8f0',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: loc.color }} />
                {loc.name}
              </span>
            ))}
          </div>

          {/* Alt Bilgi */}
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            T.C. Sinop Valiliği • Kültür, Turizm ve Balıkçılık Şube Yönetimi Tanıtım Yayını
          </div>
        </div>
      )}

    </div>
  );
}
