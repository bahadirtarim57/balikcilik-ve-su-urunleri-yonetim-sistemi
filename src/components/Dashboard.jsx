import React, { useMemo } from 'react';
import { ShieldAlert, Fish, Clock, AlertOctagon, Anchor, AlertCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ data }) => {
  const navigate = useNavigate();
  
  const stats = useMemo(() => {
    let total = 0;
    let avcilik = 0;
    let yetistiricilik = 0;
    let diger = 0;

    if (Array.isArray(data)) {
      total = data.length;
      avcilik = data.filter(d => d.ana_baslik === 'Avcılık İhlalleri').length;
      yetistiricilik = data.filter(d => d.ana_baslik === 'Yetiştiricilik İhlalleri').length;
      diger = total - avcilik - yetistiricilik;
    }

    return { total, avcilik, yetistiricilik, diger };
  }, [data]);

  return (
    <div className="dashboard-container">
      
      {/* Hero Section */}
      <div className="hero-section glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '32px 40px', background: 'linear-gradient(to right, #ffffff, #f8fafc)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            1380 Sayılı Su Ürünleri Kanunu İhlalleri Veritabanı
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '800px', lineHeight: 1.6 }}>
            Sol menüden ilgili ceza düzenleri incelenebilir, sürekli aramanın kesilmesi nedeni veya kanun maddesine göre arama yapılabilir. Aşağıdaki kartlara tıklayarak doğrudan ilgili kategorinin cezalarını görüntüleyebilirsiniz.
          </p>
        </div>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', padding: '32px 40px' }}>
          
          <div className="stat-card" onClick={() => navigate('/cezalar', { state: { category: 'Tümü' } })} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertCircle size={24} color="#3b82f6" />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Toplam İhlal Maddesi</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{stats.total}</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/cezalar', { state: { category: 'Avcılık İhlalleri' } })} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Anchor size={24} color="#10b981" />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Avcılık İhlalleri</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{stats.avcilik}</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/cezalar', { state: { category: 'Yetiştiricilik İhlalleri' } })} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Fish size={24} color="#f97316" />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Yetiştiricilik İhlalleri</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{stats.yetistiricilik}</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/cezalar', { state: { category: 'Çevre ve Su Kalitesi' } })} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="#8b5cf6" />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Çevre & Diğer İhlaller</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{stats.diger}</div>
          </div>

        </div>
      </div>

      <div className="white-card" style={{ marginTop: '20px', padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={20} color="#dc2626"/> Önemli Hatırlatmalar
        </h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: '#4b5563' }}>
          <li>Gırgır ağları veya Orta su trolü ya da Dip trolü, Algarna gibi dip sürütme av araçları kullanılarak ya da Dalarak ticari avcılık yapılması halinde gemi dahil istihsal vasıtalarına zapt ve mülkiyeti kamuya geçirilir, diğer av araçlarında gemi hariç istihsal vasıtalarına el koyulur.</li>
          <li>Tekrarı halinde gemiye el koyularak mülkiyeti kamuya geçirilir.</li>
          <li>Yurtiçine yasak su ürünlerinin sokulması veya yurt dışına gönderilmesi durumunda su ürünlerine, nakil araçlarına ve istihsal vasıtalarına el koyulur. Tekrarı halinde hapis cezası uygulanır.</li>
          <li>36. maddede sayılan kabahat konusu fiillerin tekrarı halinde idarî para cezaları iki katı olarak uygulanır.</li>
        </ul>
      </div>
    </div>
  );
};

// Lucide React doesn't have an AnchorIcon named explicitly, it is Anchor
const AnchorIcon = ({size, color}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3"></circle>
      <line x1="12" y1="22" x2="12" y2="8"></line>
      <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
    </svg>
  );
};

export default Dashboard;
