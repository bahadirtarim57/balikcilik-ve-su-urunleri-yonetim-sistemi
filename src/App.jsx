import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import GenelDashboard from './components/GenelDashboard';
import IhlallerDashboard from './components/IhlallerDashboard';
import FinesTable from './components/FinesTable';
import Calculator from './components/Calculator';
import FormGenerator from './components/FormGenerator';
import Archive from './components/Archive';
import Reports from './components/Reports';
import LawArticles from './components/LawArticles';
import ErrorBoundary from './components/ErrorBoundary';
import InstitutionSettings from './components/InstitutionSettings';
import DataManagement from './components/DataManagement';
import PersonnelList from './components/PersonnelList';
import RoleAssignments from './components/RoleAssignments';
import PermissionMatrix from './components/PermissionMatrix';
import RevaluationRate from './components/RevaluationRate';
import Login from './components/Login';

import StokTespit from './components/StokTespit';
import TesisYonetimi from './components/TesisYonetimi';
import SunumModu from './components/SunumModu';
import HaritaRadar from './components/HaritaRadar';

import RuhsatAnaSayfa from './components/RuhsatAnaSayfa';
import YeniRuhsatSecim from './components/YeniRuhsatSecim';
import MevcutRuhsataIslemSecim from './components/MevcutRuhsataIslemSecim';
import YeniDenizRuhsatiFormu from './components/forms/YeniDenizRuhsatiFormu';
import YeniIcsuRuhsatiFormu from './components/forms/YeniIcsuRuhsatiFormu';
import YeniYedekRuhsatiFormu from './components/forms/YeniYedekRuhsatiFormu';
import RuhsatListesi from './components/RuhsatListesi';
import LeasedAreasSettings from './components/LeasedAreasSettings';
import GhostLoginModal from './components/GhostLoginModal';
import ElKoymaTutanagi from './components/forms/ElKoymaTutanagi';
import IdariParaCezasiKarari from './components/forms/IdariParaCezasiKarari';
import TutanakVeTebligat from './components/forms/TutanakVeTebligat';
import MulkiyetinKamuya from './components/forms/MulkiyetinKamuya';
import DenetimFormu from './components/forms/DenetimFormu';
import './index.css';
import excelCezalarJson from './data/excel_cezalar.json';
import { PROVINCES, DISTRICTS } from './utils/turkeyData';
import { getBranches } from './utils/excelData';
import { Toaster, toast } from 'react-hot-toast';
import { UserCircle, Shield, Palette, RefreshCcw, Ghost, Menu, X } from 'lucide-react';
import { loadFromSupabase, uploadLocalToSupabase } from './lib/storage';
import { useAuth } from './context/AuthContext';


const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const location = useLocation();
  const allowedPaths = ['/cezalar', '/hesaplama'];
  if (!allowedPaths.includes(location.pathname)) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
      <input 
        type="text" 
        placeholder="İhlal Nedeni veya Madde Ara..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px' }}
      />
    </div>
  );
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('app-selectedCity') || '');
  const [selectedUnitType, setSelectedUnitType] = useState(() => localStorage.getItem('app-selectedUnitType') || '');
  const [selectedUnit, setSelectedUnit] = useState(() => localStorage.getItem('app-selectedUnit') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(() => localStorage.getItem('app-selectedDistrict') || '');

  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'theme-blue');
  const [showThemeColors, setShowThemeColors] = useState(false);
  const [showGhostModal, setShowGhostModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const { user: currentUser, login, setUser: setCurrentUser, originalAdminUser, stopImpersonating } = useAuth();

  // Supabase'den veri yükle - uygulama açılışında
  useEffect(() => {
    const syncFromSupabase = async () => {
      const count = await loadFromSupabase();
      if (count === 0) {
        // Supabase boş veya bağlantı yok - local verileri Supabase'e yükle
        console.log('Supabase boş, local veriler yükleniyor...');
        await uploadLocalToSupabase();
      }
      setSupabaseReady(true);
    };
    syncFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('app-selectedCity', selectedCity);
  }, [selectedCity]);
  
  useEffect(() => {
    localStorage.setItem('app-selectedUnitType', selectedUnitType);
  }, [selectedUnitType]);
  
  useEffect(() => {
    localStorage.setItem('app-selectedUnit', selectedUnit);
  }, [selectedUnit]);
  
  useEffect(() => {
    localStorage.setItem('app-selectedDistrict', selectedDistrict);
  }, [selectedDistrict]);

  useEffect(() => {
    if (!currentUser) return;
    const uRoles = JSON.parse(localStorage.getItem('user_roles') || '{}');
    const userIdentifier = currentUser.sicil || currentUser.adSoyad || currentUser.name;
    const isOwner = currentUser.adSoyad === 'Bahadır ŞENOĞLU' || currentUser.name === 'Bahadır ŞENOĞLU';
    const role = (currentUser.sicil === 'admin' || isOwner) ? 'Genel Koordinatör' : (uRoles[userIdentifier] || 'Personel');
    
    if (role === 'Genel Koordinatör') {
      // Full access
    } else if (['Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı'].includes(role)) {
      // Sadece il bazında tam yetki, şehri değiştirmiyoruz (seçili şehir kalıyor)
    } else {
      // Normal personel: birimini otomatik seç
      const birim = currentUser.birim || currentUser.unit || '';
      if (birim.toLowerCase().includes('ilçe')) {
        setSelectedUnitType('İlçe');
        const distName = birim.split(' ')[0];
        setSelectedDistrict(distName);
      } else if (birim) {
        setSelectedUnitType('Şube');
        let matchedBranch = birim;
        const branches = getBranches();
        if (birim.toLowerCase().includes('şube')) {
           const prefix = birim.toLowerCase().split('şube')[0].trim();
           const found = branches.find(b => b.toLowerCase().includes(prefix));
           if (found) matchedBranch = found;
        } else {
           const found = branches.find(b => b.toLowerCase() === birim.toLowerCase());
           if (found) matchedBranch = found;
        }
        setSelectedUnit(matchedBranch);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Main data state with localStorage persistence
  const [cezalarData, setCezalarData] = useState(() => {
    let parsedData = null;
    const saved = localStorage.getItem('cezalarData2026_excel_v3');
    if (saved) {
      try { 
        parsedData = JSON.parse(saved); 
        if (Array.isArray(parsedData)) {
          parsedData = parsedData.map(item => {
            if (item.ihlal_nedeni) {
              item.ihlal_nedeni = item.ihlal_nedeni.replace('12 metre dahil, daha büyük', '22 metre dahil, daha büyük');
              item.ihlal_nedeni = item.ihlal_nedeni.replace(/ürünükaraya/g, 'ürünü karaya');
            }
            return item;
          });
        }
      } catch (e) { parsedData = null; }
    }
    
    const sourceData = Array.isArray(parsedData) ? parsedData : excelCezalarJson.TümCezalar;
    
    // Add unique IDs to data if they don't exist
    const finalData = sourceData.map((item, idx) => ({
      ...item, id: item.id || `ceza-${idx}-${Date.now()}`
    }));
    
    return finalData;
  });

  useEffect(() => {
    localStorage.setItem('cezalarData2026_excel_v3', JSON.stringify(cezalarData));
  }, [cezalarData]);

  const handleSaveItem = (item) => {
    setCezalarData(prev => {
      const list = [...prev];
      const index = list.findIndex(i => i.id === item.id);
      
      if (index >= 0) {
        list[index] = item;
        toast.success('Kayıt başarıyla güncellendi!', { icon: '📝' });
      } else {
        list.push(item);
        toast.success('Yeni kayıt başarıyla eklendi!', { icon: '✨' });
      }
      return list;
    });
  };

  const handleDeleteItem = (itemId) => {
    setCezalarData(prev => prev.filter(i => i.id !== itemId));
    toast.success('Kayıt silindi.', { icon: '🗑️' });
  };

  const currentDistricts = DISTRICTS[selectedCity] || [];
  const dynamicBranches = getBranches();
  const disabledBranches = JSON.parse(localStorage.getItem('disabledBranches') || '[]');

  const activeUnitName = selectedUnitType === 'İlçe' ? (selectedDistrict ? `${selectedDistrict} İlçe` : 'İlçe Seçilmedi') : (selectedUnitType === 'Şube' ? (selectedUnit || 'Şube Seçilmedi') : 'Birim Seçilmedi');

  const uRoles = JSON.parse(localStorage.getItem('user_roles') || '{}');
  const isOwner = currentUser?.adSoyad === 'Bahadır ŞENOĞLU' || currentUser?.name === 'Bahadır ŞENOĞLU';
  const realRole = (currentUser?.sicil === 'admin' || isOwner) ? 'Genel Koordinatör' : (uRoles[currentUser?.sicil || currentUser?.adSoyad] || 'Personel');
  const isViewingAsPersonel = localStorage.getItem('view_as_personel') === 'true';
  const currentRole = isViewingAsPersonel ? 'Personel' : realRole;
  
  const isCityLocked = currentRole !== 'Genel Koordinatör';
  const isUnitLocked = !['Genel Koordinatör', 'Yetkili Yönetici', 'İl Müdürü', 'İl Müdür Yardımcısı'].includes(currentRole);

  const savedPermissions = JSON.parse(localStorage.getItem('role_permissions') || 'null') || {
    'Genel Koordinatör': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel', '/ayarlar', '/rol-atamalari', '/yetki-matrisi'],
    'Yetkili Yönetici': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel', '/ayarlar', '/rol-atamalari', '/yetki-matrisi'],
    'İl Müdürü': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel'],
    'İl Müdür Yardımcısı': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel'],
    'Şube Müdürü': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel'],
    'İlçe Müdürü': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel'],
    'Birim Sorumlusu': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/veri-yonetimi', '/personel', '/rol-atamalari'],
    'Personel': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv']
  };

  const hasAccess = (path) => {
    if (currentRole === 'Genel Koordinatör') return true;
    if (path.startsWith('/formlar/')) return true;

    if (currentRole === 'Personel' && currentUser) {
      const modulePermissions = JSON.parse(localStorage.getItem('modulePermissionsData') || '{}');
      const pName = currentUser.originalName || currentUser.name || currentUser.adSoyad;
      const perms = modulePermissions[pName] || {};

      if (path.startsWith('/ruhsat')) return !!perms.ruhsat;
      if (path.startsWith('/stok-tespiti')) return !!perms.stok;
      if (path.startsWith('/tesis-yonetimi') || path.startsWith('/sunum-modu') || path.startsWith('/harita-radar')) return !!perms.yetistiricilik;
      if (path.startsWith('/ihlaller-ozet') || path === '/cezalar' || path === '/hesaplama' || path === '/kanun-maddeleri' || path === '/arsiv') return !!perms.ihlaller;
    }

    if (path.startsWith('/ruhsat') || path.startsWith('/stok-tespiti') || path.startsWith('/tesis-yonetimi') || path.startsWith('/sunum-modu') || path.startsWith('/harita-radar')) return true;

    let checkPath = path;
    const allowed = savedPermissions[currentRole] || [];
    
    if (checkPath === '/form') {
      return allowed.includes('/hesaplama');
    }
    
    return allowed.includes(checkPath);
  };

  const ProtectedRoute = ({ path, children }) => {
    if (!hasAccess(path)) {
      if (path !== '/' && hasAccess('/')) {
        return <Navigate to="/" replace />;
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
          <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
            <Shield style={{ color: '#ef4444' }} size={48} />
          </div>
          <h2 style={{ color: '#111827', fontSize: '24px', marginBottom: '8px' }}>Yetkisiz Erişim</h2>
          <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '400px' }}>Bu sayfayı görüntülemek için yeterli yetkiniz bulunmamaktadır. Lütfen sistem yöneticinizle iletişime geçin.</p>
        </div>
      );
    }
    return children;
  };

  if (!currentUser) {
    return (
      <React.Fragment>
        <Toaster position="top-right" />
        <Login onLogin={login} activeUnitName={activeUnitName} selectedCity={selectedCity} />
      </React.Fragment>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '10px', background: '#333', color: '#fff', fontSize: '14px' } }} />
      {originalAdminUser && (
        <div style={{ background: '#ef4444', color: 'white', padding: '8px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', fontWeight: '500', fontSize: '14px', zIndex: 9999 }}>
          Dikkat: Şu an {currentUser?.adSoyad || currentUser?.name} ({currentRole}) hesabı üzerinden işlem yapıyorsunuz.
          <button 
            onClick={() => {
              if (window.confirm('Kendi kimliğinize dönmek istediğinize emin misiniz?')) {
                stopImpersonating();
              }
            }}
            style={{ background: 'white', color: '#ef4444', border: 'none', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
          >
            Kendi Hesabıma Dön
          </button>
        </div>
      )}
      {showInstallBanner && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: '#0ea5e9', color: 'white', padding: '16px', borderRadius: '12px', zIndex: 10000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/pwa-192x192.png" style={{ width: '40px', height: '40px', borderRadius: '8px' }} alt="Icon" />
            <div>
              <div style={{ fontWeight: 'bold' }}>BSÜSY</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Uygulamayı telefonuna kur</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowInstallBanner(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' }}>İptal</button>
            <button onClick={handleInstallApp} style={{ background: 'white', color: '#0ea5e9', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold' }}>Yükle</button>
          </div>
        </div>
      )}
      <div className="app-container" style={{ height: originalAdminUser ? 'calc(100dvh - 36px)' : '100dvh' }}>
        <Sidebar 
          selectedCity={selectedCity}
          selectedUnit={activeUnitName !== 'Birim Seçilmedi' ? activeUnitName : ''}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="main-content">
          <header className="top-header" style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="header-controls" style={{ width: '100%', justifyContent: 'space-between', padding: 0, paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
              <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="unit-selector" style={{ flex: 1, display: 'flex', gap: '20px', background: 'transparent', border: 'none', padding: 0 }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="unit-label" style={{ margin: 0, color: '#4b5563' }}>İl Seçiniz:</span>
                  <select
                    className="unit-select"
                    style={{ background: isCityLocked ? '#f3f4f6' : 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: isCityLocked ? 'not-allowed' : 'pointer' }}
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value)
                      setSelectedDistrict('')
                      setSelectedUnit('')
                    }}
                    disabled={isCityLocked}
                  >
                    <option value="">İl Seçiniz</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="unit-label" style={{ margin: 0, color: '#4b5563' }}>Birim Seçiniz:</span>
                  <select
                    className="unit-select"
                    style={{ background: isUnitLocked ? '#f3f4f6' : 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: isUnitLocked ? 'not-allowed' : 'pointer' }}
                    value={selectedUnitType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedUnitType(val);
                      setSelectedDistrict('');
                      if (val === 'İl Dışı' || val === 'Emekli') {
                        setSelectedUnit(val);
                      } else {
                        setSelectedUnit('');
                      }
                    }}
                    disabled={isUnitLocked}
                  >
                    <option value="">Birim Seçiniz</option>
                    <option value="Şube">Şube</option>
                    <option value="İlçe">İlçe</option>
                    <option value="İl Dışı">İl Dışı</option>
                    <option value="Emekli">Emekli</option>
                  </select>
                </div>

                {selectedUnitType === 'İlçe' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="unit-label" style={{ margin: 0, color: '#4b5563' }}>İlçe Seçiniz:</span>
                    <select
                      className="unit-select"
                      style={{ background: isUnitLocked ? '#f3f4f6' : 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: isUnitLocked ? 'not-allowed' : 'pointer' }}
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={isUnitLocked}
                    >
                      <option value="">İlçe Seçiniz</option>
                      {currentDistricts.map(ilce => {
                        const isDisabled = disabledBranches.includes(`${ilce} İlçe`) && currentRole !== 'Genel Koordinatör';
                        return (
                          <option key={ilce} value={ilce} disabled={isDisabled}>
                            {ilce} İlçe Tarım ve Orman Müdürlüğü {isDisabled ? '(Pasif)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {selectedUnitType === 'Şube' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="unit-label" style={{ margin: 0, color: '#4b5563' }}>Şube Seçiniz:</span>
                    <select
                      className="unit-select"
                      style={{ background: isUnitLocked ? '#f3f4f6' : 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: isUnitLocked ? 'not-allowed' : 'pointer' }}
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      disabled={isUnitLocked}
                    >
                      <option value="">Şube Seçiniz</option>
                      {dynamicBranches.map(sube => {
                        const isDisabled = disabledBranches.includes(sube) && currentRole !== 'Genel Koordinatör';
                        return (
                          <option key={sube} value={sube} disabled={isDisabled}>
                            {sube} {isDisabled ? '(Pasif)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <UserCircle size={16} color="#3b82f6" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e2937' }}>Hoşgeldiniz, {currentUser?.adSoyad || 'Sistem Yöneticisi'}</span>
                </div>
                
                {!originalAdminUser && ['Genel Koordinatör', 'Yetkili Yönetici'].includes(currentRole) && (
                  <button 
                    onClick={() => setShowGhostModal(true)}
                    style={{ background: '#f3e8ff', color: '#9333ea', border: '1px solid #e9d5ff', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#e9d5ff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#f3e8ff'; }}
                  >
                    <Ghost size={16} /> Kimliğine Bürün
                  </button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <Shield size={16} color="#10b981" />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e2937' }}>Birim: <strong style={{ color: '#047857' }}>{activeUnitName}</strong></span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <button 
                    onClick={() => setShowThemeColors(!showThemeColors)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.8)', borderRadius: '20px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '12px', color: '#4b5563', fontWeight: '500' }}
                    title="Tema Rengi Değiştir"
                  >
                    <Palette size={14} /> Renk Seçiniz
                  </button>
                  
                  {showThemeColors && (
                    <div style={{ display: 'flex', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.95)', borderRadius: '20px', border: '1px solid #e5e7eb', position: 'absolute', top: '110%', right: '0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 10 }}>
                      <button onClick={() => { setTheme('theme-blue'); setShowThemeColors(false); }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1a73e8', border: theme === 'theme-blue' ? '2px solid #111827' : 'none', cursor: 'pointer' }} title="Mavi Tema"></button>
                      <button onClick={() => { setTheme('theme-green'); setShowThemeColors(false); }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#059669', border: theme === 'theme-green' ? '2px solid #111827' : 'none', cursor: 'pointer' }} title="Yeşil Tema"></button>
                      <button onClick={() => { setTheme('theme-purple'); setShowThemeColors(false); }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#7c3aed', border: theme === 'theme-purple' ? '2px solid #111827' : 'none', cursor: 'pointer' }} title="Mor Tema"></button>
                      <button onClick={() => { setTheme('theme-orange'); setShowThemeColors(false); }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ea580c', border: theme === 'theme-orange' ? '2px solid #111827' : 'none', cursor: 'pointer' }} title="Turuncu Tema"></button>
                      <button onClick={() => { setTheme('theme-black'); setShowThemeColors(false); }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#111827', border: theme === 'theme-black' ? '2px solid #6b7280' : 'none', cursor: 'pointer' }} title="Siyah Tema"></button>
                    </div>
                  )}
                </div>

                <button className="refresh-btn" onClick={() => window.location.reload()} style={{ padding: '6px 12px', fontSize: '12px' }}>
                  <RefreshCcw size={14} /> Yenile
                </button>
              </div>
            </div>
          </header>
          
          <div className="content-container">
            <ErrorBoundary>
                            <Routes>
                <Route path="/" element={<ProtectedRoute path="/"><GenelDashboard data={cezalarData} /></ProtectedRoute>} />
                <Route path="/ihlaller-ozet" element={<ProtectedRoute path="/ihlaller-ozet"><IhlallerDashboard data={cezalarData} /></ProtectedRoute>} />
                  <Route path="/cezalar" element={<ProtectedRoute path="/cezalar"><FinesTable data={cezalarData} searchTerm={searchTerm} onSave={handleSaveItem} onDelete={handleDeleteItem} /></ProtectedRoute>} />
                <Route path="/hesaplama" element={<ProtectedRoute path="/hesaplama"><Calculator data={cezalarData} /></ProtectedRoute>} />
                <Route path="/form" element={<ProtectedRoute path="/form"><FormGenerator selectedCity={selectedCity} selectedUnit={selectedUnit} /></ProtectedRoute>} />
                <Route path="/formlar/idari-para-cezasi" element={<ProtectedRoute path="/formlar/idari-para-cezasi"><IdariParaCezasiKarari selectedCity={selectedCity} selectedUnit={selectedUnit} /></ProtectedRoute>} />
                <Route path="/formlar/tutanak-ve-tebligat" element={<ProtectedRoute path="/formlar/tutanak-ve-tebligat"><TutanakVeTebligat selectedCity={selectedCity} selectedUnit={selectedUnit} /></ProtectedRoute>} />
                <Route path="/formlar/el-koyma" element={<ProtectedRoute path="/formlar/el-koyma"><ElKoymaTutanagi selectedCity={selectedCity} selectedUnit={selectedUnit} /></ProtectedRoute>} />
                <Route path="/formlar/mulkiyetin-kamuya-gecirilmesi" element={<ProtectedRoute path="/formlar/mulkiyetin-kamuya-gecirilmesi"><MulkiyetinKamuya selectedCity={selectedCity} selectedUnit={selectedUnit} /></ProtectedRoute>} />
                <Route path="/formlar/denetim-formu" element={<ProtectedRoute path="/formlar/denetim-formu"><DenetimFormu selectedCity={selectedCity} selectedUnit={selectedUnit} /></ProtectedRoute>} />
                <Route path="/arsiv" element={<ProtectedRoute path="/arsiv"><Archive /></ProtectedRoute>} />
                <Route path="/raporlar" element={<ProtectedRoute path="/raporlar"><Reports /></ProtectedRoute>} />
                <Route path="/kanun-maddeleri" element={<ProtectedRoute path="/kanun-maddeleri"><LawArticles data={cezalarData} /></ProtectedRoute>} />
                <Route path="/personel" element={<ProtectedRoute path="/personel"><PersonnelList selectedProvince={selectedCity} selectedUnit={selectedUnit} selectedUnitType={selectedUnitType} selectedDistrict={selectedDistrict} currentRole={currentRole} /></ProtectedRoute>} />
                <Route path="/ayarlar" element={<ProtectedRoute path="/ayarlar"><InstitutionSettings /></ProtectedRoute>} />
                <Route path="/veri-yonetimi" element={<ProtectedRoute path="/veri-yonetimi"><DataManagement /></ProtectedRoute>} />
                <Route path="/yeniden-degerlendirme" element={<ProtectedRoute path="/yeniden-degerlendirme"><RevaluationRate /></ProtectedRoute>} />
                <Route path="/rol-atamalari" element={<ProtectedRoute path="/rol-atamalari"><RoleAssignments selectedCity={selectedCity} selectedUnit={selectedUnit} selectedUnitType={selectedUnitType} selectedDistrict={selectedDistrict} currentRole={currentRole} /></ProtectedRoute>} />
                <Route path="/yetki-matrisi" element={<ProtectedRoute path="/yetki-matrisi"><PermissionMatrix /></ProtectedRoute>} />
                <Route path="/stok-tespiti" element={<ProtectedRoute path="/stok-tespiti"><StokTespit /></ProtectedRoute>} />
                <Route path="/tesis-yonetimi" element={<ProtectedRoute path="/tesis-yonetimi"><TesisYonetimi selectedCity={selectedCity} /></ProtectedRoute>} />
                <Route path="/sunum-modu" element={<ProtectedRoute path="/sunum-modu"><SunumModu /></ProtectedRoute>} />
                <Route path="/harita-radar" element={<ProtectedRoute path="/harita-radar"><HaritaRadar /></ProtectedRoute>} />
                <Route path="/ruhsat" element={<ProtectedRoute path="/ruhsat"><RuhsatAnaSayfa /></ProtectedRoute>} />
                <Route path="/ruhsat/liste" element={<ProtectedRoute path="/ruhsat/liste"><RuhsatListesi /></ProtectedRoute>} />
                <Route path="/ruhsat/yeni-kayit" element={<ProtectedRoute path="/ruhsat/yeni-kayit"><YeniRuhsatSecim /></ProtectedRoute>} />
                <Route path="/ruhsat/mevcut-islem" element={<ProtectedRoute path="/ruhsat/mevcut-islem"><MevcutRuhsataIslemSecim /></ProtectedRoute>} />
                <Route path="/ruhsat/yeni-kayit/deniz" element={<ProtectedRoute path="/ruhsat/yeni-kayit/deniz"><YeniDenizRuhsatiFormu /></ProtectedRoute>} />
                <Route path="/ruhsat/yeni-kayit/icsu" element={<ProtectedRoute path="/ruhsat/yeni-kayit/icsu"><YeniIcsuRuhsatiFormu /></ProtectedRoute>} />
                <Route path="/ruhsat/yeni-kayit/yedek" element={<ProtectedRoute path="/ruhsat/yeni-kayit/yedek"><YeniYedekRuhsatiFormu /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <GhostLoginModal isOpen={showGhostModal} onClose={() => setShowGhostModal(false)} />
    </Router>
  );
}

export default App;
