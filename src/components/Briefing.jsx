import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Anchor, Ship, Users, Camera, TrendingUp, Award, Activity, ChevronLeft, ChevronRight, Play, X, Fish, Building, Shield, BookOpen, Layers } from 'lucide-react';

const TOTAL_SLIDES = 9;

const productionData = [
  { year: '2022', ton: 17519 },
  { year: '2023', ton: 26821 },
  { year: '2024', ton: 21196 },
  { year: '2025', ton: 35230 },
  { year: '2026', ton: 43007 },
];

const supportData = [
  { year: '2023', miktar: 6.21, tesis: 21 },
  { year: '2024', miktar: 6.32, tesis: 18 },
  { year: '2025', miktar: 5.02, tesis: 15 },
  { year: '2026', miktar: 7.14, tesis: 20 },
];

const StatBox = ({ title, value, subtitle, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '14px', border: '1px solid ' + color + '40', borderLeft: '4px solid ' + color, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
    <div style={{ color: color, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{title}</div>
    <div style={{ color: '#fff', fontSize: '40px', fontWeight: 900, lineHeight: 1.1 }}>{value}</div>
    {subtitle && <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>{subtitle}</div>}
  </div>
);

const SplitSlide = ({ leftContent, rightContent }) => (
  <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#020617', animation: 'fadeIn 0.5s ease-out' }}>
    <div style={{ width: '55%', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
      {leftContent}
    </div>
    <div style={{ width: '45%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
      {rightContent}
    </div>
  </div>
);

const FullSlide = ({ children, bg }) => (
  <div style={{ height: '100vh', width: '100vw', backgroundColor: bg || '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', animation: 'fadeIn 0.5s ease-out' }}>
    {children}
  </div>
);

export default function Briefing() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const handleKey = (e) => {
      if (!isFullscreen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') setSlide(s => Math.min(s + 1, TOTAL_SLIDES - 1));
      if (e.key === 'ArrowLeft') setSlide(s => Math.max(s - 1, 0));
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  const renderSlide = () => {
    // Slayt 0: Kapak
    if (slide === 0) return (
      <FullSlide bg="#0a0e1a">
        <div style={{ textAlign: 'center', maxWidth: '900px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <Anchor size={64} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '16px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '20px' }}>
            T.C. TARIM VE ORMAN BAKANLIĞI — SİNOP İL MÜDÜRLÜĞÜ
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#fff', lineHeight: 1.15, margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>
            Mavi Vatanın<br />
            <span style={{ color: '#38bdf8' }}>Kuzeydeki Kalbi</span>
          </h1>
          <p style={{ fontSize: '22px', color: '#94a3b8', fontWeight: 400, marginBottom: '50px', lineHeight: 1.6 }}>
            Balıkçılık ve Su Ürünleri Şubesi — 2026 Kurumsal Brifing
          </p>
          <div style={{ display: 'inline-block', background: '#1e293b', padding: '12px 28px', borderRadius: '50px', border: '1px solid #334155', color: '#64748b', fontSize: '14px' }}>
            Türk Somonu Üretiminde Türkiye'nin Tartışmasız Lideri
          </div>
        </div>
      </FullSlide>
    );

    // Slayt 1: İçerik
    if (slide === 1) return (
      <SplitSlide
        leftContent={
          <>
            <h2 style={{ fontSize: '36px', color: '#fff', borderBottom: '2px solid #3b82f6', paddingBottom: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <BookOpen size={36} color="#3b82f6" /> Sunum İçeriği
            </h2>
            {[
              'Kurumsal Yapı ve Misyon / Vizyon',
              'Bölgesel Potansiyel ve Mevcut Durum',
              'Tesis Varlığı ve Denetim Filosu',
              'Üretim Verileri ve Tür Çeşitliliği',
              'Desteklemeler ve Teşvikler',
              'Eğitim ve Yayım Faaliyetleri',
              'Karşılaşılan Sorunlar ve Çözüm Önerileri',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', marginBottom: '12px', background: 'rgba(59,130,246,0.08)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <div style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>{i + 1}</div>
                <span style={{ color: '#cbd5e1', fontSize: '17px' }}>{item}</span>
              </div>
            ))}
          </>
        }
        rightContent={
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Fish size={120} color="#1e40af" opacity={0.3} />
            <div style={{ marginTop: '30px', color: '#334155', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Balıkçılık ve Su Ürünleri Şube Müdürlüğü</div>
          </div>
        }
      />
    );

    // Slayt 2: Sinop Tanıtım
    if (slide === 2) return (
      <SplitSlide
        leftContent={
          <>
            <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Sinop İl Tanıtımı</div>
            <h2 style={{ fontSize: '40px', color: '#fff', marginBottom: '36px', fontWeight: 800, lineHeight: 1.2 }}>
              Karadeniz'in Su Ürünleri Başkenti
            </h2>
            {[
              { label: 'Sahil Şeridi', value: '175 km', desc: 'En uzun sahil şeridine sahip il', color: '#38bdf8' },
              { label: 'Türk Somonu', value: '1. Sıra', desc: "Türkiye genelinde üretim şampiyonu", color: '#10b981' },
              { label: 'Stratejik Konum', value: 'Kuzey', desc: 'Doğal koylar — kafes yetiştiriciliğine ideal', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', borderLeft: '4px solid ' + item.color }}>
                <div>
                  <div style={{ color: item.color, fontSize: '28px', fontWeight: 900 }}>{item.value}</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>{item.label}</div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </>
        }
        rightContent={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Anchor size={100} color="#1e3a8a" opacity={0.4} />
            <div style={{ marginTop: '40px' }}>
              <div style={{ color: '#334155', fontSize: '80px', fontWeight: 900, lineHeight: 1 }}>175</div>
              <div style={{ color: '#475569', fontSize: '18px' }}>km sahil şeridi</div>
            </div>
          </div>
        }
      />
    );

    // Slayt 3: Kurumsal Yapı
    if (slide === 3) return (
      <SplitSlide
        leftContent={
          <>
            <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Kurumsal Yapı ve Vizyon</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Güçlü Kadro,<br />Kesintisiz Hizmet</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <StatBox title="Merkez Personel" value="17" subtitle="Uzman kadro" color="#3b82f6" />
              <StatBox title="İlçe Personeli" value="8" subtitle="5 ilçede görevli" color="#10b981" />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kadro Dağılımı</div>
              {['1 Şube Müdürü', '9 Su Ürünleri Mühendisi', '1 Balıkçılık Teknolojisi Mühendisi', '2 Veteriner Hekim', '2 Ziraat Mühendisi', '1 Gemi Kaptanı', '1 Memur'].map((p, i) => (
                <div key={i} style={{ color: '#e2e8f0', fontSize: '15px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>• {p}</div>
              ))}
            </div>
          </>
        }
        rightContent={
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Users size={100} color="#1e40af" opacity={0.4} />
            <div style={{ marginTop: '30px', color: '#334155', fontSize: '72px', fontWeight: 900 }}>25</div>
            <div style={{ color: '#475569', fontSize: '18px' }}>Toplam uzman personel</div>
          </div>
        }
      />
    );

    // Slayt 4: Denetim Gücü
    if (slide === 4) return (
      <SplitSlide
        leftContent={
          <>
            <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Denetim ve Kontrol</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Havadan Denize<br />Tam Saha Baskı</h2>
            {[
              { icon: <Ship size={28} color="#3b82f6" />, title: 'KUZEY YILDIZI', desc: '10.50 m — 250 Hp (2 Motor) — Sinop Merkez Aktif', color: '#3b82f6' },
              { icon: <Ship size={28} color="#6366f1" />, title: 'KONTROL 57', desc: '6 m — 100 Hp — İl Müdürlüğü Bahçesi, Hazır', color: '#6366f1' },
              { icon: <Camera size={28} color="#10b981" />, title: '3 Adet Hava Dronu', desc: 'Deniz ve kara denetimlerinde aktif kullanım', color: '#10b981' },
              { icon: <Camera size={28} color="#f59e0b" />, title: 'Saha Fotoğraf Makinesi', desc: '83× Zoom kapasitesi — uzak mesafe tespiti', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', marginBottom: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', borderLeft: '4px solid ' + item.color }}>
                {item.icon}
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </>
        }
        rightContent={
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Shield size={100} color="#1e40af" opacity={0.4} />
            <div style={{ marginTop: '30px' }}>
              <div style={{ color: '#334155', fontSize: '60px', fontWeight: 900 }}>7/24</div>
              <div style={{ color: '#475569', fontSize: '18px' }}>Karadeniz Denetimi</div>
            </div>
          </div>
        }
      />
    );

    // Slayt 5: Sektörel Görünüm
    if (slide === 5) return (
      <SplitSlide
        leftContent={
          <>
            <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Sektörel Genel Görünüm</div>
            <h2 style={{ fontSize: '38px', color: '#fff', marginBottom: '36px', fontWeight: 800 }}>Sinop'un Su Ürünleri<br />Ekosistemi</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <StatBox title="Balıkçı Gemisi" value="428" subtitle="Kayıtlı tekne" color="#3b82f6" />
              <StatBox title="Aktif Balıkçı" value="2.555" subtitle="Lisanslı" color="#10b981" />
              <StatBox title="Yetiştiricilik" value="51" subtitle="Toplam tesis" color="#f59e0b" />
              <StatBox title="Kooperatif" value="11" subtitle="Su ürünleri koop." color="#8b5cf6" />
              <StatBox title="Balıkçı Barınağı" value="5" subtitle="Adet" color="#ec4899" />
              <StatBox title="İşleme Tesisi" value="9" subtitle="Değerlendirme" color="#14b8a6" />
            </div>
          </>
        }
        rightContent={
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Layers size={100} color="#1e40af" opacity={0.4} />
            <div style={{ marginTop: '30px', color: '#334155', fontSize: '72px', fontWeight: 900 }}>51</div>
            <div style={{ color: '#475569', fontSize: '18px' }}>Yetiştiricilik Tesisi</div>
          </div>
        }
      />
    );

    // Slayt 6: Üretim Verileri (Grafik)
    if (slide === 6) return (
      <FullSlide>
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px', textAlign: 'center' }}>Üretim İvmesi</div>
          <h2 style={{ fontSize: '40px', color: '#fff', textAlign: 'center', marginBottom: '40px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <Activity size={40} color="#3b82f6" /> 2022-2026 Üretim Verileri (Ton)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <StatBox title="2022" value="17.519" color="#64748b" />
              <StatBox title="2026" value="43.007" color="#10b981" subtitle="Ton — Tüm Türler" />
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#10b981', fontSize: '30px', fontWeight: 900 }}>+146%</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>4 Yılda Büyüme</div>
              </div>
            </div>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 14 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000) + 'k'} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }}
                    formatter={(value) => [new Intl.NumberFormat('tr-TR').format(value) + ' Ton', 'Toplam Üretim']}
                  />
                  <Line type="monotone" dataKey="ton" name="Toplam" stroke="#3b82f6" strokeWidth={4} dot={{ r: 7, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </FullSlide>
    );

    // Slayt 7: Desteklemeler
    if (slide === 7) return (
      <FullSlide>
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px', textAlign: 'center' }}>Desteklemeler ve Teşvikler</div>
          <h2 style={{ fontSize: '40px', color: '#fff', textAlign: 'center', marginBottom: '40px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <Award size={40} color="#f59e0b" /> Yıllara Göre Destekleme Rakamları
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {supportData.map((d, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px 18px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '20px' }}>{d.year}</div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>{d.miktar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} Milyon TL</div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>{d.tesis} Tesis Desteklendi</div>
                </div>
              ))}
            </div>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supportData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v + 'M'} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#fff' }}
                    formatter={(v) => [v + ' Milyon TL', 'Destek Tutarı']}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="miktar" name="Destek (M TL)" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </FullSlide>
    );

    // Slayt 8: Teşekkürler
    if (slide === 8) return (
      <FullSlide bg="#050d1a">
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <TrendingUp size={80} color="#3b82f6" style={{ marginBottom: '30px' }} />
          <h1 style={{ fontSize: '64px', fontWeight: 900, color: '#fff', margin: '0 0 20px 0', letterSpacing: '-0.02em' }}>
            TEŞEKKÜRLER
          </h1>
          <div style={{ width: '80px', height: '4px', background: '#3b82f6', margin: '0 auto 30px auto', borderRadius: '2px' }} />
          <p style={{ fontSize: '20px', color: '#64748b', lineHeight: 1.8, marginBottom: '50px' }}>
            Balıkçılık ve Su Ürünleri Şube Müdürlüğü<br />
            <span style={{ color: '#475569' }}>Sinop İl Tarım ve Orman Müdürlüğü — 2026</span>
          </p>
          <div style={{ display: 'inline-flex', gap: '12px', padding: '16px 32px', background: 'rgba(59,130,246,0.1)', borderRadius: '50px', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Anchor size={20} color="#3b82f6" />
            <span style={{ color: '#3b82f6', fontWeight: 600 }}>Mavi Vatan — Güvenli Üretim — Sürdürülebilir Gelecek</span>
          </div>
        </div>
      </FullSlide>
    );

    return null;
  };

  if (isFullscreen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#020617', userSelect: 'none' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {renderSlide()}

        {/* Navigation */}
        <div style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15,23,42,0.9)', padding: '10px 24px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
          <button onClick={() => setSlide(s => Math.max(s - 1, 0))} disabled={slide === 0} style={{ background: 'none', border: 'none', cursor: slide === 0 ? 'not-allowed' : 'pointer', color: slide === 0 ? '#334155' : '#94a3b8', padding: '4px', display: 'flex' }}>
            <ChevronLeft size={22} />
          </button>
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === slide ? '#3b82f6' : '#334155', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
          <button onClick={() => setSlide(s => Math.min(s + 1, TOTAL_SLIDES - 1))} disabled={slide === TOTAL_SLIDES - 1} style={{ background: 'none', border: 'none', cursor: slide === TOTAL_SLIDES - 1 ? 'not-allowed' : 'pointer', color: slide === TOTAL_SLIDES - 1 ? '#334155' : '#94a3b8', padding: '4px', display: 'flex' }}>
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Slide Counter */}
        <div style={{ position: 'fixed', top: '20px', right: '80px', color: '#334155', fontSize: '13px', fontWeight: 600 }}>
          {slide + 1} / {TOTAL_SLIDES}
        </div>

        {/* Exit Button */}
        <button onClick={() => setIsFullscreen(false)} style={{ position: 'fixed', top: '16px', right: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', zIndex: 9999 }}>
          <X size={20} />
        </button>
      </div>
    );
  }

  // Normal sayfa görünümü (fullscreen değilken)
  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', borderRadius: '20px', padding: '60px 40px', color: '#fff', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <Anchor size={52} color="#93c5fd" style={{ marginBottom: '20px' }} />
        <div style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Balıkçılık ve Su Ürünleri Şube Müdürlüğü
        </div>
        <h1 style={{ fontSize: '38px', fontWeight: 900, margin: '0 0 16px 0', letterSpacing: '-0.01em' }}>
          Kurumsal Brifing Sunumu
        </h1>
        <p style={{ color: '#bfdbfe', fontSize: '16px', marginBottom: '40px', lineHeight: 1.6 }}>
          Sinop'un su ürünleri potansiyeli, tesis envanteri, denetim gücü ve üretim<br />istatistiklerini kapsayan 2026 vizyon sunumu.
        </p>
        <button
          onClick={() => { setSlide(0); setIsFullscreen(true); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '50px', padding: '16px 36px', fontSize: '17px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(59,130,246,0.4)', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Play size={22} fill="#fff" />
          Sunumu Başlat
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { num: '1', title: 'Kapak', desc: 'Açılış slaydı' },
          { num: '2', title: 'Sunum İçeriği', desc: 'Konu başlıkları' },
          { num: '3', title: 'Sinop Tanıtımı', desc: '175 km sahil şeridi' },
          { num: '4', title: 'Kurumsal Yapı', desc: '25 Uzman personel' },
          { num: '5', title: 'Denetim Filosu', desc: 'Gemi, dron, kamera' },
          { num: '6', title: 'Sektörel Görünüm', desc: '51 Tesis, 428 tekne' },
          { num: '7', title: 'Üretim Verileri', desc: '2022-2026 grafikleri' },
          { num: '8', title: 'Desteklemeler', desc: '7.1M TL (2026)' },
          { num: '9', title: 'Kapanış', desc: 'Teşekkürler' },
        ].map((s, i) => (
          <div key={i} onClick={() => { setSlide(i); setIsFullscreen(true); }} style={{ background: '#fff', borderRadius: '12px', padding: '20px', cursor: 'pointer', border: '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(59,130,246,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#3b82f6', marginBottom: '10px', fontSize: '15px' }}>{s.num}</div>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px', fontSize: '14px' }}>{s.title}</div>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
        💡 Slayta tıklayarak o slayttan başlatabilirsiniz. Tam ekranda → ile ilerleyin, ESC ile çıkın.
      </div>
    </div>
  );
}
