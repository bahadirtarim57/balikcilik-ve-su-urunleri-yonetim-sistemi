import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Anchor, Ship, Users, Camera, TrendingUp, Award, Activity, ChevronLeft, ChevronRight, Play, X, Fish, Building, Shield, BookOpen, Layers } from 'lucide-react';

const productionData = [
  { year: '2022', 'Türk Somonu': 17333, 'Gökkuşağı Alabalığı': 186, 'Midye': 0, 'Toplam': 17519 },
  { year: '2023', 'Türk Somonu': 26631, 'Gökkuşağı Alabalığı': 126, 'Midye': 64, 'Toplam': 26821 },
  { year: '2024', 'Türk Somonu': 20541, 'Gökkuşağı Alabalığı': 620, 'Midye': 35, 'Toplam': 21196 },
  { year: '2025', 'Türk Somonu': 34470, 'Gökkuşağı Alabalığı': 612, 'Midye': 148, 'Toplam': 35230 },
  { year: '2026', 'Türk Somonu': 42609, 'Gökkuşağı Alabalığı': 276, 'Midye': 122, 'Toplam': 43007 },
];

const supportData = [
  { year: '2023', miktar: 6.211584, tesis: 21 },
  { year: '2024', miktar: 6.325129, tesis: 18 },
  { year: '2025', miktar: 5.025634, tesis: 15 },
  { year: '2026', miktar: 7.142139, tesis: 20 },
];

const StatBox = ({ title, value, subtitle, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '14px', border: '1px solid ' + color + '40', borderLeft: '4px solid ' + color, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
    <div style={{ color: color, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{title}</div>
    <div style={{ color: '#fff', fontSize: '32px', fontWeight: 900, lineHeight: 1.1 }}>{value}</div>
    {subtitle && <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>{subtitle}</div>}
  </div>
);

const SplitSlide = ({ leftContent, rightImgUrls }) => (
  <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#020617', animation: 'fadeIn 0.5s ease-out' }}>
    <div style={{ width: '55%', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
      {leftContent}
    </div>
    <div style={{ width: '45%', position: 'relative', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
      {rightImgUrls && rightImgUrls.length > 1 ? (
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '1fr 1fr', gap: '4px', height: '100%' }}>
              <div style={{ gridColumn: '1 / -1', backgroundImage: 'url(/images/brifing/' + rightImgUrls[0] + ')', backgroundSize: 'cover', backgroundPosition: 'center', animation: 'zoomIn 1.5s ease-out both' }} />
              {rightImgUrls.slice(1).map((url, i) => (
                  <div key={i} style={{ backgroundImage: 'url(/images/brifing/' + url + ')', backgroundSize: 'cover', backgroundPosition: 'center', animation: 'zoomIn 1.5s ease-out ' + (0.2 * (i+1)) + 's both' }} />
              ))}
          </div>
      ) : rightImgUrls && rightImgUrls.length === 1 ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url(/images/brifing/' + rightImgUrls[0] + ')', backgroundSize: 'cover', backgroundPosition: 'center', animation: 'kenBurns 10s ease-out both' }} />
      ) : null}
    </div>
  </div>
);

const FullSlide = ({ children, bgImg }) => (
  <div style={{ 
    height: '100vh', width: '100vw', 
    backgroundColor: '#020617', 
    backgroundImage: bgImg ? 'linear-gradient(rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.85)), url(/images/brifing/' + bgImg + ')' : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', animation: 'fadeIn 0.5s ease-out' 
  }}>
    {children}
  </div>
);

// -----------------------------------------------------------------------------
// SLAYT VERİ DİZİSİ (İstediğiniz kadar ekleyebilirsiniz, sınır yoktur)
// -----------------------------------------------------------------------------
const SLIDES = [
  {
    id: 1, title: 'Kapak', desc: 'Açılış Slaydı',
    render: () => (
      <FullSlide bgImg="image44.jpg">
        <div style={{ textAlign: 'center', maxWidth: '900px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}><Anchor size={64} color="#3b82f6" /></div>
          <div style={{ fontSize: '18px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '20px' }}>
            T.C. TARIM VE ORMAN BAKANLIĞI — SİNOP İL MÜDÜRLÜĞÜ
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: 900, color: '#fff', lineHeight: 1.15, margin: '0 0 24px 0', letterSpacing: '-0.02em', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            Su Ürünleri<br /><span style={{ color: '#38bdf8' }}>Yetiştiricilik Sunumu</span>
          </h1>
          <p style={{ fontSize: '24px', color: '#e2e8f0', fontWeight: 400, marginBottom: '50px', lineHeight: 1.6, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            Balıkçılık ve Su Ürünleri Şubesi — 2026
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(30, 41, 59, 0.8)', padding: '14px 32px', borderRadius: '50px', border: '1px solid #3b82f6', color: '#cbd5e1', fontSize: '16px', backdropFilter: 'blur(10px)' }}>
            Türk Somonu Üretiminde Türkiye'nin Lideri
          </div>
        </div>
      </FullSlide>
    )
  },
  {
    id: 2, title: 'Denetim ve Kontrol', desc: 'Gemi & Dron Filosu',
    render: () => (
      <SplitSlide
        rightImgUrls={['image11.jpeg', 'image10.jpeg', 'image12.jpeg']}
        leftContent={
          <>
            <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Denetim ve Kontrol</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Kontrol Gemisi & Görüntüleme</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.7, marginBottom: '30px' }}>
              İlimiz envanterinde 2 adet su ürünleri kontrol gemisi mevcuttur. Deniz ve iç sularda denetim ve kontrol amacıyla kullanılmaktadır.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <StatBox title="KUZEY YILDIZI" value="10.50m" subtitle="250 Hp (2 Motor) - Aktif" color="#3b82f6" />
                <StatBox title="KONTROL 57" value="6m" subtitle="100 Hp (1 Motor) - Aktif" color="#6366f1" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <Camera size={28} color="#10b981" />
                  <div><div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>3 Adet Hava Dronu</div><div style={{ color: '#64748b', fontSize: '14px' }}>Şubemiz denetimlerinde aktif kullanılmaktadır.</div></div>
                </div>
            </div>
          </>
        }
      />
    )
  },
  {
    id: 3, title: 'Genel Bakış', desc: 'Sektörel İstatistikler',
    render: () => (
      <SplitSlide
        rightImgUrls={['image13.jpg']}
        leftContent={
          <>
            <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Genel Bakış</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Sinop'un Su Ürünleri Sektörü</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
              <StatBox title="Balıkçı Gemisi & Balıkçı" value="428" subtitle="Kayıtlı gemi / 2555 aktif balıkçı" color="#3b82f6" />
              <StatBox title="Yetiştiricilik Tesisi" value="51" subtitle="Tüm tesisler" color="#10b981" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[{l: 'Örgütlenme', v: '11 Su Ürünleri Koop. | 5 Balıkçı Barınağı', c: '#f59e0b'},
                  {l: 'Sanayi Entegrasyonu', v: '5 Balık Unu Fabrikası | 9 İşleme Tesisi', c: '#8b5cf6'}].map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid ' + item.c }}>
                        <div style={{ color: item.c, fontSize: '15px', fontWeight: 600 }}>{item.l}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '15px' }}>{item.v}</div>
                    </div>
                ))}
            </div>
          </>
        }
      />
    )
  },
  {
    id: 4, title: 'Deniz Yetiştiriciliği', desc: 'Kapasite ve Türler',
    render: () => (
      <SplitSlide
        rightImgUrls={['image25.png', 'image23.jpeg', 'image24.jpeg']}
        leftContent={
          <>
            <div style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Deniz Yetiştiriciliği</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Mevcut Durum ve Potansiyel</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <div style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '8px' }}>İşletme Sayısı ve Ana Türler</div>
                  <div style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.6 }}>Denizlerde toplam <b>35</b> yetiştiricilik tesisi mevcuttur (28 faal). Ana türler: <b>Türk Somonu, Levrek, Midye</b>.</div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '8px' }}>Kapasite Bilgileri</div>
                  <div style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.6 }}>Proje: 67.000 ton/yıl Somon, 15.600 ton/yıl Levrek.<br/>Fiili: 31.792 ton/yıl Somon, 10.600 ton/yıl Levrek.</div>
              </div>
            </div>
          </>
        }
      />
    )
  },
  {
    id: 5, title: 'İç Sular Yetiştiriciliği', desc: 'Baraj Gölleri',
    render: () => (
      <SplitSlide
        rightImgUrls={['image29.png', 'image27.jpeg', 'image28.jpeg']}
        leftContent={
          <>
            <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>İç Sular Yetiştiriciliği</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Boyabat Baraj Gölü</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '8px' }}>İşletme Sayısı ve Türler</div>
                  <div style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.6 }}>İç sularda faaliyet gösteren <b>8</b> yetiştiricilik tesisi mevcuttur. Ana tür: <b>Gökkuşağı Alabalığı</b>.</div>
              </div>
            </div>
          </>
        }
      />
    )
  },
  {
    id: 6, title: 'Karasal Yetiştiricilik', desc: 'Kuluçkahaneler',
    render: () => (
      <SplitSlide
        rightImgUrls={['image30.jpeg', 'image31.jpeg']}
        leftContent={
          <>
            <div style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Karasal Yetiştiricilik</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Tesis Varlığı ve Türler</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(245,158,11,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '8px' }}>İşletme Sayısı</div>
                  <div style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.6 }}>Karada faaliyet gösteren <b>3</b> yetiştiricilik tesisi mevcuttur.</div>
              </div>
              <div style={{ background: 'rgba(139,92,246,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <div style={{ color: '#a78bfa', fontWeight: 700, marginBottom: '8px' }}>Kapasite Bilgileri</div>
                  <div style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.6 }}><b>60.500.000 adet/yıl</b> kuluçkahane kapasitesi mevcuttur.</div>
              </div>
            </div>
          </>
        }
      />
    )
  },
  {
    id: 7, title: 'Üretim İstatistikleri', desc: 'Türlere Göre Üretim',
    render: () => (
      <FullSlide>
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px', textAlign: 'center' }}>Üretim İstatistikleri</div>
          <h2 style={{ fontSize: '38px', color: '#fff', textAlign: 'center', marginBottom: '40px', fontWeight: 800 }}>Su Ürünleri Yetiştiriciliği Üretim Miktarları (Ton)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'center' }}>
            <div>
                <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.3)', padding: '20px' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '15px', marginBottom: '10px' }}>5 Yıllık Toplam Üretim:</div>
                    <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Türk Somonu: 141.584 Ton</div>
                    <div style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>Genel Toplam: 143.773 Ton</div>
                </div>
            </div>
            <div style={{ height: '400px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 14 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000) + 'k'} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }} formatter={(value, name) => [new Intl.NumberFormat('tr-TR').format(value) + ' Ton', name]} />
                  <Line type="monotone" dataKey="Türk Somonu" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Toplam" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </FullSlide>
    )
  },
  {
    id: 8, title: 'Desteklemeler', desc: 'Yıllara Göre Destekler',
    render: () => (
      <SplitSlide
        rightImgUrls={['image39.jpeg']}
        leftContent={
          <>
            <div style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Teşvikler</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Su Ürünleri Üretiminin Desteklenmesi</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {supportData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px 24px', borderLeft: '4px solid #f59e0b' }}>
                  <div><div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '24px' }}>{d.year}</div><div style={{ color: '#94a3b8', fontSize: '14px' }}>{d.tesis} Tesis</div></div>
                  <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>{d.miktar.toLocaleString('tr-TR', { minimumFractionDigits: 6 })} TL</div>
                </div>
              ))}
            </div>
          </>
        }
      />
    )
  },
  {
    id: 9, title: 'Kapanış', desc: 'Teşekkürler',
    render: () => (
      <FullSlide bgImg="image44.jpg">
        <div style={{ textAlign: 'center', maxWidth: '800px', background: 'rgba(2, 6, 23, 0.6)', padding: '60px', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <TrendingUp size={80} color="#3b82f6" style={{ marginBottom: '30px' }} />
          <h1 style={{ fontSize: '64px', fontWeight: 900, color: '#fff', margin: '0 0 20px 0', letterSpacing: '-0.02em' }}>TEŞEKKÜRLER</h1>
          <div style={{ width: '80px', height: '4px', background: '#3b82f6', margin: '0 auto 30px auto', borderRadius: '2px' }} />
          <p style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '50px' }}>
            Balıkçılık ve Su Ürünleri Şube Müdürlüğü<br /><span style={{ color: '#94a3b8' }}>Sinop İl Tarım ve Orman Müdürlüğü — 2026</span>
          </p>
        </div>
      </FullSlide>
    )
  }
];
// -----------------------------------------------------------------------------

export default function Briefing() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const TOTAL = SLIDES.length;

  useEffect(() => {
    const handleKey = (e) => {
      if (!isFullscreen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') setSlideIndex(s => Math.min(s + 1, TOTAL - 1));
      if (e.key === 'ArrowLeft') setSlideIndex(s => Math.max(s - 1, 0));
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen, TOTAL]);

  if (isFullscreen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#020617', userSelect: 'none' }}>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes zoomIn { from { transform: scale(1.1); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes kenBurns { from { transform: scale(1); } to { transform: scale(1.1); } }
        `}</style>
        
        {SLIDES[slideIndex].render()}

        {/* Navigation */}
        <div style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15,23,42,0.9)', padding: '10px 24px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
          <button onClick={() => setSlideIndex(s => Math.max(s - 1, 0))} disabled={slideIndex === 0} style={{ background: 'none', border: 'none', cursor: slideIndex === 0 ? 'not-allowed' : 'pointer', color: slideIndex === 0 ? '#334155' : '#94a3b8', padding: '4px', display: 'flex' }}>
            <ChevronLeft size={22} />
          </button>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlideIndex(i)} style={{ width: i === slideIndex ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === slideIndex ? '#3b82f6' : '#334155', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
          <button onClick={() => setSlideIndex(s => Math.min(s + 1, TOTAL - 1))} disabled={slideIndex === TOTAL - 1} style={{ background: 'none', border: 'none', cursor: slideIndex === TOTAL - 1 ? 'not-allowed' : 'pointer', color: slideIndex === TOTAL - 1 ? '#334155' : '#94a3b8', padding: '4px', display: 'flex' }}>
            <ChevronRight size={22} />
          </button>
        </div>

        <div style={{ position: 'fixed', top: '20px', right: '80px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '12px' }}>
          {slideIndex + 1} / {TOTAL}
        </div>

        <button onClick={() => setIsFullscreen(false)} style={{ position: 'fixed', top: '16px', right: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', zIndex: 9999, transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', borderRadius: '20px', padding: '60px 40px', color: '#fff', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <Anchor size={52} color="#93c5fd" style={{ marginBottom: '20px' }} />
        <div style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>Balıkçılık ve Su Ürünleri Şube Müdürlüğü</div>
        <h1 style={{ fontSize: '38px', fontWeight: 900, margin: '0 0 16px 0', letterSpacing: '-0.01em' }}>2026 Yetiştiricilik Sunumu</h1>
        <p style={{ color: '#bfdbfe', fontSize: '16px', marginBottom: '40px', lineHeight: 1.6 }}>Orijinal sunum metinleri ve görselleriyle zenginleştirilmiş tam ekran sunum modülü.</p>
        <button
          onClick={() => { setSlideIndex(0); setIsFullscreen(true); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '50px', padding: '16px 36px', fontSize: '17px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(59,130,246,0.4)', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Play size={22} fill="#fff" />
          Sunumu Başlat
        </button>
      </div>
      
      {/* DINAMIK KARTLAR (SLIDES dizisindeki eleman sayisi kadar kart üretilir) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {SLIDES.map((s, i) => (
          <div key={i} onClick={() => { setSlideIndex(i); setIsFullscreen(true); }} style={{ background: '#fff', borderRadius: '12px', padding: '20px', cursor: 'pointer', border: '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(59,130,246,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#3b82f6', marginBottom: '10px', fontSize: '15px' }}>{i + 1}</div>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px', fontSize: '14px' }}>{s.title}</div>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
