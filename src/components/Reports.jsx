import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  PieChart, 
  TrendingUp, 
  Filter, 
  Calendar,
  AlertCircle,
  Fish,
  Anchor,
  FileText,
  Clock,
  Users
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [rawData, setRawData] = useState([]);
  const [period, setPeriod] = useState('all'); // 'all', 'year', '6months', '3months', 'month'

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('ceza_arsivi') || '[]');
    setRawData(data);
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    return rawData.filter(item => {
      if (!item.formData?.tarih) return false;
      const offenseDate = new Date(item.formData.tarih);
      if (isNaN(offenseDate)) return false;

      const diffTime = Math.abs(now - offenseDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = diffDays / 30;

      switch (period) {
        case 'month': return diffMonths <= 1;
        case '3months': return diffMonths <= 3;
        case '6months': return diffMonths <= 6;
        case 'year': return diffMonths <= 12;
        case 'all':
        default: return true;
      }
    });
  }, [rawData, period]);

  const stats = useMemo(() => {
    let totalCezalar = filteredData.length;
    let totalTutar = 0;
    let avcilik = 0;
    let yetistiricilik = 0;
    let diger = 0;

    const baslikMap = {};
    const aylikTarihMap = {};
    const personelMap = {};

    filteredData.forEach(item => {
      // Tutar
      const tutar = item.penaltyData?.calculatedAmount || 0;
      totalTutar += Number(tutar);

      // Kategori
      const anaBaslik = item.penaltyData?.fine?.ana_baslik || 'Diğer';
      if (anaBaslik.includes('Avcılık')) avcilik++;
      else if (anaBaslik.includes('Yetiştiricilik')) yetistiricilik++;
      else diger++;

      // Personel Performansı
      const gorevli1 = item.formData?.gorevli1Ad || '';
      const gorevli2 = item.formData?.gorevli2Ad || '';
      
      [gorevli1, gorevli2].forEach(gorevli => {
        if (gorevli && gorevli.trim() !== '') {
          if (!personelMap[gorevli]) {
            personelMap[gorevli] = { name: gorevli, count: 0, totalAmount: 0 };
          }
          personelMap[gorevli].count++;
          personelMap[gorevli].totalAmount += Number(tutar);
        }
      });

      // Kırılım tablosu için
      const ihlalNedeni = item.penaltyData?.fine?.ihlal_nedeni || 'Belirtilmemiş';
      const kanun = item.penaltyData?.fine?.kanun_maddesi || '-';
      const yonetmelik = item.penaltyData?.fine?.yonetmelik || '-';
      const teblig = item.penaltyData?.fine?.teblig || '-';
      const anaht = `${anaBaslik}|${kanun}|${yonetmelik}|${teblig}|${ihlalNedeni}`;
      
      if (!baslikMap[anaht]) {
        baslikMap[anaht] = { anaBaslik, kanun, yonetmelik, teblig, ihlalNedeni, count: 0, totalAmount: 0 };
      }
      baslikMap[anaht].count++;
      baslikMap[anaht].totalAmount += Number(tutar);

      // Aylar için
      const d = new Date(item.formData.tarih);
      const ayYil = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!aylikTarihMap[ayYil]) aylikTarihMap[ayYil] = 0;
      aylikTarihMap[ayYil]++;
    });

    // Chart.js bar data
    const sortedAylar = Object.keys(aylikTarihMap).sort();
    const barLabels = sortedAylar.map(ay => {
      const [y, m] = ay.split('-');
      const date = new Date(y, m - 1);
      return date.toLocaleString('tr-TR', { month: 'short', year: 'numeric' });
    });
    const barData = sortedAylar.map(ay => aylikTarihMap[ay]);

    const tableData = Object.values(baslikMap).sort((a, b) => b.count - a.count);

    const sortedPersonel = Object.values(personelMap).sort((a, b) => b.count - a.count);
    const topPersonelNames = sortedPersonel.map(p => p.name).slice(0, 10);
    const topPersonelCounts = sortedPersonel.map(p => p.count).slice(0, 10);

    return { totalCezalar, totalTutar, avcilik, yetistiricilik, diger, barLabels, barData, tableData, topPersonelNames, topPersonelCounts };
  }, [filteredData]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(amount);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 } } },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  const barChartData = {
    labels: stats.barLabels,
    datasets: [
      {
        label: 'Kesilen Ceza Sayısı',
        data: stats.barData,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 6,
      }
    ]
  };

  const personelChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
      y: { grid: { display: false } }
    }
  };

  const personelChartData = {
    labels: stats.topPersonelNames,
    datasets: [{
      label: 'İşlem Yapılan Ceza',
      data: stats.topPersonelCounts,
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderRadius: 4
    }]
  };

  const doughnutData = {
    labels: ['Avcılık İhlalleri', 'Yetiştiricilik İhlalleri', 'Diğer İhlaller'],
    datasets: [
      {
        data: [stats.avcilik, stats.yetistiricilik, stats.diger],
        backgroundColor: ['#10b981', '#f97316', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '26px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
            <PieChart size={30} color="#4f46e5" /> İstatistik & İcmal Raporları
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '15px' }}>
            Geçmişe dönük kesilmiş tüm idari para cezalarının detaylı analiz ve raporlaması.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <Filter size={18} color="#64748b" style={{ marginLeft: '8px' }} />
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', fontWeight: 600, color: '#334155', cursor: 'pointer', paddingRight: '8px' }}
          >
            <option value="all">Tüm Zamanlar</option>
            <option value="year">Son 1 Yıl</option>
            <option value="6months">Son 6 Ay</option>
            <option value="3months">Son 3 Ay</option>
            <option value="month">Son 1 Ay</option>
          </select>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: 500, marginBottom: '8px' }}>Toplam Uygulanan Ceza</div>
              <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.totalCezalar}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><FileText size={24} /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: 500, marginBottom: '8px' }}>Toplam Ceza Tutarı</div>
              <div style={{ fontSize: '32px', fontWeight: 800, whiteSpace: 'nowrap' }}>{formatMoney(stats.totalTutar)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><TrendingUp size={24} /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Anchor size={20} color="#10b981" /> <span style={{ fontWeight: 600, color: '#334155' }}>Avcılık İhlalleri</span></div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{stats.avcilik}</span>
          </div>
          <div style={{ height: '1px', background: '#f1f5f9' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Fish size={20} color="#f97316" /> <span style={{ fontWeight: 600, color: '#334155' }}>Yetiştiricilik İhlalleri</span></div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#f97316' }}>{stats.yetistiricilik}</span>
          </div>
        </motion.div>

      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#64748b" /> Zamana Göre Ceza Eğilimi
          </h3>
          <div style={{ height: '300px' }}>
            {stats.barLabels.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Veri bulunamadı</div>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#64748b" /> Kategori Dağılımı
          </h3>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {stats.totalCezalar > 0 ? (
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <div style={{ color: '#94a3b8' }}>Veri bulunamadı</div>
            )}
          </div>
        </div>

      </div>

      {/* PERSONNEL CHART */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#64748b" /> Personel Performansı (En Çok Ceza İşlemi Yapan 10 Personel)
        </h3>
        <div style={{ height: '300px' }}>
          {stats.topPersonelNames.length > 0 ? (
            <Bar data={personelChartData} options={personelChartOptions} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Veri bulunamadı</div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#4f46e5" /> Detaylı İhlal İcmali
          </h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'white', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Ana Başlık</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Kanun / Yön. / Tebliğ</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>İhlal Adı / Nedeni</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Ceza Sayısı</th>
                <th style={{ padding: '16px', textAlign: 'right', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Toplam Tutar</th>
              </tr>
            </thead>
            <tbody>
              {stats.tableData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Seçilen dönemde kesilmiş ceza bulunmamaktadır.</td>
                </tr>
              ) : (
                stats.tableData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: row.anaBaslik.includes('Avcılık') ? '#dcfce7' : (row.anaBaslik.includes('Yetiştiricilik') ? '#ffedd5' : '#ede9fe'), color: row.anaBaslik.includes('Avcılık') ? '#15803d' : (row.anaBaslik.includes('Yetiştiricilik') ? '#c2410c' : '#6d28d9'), padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                        {row.anaBaslik}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>K: {row.kanun}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Y: {row.yonetmelik}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>T: {row.teblig}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#1e293b', fontSize: '13px', maxWidth: '400px' }}>
                      {row.ihlalNedeni}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 800, color: '#4f46e5', fontSize: '15px' }}>
                      {row.count}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {formatMoney(row.totalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
