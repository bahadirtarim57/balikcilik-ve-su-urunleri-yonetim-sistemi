import React, { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function RevaluationRate() {
  const [inflationRate, setInflationRate] = useState('');
  const [status, setStatus] = useState('');

  const currentUserStr = localStorage.getItem('currentUser');
  let currentUser = null;
  if (currentUserStr) {
    try { currentUser = JSON.parse(currentUserStr); } catch(e) {}
  }
  const uRoles = JSON.parse(localStorage.getItem('user_roles') || '{}');
  const userIdentifier = currentUser?.sicil || currentUser?.adSoyad || currentUser?.name;
  const role = currentUser?.sicil === 'admin' ? 'Genel Koordinatör' : (uRoles[userIdentifier] || 'Personel');
  const isAuthorized = ['Genel Koordinatör', 'Yetkili Yönetici', 'Birim Sorumlusu', 'Sistem Yöneticisi'].includes(role);

  const handleApplyIncrease = async () => {
    if (!inflationRate) return;
    const percentage = parseFloat(inflationRate.replace(',', '.'));
    if (isNaN(percentage)) {
      setStatus('error: Lütfen geçerli bir sayı girin.');
      return;
    }
    if (!window.confirm(`Tüm idari para cezalarına %${percentage} oranında zam (Yeniden Değerleme Oranı) uygulanacak ve küsüratlar yuvarlanacaktır. Onaylıyor musunuz?`)) return;

    try {
      const response = await fetch('/api/apply-increase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage })
      });
      const data = await response.json();
      if (data.success) {
        setStatus('success: Ceza oranları başarıyla güncellendi. Yeni cezaları görmek için sayfayı yenileyiniz (F5).');
        setInflationRate('');
      } else {
        setStatus('error: Hata: ' + data.error);
      }
    } catch (e) {
      setStatus('error: Hata: ' + e.message);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="module-container">
        <div className="module-content glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' }}>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header glass-panel" style={{ marginBottom: '20px' }}>
        <div className="header-left">
          <h2><TrendingUp size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Yeniden Değerlendirme Oranı</h2>
          <p>Tüm idari para cezalarına topluca zam oranı uygulayın.</p>
        </div>
      </div>

      <div className="module-content glass-panel" style={{ border: '2px solid #f59e0b', maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#b45309', borderBottom: '2px solid #fde68a', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} /> Yeniden Değerlendirme (Zam)
        </h3>
        <p style={{ marginBottom: '20px', fontSize: '0.95rem', color: '#334155' }}>
          Yıl sonunda belirlenen Yeniden Değerlendirme Oranını (% olarak) girerek sistemdeki <strong>tüm idari para cezası miktarlarını</strong> otomatik olarak güncelleyebilirsiniz.
        </p>

        {status && (
          <div style={{ marginBottom: '20px', padding: '12px', background: status.startsWith('error') ? '#fee2e2' : '#dcfce7', color: status.startsWith('error') ? '#b91c1c' : '#15803d', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {status.startsWith('error') ? <AlertCircle size={20} style={{ flexShrink: 0 }} /> : <CheckCircle size={20} style={{ flexShrink: 0 }} />}
            <div>{status.split(': ')[1]}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Zam Oranı (%)</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 'bold', fontSize: '16px' }}>%</span>
              <input
                type="text"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                placeholder="Örn: 58.46"
                style={{ width: '100%', padding: '12px 16px 12px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 'bold', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
            <button 
              onClick={handleApplyIncrease}
              style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
            >
              <TrendingUp size={20} /> Uygula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
