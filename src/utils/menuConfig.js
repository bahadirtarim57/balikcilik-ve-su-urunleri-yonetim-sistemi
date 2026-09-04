import {
  Presentation, Home, Fish, Archive, BookOpen, Calculator, Settings, Users, Scale, PieChart, Shield, LogOut, UserCog, Database, FileText, Rocket, TrendingUp, Ship, CheckCircle, AlertTriangle, MapPin, Building2, FileBadge, ChevronDown, ChevronUp, Globe
} from 'lucide-react';

export const IconMap = { Presentation, Home, Fish, Archive, BookOpen, Calculator, Settings, Users, Scale, PieChart, Shield, LogOut, UserCog, Database, FileText, Rocket, TrendingUp, Ship, CheckCircle, AlertTriangle, MapPin, Building2 };

export const defaultSections = [
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
      { id: '/ihlaller-ozet', label: 'İhlaller Özeti', iconName: 'PieChart', link: '/ihlaller-ozet' },
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
