import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, MapPin } from 'lucide-react';
import { uploadLocalToSupabase } from '../lib/storage';

export default function LeasedAreasSettings() {
  const [areas, setAreas] = useState([]);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaQuota, setNewAreaQuota] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedAreas = localStorage.getItem('systemLeasedAreas');
    if (storedAreas) {
      try {
        setAreas(JSON.parse(storedAreas));
      } catch (e) {
        setAreas([]);
      }
    }
  }, []);

  const saveToStorage = (newAreas) => {
    setAreas(newAreas);
    localStorage.setItem('systemLeasedAreas', JSON.stringify(newAreas));
    uploadLocalToSupabase();
  };

  const handleAddArea = () => {
    if (!newAreaName.trim() || !newAreaQuota) return;
    
    // Check if exists
    if (areas.some(a => a.name.toLowerCase() === newAreaName.trim().toLowerCase())) {
        alert('Bu alan zaten kayıtlı!');
        return;
    }

    const newAreas = [...areas, { name: newAreaName.trim(), quota: parseInt(newAreaQuota, 10) }];
    saveToStorage(newAreas);
    setNewAreaName('');
    setNewAreaQuota('');
    showSavedBanner();
  };

  const handleDeleteArea = (index) => {
    if (!window.confirm('Bu kiralama alanını silmek istediğinize emin misiniz?')) return;
    const newAreas = areas.filter((_, i) => i !== index);
    saveToStorage(newAreas);
  };

  const showSavedBanner = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            İçsu Kiralama Alanları ve Kotaları
          </h1>
          <p className="text-gray-500 mt-2">İç sular için baraj, göl ve nehir kiralama alanlarını ve kota limitlerini yönetin.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Kiralama Alanı Adı (Örn: Altınkaya Barajı)"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              min="1"
              placeholder="Kota Adedi"
              value={newAreaQuota}
              onChange={(e) => setNewAreaQuota(e.target.value)}
              className="w-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleAddArea}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Ekle
            </button>
          </div>

          <div className="space-y-3">
            {areas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{area.name}</span>
                    <span className="ml-4 text-sm text-gray-500">Kota: <strong className="text-blue-700">{area.quota} Adet</strong></span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteArea(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {areas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Henüz kiralama alanı tanımlanmamış.
              </div>
            )}
          </div>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Save className="w-5 h-5" />
          Kayıt Başarılı
        </div>
      )}
    </div>
  );
}
