import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Presentation, Home, Fish, Archive, BookOpen, Calculator, Settings, Users, Scale, PieChart, Shield, LogOut, UserCog, Database, FileText, Rocket, TrendingUp, Ship, CheckCircle, AlertTriangle, MapPin, Building2, FileBadge, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { getMinistryName, PERSONELLER } from '../utils/excelData';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GhostLoginModal from './GhostLoginModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const IconMap = { Presentation, Home, Fish, Archive, BookOpen, Calculator, Settings, Users, Scale, PieChart, Shield, LogOut, UserCog, Database, FileText, Rocket, TrendingUp, Ship, CheckCircle, AlertTriangle, MapPin, Building2 };

const defaultSections = [
  {
    id: 'section-genel',
    title: 'GENEL',
    items: [
      { id: '/', label: 'Dashboard', iconName: 'Home', link: '/' }
    ]
  },
  {
    id: 'section-ruhsat',
    title: 'RUHSAT İŞLEMLERİ',
    items: [
      { id: '/ruhsat', label: 'Ruhsat İşlemleri', iconName: 'FileBadge', link: '/ruhsat' }
    ]
  },
  {
    id: 'section-stok',
    title: 'STOK İŞLEMLERİ',
    items: [
      { id: '/stok-tespiti', label: 'Stok İşlemleri', iconName: 'Database', link: '/stok-tespiti' }
    ]
  },
  {
    id: 'section-tesis',
    title: 'YETİŞTİRİCİLİK İŞLEMLERİ',
    items: [
      { id: '/tesis-yonetimi', label: 'Tesis Yönetimi', iconName: 'Building2', link: '/tesis-yonetimi' },
      { id: '/sunum-modu', label: 'Yetiştiricilik Sunumu', iconName: 'Presentation', link: '/sunum-modu' },
      { id: '/harita-radar', label: 'Harita', iconName: 'Map', link: '/harita-radar' }
    ]
  },
  {
    id: 'section-ipc',
    title: '1380 SAYILI YASA İHLALLERİ',
    items: [
      { id: '/kanun-maddeleri', label: 'Kanun Rehberi', iconName: 'BookOpen', link: '/kanun-maddeleri' },
      { id: '/hesaplama', label: 'İhlal Karşılığı İPC Hazırlama', iconName: 'Calculator', link: '/hesaplama' },
      { id: '/cezalar', label: 'İPC Cetveli', iconName: 'Fish', link: '/cezalar' },
      { id: '/formlar/idari-para-cezasi', label: 'EK-10: İdari Para Cezası', iconName: 'FileText', link: '/formlar/idari-para-cezasi' },
      { id: '/formlar/tutanak-ve-tebligat', label: 'EK-11: Tutanak ve Tebligat', iconName: 'FileText', link: '/formlar/tutanak-ve-tebligat' },
      { id: '/formlar/el-koyma', label: 'EK-12: Zaptetme Tutanağı', iconName: 'FileText', link: '/formlar/el-koyma' },
      { id: '/formlar/mulkiyetin-kamuya-gecirilmesi', label: 'Mülkiyetin Kamuya Geç.', iconName: 'FileText', link: '/formlar/mulkiyetin-kamuya-gecirilmesi' },
      { id: '/formlar/denetim-formu', label: 'Denetim Formu', iconName: 'FileText', link: '/formlar/denetim-formu' },
      { id: '/raporlar', label: 'İstatistik & İcmal', iconName: 'PieChart', link: '/raporlar' },
      { id: '/arsiv', label: 'Ceza Arşivi / Sicil', iconName: 'Archive', link: '/arsiv' }
    ]
  },
  {
    id: 'section-ayarlar',
    title: 'SİSTEM AYARLARI',
    items: [
      { id: '/personel', label: 'Personel Listesi', iconName: 'Users', link: '/personel' },
      { id: '/ayarlar', label: 'Kurum Ayarları', iconName: 'Settings', link: '/ayarlar' },
      { id: '/veri-yonetimi', label: 'Veri Yönetimi', iconName: 'Database', link: '/veri-yonetimi' },
      { id: '/yeniden-degerlendirme', label: 'Yeniden Değerlendirme', iconName: 'TrendingUp', link: '/yeniden-degerlendirme' },
      { id: '/rol-atamalari', label: 'Sistem Yetki Yönetimi', iconName: 'UserCog', link: '/rol-atamalari' },
      { id: '/yetki-matrisi', label: 'Detaylı Yetki Matrisi', iconName: 'Shield', link: '/yetki-matrisi' }
    ]
  }
];

const Sidebar = ({ selectedCity, selectedUnit, currentUser, setCurrentUser }) => {
  const { originalAdminUser, stopImpersonating, logout } = useAuth();
  const [isGhostLoginModalOpen, setIsGhostLoginModalOpen] = useState(false);
  const ministryName = getMinistryName();
  const [personnelList, setPersonnelList] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [rolePermissions, setRolePermissions] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    // If it's the ONLY core section, don't let them close it
    let coreCount = 0;
    sections.forEach(sec => {
      if (sec.id !== 'section-genel' && sec.id !== 'section-ayarlar') {
        const visibleItems = sec.items.filter(item => hasAccess(item.id));
        if (visibleItems.length > 0 || currentRole === 'Genel Koordinatör') coreCount++;
      }
    });
    if (coreCount === 1 && id !== 'section-genel' && id !== 'section-ayarlar' && expandedSections[id]) {
      return; // Do nothing, keep it open
    }
    
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('sidebar_config_v4');
    if (saved) {
      try { 
        let parsed = JSON.parse(saved); 
        const hasOldRuhsat = parsed.some(s => s.items && s.items.some(i => i.id === '/ruhsat/deniz'));
        if (hasOldRuhsat) return defaultSections;
        
        // Auto-merge missing items & deduplicate
        // 1. Remove duplicates (keep the ones in user's custom sections over the default ones if possible, 
        // actually we'll just keep the LAST occurrence to preserve items moved downwards)
        let seenIds = new Set();
        for (let i = parsed.length - 1; i >= 0; i--) {
            parsed[i].items = parsed[i].items.filter(item => {
                if (seenIds.has(item.id)) return false;
                seenIds.add(item.id);
                return true;
            }).reverse();
        }
        parsed.forEach(p => p.items.reverse()); // restore original order inside sections
        
        // 2. Add missing items
        defaultSections.forEach(ds => {
          let ps = parsed.find(p => p.id === ds.id);
          
          ds.items.forEach(di => {
             let existsAnywhere = false;
             let existingItem = null;
             for (let section of parsed) {
                 let found = section.items.find(pi => pi.id === di.id);
                 if (found) {
                     existsAnywhere = true;
                     existingItem = found;
                     break;
                 }
             }
             
             if (!existsAnywhere) {
                 if (ps) {
                     ps.items.push(di);
                 } else {
                     // Create section if not exists
                     let newSection = parsed.find(p => p.id === ds.id);
                     if (!newSection) {
                         newSection = { ...ds, items: [] };
                         parsed.push(newSection);
                     }
                     newSection.items.push(di);
                 }
             } else if (existingItem) {
                 existingItem.label = di.label;
                 existingItem.iconName = di.iconName;
             }
          });
        });
        
        // Save cleaned version back so duplicates are gone from localStorage too
        localStorage.setItem('sidebar_config_v4', JSON.stringify(parsed));
        
        return parsed;
      } catch (e) { return defaultSections; }
    }
    return defaultSections;
  });

  const handlePublish = async () => {
    if (!window.confirm("Sitenin yeni sürümünü Vercel'da yayınlamak istediğinize emin misiniz? Bu işlem 20-30 saniye sürebilir.")) return;
    setIsPublishing(true);
    const publishToast = toast.loading("Sistem derleniyor ve yayınlanıyor... Lütfen bekleyin ğŸš€");
    try {
      const res = await fetch('/api/publish', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success("Site başarıyla yayınlandı! Tüm değişiklikler canlıda.", { id: publishToast });
      } else {
        toast.error("Yayınlama hatası: " + data.error, { id: publishToast });
      }
    } catch (err) {
      toast.error("Yayınlama başlatılamadı. Sunucu bağlantısını kontrol edin.", { id: publishToast });
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    const localPersonnel = JSON.parse(localStorage.getItem('personnel_data') || '[]');
    const excelPersonnel = PERSONELLER || [];
    const merged = [...localPersonnel];
    excelPersonnel.forEach(ep => {
      const pName = ep.adSoyad || ep.name;
      const exists = merged.find(mp => (mp.sicil === ep.sicil && ep.sicil) || (mp.adSoyad || mp.name) === pName);
      if (!exists) {
        merged.push({ ...ep, adSoyad: pName, birim: ep.birim || ep.unit, unvan: ep.unvan || ep.title });
      }
    });
    setPersonnelList(merged);

    const savedRoles = JSON.parse(localStorage.getItem('user_roles') || '{}');
    setUserRoles(savedRoles);

    const savedPermissions = JSON.parse(localStorage.getItem('role_permissions') || 'null');
    if (savedPermissions) {
      setRolePermissions(savedPermissions);
    } else {
      const formRoutes = ['/formlar/idari-para-cezasi', '/formlar/el-koyma', '/formlar/mulkiyetin-kamuya-gecirilmesi', '/formlar/denetim-formu'];
      setRolePermissions({
        'Genel Koordinatör': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel', '/ayarlar', '/rol-atamalari', '/yetki-matrisi', '/yeniden-degerlendirme', '/ruhsat', ...formRoutes],
        'Yetkili Yönetici': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel', '/ayarlar', '/rol-atamalari', '/yetki-matrisi', '/yeniden-degerlendirme', '/ruhsat', ...formRoutes],
        'İl Müdürü': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel', ...formRoutes],
        'İl Müdür Yardımcısı': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel', ...formRoutes],
        'Şube Müdürü': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel', ...formRoutes],
        'İlçe Müdürü': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/personel', ...formRoutes],
        'Birim Sorumlusu': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', '/raporlar', '/veri-yonetimi', '/personel', '/rol-atamalari', '/yeniden-degerlendirme', ...formRoutes],
        'Personel': ['/', '/cezalar', '/kanun-maddeleri', '/hesaplama', '/arsiv', ...formRoutes]
      });
    }
  }, []);

  const realRole = currentUser?.sicil === 'admin' ? 'Genel Koordinatör' : (userRoles[currentUser?.sicil || currentUser?.adSoyad] || 'Personel');
  const currentRole = currentUser?.impersonated ? currentUser.role : realRole;
  const isViewingAsPersonel = !!originalAdminUser;
  const isManager = realRole !== 'Personel';

  const hasAccess = (menuId) => {
    if (currentRole === 'Genel Koordinatör') return true;
    if (menuId.startsWith('/formlar/')) return true;
    let checkPath = menuId;
    if (menuId.startsWith('/ruhsat/')) checkPath = '/ruhsat';
    const allowedMenus = rolePermissions[currentRole] || [];
    return allowedMenus.includes(checkPath);
  };

  const handleAdminReset = () => {
    logout();
    toast.success('Güvenli çıkış yapıldı.');
  };

  const toggleViewMode = () => {
    if (isViewingAsPersonel) {
      stopImpersonating();
      toast.success('Yönetici görünümüne dönüldü.', { icon: 'ğŸ›¡ï¸' });
    }
  };


  // Auto-expand logic if user has exactly 1 core task
  useEffect(() => {
    let coreCount = 0;
    let singleCoreId = null;
    
    sections.forEach(sec => {
      if (sec.id !== 'section-genel' && sec.id !== 'section-ayarlar') {
        const visibleItems = sec.items.filter(item => hasAccess(item.id));
        if (visibleItems.length > 0 || currentRole === 'Genel Koordinatör') {
          coreCount++;
          singleCoreId = sec.id;
        }
      }
    });

    if (coreCount === 1 && singleCoreId) {
      setExpandedSections(prev => {
        if (!prev[singleCoreId]) {
            return { ...prev, [singleCoreId]: true };
        }
        return prev;
      });
    }
  }, [sections, currentRole, personnelList]);

  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    
    if (type === 'section') {
      const newSections = Array.from(sections);
      const [removed] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, removed);
      setSections(newSections);
      localStorage.setItem('sidebar_config_v4', JSON.stringify(newSections));
      return;
    }
    
    // Type is item, moving between lists
    const sourceSectionIndex = sections.findIndex(s => s.id === source.droppableId);
    const destSectionIndex = sections.findIndex(s => s.id === destination.droppableId);
    
    if (sourceSectionIndex !== -1 && destSectionIndex !== -1) {
      const newSections = JSON.parse(JSON.stringify(sections));
      const sourceItems = newSections[sourceSectionIndex].items;
      const destItems = newSections[destSectionIndex].items;
      
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setSections(newSections);
      localStorage.setItem('sidebar_config_v4', JSON.stringify(newSections));
    }
  };

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '10px' }}>
        <div style={{ background: '#dcfce7', padding: '12px 20px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)', gap: '8px' }}>
          <Fish size={28} color="#059669" />
          <Scale size={28} color="#059669" />
        </div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', letterSpacing: '0.5px', marginBottom: '4px', textTransform: 'uppercase' }}>
          {ministryName}
        </div>
        <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '2px' }}>
          {selectedCity ? `${selectedCity} İl Tarım ve Orman Müdürlüğü` : 'İl Seçilmedi'}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
          {selectedUnit || 'Birim Seçilmedi'}
        </div>
        
        <div style={{ width: '40px', height: '2px', background: '#10b981', marginBottom: '12px' }}></div>

        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', letterSpacing: '0.5px' }}>
          ŞUBE YÖNETİM SİSTEMİ
        </div>
      </div>
      
      <div className="sidebar-scrollable" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '10px 12px 5px 12px', fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px' }}>
          BALIKÇILIK VE SU ÜRÜNLERİ YÖNETİMİ
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="section">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {sections.map((section, index) => {
                  const visibleItems = section.items.filter(item => hasAccess(item.id));
                  if (visibleItems.length === 0 && currentRole !== 'Genel Koordinatör') return null;

                  return (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(providedSection, snapshotSection) => (
                        <div 
                          ref={providedSection.innerRef} 
                          {...providedSection.draggableProps} 
                          className="nav-section" 
                          style={{ 
                            marginTop: index === 0 ? '0' : '4px',
                            ...providedSection.draggableProps.style,
                            opacity: snapshotSection.isDragging ? 0.8 : 1
                          }}
                        >
                          <div 
                            className="nav-section-title" 
                            {...providedSection.dragHandleProps} 
                            style={{ cursor: 'pointer', marginBottom: expandedSections[section.id] ? '4px' : '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: expandedSections[section.id] ? '#f8fafc' : 'transparent', borderRadius: '8px', transition: 'all 0.2s', border: expandedSections[section.id] ? '1px solid #e2e8f0' : '1px solid transparent' }}
                            onClick={() => toggleSection(section.id)}
                          >
                            <span>{section.title}</span>
                            {expandedSections[section.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                          
                          <Droppable droppableId={section.id} type="item">
                            {(providedList, snapshotList) => (
                              <div 
                                ref={providedList.innerRef} 
                                {...providedList.droppableProps}
                                style={{
                                  minHeight: expandedSections[section.id] ? '20px' : '0px',
                                  height: expandedSections[section.id] ? 'auto' : '0px',
                                  overflow: 'hidden',
                                  background: snapshotList.isDraggingOver ? 'rgba(0,0,0,0.02)' : 'transparent',
                                  borderRadius: '8px',
                                  transition: 'height 0.2s ease-in-out'
                                }}
                              >
                                {expandedSections[section.id] && visibleItems.map((item, i) => {
                                  const IconComponent = IconMap[item.iconName] || FileText;
                                  return (
                                    <Draggable key={item.id} draggableId={item.id} index={i}>
                                      {(providedItem, snapshotItem) => (
                                        <div
                                          ref={providedItem.innerRef}
                                          {...providedItem.draggableProps}
                                          {...providedItem.dragHandleProps}
                                          style={{
                                            ...providedItem.draggableProps.style,
                                            marginBottom: '2px'
                                          }}
                                        >
                                          <NavLink 
                                            to={item.link} 
                                            className={({isActive}) => isActive ? "nav-item active" : "nav-item"} 
                                            end={item.link === '/'}
                                            style={{
                                              
                                              boxShadow: snapshotItem.isDragging ? '0 5px 10px rgba(0,0,0,0.1)' : 'none',
                                              cursor: 'grab'
                                            }}
                                          >
                                            <IconComponent size={18} />
                                            <span>{item.label}</span>
                                          </NavLink>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {providedList.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      <div className="sidebar-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px' }}>
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
              {currentUser?.adSoyad?.substring(0, 2)?.toUpperCase() || 'SY'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.adSoyad || 'Sistem Yöneticisi'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {currentRole}
              </div>
            </div>
          </div>
          
          {isViewingAsPersonel && (
            <button onClick={toggleViewMode} style={{ width: '100%', background: '#3b82f6', border: 'none', padding: '6px 0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'white', cursor: 'pointer', marginBottom: '6px' }}>
              Yönetici Görünümüne Dön
            </button>
          )}

          {isManager && !isViewingAsPersonel && (
            <button onClick={() => setIsGhostLoginModalOpen(true)} style={{ width: '100%', background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', border: '1px solid #d8b4fe', padding: '6px 0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#9333ea', cursor: 'pointer', marginBottom: '6px' }}>
              Personel Olarak Görün
            </button>
          )}
          
          <button onClick={handleAdminReset} style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', padding: '6px 0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <LogOut size={14} /> Güvenli Çıkış
          </button>
          
          {window.location.hostname === 'localhost' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => window.open('https://balikcilik-ve-su-urunleri-yonetim-s.vercel.app', '_blank')} style={{ width: '100%', background: '#3b82f6', border: 'none', padding: '8px 0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  <Globe size={14} /> CANLI SİTEYE GİT
                </button>
            <button onClick={handlePublish} disabled={isPublishing} style={{ width: '100%', background: isPublishing ? '#94a3b8' : '#10b981', border: 'none', padding: '8px 0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'white', cursor: isPublishing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Rocket size={14} className={isPublishing ? "animate-pulse" : ""} />
              {isPublishing ? 'YAYINLANIYOR...' : 'SİTEYİ YAYINLA'}
            </button>
            </div>
          )}
        </div>
      </div>
      
      <GhostLoginModal isOpen={isGhostLoginModalOpen} onClose={() => setIsGhostLoginModalOpen(false)} />
    </aside>
  );
};

export default Sidebar;

