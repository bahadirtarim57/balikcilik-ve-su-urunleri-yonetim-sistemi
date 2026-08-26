import { useState, useMemo } from 'react';
import { Search, Ship, RefreshCw, AlertTriangle, CheckCircle, Navigation, ShieldAlert, History, ArrowLeft, Anchor, User, FileText, Activity, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import masterArsiv from '../data/master_arsiv.json';
import './ArchiveReports.css'; 

const RuhsatListesi = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGemi, setSelectedGemi] = useState(null);
  const [activeTab, setActiveTab] = useState('kimlik'); // kimlik, vize, satis, ceza

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({ yeniPlaka: '', neden: 'SATIS' });
  const [filterYedek, setFilterYedek] = useState('');

  const data = masterArsiv;

  const yedekMap = useMemo(() => {
    const map = {};
    data.forEach(g => {
      if (g.kimlik?.ruhsatTipi === 'YEDEK' && g.kimlik?.anaGemiPlakasi) {
        const ana = g.kimlik.anaGemiPlakasi;
        if (!map[ana]) map[ana] = [];
        map[ana].push(g);
      }
    });
    return map;
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;

    if (filterYedek) {
      result = result.filter(row => {
        const yedekler = yedekMap[row.plakaNo] || [];
        if (yedekler.length === 0) return false;
        
        if (filterYedek === 'VAR_AKTIF') {
          return yedekler.some(y => y.arsivDurumu !== 'PASİF' && y.guncelDurum === 'AKTİF');
        }
        return true; // VAR_TUMU
      });
    }

    if (!searchTerm.trim()) return result;
    const term = searchTerm.toLowerCase('tr-TR').trim();
    return result.filter(row => {
      const plaka = String(row.plakaNo || '').toLowerCase('tr-TR');
      const eskiPlaka = String(row.kimlik?.eskiPlaka || '').toLowerCase('tr-TR');
      const gemiAdi = String(row.kimlik?.gemiAdi || '').toLowerCase('tr-TR');
      const sahip = String(row.kimlik?.sahibi || '').toLowerCase('tr-TR');
      const tc = String(row.kimlik?.tcKimlik || row.kimlik?.vergiNo || '').toLowerCase('tr-TR');
      const hologram = String(row.guncelHologram || '').toLowerCase('tr-TR');
      return plaka.includes(term) || eskiPlaka.includes(term) || gemiAdi.includes(term) || sahip.includes(term) || tc.includes(term) || hologram.includes(term);
    });
  }, [data, searchTerm, filterYedek, yedekMap]);

  const hesaplaIadeTarihi = (baslangic, sure, excelIadeTarihi) => {
    if (excelIadeTarihi) return excelIadeTarihi;
    if (!baslangic || !sure) return '-';
    
    let ayEkle = 0;
    let gunEkle = 0;
    const s = String(sure).toUpperCase();
    if (s.includes('AY')) {
       ayEkle = parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
    } else {
       gunEkle = parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
    }

    const parts = baslangic.split(/[\.\-\/]/);
    if (parts.length === 3) {
      let d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10) - 1;
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 2000;
      let date = new Date(y, m, d);
      if (ayEkle > 0) date.setMonth(date.getMonth() + ayEkle);
      if (gunEkle > 0) date.setDate(date.getDate() + gunEkle);
      return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    }
    return '-';
  };

  const hesaplaCezaDusum = (cezaTarihi, excelSonaErme) => {
    if (excelSonaErme) return excelSonaErme;
    if (!cezaTarihi) return '-';
    const parts = cezaTarihi.split(/[\.\-\/]/);
    if (parts.length === 3) {
      let d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10) - 1;
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 2000;
      let date = new Date(y + 2, m, d); // +2 Yıl ekle
      return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    }
    return '-';
  };

  const isZamanAsimi = (dusumTarihi) => {
    if (!dusumTarihi || dusumTarihi === '-') return false;
    const parts = dusumTarihi.split(/[\.\-\/]/);
    if (parts.length === 3) {
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 2000;
      let date = new Date(y, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      return date < new Date(); // Bugünün tarihinden küçükse zaman aşımına uğramıştır
    }
    return false;
  };

  const getVizeStatus = (vizeTarihi) => {
    if (!vizeTarihi) return { icon: <AlertTriangle size={16} color="#9ca3af" />, text: 'Belirsiz', color: '#9ca3af' };
    
    // Basit mantık: Tarih eskideyse geçersiz vs yapılabilir. 
    // Şimdilik hepsi geçerli varsayıyoruz mock olarak.
    return { icon: <CheckCircle size={16} color="#10b981" />, text: 'Geçerli', color: '#10b981' };
  };

  // ---------------- DETAY EKRANI ---------------- //
  if (selectedGemi) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
        
        <button 
          onClick={() => setSelectedGemi(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '20px' }}
        >
          <ArrowLeft size={18} /> Arşive Dön
        </button>

        {/* Başlık Kartı */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '30px', color: 'white', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
           
           <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
             <Ship size={40} color="#38bdf8" />
           </div>
           
           <div style={{ flex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{selectedGemi.plakaNo}</h2>
                <span style={{ background: selectedGemi.arsivDurumu === 'PASİF' ? '#f59e0b' : selectedGemi.guncelDurum === 'AKTİF' ? '#10b981' : '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px' }}>
                  {selectedGemi.arsivDurumu === 'PASİF' ? 'PASİF KAYIT (GEÇMİŞ)' : selectedGemi.guncelDurum}
                </span>
             </div>
             <h3 style={{ fontSize: '18px', color: '#94a3b8', margin: 0, fontWeight: '500' }}>{selectedGemi.kimlik?.gemiAdi || 'İsimsiz'} • {selectedGemi.kimlik?.ruhsatTipi || 'BİLİNMİYOR'}</h3>
           </div>
           
           <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
             
             <button 
               onClick={() => setShowTransferModal(true)}
               style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)' }}
             >
               <RefreshCw size={18} /> Devret / Nakil Et
             </button>

             {/* Vize Dates */}
             <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '12px' }}>
               <div style={{ textAlign: 'left' }}>
                 <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Son Vize</div>
                 <div style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>{selectedGemi.tarihler?.sonVizeTarihi || '-'}</div>
               </div>
               <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
               <div style={{ textAlign: 'left' }}>
                 <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vize Bitiş</div>
                 <div style={{ fontSize: '15px', fontWeight: '600', color: '#10b981' }}>{selectedGemi.tarihler?.vizeBitisTarihi || '-'}</div>
               </div>
               <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
               <div style={{ textAlign: 'left' }}>
                 <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ruhsat Bitiş</div>
                 <div style={{ fontSize: '15px', fontWeight: '600', color: '#f59e0b' }}>{selectedGemi.tarihler?.ruhsatBitisTarihi || selectedGemi.cezaVeIptal?.iptalTarihi || '-'}</div>
               </div>
             </div>

             {/* Hologram */}
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Güncel Hologram</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '8px', minWidth: '120px' }}>
                  {selectedGemi.guncelHologram || 'YOK'}
                </div>
             </div>
           </div>
        </div>

        {selectedGemi.arsivDurumu === 'PASİF' && selectedGemi.kimlik?.sonrakiPlaka && (
          <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle color="#f59e0b" />
            <div>
              <h4 style={{ margin: '0 0 4px', color: '#b45309', fontSize: '15px' }}>Bu kayıt geçmiş bir arşiv kaydıdır.</h4>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>Tekne devredilmiş veya nakil olmuştur. Güncel plaka numarası: <strong>{selectedGemi.kimlik.sonrakiPlaka}</strong></p>
            </div>
          </div>
        )}

        {showTransferModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><RefreshCw color="#3b82f6" /> Tekneyi Devret / Nakil Et</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Bu işlem mevcut kaydı arşive (pasif) kaldıracak ve girdiğiniz yeni plaka ile aktif bir tekne yaratacaktır.</p>
              
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Yeni Plaka Numarası</label>
              <input type="text" value={transferData.yeniPlaka} onChange={e => setTransferData({...transferData, yeniPlaka: e.target.value})} placeholder="Örn: 55D1234" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }} />
              
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Devir Nedeni</label>
              <select value={transferData.neden} onChange={e => setTransferData({...transferData, neden: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <option value="SATIS">Satış Yapıldı</option>
                <option value="NAKIL">Başka İle Nakil Gitti</option>
                <option value="DIGER">Diğer / İsim Değişikliği</option>
              </select>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowTransferModal(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>İptal</button>
                <button onClick={() => {
                  toast.success('Tekne başarıyla ' + transferData.yeniPlaka + ' plakasına devredildi! (Backend entegrasyonu simülasyonu)');
                  setShowTransferModal(false);
                }} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Onayla & Devret</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB MENÜSÜ */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {[
            { id: 'kimlik', icon: <FileText size={18} />, label: 'Ana Kimlik & Özellikler' },
            { id: 'vize', icon: <Activity size={18} />, label: 'Vize & Hologram Geçmişi' },
            { id: 'satis', icon: <User size={18} />, label: 'Satış & Devir Kayıtları' },
            { id: 'ceza', icon: <ShieldAlert size={18} />, label: 'Ceza & Elkoyma Sicili' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px',
                background: activeTab === tab.id ? '#f1f5f9' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '600',
                border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB İÇERİKLERİ */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '400px' }}>
          
          {/* 1. KİMLİK SEKME */}
          {activeTab === 'kimlik' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <User size={20} color="#3b82f6" /> Ruhsat Sahibi Bilgileri
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AD SOYAD / ÜNVAN</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.kimlik?.sahibi || '-'}</div></div>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TC KİMLİK / VKN</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.kimlik?.tcKimlik || selectedGemi.kimlik?.vergiNo || '-'}</div></div>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TELEFON</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.kimlik?.telefon || '-'}</div></div>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ADRES</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.kimlik?.adres || '-'}</div></div>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>BAĞLAMA LİMANI / İLÇE</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.kimlik?.liman || '-'}</div></div>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Anchor size={20} color="#10b981" /> Teknik Özellikler & Ruhsat
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TAM BOY / KÜTÜK BOY</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.teknikOzellikler?.tamBoy || '-'}m / {selectedGemi.teknikOzellikler?.kutukBoy || '-'}m</div></div>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>EN / DERİNLİK</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.teknikOzellikler?.en || '-'}m / {selectedGemi.teknikOzellikler?.derinlik || '-'}m</div></div>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>GROSTONAJ / YAPIM YILI</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.teknikOzellikler?.grostonaj || '-'} / {selectedGemi.teknikOzellikler?.yapimYili || '-'}</div></div>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>GEMİ TÜRÜ / MALZEMESİ</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.teknikOzellikler?.gemiTuru || '-'} / {selectedGemi.teknikOzellikler?.yapimMalzemesi || '-'}</div></div>
                   
                   <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
                   
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AV ARACI</div><div style={{ fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>{selectedGemi.ruhsatOzellikleri?.avAraci || '-'}</div></div>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>BOY HAKKI / 12 MÜ</div><div style={{ fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>{selectedGemi.ruhsatOzellikleri?.boyHakki || '-'} / {selectedGemi.ruhsatOzellikleri?.onIkiMu || '-'}</div></div>
                </div>
              </div>
              
              {/* 3. Kolon: Sicil ve Gecmis (Secere) */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <History size={20} color="#f59e0b" /> Sicil & Geçmiş Kayıtlar
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                   <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ESKİ PLAKASI</div><div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedGemi.kimlik?.eskiPlaka || '-'}</div></div>
                   
                   {selectedGemi.guncelDurum.includes('BAKA LE') && (
                     <>
                       <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>GİDİŞ TARİHİ</div><div style={{ fontSize: '15px', fontWeight: '500', color: '#0ea5e9' }}>{selectedGemi.cezaVeIptal?.gidisTarihi || '-'}</div></div>
                       <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>GİTTİĞİ İL</div><div style={{ fontSize: '15px', fontWeight: '500', color: '#0ea5e9' }}>{selectedGemi.cezaVeIptal?.gittigiIl || '-'}</div></div>
                     </>
                   )}

                   {selectedGemi.guncelDurum.includes('DESTEKLEME') && (
                     <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>DESTEKLEME YILI</div><div style={{ fontSize: '15px', fontWeight: '500', color: '#10b981' }}>{selectedGemi.cezaVeIptal?.desteklemeYili || '-'}</div></div>
                   )}

                   {selectedGemi.guncelDurum.includes('PTAL') && (
                     <>
                       <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>İPTAL TARİHİ</div><div style={{ fontSize: '15px', fontWeight: '500', color: '#ef4444' }}>{selectedGemi.cezaVeIptal?.iptalTarihi || '-'}</div></div>
                       <div><div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>İPTAL NEDENİ</div><div style={{ fontSize: '15px', fontWeight: '500', color: '#ef4444' }}>{selectedGemi.cezaVeIptal?.iptalNedeni || '-'}</div></div>
                     </>
                   )}
                </div>

                {(() => {
                  const seciliGemininYedekleri = yedekMap[selectedGemi.plakaNo] || [];
                  if (seciliGemininYedekleri.length === 0) return null;
                  
                  return (
                    <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <Ship size={20} color="#8b5cf6" /> Bağlı Yedek Tekneler
                      </h3>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {seciliGemininYedekleri.map((y, i) => {
                          const isActive = y.arsivDurumu !== 'PASİF' && y.guncelDurum === 'AKTİF';
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isActive ? '#f8fafc' : '#f1f5f9', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                               <div>
                                 <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>{y.plakaNo} <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>({y.kimlik?.gemiAdi})</span></div>
                                 <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Faaliyet Alanı: {y.kimlik?.faaliyetAlani || '-'}</div>
                               </div>
                               <div style={{ background: isActive ? '#dcfce7' : '#e2e8f0', color: isActive ? '#166534' : '#475569', padding: '6px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '12px' }}>
                                 {isActive ? 'AKTİF YEDEK' : 'PASİF YEDEK (İPTAL/DEVİR)'}
                               </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          )}

          {/* 2. VZE SEKME */}
          {activeTab === 'vize' && (
            <div>
               <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>Geçmiş Vize İşlemleri Listesi</h3>
               {(!selectedGemi.tarihce_vize || selectedGemi.tarihce_vize.length === 0) ? (
                 <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                   Geçmişe dönük kayıtlı vize işlemi bulunamadı.
                 </div>
               ) : (
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ background: '#f1f5f9' }}>
                       <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>İşlem Tarihi</th>
                       <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Eski Hologram</th>
                       <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Yeni Hologram</th>
                       <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>İşlemi Yapan</th>
                     </tr>
                   </thead>
                   <tbody>
                     {selectedGemi.tarihce_vize.map((islem, i) => (
                       <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                         <td style={{ padding: '12px', fontWeight: '500' }}>{islem.islemTarihi}</td>
                         <td style={{ padding: '12px', color: '#64748b' }}>{islem.eskiHologram || '-'}</td>
                         <td style={{ padding: '12px', fontWeight: '700', color: '#10b981' }}>{islem.yeniHologram}</td>
                         <td style={{ padding: '12px' }}>{islem.memur || '-'}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
          )}

          {/* 3 ve 4 Diğer Sekmeler Şablon */}
          {(activeTab === 'satis' || activeTab === 'ceza') && (
            <div>
              {activeTab === 'ceza' && (selectedGemi.cezaVeIptal?.iptalNedeni || selectedGemi.cezaVeIptal?.cezaMaddesi || selectedGemi.cezaVeIptal?.elKoymaSuresi || selectedGemi.cezaVeIptal?.ceza1Tarihi) ? (
                 <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1', fontWeight: '700', color: '#b91c1c', fontSize: '18px', marginBottom: '4px' }}><ShieldAlert size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> İdari Para Cezası ve Elkoyma Sicili</div>
                    

                    {(() => {
                      if (!selectedGemi.cezaVeIptal.ceza1Tarihi && !selectedGemi.cezaVeIptal.elKoymaSuresi) return null;
                      const dusum1 = hesaplaCezaDusum(selectedGemi.cezaVeIptal.ceza1Tarihi, selectedGemi.cezaVeIptal.cezaSonaErmeTarihi);
                      const isExpired1 = isZamanAsimi(dusum1);
                      return (
                        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px 12px', background: isExpired1 ? '#f0fdf4' : 'transparent', borderRadius: '8px', border: isExpired1 ? '2px dashed #34d399' : 'none', opacity: isExpired1 ? 0.7 : 1, position: 'relative' }}>
                          {isExpired1 && (
                            <div style={{ position: 'absolute', top: '-10px', left: '16px', background: '#10b981', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              1. CEZA ZAMAN AŞIMINA UĞRADI (SİLİNDİ)
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '12px', color: isExpired1 ? '#059669' : '#ef4444', fontWeight: '600' }}>1. CEZA TARİHİ / MADDESİ</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: isExpired1 ? '#047857' : '#7f1d1d', textDecoration: isExpired1 ? 'line-through' : 'none' }}>{selectedGemi.cezaVeIptal.ceza1Tarihi || '-'} / {selectedGemi.cezaVeIptal.cezaMaddesi || '-'}</div>
                            <div style={{ marginTop: '12px', fontSize: '12px', color: isExpired1 ? '#059669' : '#8b5cf6', fontWeight: '600' }}>CEZA DÜŞÜM TARİHİ (+2 YIL)</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: isExpired1 ? '#047857' : '#6d28d9' }}>{dusum1}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: isExpired1 ? '#059669' : '#ef4444', fontWeight: '600' }}>1. EL KOYMA SÜRESİ / TARİHİ</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: isExpired1 ? '#047857' : '#7f1d1d', textDecoration: isExpired1 ? 'line-through' : 'none' }}>{selectedGemi.cezaVeIptal.elKoymaSuresi || '-'} / {selectedGemi.cezaVeIptal.elKoymaTarihi || '-'}</div>
                            {(selectedGemi.cezaVeIptal.elKoymaSuresi || selectedGemi.cezaVeIptal.ruhsatTeslimTarihi) && (
                              <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>1. İADE TARİHİ (OTOMATİK)</div>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#047857', textDecoration: isExpired1 ? 'line-through' : 'none' }}>{hesaplaIadeTarihi(selectedGemi.cezaVeIptal.elKoymaTarihi, selectedGemi.cezaVeIptal.elKoymaSuresi, selectedGemi.cezaVeIptal.ruhsatTeslimTarihi)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                    
                    {/* Ceza 2 */}
                    {(selectedGemi.cezaVeIptal.ceza2Tarihi || selectedGemi.cezaVeIptal.elKoymaSuresi2) && (() => {
                      const dusum2 = hesaplaCezaDusum(selectedGemi.cezaVeIptal.ceza2Tarihi, null);
                      const isExpired2 = isZamanAsimi(dusum2);
                      const dusum1ForBadge = selectedGemi.cezaVeIptal.ceza1Tarihi ? hesaplaCezaDusum(selectedGemi.cezaVeIptal.ceza1Tarihi, selectedGemi.cezaVeIptal.cezaSonaErmeTarihi) : null;
                      const isExpired1ForBadge = dusum1ForBadge ? isZamanAsimi(dusum1ForBadge) : false;

                      return (
                        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px 12px', background: isExpired2 ? '#f0fdf4' : 'transparent', borderRadius: '8px', border: isExpired2 ? '2px dashed #34d399' : 'none', borderTop: !isExpired2 ? '1px dashed #fca5a5' : undefined, opacity: isExpired2 ? 0.7 : 1, position: 'relative' }}>
                          {isExpired2 && (
                            <div style={{ position: 'absolute', top: '-10px', left: '16px', background: '#10b981', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              2. CEZA ZAMAN AŞIMINA UĞRADI (SİLİNDİ)
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '12px', color: isExpired2 ? '#059669' : '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                              2. CEZA TARİHİ
                              {isExpired1ForBadge && !isExpired2 && (
                                <span style={{ marginLeft: '8px', background: '#eff6ff', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', border: '1px solid #bfdbfe' }}>
                                  (1. Ceza Hükmünde)
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: isExpired2 ? '#047857' : '#7f1d1d', textDecoration: isExpired2 ? 'line-through' : 'none' }}>{selectedGemi.cezaVeIptal.ceza2Tarihi || '-'}</div>
                            <div style={{ marginTop: '12px', fontSize: '12px', color: isExpired2 ? '#059669' : '#8b5cf6', fontWeight: '600' }}>CEZA DÜŞÜM TARİHİ (+2 YIL)</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: isExpired2 ? '#047857' : '#6d28d9' }}>{dusum2}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: isExpired2 ? '#059669' : '#ef4444', fontWeight: '600' }}>2. EL KOYMA SÜRESİ / TARİHİ</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: isExpired2 ? '#047857' : '#7f1d1d', textDecoration: isExpired2 ? 'line-through' : 'none' }}>{selectedGemi.cezaVeIptal.elKoymaSuresi2 || '-'} / {selectedGemi.cezaVeIptal.elKoymaTarihi2 || '-'}</div>
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>2. İADE TARİHİ (OTOMATİK)</div>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: '#047857', textDecoration: isExpired2 ? 'line-through' : 'none' }}>{hesaplaIadeTarihi(selectedGemi.cezaVeIptal.elKoymaTarihi2, selectedGemi.cezaVeIptal.elKoymaSuresi2, '')}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Mevzuat Uyarı Paneli */}
                    {(() => {
                      // Eğer tamamen iptal edildiyse geleceğe dönük uyarıya gerek yok (veya zaten iptal yazıyor)
                      if (selectedGemi.cezaVeIptal.iptalNedeni) return null;
                      if (!selectedGemi.cezaVeIptal.ceza1Tarihi) return null;

                      const dusum1 = hesaplaCezaDusum(selectedGemi.cezaVeIptal.ceza1Tarihi, selectedGemi.cezaVeIptal.cezaSonaErmeTarihi);
                      const isExpired1 = isZamanAsimi(dusum1);
                      const hasCeza2 = !!selectedGemi.cezaVeIptal.ceza2Tarihi;
                      const dusum2 = hasCeza2 ? hesaplaCezaDusum(selectedGemi.cezaVeIptal.ceza2Tarihi, null) : null;
                      const isExpired2 = hasCeza2 ? isZamanAsimi(dusum2) : false;

                      let boxStyle = { padding: '16px', borderRadius: '8px', gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center' };
                      let icon = null;
                      let title = '';
                      let desc = '';

                      if (isExpired1 && (!hasCeza2 || isExpired2)) {
                        // Senaryo: Her şey silinmiş
                        boxStyle = { ...boxStyle, background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' };
                        icon = <ShieldAlert size={24} color="#166534" />;
                        title = 'SİCİL TEMİZ (ZAMAN AŞIMI)';
                        desc = 'Kayıtlı tüm cezalar 2 yıllık zaman aşımı süresini doldurmuştur. Aynı maddeden işlenecek olası yeni bir ihlal, mevzuat gereği 1. Ceza (1 Ay El Koyma) statüsünde değerlendirilecektir.';
                      } else if (!isExpired1 && !hasCeza2) {
                        // Senaryo: Sadece 1. ceza var ve aktif
                        boxStyle = { ...boxStyle, background: '#fffbeb', border: '1px solid #fde047', color: '#854d0e' };
                        icon = <AlertTriangle size={24} color="#854d0e" />;
                        title = '1 AKTİF CEZA BULUNMAKTADIR';
                        desc = 'Geminin aynı maddeden işleyeceği olası yeni bir ihlalde, 2. Ceza (3 Ay El Koyma) prosedürü uygulanacaktır.';
                      } else if (isExpired1 && hasCeza2 && !isExpired2) {
                        // Senaryo: 1. ceza silinmiş, 2. ceza aktif (KAYDIRMA KURALI)
                        boxStyle = { ...boxStyle, background: '#eff6ff', border: '1px solid #93c5fd', color: '#1e40af' };
                        icon = <Info size={24} color="#1e40af" />;
                        title = 'DİKKAT';
                        desc = '1. Ceza zaman aşımına uğradığı için mevcut 2. Ceza, mevzuat gereği 1. Ceza hükmüne gerilemiştir. Olası yeni bir ihlalde RUHSAT İPTALİ DEĞİL, tekrar 2. Ceza (3 Ay El Koyma) uygulanacaktır.';
                      } else if (!isExpired1 && hasCeza2 && !isExpired2) {
                        // Senaryo: İkisi de aktif
                        boxStyle = { ...boxStyle, background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' };
                        icon = <AlertTriangle size={24} color="#991b1b" />;
                        title = 'KRİTİK UYARI: 2 AKTİF CEZA!';
                        desc = 'Geminin zaman aşımına uğramamış 2 aktif cezası bulunmaktadır. Aynı maddeden işlenecek olası yeni bir ihlalde 3. Ceza prosedürü olan RUHSAT İPTALİ işlemi uygulanacaktır!';
                      }

                      return (
                        <div style={boxStyle}>
                          <div>{icon}</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{title}</div>
                            <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{desc}</div>
                          </div>
                        </div>
                      );
                    })()}

                    {selectedGemi.cezaVeIptal.iptalNedeni && (
                      <div style={{ gridColumn: '1 / -1', marginTop: '12px', padding: '12px', background: '#7f1d1d', color: 'white', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#fca5a5' }}>İPTAL / DESTEKLEME GEREKÇESİ</div>
                        <div style={{ fontSize: '15px', fontWeight: '700' }}>{selectedGemi.cezaVeIptal.iptalNedeni}</div>
                      </div>
                    )}
                 </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                   <History size={48} color="#94a3b8" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                   <h3 style={{ fontSize: '18px', color: '#475569', marginBottom: '8px' }}>{activeTab === 'satis' ? 'Kayıt Bulunamadı' : 'Sicil Temiz'}</h3>
                   <p>{activeTab === 'satis' ? 'Bu tekneye ait geçmiş satış/devir kaydı bulunmamaktadır.' : 'Bu tekne ile ilgili herhangi bir idari para cezası veya ruhsat iptal kaydı bulunmamaktadır.'}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  // ---------------- ANA LİSTE EKRANI ---------------- //
  return (
    <div className="reports-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="reports-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.5px' }}>
            <Ship size={32} color="#059669" />
            Ana Gemi Sicil Arşivi
          </h2>
          <p style={{ color: '#64748b', marginTop: '6px', fontSize: '15px' }}>
            Toplam <strong>{data.length}</strong> gemi dosyası listeleniyor. Hızlı arama için plaka veya hologram no giriniz.
          </p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={22} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Jet hızında arama: Plaka No, Gemi Adı, Sahip Adı veya Hologram No yazın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 50px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '16px', fontWeight: '500', transition: 'border-color 0.2s', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <select
            value={filterYedek}
            onChange={(e) => setFilterYedek(e.target.value)}
            style={{ width: '250px', padding: '16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', fontWeight: '600', color: '#475569', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">Yedek Filtresi (Tümü)</option>
            <option value="VAR_AKTIF">Sadece Aktif Yedeği Olanlar</option>
            <option value="VAR_TUMU">Yedeği Olanlar (Pasifler Dahil)</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {filteredData.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
            <AlertTriangle size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '16px' }}>Kriterlerinize uygun gemi bulunamadı.</p>
          </div>
        ) : (
          <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plaka / Tip</th>
                  <th style={{ padding: '16px 20px', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gemi Adı</th>
                  <th style={{ padding: '16px 20px', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gemi Sahibi</th>
                  <th style={{ padding: '16px 20px', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hologram</th>
                  <th style={{ padding: '16px 20px', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vize Tarihi</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 100).map((row, idx) => (
                  <tr 
                    key={idx} 
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setSelectedGemi(row)}
                  >
                    <td style={{ padding: '16px 20px' }}>
                       <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{row.plakaNo}</div>
                       <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{row.kimlik?.ruhsatTipi || '-'}</div>
                       {(() => {
                         const rowYedekler = yedekMap[row.plakaNo];
                         if (!rowYedekler || rowYedekler.length === 0) return null;
                         const activeYedek = rowYedekler.find(y => y.arsivDurumu !== 'PASİF' && y.guncelDurum === 'AKTİF');
                         if (activeYedek) {
                           return <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '700', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>YEDEĞİ VAR: {activeYedek.plakaNo}</div>;
                         }
                         const passiveYedek = rowYedekler[0];
                         return <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '700', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>ESKİ YEDEK: {passiveYedek.plakaNo}</div>;
                       })()}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#334155' }}>
                       {row.kimlik?.gemiAdi || '-'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                       <div style={{ fontWeight: '500', color: '#334155' }}>{row.kimlik?.sahibi || '-'}</div>
                       <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>TC: {row.kimlik?.tcKimlik || row.kimlik?.vergiNo || 'Bilinmiyor'}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                       <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                          {row.guncelHologram || 'YOK'}
                       </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#059669', fontWeight: '600' }}>
                       {row.tarihler?.sonVizeTarihi || '-'}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                       <button style={{ background: '#38bdf8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                         Dosyayı Aç
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length > 100 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px', background: '#f8fafc' }}>
                Hız ve performans için ilk 100 kayıt gösteriliyor. Kalan {filteredData.length - 100} kaydı bulmak için arama yapın.
              </div>
            )}
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default RuhsatListesi;
