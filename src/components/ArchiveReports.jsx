import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { X, FileX, MapPin, AlertTriangle, Anchor, Info, BarChart2 } from 'lucide-react';
import './ArchiveReports.css';

// Çubuk ve Pasta grafiklerin üzerine sayıları yazdıran özel eklenti
const dataLabelPlugin = {
  id: 'dataLabelPlugin',
  afterDatasetsDraw(chart, args, pluginOptions) {
    const { ctx } = chart;
    ctx.save();
    
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta.hidden) {
        meta.data.forEach((element, index) => {
          const val = dataset.data[index];
          if (val > 0) {
            const model = element.tooltipPosition();
            
            if (meta.type === 'pie' || meta.type === 'doughnut') {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 13px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.shadowColor = 'rgba(0,0,0,0.7)';
              ctx.shadowBlur = 4;
              ctx.fillText(val, model.x, model.y);
              ctx.shadowBlur = 0;
            } else {
              // Bar charts
              ctx.fillStyle = '#64748b';
              ctx.font = '600 11px Inter, sans-serif';
              if (chart.config.options.indexAxis === 'y') {
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(val, element.x + 5, element.y);
              } else {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(val, element.x, element.y - 5);
              }
            }
          }
        });
      }
    });
    ctx.restore();
  }
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ArchiveReports({ ruhsatData, onClose }) {
  
  const stats = useMemo(() => {
    if (!ruhsatData || !ruhsatData.data) return null;
    
    const data = ruhsatData.data;
    
    let totalCancelled = 0;
    if (data['RUHSAT İPTALLERİ']) {
      totalCancelled += data['RUHSAT İPTALLERİ'].length;
    }

    const penaltyCounts = {};
    if (data['GEMİ CEZA']) {
      data['GEMİ CEZA'].forEach(row => {
        const penaltyCol = Object.keys(row).find(k => k.includes('MADDESİ') || k.includes('İPC'));
        if (penaltyCol && row[penaltyCol]) {
          const reason = String(row[penaltyCol]).trim().toUpperCase();
          if (reason && reason !== '-') {
            penaltyCounts[reason] = (penaltyCounts[reason] || 0) + 1;
          }
        }
      });
    }

    const activeShips = new Map();
    const activeTabs = ['DENİZ', 'İÇ SU', 'YEDEK', '12 MT. ÜSTÜ GEMİLER', 'GIRGIR VE TROL-GIRGIR GEMİLERİ'];

    activeTabs.forEach(sheetName => {
      if (data[sheetName]) {
        data[sheetName].forEach(row => {
          // Benzersiz gemi/plaka tespiti
          const plakaCol = Object.keys(row).find(k => k.includes('PLAKA'));
          const isimCol = Object.keys(row).find(k => k.includes('İSİM') || k.includes('ADI'));
          
          let identifier = null;
          if (plakaCol && row[plakaCol] && String(row[plakaCol]).trim() !== '-' && String(row[plakaCol]).trim() !== '') {
            identifier = String(row[plakaCol]).trim().toUpperCase();
          } else if (isimCol && row[isimCol] && String(row[isimCol]).trim() !== '-' && String(row[isimCol]).trim() !== '') {
            identifier = String(row[isimCol]).trim().toUpperCase();
          }
          
          if (identifier) {
            if (!activeShips.has(identifier)) {
              activeShips.set(identifier, row);
            } else {
              const existing = activeShips.get(identifier);
              activeShips.set(identifier, { ...existing, ...row });
            }
          }
        });
      }
    });

    const materialCounts = {};
    const vesselTypes = {};
    const lengthCounts = {
      '5 Metre Altı': 0,
      '5 - 10 Metre': 0,
      '10 - 12 Metre': 0,
      '12 - 18 Metre': 0,
      '18 - 22 Metre': 0,
      '22 - 35 Metre': 0,
      '35 Metre ve Üstü': 0,
      'Boyu Girilmeyen': 0
    };
    const exportedLengthCounts = { ...lengthCounts };
    const cancelledLengthCounts = { ...lengthCounts };
    const portCounts = {};
    const exportCities = {};
    const mismatches = [];

    // Aktif gemiler üzerinden fiziksel analiz (Boy, Malzeme, Tür, Liman)
    activeShips.forEach(row => {
      const materialCol = Object.keys(row).find(k => k.includes('MALZEMESİ'));
      let mat = 'BELİRTİLMEYEN';
      if (materialCol && row[materialCol]) {
        const rawMat = String(row[materialCol]).trim().toUpperCase();
        if (rawMat && rawMat !== '-') mat = rawMat;
      }
      materialCounts[mat] = (materialCounts[mat] || 0) + 1;
      
      const typeCol = Object.keys(row).find(k => k === 'GEMİ TÜRÜ' || k === 'CİNSİ');
      let type = 'BELİRTİLMEYEN';
      if (typeCol && row[typeCol]) {
        let rawType = String(row[typeCol]).trim().toUpperCase();
        
        // Kısaltmaları tam metne çevir
        if (rawType === 'G') rawType = 'GIRGIR';
        else if (rawType === 'TG') rawType = 'GIRGIR / TROL';
        
        if (rawType && rawType !== '-') type = rawType;
      }
      vesselTypes[type] = (vesselTypes[type] || 0) + 1;

      const portCol = Object.keys(row).find(k => k.includes('BAĞLAMA LİMANI') || k.includes('LİMAN'));
      let port = 'BELİRTİLMEYEN';
      if (portCol && row[portCol]) {
        const rawPort = String(row[portCol]).trim().toUpperCase();
        if (rawPort && rawPort !== '-') {
            port = rawPort.includes('/') ? rawPort.split('/')[0].trim() : rawPort;
        }
      }
      portCounts[port] = (portCounts[port] || 0) + 1;

      // Plaka - Liman Uyuşmazlık Kontrolü
      const plakaCol = Object.keys(row).find(k => k.includes('PLAKA'));
      if (plakaCol && row[plakaCol] && port !== 'BELİRTİLMEYEN') {
        const plakaFull = String(row[plakaCol]).trim().toUpperCase();
        if (plakaFull && plakaFull !== '-') {
          const is57 = plakaFull.startsWith('57');
          const isSinopPort = ['SİNOP', 'AYANCIK', 'GERZE'].includes(port);
          
          if (!is57 && isSinopPort) {
            mismatches.push({ plaka: plakaFull, port, tip: 'Yabancı Plaka / Yerel Liman' });
          } else if (is57 && !isSinopPort) {
            mismatches.push({ plaka: plakaFull, port, tip: '57 Plaka / Yabancı Liman' });
          }
        }
      }

      let bracket = 'Boyu Girilmeyen';
      const lengthCol = Object.keys(row).find(k => k === 'TAM BOY' || k.includes('TAM BOY'));
      if (lengthCol && row[lengthCol]) {
        const length = parseFloat(String(row[lengthCol]).replace(',', '.'));
        if (!isNaN(length) && length > 0) {
          if (length < 5) bracket = '5 Metre Altı';
          else if (length >= 5 && length < 10) bracket = '5 - 10 Metre';
          else if (length >= 10 && length < 12) bracket = '10 - 12 Metre';
          else if (length >= 12 && length < 18) bracket = '12 - 18 Metre';
          else if (length >= 18 && length < 22) bracket = '18 - 22 Metre';
          else if (length >= 22 && length < 35) bracket = '22 - 35 Metre';
          else if (length >= 35) bracket = '35 Metre ve Üstü';
        }
      }
      lengthCounts[bracket]++;
    });

    // BAŞKA İLE GİDENLER Sekmesi için özel boy analizi (Mükerrerleri eleyerek)
    let totalExportedShips = 0;
    if (data['BAŞKA İLE GİDENLER']) {
      const exportedShips = new Map();
      data['BAŞKA İLE GİDENLER'].forEach(row => {
        const plakaCol = Object.keys(row).find(k => k.includes('PLAKA'));
        const isimCol = Object.keys(row).find(k => k.includes('İSİM') || k.includes('ADI'));
        
        let identifier = null;
        if (plakaCol && row[plakaCol] && String(row[plakaCol]).trim() !== '-' && String(row[plakaCol]).trim() !== '') {
          identifier = String(row[plakaCol]).trim().toUpperCase();
        } else if (isimCol && row[isimCol] && String(row[isimCol]).trim() !== '-' && String(row[isimCol]).trim() !== '') {
          identifier = String(row[isimCol]).trim().toUpperCase();
        }
        if (identifier) exportedShips.set(identifier, row);
      });
      
      totalExportedShips = exportedShips.size;

      exportedShips.forEach(row => {
        let bracket = 'Boyu Girilmeyen';
        const lengthCol = Object.keys(row).find(k => k === 'TAM BOY' || k.includes('TAM BOY'));
        if (lengthCol && row[lengthCol]) {
          const length = parseFloat(String(row[lengthCol]).replace(',', '.'));
          if (!isNaN(length) && length > 0) {
            if (length < 5) bracket = '5 Metre Altı';
            else if (length >= 5 && length < 10) bracket = '5 - 10 Metre';
            else if (length >= 10 && length < 12) bracket = '10 - 12 Metre';
            else if (length >= 12 && length < 18) bracket = '12 - 18 Metre';
            else if (length >= 18 && length < 22) bracket = '18 - 22 Metre';
            else if (length >= 22 && length < 35) bracket = '22 - 35 Metre';
            else if (length >= 35) bracket = '35 Metre ve Üstü';
          }
        }
        exportedLengthCounts[bracket]++;

        // Gidilen il analizi
        const targetCityCol = Object.keys(row).find(k => k.includes('GİTTİĞİ') || k.includes('İL') || k.includes('ADRES'));
        let city = 'BİLİNMEYEN';
        if (targetCityCol && row[targetCityCol]) {
          let rawCity = String(row[targetCityCol]).trim().toUpperCase();
          if (rawCity && rawCity !== '-') {
            if (rawCity.includes('/')) rawCity = rawCity.split('/')[0].trim();
            if (rawCity.includes(' ')) rawCity = rawCity.split(' ')[0].trim();
            city = rawCity;
          }
        }
        exportCities[city] = (exportCities[city] || 0) + 1;
      });
    }

    // RUHSAT İPTALLERİ Sekmesi için özel boy analizi
    if (data['RUHSAT İPTALLERİ']) {
      data['RUHSAT İPTALLERİ'].forEach(row => {
        let bracket = 'Boyu Girilmeyen';
        const lengthCol = Object.keys(row).find(k => k === 'TAM BOY' || k.includes('TAM BOY'));
        if (lengthCol && row[lengthCol]) {
          const length = parseFloat(String(row[lengthCol]).replace(',', '.'));
          if (!isNaN(length) && length > 0) {
            if (length < 5) bracket = '5 Metre Altı';
            else if (length >= 5 && length < 10) bracket = '5 - 10 Metre';
            else if (length >= 10 && length < 12) bracket = '10 - 12 Metre';
            else if (length >= 12 && length < 18) bracket = '12 - 18 Metre';
            else if (length >= 18 && length < 22) bracket = '18 - 22 Metre';
            else if (length >= 22 && length < 35) bracket = '22 - 35 Metre';
            else if (length >= 35) bracket = '35 Metre ve Üstü';
          }
        }
        cancelledLengthCounts[bracket]++;
      });
    }

    return {
      totalCancelled,
      totalExported: totalExportedShips,
      exportCities,
      penaltyCounts,
      materialCounts,
      vesselTypes,
      lengthCounts,
      exportedLengthCounts,
      cancelledLengthCounts,
      portCounts,
      mismatches,
      totalActiveShips: activeShips.size
    };
  }, [ruhsatData]);

  if (!stats) return null;

  const sortedPenalties = Object.entries(stats.penaltyCounts).sort((a,b) => b[1] - a[1]).slice(0, 10);
  const penaltyChartData = {
    labels: sortedPenalties.map(x => x[0]),
    datasets: [
      {
        label: 'Ceza Sayısı',
        data: sortedPenalties.map(x => x[1]),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const sortedMaterials = Object.entries(stats.materialCounts).sort((a,b) => b[1] - a[1]);
  const materialChartData = {
    labels: sortedMaterials.map(x => x[0]),
    datasets: [
      {
        data: sortedMaterials.map(x => x[1]),
        backgroundColor: sortedMaterials.map(x => {
            if (x[0] === 'METAL') return '#3b82f6';
            if (x[0] === 'AHŞAP') return '#f59e0b';
            if (x[0] === 'BELİRTİLMEYEN') return '#94a3b8';
            return '#06b6d4';
        }),
        borderWidth: 2,
        borderColor: '#ffffff'
      },
    ],
  };

  const sortedCities = Object.entries(stats.exportCities).sort((a,b) => b[1] - a[1]);
  const exportCityChartData = {
    labels: sortedCities.map(x => x[0]),
    datasets: [
      {
        label: 'Giden Gemi Sayısı',
        data: sortedCities.map(x => x[1]),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  const lengthLabels = Object.keys(stats.lengthCounts);
  const lengthValues = Object.values(stats.lengthCounts);
  const exportedLengthValues = Object.values(stats.exportedLengthCounts);
  const cancelledLengthValues = Object.values(stats.cancelledLengthCounts);
  
  const lengthChartData = {
    labels: lengthLabels,
    datasets: [
      {
        label: 'Mevcut Gemi',
        data: lengthValues,
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'İl Dışına Giden',
        data: exportedLengthValues,
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'İptal Edilen',
        data: cancelledLengthValues,
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  const sortedPorts = Object.entries(stats.portCounts).sort((a,b) => b[1] - a[1]);
  
  const getPortColor = (portName) => {
    switch(portName) {
      case 'AYANCIK': return '#10b981'; // Emerald/Green
      case 'SİNOP': return '#3b82f6'; // Blue
      case 'GERZE': return '#ec4899'; // Pink
      case 'BELİRTİLMEYEN': return '#cbd5e1'; // Slate light
      default: return '#f59e0b'; // Amber
    }
  };

  const portChartData = {
    labels: sortedPorts.map(x => x[0]),
    datasets: [
      {
        data: sortedPorts.map(x => x[1]),
        backgroundColor: sortedPorts.map(x => getPortColor(x[0])),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <div className="reports-modal-overlay">
      <div className="reports-modal-container">
        
        <div className="reports-header">
          <div className="reports-header-title">
            <div className="reports-header-icon">
              <BarChart2 size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2>Ruhsat Arşivi Yönetim Paneli</h2>
              <p>Yapay Zeka Destekli Anlık Analiz ve Fuar Sınıfı Raporlar</p>
            </div>
          </div>
          <button onClick={onClose} className="reports-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="reports-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-emerald">
                <Anchor size={32} />
              </div>
              <div className="stat-info">
                <p>An İtibariyle Mevcut</p>
                <h3>{stats.totalActiveShips}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-indigo">
                <AlertTriangle size={32} />
              </div>
              <div className="stat-info">
                <p>Plaka/Liman Uyuşmazlığı</p>
                <h3>{stats.mismatches.length}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-red">
                <FileX size={32} />
              </div>
              <div className="stat-info">
                <p>Ruhsatı İptal Edilen</p>
                <h3>{stats.totalCancelled}</h3>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-orange">
                <MapPin size={32} />
              </div>
              <div className="stat-info">
                <p>İl Dışına Gidenler</p>
                <h3>{stats.totalExported}</h3>
              </div>
            </div>

          </div>

          <div className="charts-grid">
            
            <div className="chart-card">
              <div className="chart-header">
                <AlertTriangle size={20} color="#ef4444" />
                <h3>En Çok İhlal Edilen Ceza Maddeleri</h3>
              </div>
              <div className="chart-body">
                {sortedPenalties.length > 0 ? (
                  <Bar 
                    data={penaltyChartData} 
                    plugins={[dataLabelPlugin]}
                    options={{ 
                      maintainAspectRatio: false, 
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, grace: '10%' }, x: { grid: { display: false } } }
                    }} 
                  />
                ) : (
                  <div className="empty-data">Ceza maddesi verisi bulunamadı.</div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <MapPin size={20} color="#6366f1" />
                <h3>İl Dışına Gidenler (İller Bazında)</h3>
              </div>
              <div className="chart-body" style={{ minHeight: '350px' }}>
                {sortedCities.length > 0 ? (
                  <Bar 
                    data={exportCityChartData} 
                    plugins={[dataLabelPlugin]}
                    options={{ 
                      maintainAspectRatio: false, 
                      indexAxis: 'y', 
                      plugins: { legend: { display: false } },
                      scales: { x: { beginAtZero: true, grid: { color: '#f1f5f9' }, grace: '15%' }, y: { grid: { display: false } } }
                    }} 
                  />
                ) : (
                  <div className="empty-data">İl dışı veri dağılımı bulunamadı.</div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <Anchor size={20} color="#3b82f6" />
                <h3>Filo Yapım Malzemesi</h3>
              </div>
              <div className="chart-body pie-container">
                {sortedMaterials.length > 0 ? (
                  <Pie 
                    data={materialChartData} 
                    plugins={[dataLabelPlugin]}
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'right', labels: { font: { size: 14, weight: 'bold' } } } }
                    }} 
                  />
                ) : (
                  <div className="empty-data">Yapım malzemesi verisi bulunamadı.</div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <Info size={20} color="#10b981" />
                <h3>Gemi Türü / Cinsi Dağılımı</h3>
              </div>
              <div className="chart-body" style={{ alignItems: 'flex-start' }}>
                {Object.keys(stats.vesselTypes).length > 0 ? (
                  <div className="vessel-list">
                    {Object.entries(stats.vesselTypes).sort((a,b)=> b[1] - a[1]).map(([type, count], idx) => (
                      <div key={idx} className="vessel-list-item">
                        <span className="vessel-name">{type}</span>
                        <span className="vessel-badge">{count} Gemi</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-data" style={{ alignSelf: 'center' }}>Gemi türü verisi bulunamadı.</div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <Anchor size={20} color="#8b5cf6" />
                <h3>Bağlama Limanına Göre Dağılım</h3>
              </div>
              <div className="chart-body pie-container">
                {sortedPorts.length > 0 ? (
                  <Doughnut 
                    data={portChartData} 
                    plugins={[dataLabelPlugin]}
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'right', labels: { font: { size: 12, weight: 'bold' } } } }
                    }} 
                  />
                ) : (
                  <div className="empty-data">Bağlama limanı verisi bulunamadı.</div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <AlertTriangle size={20} color="#f59e0b" />
                <h3>Plaka / Liman Uyuşmazlıkları</h3>
              </div>
              <div className="chart-body" style={{ alignItems: 'flex-start', overflowY: 'auto', maxHeight: '350px' }}>
                {stats.mismatches.length > 0 ? (
                  <div className="vessel-list" style={{ width: '100%' }}>
                    {stats.mismatches.map((m, idx) => (
                      <div key={idx} className="vessel-list-item" style={{ justifyContent: 'space-between', padding: '12px' }}>
                        <span className="vessel-name" style={{ fontWeight: '600' }}>{m.plaka}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span className="vessel-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>{m.tip}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Liman: {m.port}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-data" style={{ alignSelf: 'center' }}>Uyuşmazlık bulunamadı.</div>
                )}
              </div>
            </div>

            <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
              <div className="chart-header">
                <BarChart2 size={20} color="#10b981" />
                <h3>1380 Sayılı Kanun Kapsamında Boy Gruplarına Göre Filo Envanter Bilançosu</h3>
              </div>
              <div className="chart-body" style={{ minHeight: '350px' }}>
                {lengthValues.some(v => v > 0) || exportedLengthValues.some(v => v > 0) || cancelledLengthValues.some(v => v > 0) ? (
                  <Bar 
                    data={lengthChartData} 
                    plugins={[dataLabelPlugin]}
                    options={{ 
                      maintainAspectRatio: false, 
                      plugins: { 
                        legend: { display: true, position: 'top' },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return ` ${context.parsed.y} Adet Gemi/Tekne`;
                            }
                          }
                        }
                      },
                      scales: { 
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, grace: '15%' }, 
                        x: { grid: { display: false } } 
                      }
                    }} 
                  />
                ) : (
                  <div className="empty-data">Boy grupları verisi bulunamadı.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
