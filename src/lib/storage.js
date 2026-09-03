/**
 * Supabase destekli storage katmanı.
 * localStorage'ı hızlı cache olarak kullanır,
 * tüm değişiklikleri Supabase'e de yazar.
 * Uygulama başlarken Supabase'den yükler.
 */
import { supabase } from './supabase';

const SHARED_APP_SETTINGS_KEYS = [
  'personnelHistoryData',
  'editedPersonnelData',
  'branchPersonnelData',
  'personnelEmailData'
];

// Hangi key'leri Supabase'e kaydedelim
const SYNCED_KEYS = [
  'user_roles',
  'pendingChanges',
  'ipc_violations',
  'cezalar',
  'tutanaklar',
  'hakedisler',
  'subeler',
  'kurumAyarlari',
  'veriYonetimi',
  'themeColor',
];

// Supabase'den TÜM verileri çek ve localStorage'a yaz
export async function loadFromSupabase() {
  try {
    let totalLoaded = 0;

    const { data: ipcData, error: ipcError } = await supabase
      .from('ipc_storage')
      .select('key, value');

    if (!ipcError && ipcData) {
      ipcData.forEach(({ key, value }) => {
        if (value !== null && value !== undefined) {
          localStorage.setItem(key, JSON.stringify(value));
          totalLoaded++;
        }
      });
    }

    const { data: appData, error: appError } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value');

    if (!appError && appData) {
      appData.forEach(({ setting_key, setting_value }) => {
        if (SHARED_APP_SETTINGS_KEYS.includes(setting_key) && setting_value !== null && setting_value !== undefined) {
          const valueToSave = typeof setting_value === 'object' 
            ? JSON.stringify(setting_value) 
            : setting_value;
          localStorage.setItem(setting_key, valueToSave);
          totalLoaded++;
        }
      });
    }

    console.log(`✅  Supabase'den ${totalLoaded} kayıt yüklendi.`);
    window.dispatchEvent(new Event('settingsSynced'));
    return totalLoaded;
  } catch (err) {
    console.warn('Supabase bağlantı hatası:', err.message);
    return 0;
  }
}

// Tek bir key'i Supabase'e kaydet
export async function saveToSupabase(key, value) {
  if (!SYNCED_KEYS.includes(key) && !SHARED_APP_SETTINGS_KEYS.includes(key)) return;

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    
    if (SHARED_APP_SETTINGS_KEYS.includes(key)) {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ setting_key: key, setting_value: parsed }, { onConflict: 'setting_key' });
      if (error) console.warn(`Supabase kaydetme hatası (${key}):`, error.message);
    } else {
      const { error } = await supabase
        .from('ipc_storage')
        .upsert({ key, value: parsed, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) console.warn(`Supabase kaydetme hatası (${key}):`, error.message);
    }
  } catch (err) {
    // JSON parse hatası vs - sessizce geç
  }
}

// localStorage.setItem'ın yerini alan wrapper
export function setItem(key, value) {
  localStorage.setItem(key, value);
  saveToSupabase(key, value); // async, beklemeden
}

// Mevcut localStorage verilerini Supabase'e yükle (ilk kurulum)
export async function uploadLocalToSupabase() {
  const ipcUploads = [];
  const appUploads = [];

  [...SYNCED_KEYS, ...SHARED_APP_SETTINGS_KEYS].forEach(key => {
    const val = localStorage.getItem(key);
    if (val) {
      try {
        const parsed = JSON.parse(val);
        if (SHARED_APP_SETTINGS_KEYS.includes(key)) {
          appUploads.push({ setting_key: key, setting_value: parsed });
        } else {
          ipcUploads.push({ key, value: parsed, updated_at: new Date().toISOString() });
        }
      } catch (e) {}
    }
  });

  if (ipcUploads.length > 0) {
    const { error } = await supabase
      .from('ipc_storage')
      .upsert(ipcUploads, { onConflict: 'key' });
    if (error) console.warn('Toplu yükleme hatası (ipc_storage):', error.message);
  }

  if (appUploads.length > 0) {
    const { error } = await supabase
      .from('app_settings')
      .upsert(appUploads, { onConflict: 'setting_key' });
    if (error) console.warn('Toplu yükleme hatası (app_settings):', error.message);
  }
  
  console.log(`✅  Kayıtlar Supabase'e yüklendi.`);
}
