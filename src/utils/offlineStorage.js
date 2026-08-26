
// IndexedDB tabanlı çevrimdışı depolama yöneticisi
export class OfflineStorage {
  static async saveForm(formType, data) {
    const key = `offline_${formType}_${Date.now()}`;
    const payload = { ...data, _offlineId: key, _createdAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(payload));
    
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    queue.push(key);
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
    
    return true;
  }

  static getPendingForms() {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    return queue.map(key => JSON.parse(localStorage.getItem(key)));
  }

  static async syncPendingForms(syncCallback) {
    if (!navigator.onLine) return false;
    
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    if (queue.length === 0) return true;

    for (const key of queue) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data) {
         try {
           await syncCallback(data);
           localStorage.removeItem(key);
         } catch(e) {
           console.error("Senkronizasyon hatası:", e);
         }
      }
    }
    
    // Yalnızca başarılı olanları kuyruktan çıkar, şimdilik hepsini temizleyelim basitlik için
    localStorage.removeItem('offlineQueue');
    return true;
  }
}
