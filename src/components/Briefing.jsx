import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Anchor, Fish, Ship, Users, Zap, MapPin, Building, Camera, ShieldCheck, TrendingUp, Award, Activity } from 'lucide-react';

const productionData = [
  { year: '2022', turkSomonu: 17333, alabalik: 186, midye: 0, toplam: 17519 },
  { year: '2023', turkSomonu: 26631, alabalik: 126, midye: 64, toplam: 26821 },
  { year: '2024', turkSomonu: 20541, alabalik: 620, midye: 35, toplam: 21196 },
  { year: '2025', turkSomonu: 34470, alabalik: 612, midye: 148, toplam: 35230 },
  { year: '2026', turkSomonu: 42609, alabalik: 276, midye: 122, toplam: 43007 },
];

const facilityData = [
  { name: 'Deniz Ağ Kafes', value: 35, color: '#3b82f6' },
  { name: 'İç Su Ağ Kafes', value: 8, color: '#10b981' },
  { name: 'Midye', value: 5, color: '#f59e0b' },
  { name: 'Karasal', value: 3, color: '#8b5cf6' },
];

const supportData = [
  { year: '2023', miktar: 6.21, tesis: 21 },
  { year: '2024', miktar: 6.32, tesis: 18 },
  { year: '2025', miktar: 5.02, tesis: 15 },
  { year: '2026', miktar: 7.14, tesis: 20 },
];

const CustomCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', borderLeft: '4px solid ' + color, transition: 'transform 0.2s', cursor: 'pointer' }}
       onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
       onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{title}</p>
        <h3 style={{ color: '#1e293b', fontSize: '28px', fontWeight: 800, margin: 0 }}>{value}</h3>
        {subtitle && <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px', fontWeight: 500 }}>{subtitle}</p>}
      </div>
      <div style={{ background: color + '15', padding: '12px', borderRadius: '12px' }}>
        <Icon size={24} color={color} />
      </div>
    </div>
  </div>
);

export default function Briefing() {
  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '32px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Anchor size={32} color="#93c5fd" />
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>Mavi Vatanın Kuzeydeki Kalbi: Sinop</h1>
          </div>
          <p style={{ margin: 0, fontSize: '16px', color: '#bfdbfe', maxWidth: '600px', lineHeight: '1.6' }}>
            Türkiye'nin somon üretimindeki tartışmasız lideri. 175 km sahil şeridi, eşsiz doğal koyları ve son teknoloji denetim filosuyla sürdürülebilir su ürünleri yönetim merkezi.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>2026 Vizyon Raporu</div>
          <div style={{ fontSize: '42px', fontWeight: 900, color: '#fff', marginTop: '4px' }}>%100</div>
          <div style={{ fontSize: '14px', color: '#bfdbfe' }}>Kayıtlı & Denetimli Üretim</div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <CustomCard title="Toplam Üretim (2026)" value="43.007 Ton" icon={TrendingUp} color="#3b82f6" subtitle="Tüm türler bazında" />
        <CustomCard title="Türk Somonu" value="42.609 Ton" icon={Fish} color="#10b981" subtitle="Türkiye Lideri!" />
        <CustomCard title="Yetiştiricilik Tesisi" value="51 Adet" icon={Building} color="#f59e0b" subtitle="Deniz, İç Su, Midye, Karasal" />
        <CustomCard title="Balıkçı Gemisi" value="428 Adet" icon={Ship} color="#8b5cf6" subtitle="2.555 Aktif Balıkçı" />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Line Chart: Production Growth */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#3b82f6" /> 2022-2026 Üretim İvmesi (Ton)
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => (val / 1000) + 'k'} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => new Intl.NumberFormat('tr-TR').format(value) + ' Ton'}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="turkSomonu" name="Türk Somonu" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="alabalik" name="Alabalık" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="midye" name="Midye" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Facility Types */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="#8b5cf6" /> Tesis Dağılımı
          </h3>
          <div style={{ height: '250px', flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={facilityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {facilityData.map((entry, index) => (
                    <Cell key={'cell-' + index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value + ' Tesis', 'Sayı']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {facilityData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Fleet & Subsidies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Fleet & Team */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#10b981" /> Denetim ve Kontrol Gücümüz
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#3b82f6', padding: '12px', borderRadius: '8px', color: '#fff' }}><Ship size={24} /></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>KUZEY YILDIZI (Kontrol Gemisi)</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>10.50 Metre, 250 Hp (2 Adet Motor), Sinop Merkez B.B. Aktif</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#10b981', padding: '12px', borderRadius: '8px', color: '#fff' }}><Camera size={24} /></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>Hava Filosu ve Görüntüleme</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>3 Adet Hava Dronu, 83x Zoom Kapasiteli Saha Fotoğraf Makinesi</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#f59e0b', padding: '12px', borderRadius: '8px', color: '#fff' }}><Users size={24} /></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>Uzman Kadro</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Merkezde 17, İlçelerde 8 Uzman Personel (Mühendis, Veteriner, Kaptan)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subsidies Bar Chart */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#f59e0b" /> Yetiştiricilik Desteklemeleri (Milyon TL)
          </h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supportData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(v) => '₺' + v + 'M'} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value, name) => {
                    if (name === 'miktar') return [value + ' Milyon TL', 'Destek Tutarı'];
                    return [value, 'Tesis Sayısı'];
                  }}
                />
                <Bar dataKey="miktar" name="Destek Tutarı" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
