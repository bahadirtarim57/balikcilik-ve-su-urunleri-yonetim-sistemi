import { supabase } from '../supabaseClient';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Building2 } from 'lucide-react';

// Fix for default marker icon in leaflet inside React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Fish Farms
const farmIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2855/2855685.png', // Ship/Anchor style icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const HaritaRadar = () => {
    const [tesisler, setTesisler] = useState([]);

        useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('tesisler').select('*');
            if (data) setTesisler(data);
        };
        load();
    }, []);

    // Center of Sinop
    const center = [42.0285, 35.1555];

    return (
        <div style={{ height: 'calc(100vh - 60px)', width: '100%', position: 'relative' }}>
            
            {/* Header Overlay */}
            <div style={{ position: 'absolute', top: 20, left: 60, zIndex: 1000, background: '#ffffff', color: '#1e293b', padding: '16px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '600' }}>
                    <Map size={22} color="#0369a1" /> Yetiştiricilik Tesisleri Haritası
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                    <Building2 size={16} color="#059669" /> Kayıtlı Tesis Sayısı: <strong>{tesisler.length}</strong>
                </p>
            </div>

            <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {tesisler.map((t, idx) => {
                    const coords = t.koordinatList || [];
                    const validCoords = coords.filter(c => c.wgsLat && c.wgsLon).map(c => [parseFloat(c.wgsLat), parseFloat(c.wgsLon)]);
                    
                    if (validCoords.length === 0) return null;

                    const mainCoord = validCoords[0];
                    const polyOptions = { color: t.durum === 'Aktif' ? '#059669' : '#ef4444', fillColor: t.durum === 'Aktif' ? '#10b981' : '#f87171', fillOpacity: 0.4 };

                    return (
                        <React.Fragment key={t.id || idx}>
                            {validCoords.length > 2 && (
                                <Polygon positions={validCoords} pathOptions={polyOptions} />
                            )}
                            <Marker position={mainCoord} icon={farmIcon}>
                                <Popup>
                                    <div style={{ padding: '4px', minWidth: '200px' }}>
                                        <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', color: '#0f172a' }}>{t.tesisAdi || 'İsimsiz Tesis'}</h3>
                                        <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>Firma:</strong> <span>{t.firmaAdi || '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>Durum:</strong> 
                                                <span style={{ color: t.durum === 'Aktif' ? '#059669' : '#ef4444', fontWeight: 'bold' }}>{t.durum || '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>Şamandıra:</strong> 
                                                <span style={{ color: t.samandiraDurum === 'Aktif / Sorunsuz' ? '#059669' : t.samandiraDurum === 'Söndü / Arızalı' ? '#ef4444' : '#ea580c', fontWeight: 'bold' }}>{t.samandiraDurum || 'Yok'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>Vize Bitiş:</strong> 
                                                <span style={{ color: '#0f172a' }}>{t.vizeTarihi ? new Date(t.vizeTarihi).toLocaleDateString('tr-TR') : '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default HaritaRadar;

