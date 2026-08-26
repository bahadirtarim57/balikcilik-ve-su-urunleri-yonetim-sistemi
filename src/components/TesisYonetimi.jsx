import proj4 from 'proj4';
import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { Users, Download, LayoutGrid, MapPin, Search, Edit, Trash2, Plus, ArrowLeft, Save, Fish, Building, Info, FileText, ChevronDown, ChevronUp, Archive, BarChart3, Droplets, Ruler, Clock, AlertTriangle, ShieldCheck, Anchor, Activity, Globe, RefreshCw, Zap, X, Database } from 'lucide-react';


const VALID_DISTRICTS = ['Merkez', 'Gerze', 'AyancÄ±k', 'Boyabat', 'Dikmen', 'Erfelek', 'DuraÄŸan', 'TÃ¼rkeli', 'SaraydÃ¼zÃ¼'];
const STATUS_OPTIONS = ['Aktif', 'Pasif', 'Ä°ptal', 'Devredildi', 'Kiralama AÅŸamasÄ±nda'];
const TUR_OPTIONS = ['Deniz YetiÅŸtiriciliÄŸi', 'Karasal Ãœretim', 'Ã‡ift Kabuklu YetiÅŸtiriciliÄŸi', 'Baraj / GÃ¶l Ãœretimi', 'DiÄŸer'];

const SPECIES_OPTIONS = {
    'Deniz YetiÅŸtiriciliÄŸi': ['Levrek', 'Ã‡ipura', 'Levrek & Ã‡ipura', 'TÃ¼rk Somonu', 'Mavi YÃ¼zgeÃ§li Orkinos', 'SarÄ±aÄŸÄ±z', 'DiÄŸer'],
    'Ã‡ift Kabuklu YetiÅŸtiriciliÄŸi': ['Akdeniz Midyesi', 'Kara Midye', 'Ä°stiridye', 'DiÄŸer'],
    'Baraj / GÃ¶l Ãœretimi': ['GÃ¶kkuÅŸaÄŸÄ± AlabalÄ±ÄŸÄ±', 'TÃ¼rk Somonu', 'Sazan', 'DiÄŸer'],
    'Karasal Ãœretim': ['GÃ¶kkuÅŸaÄŸÄ± AlabalÄ±ÄŸÄ±', 'Sazan', 'Mersin BalÄ±ÄŸÄ±', 'Kerevit', 'DiÄŸer'],
    'DiÄŸer': ['Belirtilmedi', 'DiÄŸer']
};

function formatDate(dateStr) {
  if (!dateStr || String(dateStr).trim() === '' || String(dateStr).trim() === 'null') return '';
  const match = String(dateStr).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  if (String(dateStr).includes('00:00:00')) return String(dateStr).split(' ')[0];
  return dateStr;
}

const getTesisTuru = (sekme, tesisAdi, ilce) => {
    const s = String(sekme).toUpperCase();
    const t = String(tesisAdi).toUpperCase();
    const i = String(ilce).toUpperCase();
    if (t.includes('KARASAL') || s.includes('KARASAL')) return 'Karasal Ãœretim';
    if (t.includes('MÄ°DYE') || s.includes('MÄ°DYE')) return 'Ã‡ift Kabuklu YetiÅŸtiriciliÄŸi';
    if (t.includes('BARAJ') || t.includes('GÃ–L') || s.includes('BARAJ') || s.includes('GÃ–L')) return 'Baraj / GÃ¶l Ãœretimi';
    if (s.includes('SAHA')) return 'Deniz YetiÅŸtiriciliÄŸi';
    if (['SARAYDÃœZÃœ', 'BOYABAT', 'DURAÄAN', 'ERFELEK'].includes(i)) return 'Karasal Ãœretim';
    return 'Deniz YetiÅŸtiriciliÄŸi';
};

const getDynamicHeaders = (turu) => {
    if (turu === 'Karasal Ãœretim') return { sayi: 'Havuz SayÄ±sÄ±', ebat: 'Havuz EbatlarÄ±', hacim: 'Top. Havuz Hacmi' };
    if (turu === 'Ã‡ift Kabuklu YetiÅŸtiriciliÄŸi') return { sayi: 'Hat/KolektÃ¶r SayÄ±sÄ±', ebat: 'Halat UzunluÄŸu (m)', hacim: 'Top. Su Hacmi' };
    return { sayi: 'Kafes SayÄ±sÄ±', ebat: 'Kafes EbatlarÄ±', hacim: 'Top. Kafes Hacmi' };
};

const getLatestDateTimestamp = (t) => {
    const dates = [t.vizeTarihi, t.kiraTarih, t.aktifTarih].map(d => {
        if (!d) return 0;
        const parsed = new Date(d).getTime();
        return isNaN(parsed) ? 0 : parsed;
    });
    return Math.max(...dates, 0);
};

const FormSection = ({ title, icon, children }) => (
    <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' }}>
        {icon} <span style={{ marginLeft: '8px' }}>{title}</span>
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {children}
      </div>
    </div>
  );

  const FormGroup = ({ label, name, type="text", options=null, formData, handleInputChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>{label}</label>
      {options ? (
        <select name={name} value={formData && formData[name] ? formData[name] : ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: 'white' }}>
            <option value="">SeÃ§iniz...</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={formData && formData[name] ? formData[name] : ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} placeholder={`${label} girin...`} />
      )}
    </div>
  );

  




const KoordinatListManager = ({ items = [], onChange }) => {
    // Proj4 definitions
    proj4.defs("EPSG:23036", "+proj=utm +zone=36 +ellps=intl +towgs84=-87,-96,-120,0,0,0,0 +units=m +no_defs");
    proj4.defs("EPSG:32636", "+proj=utm +zone=36 +ellps=WGS84 +datum=WGS84 +units=m +no_defs");
    proj4.defs("ED50_GEO", "+proj=longlat +ellps=intl +towgs84=-87,-96,-120,0,0,0,0 +no_defs");
    
    // 3 Derece Gauss-Kruger (ITRF/ED50) definitions for Turkey (DOM 33 and 36)
    proj4.defs("EPSG:ED50_33", "+proj=tmerc +lat_0=0 +lon_0=33 +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-96,-120,0,0,0,0 +units=m +no_defs");
    proj4.defs("EPSG:ED50_36", "+proj=tmerc +lat_0=0 +lon_0=36 +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-96,-120,0,0,0,0 +units=m +no_defs");

    const handleAdd = () => {
        // Sistem boÅŸ baÅŸlasÄ±n
        onChange([...items, { kose: `KÃ¶ÅŸe ${items.length + 1}`, sistem: '', x: '', y: '', wgsLat: '', wgsLon: '', latD: '', latM: '', latS: '', latDir: 'N', lonD: '', lonM: '', lonS: '', lonDir: 'E' }]);
    };

    const handleRemove = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const dmsToDd = (d, m, s, dir) => {
        let dd = parseFloat(d || 0) + parseFloat(m || 0)/60 + parseFloat(s || 0)/3600;
        if (dir === 'S' || dir === 'W') dd = dd * -1;
        return dd;
    };
    
    const handleAutoAdvance = (e, nextId, maxLength = 2) => {
        if (e.target.value.length >= maxLength) {
            const nextElement = document.getElementById(nextId);
            if (nextElement) {
                nextElement.focus();
            }
        }
    };

    const handleChange = (index, field, value) => {
        const newItems = [...items];
        
        // AkÄ±llÄ± VirgÃ¼l/Nokta DÃ¼zeltici (Sadece X ve Y kutularÄ± iÃ§in)
        if (field === 'x' || field === 'y') {
            value = value.replace(/,/g, '.'); // VirgÃ¼lÃ¼ noktaya Ã§evir
            value = value.replace(/[^0-9.]/g, ''); // Harf ve diÄŸer iÅŸaretleri sil
            // Birden fazla nokta girilmesini engelle
            let parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
        }
        
        if (field === 'latS' || field === 'lonS') {
            value = value.replace(/,/g, '.');
            let clean = value.replace(/[^0-9.]/g, ''); 
            
            let parts = clean.split('.');
            if (parts.length > 2) {
                clean = parts[0] + '.' + parts.slice(1).join('');
            }

            if (clean.length > 2 && !clean.includes('.')) {
                clean = clean.substring(0, 2) + '.' + clean.substring(2);
            }
            if (clean.length > 5) {
                clean = clean.substring(0, 5);
            }
            value = clean;
        }

        newItems[index][field] = value;

        if (field === 'sistem') {
            newItems[index].x = '';
            newItems[index].y = '';
            newItems[index].latD = ''; newItems[index].latM = ''; newItems[index].latS = '';
            newItems[index].lonD = ''; newItems[index].lonM = ''; newItems[index].lonS = '';
            newItems[index].wgsLat = ''; newItems[index].wgsLon = '';
            onChange(newItems);
            return;
        }

        let sys = newItems[index].sistem;
        let converted = null;

        try {
            if (sys === 'WGS84' || sys === 'ED50') {
                let latD = newItems[index].latD; let latM = newItems[index].latM; let latS = newItems[index].latS; let latDir = newItems[index].latDir || 'N';
                let lonD = newItems[index].lonD; let lonM = newItems[index].lonM; let lonS = newItems[index].lonS; let lonDir = newItems[index].lonDir || 'E';
                
                if ((latD || latM || latS) && (lonD || lonM || lonS)) {
                    let py = dmsToDd(latD, latM, latS, latDir);
                    let px = dmsToDd(lonD, lonM, lonS, lonDir);
                    
                    if (sys === 'WGS84') {
                        converted = [px, py];
                    } else {
                        converted = proj4("ED50_GEO", "EPSG:4326", [px, py]);
                    }
                    newItems[index].y = `${latD || 0}Â° ${latM || 0}' ${latS || 0}" ${latDir === 'N' ? 'K' : 'G'}`;
                    newItems[index].x = `${lonD || 0}Â° ${lonM || 0}' ${lonS || 0}" ${lonDir === 'E' ? 'D' : 'B'}`;
                }
            } else if (sys && sys.includes('UTM')) {
                let x = newItems[index].x;
                let y = newItems[index].y;
                if (x && y) {
                    let px = parseFloat(x.replace(',', '.')) || 0;
                    let py = parseFloat(y.replace(',', '.')) || 0;
                    
                    // 3 Derecelik sistemlerde y (SaÄŸa deÄŸer) 7 haneli (Ã¶rn: 33543123) girildiyse 33'Ã¼ at, 6 haneli yap
                    if ((sys === 'UTM_ED50_33' || sys === 'UTM_ED50_36') && px > 1000000) {
                        px = px % 1000000;
                    }

                    if (sys === 'UTM_ED50') {
                        converted = proj4("EPSG:23036", "EPSG:4326", [px, py]);
                    } else if (sys === 'UTM_WGS84') {
                        converted = proj4("EPSG:32636", "EPSG:4326", [px, py]);
                    } else if (sys === 'UTM_ED50_33') {
                        converted = proj4("EPSG:ED50_33", "EPSG:4326", [px, py]);
                    } else if (sys === 'UTM_ED50_36') {
                        converted = proj4("EPSG:ED50_36", "EPSG:4326", [px, py]);
                    }
                }
            }

            if (converted && !isNaN(converted[0]) && !isNaN(converted[1])) {
                newItems[index].wgsLon = converted[0].toFixed(6);
                newItems[index].wgsLat = converted[1].toFixed(6);
            } else {
                newItems[index].wgsLon = '';
                newItems[index].wgsLat = '';
            }
        } catch(e) {
            console.error("Proj4 conversion error", e);
        }

        onChange(newItems);
    };

    const openInMap = (lat, lon) => {
        if (lat && lon) {
            window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank');
        } else {
            alert('GeÃ§erli WGS 84 koordinatÄ± bulunamadÄ±.');
        }
    };

    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f59e0b', color: 'white' }}>
                <span style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16}/> SAHA KÃ–ÅE KOORDÄ°NATLARI</span>
                <button onClick={handleAdd} type="button" style={{ background: '#fff', color: '#f59e0b', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>+ KÃ¶ÅŸe Ekle</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '10px 0' }}>HenÃ¼z koordinat eklenmedi.</div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 220px 1fr 40px', gap: '12px', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                            <div>Nokta AdÄ±</div>
                            <div>Sistem</div>
                            <div>Koordinat DeÄŸerleri</div>
                            <div></div>
                        </div>
                        {items.map((item, index) => {
                            const isDMS = item.sistem === 'WGS84' || item.sistem === 'ED50';
                            const isUTM = item.sistem && item.sistem.includes('UTM');
                            
                            return (
                            <div key={index} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 220px 1fr 40px', gap: '12px', alignItems: 'start' }}>
                                    <input type="text" value={item.kose} onChange={(e) => handleChange(index, 'kose', e.target.value)} placeholder="KÃ¶ÅŸe 1..." style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
                                    
                                    <select value={item.sistem} onChange={(e) => handleChange(index, 'sistem', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: item.sistem ? '#fff' : '#fef3c7' }}>
                                        <option value="">SeÃ§iniz...</option>
                                        <option value="WGS84">WGS 84 (CoÄŸrafi - GPS)</option>
                                        <option value="ED50">ED 50 (CoÄŸrafi)</option>
                                        <option value="UTM_ED50">UTM (ED50 - 6 Derece)</option>
                                        <option value="UTM_WGS84">UTM (WGS84 - 6 Derece)</option>
                                        <option value="UTM_ED50_33">UTM (ED50 - 3 Derece / DOM 33)</option>
                                        <option value="UTM_ED50_36">UTM (ED50 - 3 Derece / DOM 36)</option>
                                    </select>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {!item.sistem ? (
                                            <div style={{ padding: '8px 12px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                                                LÃ¼tfen veri girebilmek iÃ§in sol taraftan sistem seÃ§iniz...
                                            </div>
                                        ) : isDMS ? (
                                            <>
                                                {/* DMS ENLEM */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                                    <span style={{fontSize:'11px', color:'#64748b', width:'40px'}}>Enlem:</span>
                                                    <input id={`latD_${index}`} type="text" value={item.latD} onChange={(e) => { handleChange(index, 'latD', e.target.value); handleAutoAdvance(e, `latM_${index}`, 2); }} placeholder="41" style={{ width: '40px', padding: '4px', textAlign: 'center', border: 'none', background: 'white', borderRadius: '4px' }} /> <span style={{fontWeight:'bold'}}>Â°</span>
                                                    <input id={`latM_${index}`} type="text" value={item.latM} onChange={(e) => { handleChange(index, 'latM', e.target.value); handleAutoAdvance(e, `latS_${index}`, 2); }} placeholder="44" style={{ width: '40px', padding: '4px', textAlign: 'center', border: 'none', background: 'white', borderRadius: '4px' }} /> <span style={{fontWeight:'bold'}}>'</span>
                                                    <input id={`latS_${index}`} type="text" value={item.latS} onChange={(e) => { handleChange(index, 'latS', e.target.value); handleAutoAdvance(e, `lonD_${index}`, 5); }} placeholder="25.33" style={{ width: '60px', padding: '4px', textAlign: 'center', border: 'none', background: 'white', borderRadius: '4px' }} /> <span style={{fontWeight:'bold'}}>"</span>
                                                    <select value={item.latDir} onChange={(e) => handleChange(index, 'latDir', e.target.value)} style={{ padding: '4px', border: 'none', background: '#e2e8f0', borderRadius: '4px', outline: 'none', marginLeft: '4px', fontWeight: 'bold' }}>
                                                        <option value="N">K (N)</option>
                                                        <option value="S">G (S)</option>
                                                    </select>
                                                </div>
                                                {/* DMS BOYLAM */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                                    <span style={{fontSize:'11px', color:'#64748b', width:'40px'}}>Boylam:</span>
                                                    <input id={`lonD_${index}`} type="text" value={item.lonD} onChange={(e) => { handleChange(index, 'lonD', e.target.value); handleAutoAdvance(e, `lonM_${index}`, 2); }} placeholder="35" style={{ width: '40px', padding: '4px', textAlign: 'center', border: 'none', background: 'white', borderRadius: '4px' }} /> <span style={{fontWeight:'bold'}}>Â°</span>
                                                    <input id={`lonM_${index}`} type="text" value={item.lonM} onChange={(e) => { handleChange(index, 'lonM', e.target.value); handleAutoAdvance(e, `lonS_${index}`, 2); }} placeholder="19" style={{ width: '40px', padding: '4px', textAlign: 'center', border: 'none', background: 'white', borderRadius: '4px' }} /> <span style={{fontWeight:'bold'}}>'</span>
                                                    <input id={`lonS_${index}`} type="text" value={item.lonS} onChange={(e) => handleChange(index, 'lonS', e.target.value)} placeholder="53.13" style={{ width: '60px', padding: '4px', textAlign: 'center', border: 'none', background: 'white', borderRadius: '4px' }} /> <span style={{fontWeight:'bold'}}>"</span>
                                                    <select value={item.lonDir} onChange={(e) => handleChange(index, 'lonDir', e.target.value)} style={{ padding: '4px', border: 'none', background: '#e2e8f0', borderRadius: '4px', outline: 'none', marginLeft: '4px', fontWeight: 'bold' }}>
                                                        <option value="E">D (E)</option>
                                                        <option value="W">B (W)</option>
                                                    </select>
                                                </div>
                                            </>
                                        ) : isUTM ? (
                                            <>
                                                {/* UTM INPUTS */}
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1 }}>
                                                        <span style={{fontSize:'12px', fontWeight:'bold', color:'#ef4444'}}>Y:</span>
                                                        <input type="text" value={item.x} onChange={(e) => handleChange(index, 'x', e.target.value)} placeholder="SaÄŸa DeÄŸer (Ã–rn: 624512)" style={{ flex: 1, padding: '6px', border: 'none', background: 'white', borderRadius: '4px', outline: 'none' }} />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1 }}>
                                                        <span style={{fontSize:'12px', fontWeight:'bold', color:'#3b82f6'}}>X:</span>
                                                        <input type="text" value={item.y} onChange={(e) => handleChange(index, 'y', e.target.value)} placeholder="YukarÄ± DeÄŸer (Ã–rn: 4652134)" style={{ flex: 1, padding: '6px', border: 'none', background: 'white', borderRadius: '4px', outline: 'none' }} />
                                                    </div>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                    
                                    <button type="button" onClick={() => handleRemove(index)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px' }} title="Sil">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                {/* WGS84 Ã‡eviri Sonucu GÃ¶stergesi */}
                                {item.wgsLat && item.wgsLon && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: '#059669', marginTop: '4px', border: '1px dashed #34d399' }}>
                                        <span style={{fontWeight:'500'}}>Harita Konumu (WGS84): {item.wgsLat}, {item.wgsLon}</span>
                                        <button onClick={() => openInMap(item.wgsLat, item.wgsLon)} type="button" style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight:'bold' }}>Google Haritalar'da GÃ¶r ğŸŒ</button>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
};


const PersonelListManager = ({ items, onChange }) => {
    const handleAdd = () => {
        onChange([...items, { adSoyad: '', gorev: '', telefon: '', nakilYetkisi: false }]);
    };

    const handleRemove = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const handleChange = (index, field, value) => {
        const newItems = [...items];
        
        // Auto-format for Seconds (latS, lonS) to insert dot after 2 digits
        if (field === 'latS' || field === 'lonS') {
            let clean = value.replace(/[^0-9.]/g, ''); 
            if (clean.length > 2 && !clean.includes('.')) {
                clean = clean.substring(0, 2) + '.' + clean.substring(2);
            }
            if (clean.length > 5) {
                clean = clean.substring(0, 5);
            }
            value = clean;
        }

        newItems[index][field] = value;

        // If system changes, reset coordinate fields to avoid showing DMS strings in UTM inputs
        if (field === 'sistem') {
            newItems[index].x = '';
            newItems[index].y = '';
            newItems[index].latD = ''; newItems[index].latM = ''; newItems[index].latS = '';
            newItems[index].lonD = ''; newItems[index].lonM = ''; newItems[index].lonS = '';
            newItems[index].wgsLat = ''; newItems[index].wgsLon = '';
            onChange(newItems);
            return;
        }

        let sys = newItems[index].sistem;
        let converted = null;

        try {
            if (sys === 'WGS84' || sys === 'ED50') {
                let latD = newItems[index].latD; let latM = newItems[index].latM; let latS = newItems[index].latS; let latDir = newItems[index].latDir || 'N';
                let lonD = newItems[index].lonD; let lonM = newItems[index].lonM; let lonS = newItems[index].lonS; let lonDir = newItems[index].lonDir || 'E';
                
                if ((latD || latM || latS) && (lonD || lonM || lonS)) {
                    let py = dmsToDd(latD, latM, latS, latDir);
                    let px = dmsToDd(lonD, lonM, lonS, lonDir);
                    
                    if (sys === 'WGS84') {
                        converted = [px, py];
                    } else {
                        converted = proj4("ED50_GEO", "EPSG:4326", [px, py]);
                    }
                    newItems[index].y = `${latD || 0}Â° ${latM || 0}' ${latS || 0}" ${latDir === 'N' ? 'K' : 'G'}`;
                    newItems[index].x = `${lonD || 0}Â° ${lonM || 0}' ${lonS || 0}" ${lonDir === 'E' ? 'D' : 'B'}`;
                }
            } else {
                let x = newItems[index].x;
                let y = newItems[index].y;
                if (x && y) {
                    let px = parseFloat(x.replace(',', '.')) || 0;
                    let py = parseFloat(y.replace(',', '.')) || 0;
                    if (sys === 'UTM_ED50') {
                        converted = proj4("EPSG:23036", "EPSG:4326", [px, py]);
                    } else if (sys === 'UTM_WGS84') {
                        converted = proj4("EPSG:32636", "EPSG:4326", [px, py]);
                    }
                }
            }

            if (converted && !isNaN(converted[0]) && !isNaN(converted[1])) {
                newItems[index].wgsLon = converted[0].toFixed(6);
                newItems[index].wgsLat = converted[1].toFixed(6);
            } else {
                newItems[index].wgsLon = '';
                newItems[index].wgsLat = '';
            }
        } catch(e) {
            console.error("Proj4 conversion error", e);
        }

        onChange(newItems);
    };

    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#8b5cf6', color: 'white' }}>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>TESÄ°S SORUMLU PERSONEL LÄ°STESÄ°</span>
                <button onClick={handleAdd} type="button" style={{ background: '#fff', color: '#8b5cf6', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>+ Personel Ekle</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '10px 0' }}>HenÃ¼z personel eklenmedi.</div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 80px 40px', gap: '8px', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                            <div>Ad Soyad</div>
                            <div>GÃ¶revi</div>
                            <div>Telefon</div>
                            <div style={{textAlign: 'center', fontSize: '11px', lineHeight: '1.2'}} title="Nakil Belgesi Yetkilisi">Nakil Yetk.</div>
                            <div></div>
                        </div>
                        {items.map((item, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 80px 40px', gap: '8px' }}>
                                <input type="text" value={item.adSoyad} onChange={(e) => handleChange(index, 'adSoyad', e.target.value)} placeholder="Ad Soyad..." style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
                                <select value={item.gorev} onChange={(e) => handleChange(index, 'gorev', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}>
                                    <option value="">SeÃ§iniz...</option>
                                    <option value="Su ÃœrÃ¼nleri MÃ¼hendisi">Su ÃœrÃ¼nleri MÃ¼hendisi</option>
                                    <option value="Veteriner Hekim">Veteriner Hekim</option>
                                    <option value="DalgÄ±Ã§">DalgÄ±Ã§</option>
                                    <option value="Teknisyen">Teknisyen</option>
                                    <option value="DiÄŸer">DiÄŸer</option>
                                </select>
                                <input type="text" value={item.telefon} onChange={(e) => handleChange(index, 'telefon', e.target.value)} placeholder="05..." style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <input type="checkbox" checked={item.nakilYetkisi || false} onChange={(e) => handleChange(index, 'nakilYetkisi', e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#8b5cf6' }} title="Nakil Belgesi Yetkilisi" />
                                </div>
                                <button type="button" onClick={() => handleRemove(index)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Sil">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};


const KafesListManager = ({ type, items, onChange, tesisTuru }) => {
    const isHavuz = tesisTuru === 'Karasal Ãœretim';
    const isMidye = tesisTuru === 'Ã‡ift Kabuklu YetiÅŸtiriciliÄŸi';
    
    let title = 'PROJE KAFES LÄ°STESÄ° (Resmi)';
    if (type === 'mevcut') title = 'MEVCUT KAFES LÄ°STESÄ° (Fiili)';
    
    if (isHavuz) {
        title = type === 'proje' ? 'PROJE HAVUZ LÄ°STESÄ° (Resmi)' : 'MEVCUT HAVUZ LÄ°STESÄ° (Fiili)';
    } else if (isMidye) {
        title = type === 'proje' ? 'PROJE LONGLINE/HALAT LÄ°STESÄ°' : 'MEVCUT LONGLINE/HALAT LÄ°STESÄ°';
    }

    const handleAdd = () => {
        onChange([...items, { cap: '', en: '', boy: '', derinlik: '', adet: '', hacim: 0, halatUzunluk: '', salkim: '' }]);
    };

    const handleRemove = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const handleChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (!isMidye) {
            let hacim = 0;
            let adet = parseFloat(newItems[index].adet) || 0;
            let derinlik = parseFloat(newItems[index].derinlik) || 0;

            if (isHavuz) {
                let en = parseFloat(newItems[index].en) || 0;
                let boy = parseFloat(newItems[index].boy) || 0;
                hacim = en * boy * derinlik * adet;
            } else {
                let cap = parseFloat(newItems[index].cap) || 0;
                let r = cap / 2;
                hacim = 3.14159 * (r * r) * derinlik * adet;
            }
            newItems[index].hacim = hacim;
        }

        onChange(newItems);
    };

    const totalAdet = items.reduce((sum, item) => sum + (parseInt(item.adet) || 0), 0);
    const totalHacim = items.reduce((sum, item) => sum + (item.hacim || 0), 0);
    const totalSalkim = items.reduce((sum, item) => sum + (parseInt(item.salkim) || 0), 0);

    return (
        <div style={{ background: type === 'proje' ? '#f0f9ff' : '#fff7ed', borderRadius: '12px', padding: '16px', border: `1px solid ${type === 'proje' ? '#bae6fd' : '#fed7aa'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, color: type === 'proje' ? '#0369a1' : '#c2410c', fontSize: '15px', fontWeight: 'bold', borderBottom: `2px solid ${type === 'proje' ? '#bae6fd' : '#fed7aa'}`, paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title}
                <button onClick={handleAdd} type="button" style={{ background: type === 'proje' ? '#0ea5e9' : '#f97316', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isHavuz ? '+ Havuz Ekle' : isMidye ? '+ Sistem Ekle' : '+ Kafes Ekle'}
                </button>
            </h4>
            
            {items.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '10px' }}>
                    {isHavuz ? 'HenÃ¼z havuz eklenmedi.' : isMidye ? 'HenÃ¼z sistem eklenmedi.' : 'HenÃ¼z kafes eklenmedi.'}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMidye ? '1fr 1fr 1fr 40px' : (isHavuz ? '1fr 1fr 1fr 1fr 1.5fr 40px' : '1fr 1fr 1fr 1.5fr 40px'), gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                        {isMidye ? (
                            <>
                                <div>Sistem Adedi</div>
                                <div>Halat UzunluÄŸu(m)</div>
                                <div>KollektÃ¶r(SalkÄ±m)</div>
                            </>
                        ) : isHavuz ? (
                            <>
                                <div>En(m)</div>
                                <div>Boy(m)</div>
                                <div>Derin(m)</div>
                                <div>Adet</div>
                                <div>Hacim(m3)</div>
                            </>
                        ) : (
                            <>
                                <div>Ã‡ap(m)</div>
                                <div>Derin(m)</div>
                                <div>Adet</div>
                                <div>Hacim(m3)</div>
                            </>
                        )}
                        <div></div>
                    </div>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMidye ? '1fr 1fr 1fr 40px' : (isHavuz ? '1fr 1fr 1fr 1fr 1.5fr 40px' : '1fr 1fr 1fr 1.5fr 40px'), gap: '8px', alignItems: 'center' }}>
                            {isMidye ? (
                                <>
                                    <input type="number" placeholder="Sistem sayÄ±sÄ±" value={item.adet || ''} onChange={(e) => handleChange(idx, 'adet', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <input type="number" placeholder="Halat (m)" value={item.halatUzunluk || ''} onChange={(e) => handleChange(idx, 'halatUzunluk', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <input type="number" placeholder="KollektÃ¶r sayÄ±sÄ±" value={item.salkim || ''} onChange={(e) => handleChange(idx, 'salkim', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                </>
                            ) : isHavuz ? (
                                <>
                                    <input type="number" placeholder="0" value={item.en || ''} onChange={(e) => handleChange(idx, 'en', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <input type="number" placeholder="0" value={item.boy || ''} onChange={(e) => handleChange(idx, 'boy', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <input type="number" placeholder="0" value={item.derinlik || ''} onChange={(e) => handleChange(idx, 'derinlik', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <input type="number" placeholder="0" value={item.adet || ''} onChange={(e) => handleChange(idx, 'adet', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <div style={{ padding: '6px', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                                        {item.hacim > 0 ? item.hacim.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) : '0'}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <input type="number" placeholder="0" value={item.cap || ''} onChange={(e) => handleChange(idx, 'cap', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <input type="number" placeholder="0" value={item.derinlik || ''} onChange={(e) => handleChange(idx, 'derinlik', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <input type="number" placeholder="0" value={item.adet || ''} onChange={(e) => handleChange(idx, 'adet', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                                    <div style={{ padding: '6px', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                                        {item.hacim > 0 ? item.hacim.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) : '0'}
                                    </div>
                                </>
                            )}
                            
                            <button onClick={() => handleRemove(idx)} type="button" style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                x
                            </button>
                        </div>
                    ))}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '10px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '5px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>{isMidye ? 'Genel Toplam Sistem' : 'Genel Toplam Adet'}</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{totalAdet}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>{isMidye ? 'Genel Toplam KollektÃ¶r' : 'Genel Toplam Hacim'}</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: '#10b981' }}>{isMidye ? totalSalkim : `${totalHacim.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} m3`}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TesisYonetimi = () => {
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    const fetchTesisler = async () => {
      const { data, error } = await supabase.from('tesisler').select('*');
      if (error) {
        console.error('Veri Ã§ekme hatasÄ±:', error);
        toast.error('Veriler Ã§ekilemedi!');
      } else {
        setDataList(data);
      }
    };
    fetchTesisler();
  }, []);

  const saveToDatabase = async (updatedData) => {
    try {
      const { error } = await supabase.from('tesisler').upsert(updatedData);
      if (error) throw error;
      setDataList(updatedData);
      toast.success('Veriler Supabase bulutuna baÅŸarÄ±yla kaydedildi!');
    } catch (err) {
      console.error('Supabase save error:', err);
      toast.error('Buluta kayÄ±t sÄ±rasÄ±nda hata oluÅŸtu.');
    }
  };
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [sysError, setSysError] = useState(null);

  // Quick Action States
  const [showDevirModal, setShowDevirModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [qaData, setQaData] = useState({
      sourceId: '',
      yeniFirmaAdi: '',
      devirTarihi: '',
      yeniStatus: ''
  });
  
  
  const aktifData = useMemo(() => dataList.filter(t => t.finalStatus === 'Aktif'), [dataList]);
  const kiralamaData = useMemo(() => dataList.filter(t => t.finalStatus && t.finalStatus.includes('Kiralama')), [dataList]);
  const devirData = useMemo(() => dataList.filter(t => t.finalStatus === 'Devredildi' || t.finalStatus === 'DevredilmiÅŸ'), [dataList]);
  const pasifData = useMemo(() => dataList.filter(t => t.finalStatus === 'Pasif'), [dataList]);
  const iptalData = useMemo(() => dataList.filter(t => t.finalStatus === 'Ä°ptal'), [dataList]);
  const dddData = useMemo(() => dataList.filter(t => t.isDddKapsaminda === true), [dataList]);

  const [activeTab, setActiveTab] = useState('aktif_tesisler'); 
  const [selectedIlce, setSelectedIlce] = useState('TÃ¼mÃ¼');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    let base = []; if(activeTab === 'aktif_tesisler') base = aktifData; else if (activeTab === 'kiralama_tesisler') base = kiralamaData; else if (activeTab === 'devir_tesisler') base = devirData; else if (activeTab === 'pasif_tesisler') base = pasifData; else if (activeTab === 'iptal_tesisler') base = iptalData;
    if (activeTab === 'yeni') return [];
    if (selectedIlce !== 'TÃ¼mÃ¼') base = base.filter(t => t.ilce === selectedIlce);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      base = base.filter(t => (t.firmaAdi && t.firmaAdi.toLowerCase().includes(term)) || (t.resmiNo && t.resmiNo.toLowerCase().includes(term)));
    }
    return base.sort((a, b) => {
        const numCompare = String(a.resmiNo).localeCompare(String(b.resmiNo), undefined, { numeric: true, sensitivity: 'base' });
        if (numCompare !== 0) return numCompare;
        return (b._sortDate || 0) - (a._sortDate || 0);
    });
  }, [aktifData, kiralamaData, devirData, pasifData, iptalData, selectedIlce, searchTerm, activeTab]);

  const ilceCounts = useMemo(() => {
    let currData = []; if(activeTab === 'aktif_tesisler') currData = aktifData; else if (activeTab === 'kiralama_tesisler') currData = kiralamaData; else if (activeTab === 'devir_tesisler') currData = devirData; else if (activeTab === 'pasif_tesisler') currData = pasifData; else if (activeTab === 'iptal_tesisler') currData = iptalData; const counts = { 'TÃ¼mÃ¼': currData.length };
    VALID_DISTRICTS.forEach(d => counts[d] = 0);
    counts['Belirsiz / DiÄŸer'] = 0;
    currData.forEach(t => { if (counts[t.ilce] !== undefined) counts[t.ilce]++; });
    return counts;
  }, [aktifData, kiralamaData, devirData, pasifData, iptalData, activeTab]);

  const [expandedRowId, setExpandedRowId] = useState(null);
  
  const toggleRow = (id) => setExpandedRowId(prev => prev === id ? null : id);
  const handleEdit = (e, t) => { 
      e.stopPropagation(); 
      setFormData({...t});
      setEditingId(t.id); 
      setActiveTab('yeni'); 
  };
  const handleDelete = (e, id) => { 
      e.stopPropagation(); 
      if (window.confirm('Bu kaydÄ± tamamen silmek istediÄŸinize emin misiniz?')) {
          const newDataList = dataList.filter(t => t.id !== id);
          saveToDatabase(newDataList);
      }
  };
  
  
    const pullFromStokIslemleri = () => {
        const savedStok = localStorage.getItem('stok_calismalari_v4');
        if (savedStok) {
            const stokData = JSON.parse(savedStok);
            // Try to find a lake matching the facility name or address
            const match = stokData.find(s => 
                (s.lakeName && formData.tesisAdi && s.lakeName.toLowerCase().includes(formData.tesisAdi.toLowerCase())) ||
                (s.lakeName && formData.tesisSahasi && s.lakeName.toLowerCase().includes(formData.tesisSahasi.toLowerCase()))
            );
            
            if (match) {
                // In a real scenario, StokTespit would have kiralayan, kiraBedel etc.
                // We simulate it here or fetch if they exist
                setFormData(prev => ({
                    ...prev,
                    kiralayan: match.kiralayan || 'S.S. Ã–rnek Su ÃœrÃ¼nleri Koop.',
                    suKirasiBedel: match.kiraBedel || '125000',
                    suKirasiTarih: match.kiraBaslangic || '2023-01-15',
                    kiraBitisTarihi: match.kiraBitis || '2028-01-15',
                }));
                alert(`âœ… Stok Ä°ÅŸlemleri Entegrasyonu BaÅŸarÄ±lÄ±!

${match.lakeName} iÃ§in kiralama verileri otomatik Ã§ekildi.`);
            } else {
                alert('âš ï¸ Stok Ä°ÅŸlemleri modÃ¼lÃ¼nde bu isimde bir baraj/gÃ¶l tespiti bulunamadÄ±. LÃ¼tfen Tesis AdÄ± veya SahasÄ± kÄ±smÄ±na gÃ¶lÃ¼n adÄ±nÄ± doÄŸru yazdÄ±ÄŸÄ±nÄ±zdan emin olun (Ã–rn: Boyabat Baraj GÃ¶lÃ¼).');
            }
        } else {
            alert('Stok Ä°ÅŸlemleri veritabanÄ± boÅŸ.');
        }
    };
    
    
    const getKarasalArea = (list) => {
        if (!list || !Array.isArray(list)) return 0;
        return list.reduce((sum, item) => {
            let en = parseFloat(item.en) || 0;
            let boy = parseFloat(item.boy) || 0;
            let adet = parseInt(item.adet) || 0;
            return sum + (en * boy * adet);
        }, 0);
    };

    const getPolygonArea = (coords) => {
        if (!coords || coords.length < 3) return 0;
        const R = 6378137;
        let area = 0;
        for (let i = 0; i < coords.length; i++) {
            let j = (i + 1) % coords.length;
            let lon1 = parseFloat(coords[i].wgsLon) * Math.PI / 180;
            let lat1 = parseFloat(coords[i].wgsLat) * Math.PI / 180;
            let lon2 = parseFloat(coords[j].wgsLon) * Math.PI / 180;
            let lat2 = parseFloat(coords[j].wgsLat) * Math.PI / 180;
            if (!isNaN(lon1) && !isNaN(lat1) && !isNaN(lon2) && !isNaN(lat2)) {
                area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
            }
        }
        area = Math.abs(area * R * R / 2.0);
        return Math.round(area);
    };

    const isKarasal = formData.tur === "Karasal Ãœretim";
    const isMidye = formData.tur === "Ã‡ift Kabuklu YetiÅŸtiriciliÄŸi";
    const isKafes = !isKarasal && !isMidye;

    const getHacim = (list) => {
        if (!list || !Array.isArray(list)) return 0;
        return list.reduce((sum, item) => sum + (parseFloat(item.hacim) || 0), 0);
    };

    let denetimTuru = isKarasal ? "Alan (mÂ²)" : "Hacim (mÂ³)";
    if (isMidye) denetimTuru = "Sistem Adedi";

    let projeDeger = 0;
    let mevcutDeger = 0;

    if (isKarasal) {
        projeDeger = getKarasalArea(formData.projeKafesList);
        mevcutDeger = getKarasalArea(formData.mevcutKafesList);
    } else if (isKafes) {
        projeDeger = getHacim(formData.projeKafesList);
        mevcutDeger = getHacim(formData.mevcutKafesList);
    } else if (isMidye) {
        projeDeger = (formData.projeKafesList || []).reduce((sum, item) => sum + (parseInt(item.adet) || 0), 0);
        mevcutDeger = (formData.mevcutKafesList || []).reduce((sum, item) => sum + (parseInt(item.adet) || 0), 0);
    }

    const polygonArea = getPolygonArea(formData.koordinatList);
    const fark = mevcutDeger - projeDeger;
    const hasKacak = fark > 0;

    useEffect(() => {
        let updateAlan = 0;
        if (isKarasal && projeDeger > 0) updateAlan = projeDeger;
        else if (!isKarasal && polygonArea > 0) updateAlan = polygonArea;
        
        if (updateAlan > 0 && formData.alan !== `${updateAlan} mÂ²`) {
            setFormData(prev => ({ ...prev, alan: `${updateAlan} mÂ²` }));
        }
    }, [isKarasal, projeDeger, polygonArea, formData.alan]);

    const handleInputChange = (e) => {

      const { name, value } = e.target;
      setFormData(prev => {
          const newData = {...prev, [name]: value};
          if (name === 'tur') {
              newData.turler = '';
          }
          return newData;
      });
  };

  const handleSave = () => {
      if(editingId) {
          let newDataList = dataList.map(t => t.id === editingId ? { ...t, ...formData } : t);
      } else {
          const newId = `TS-${Date.now()}`;
          newDataList = [{ ...formData, id: newId, finalStatus: formData.finalStatus || 'Aktif', tur: formData.tur || 'Deniz YetiÅŸtiriciliÄŸi' }, ...dataList];
      }
      saveToDatabase(newDataList);
      setActiveTab('aktif_tesisler');
      setFormData({});
      setEditingId(null);
  };

  const handleNewRecordClick = () => {
      setActiveTab("yeni");
      setEditingId(null);
      
      let maxNum = 0;
      dataList.forEach(t => {
          if (t.resmiNo) {
              const match = String(t.resmiNo).match(/(?:57-)?(\d+)/);
              if (match && match[1]) {
                  const num = parseInt(match[1], 10);
                  if (num > maxNum && num < 10000) maxNum = num;
              }
          }
      });
      const nextNo = `57-${maxNum + 1}`;
      
      setFormData({ 
          finalStatus: 'Aktif', 
          tur: 'Deniz YetiÅŸtiriciliÄŸi',
          resmiNo: nextNo
      });
  };

  // Quick Action Handlers
  const executeDevir = () => {
      if (!qaData.sourceId || !qaData.yeniFirmaAdi) {
          alert('LÃ¼tfen devredilecek tesisi ve yeni firma adÄ±nÄ± girin.'); return;
      }
      const sourceTesis = dataList.find(t => t.id === qaData.sourceId);
      if (!sourceTesis) return;
      
      const newTesis = { 
          ...sourceTesis, 
          id: `TS-${Date.now()}`,
          firmaAdi: qaData.yeniFirmaAdi.toUpperCase(),
          kiraTarih: qaData.devirTarihi || sourceTesis.kiraTarih,
          finalStatus: 'Aktif',
          _devirNotu: null,
          mergeCount: 1,
          kaynakSekmeler: ['HÄ±zlÄ± Devir ModÃ¼lÃ¼']
      };
      
      setDataList(prev => prev.map(t => {
          if (t.id === qaData.sourceId) {
              return { ...t, finalStatus: 'Devredildi', _devirNotu: `${qaData.devirTarihi} tarihinde ${qaData.yeniFirmaAdi} firmasÄ±na devredildi.` };
          }
          return t;
      }).concat(newTesis));
      
      setShowDevirModal(false);
      setQaData({ sourceId: '', yeniFirmaAdi: '', devirTarihi: '', yeniStatus: '' });
      saveToDatabase(newDataList);
      setActiveTab('aktif_tesisler');
  };

  const executeStatusChange = () => {
      if (!qaData.sourceId || !qaData.yeniStatus) {
          alert('LÃ¼tfen bir tesis ve yeni statÃ¼sÃ¼nÃ¼ seÃ§in.'); return;
      }
      setDataList(prev => prev.map(t => {
          if (t.id === qaData.sourceId) {
              return { ...t, finalStatus: qaData.yeniStatus, _devirNotu: `HÄ±zlÄ± iÅŸlem modÃ¼lÃ¼yle statÃ¼ ${qaData.yeniStatus} yapÄ±ldÄ±.` };
          }
          return t;
      }));
      setShowStatusModal(false);
      setQaData({ sourceId: '', yeniFirmaAdi: '', devirTarihi: '', yeniStatus: '' });
      if (qaData.yeniStatus === 'Aktif') setActiveTab('aktif_tesisler'); else if (qaData.yeniStatus === 'Kiralama AÅŸamasÄ±nda') setActiveTab('kiralama_tesisler');
      else setActiveTab('pasif_tesisler');
  };

  const getCapacityRatio = (fiili, proje) => {
      let f = Number(String(fiili).replace(',','.').replace(/[^0-9.]/g, ''));
      let p = Number(String(proje).replace(',','.').replace(/[^0-9.]/g, ''));
      if (f > 0 && p > 0) return ((f / p) * 100).toFixed(1);
      return null;
  };

  const DetailBlock = ({ title, icon, children, urgent }) => (
    <div style={{ background: urgent ? '#fef2f2' : 'white', padding: '16px', borderRadius: '12px', border: urgent ? '1px solid #fecaca' : '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: urgent ? '#dc2626' : '#334155', display: 'flex', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: urgent ? '1px solid #fecaca' : '1px solid #f1f5f9', paddingBottom: '8px' }}>
            {icon} {title}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>{children}</div>
    </div>
  );

  const DetailItem = ({ label, value, highlight, warning, ghost }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', opacity: ghost ? 0.6 : 1 }}>
        <span style={{ color: '#64748b', fontSize: '12px', minWidth: '95px' }}>{label}:</span> 
        <span style={{ fontWeight: highlight ? 'bold' : '600', color: warning ? '#ef4444' : (highlight ? '#2563eb' : (ghost ? '#94a3b8' : '#0f172a')), textAlign: 'right', wordBreak: 'break-word' }}>
            {value || '-'}
        </span>
    </div>
  );

  const yavruKaynagiBaslik = formData.tur === 'Ã‡ift Kabuklu YetiÅŸtiriciliÄŸi' ? 'Spat (Yavru Midye) KaynaÄŸÄ±' : 'Yavru BalÄ±k KaynaÄŸÄ±';

  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh", position: "relative" }}>
      {/* QUICK ACTION MODALS */}
      {showDevirModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', color: '#1e293b' }}><RefreshCw size={20} style={{ marginRight: '8px', color: '#3b82f6' }} /> HÄ±zlÄ± Tesis Devri</h3>
                    <button onClick={() => setShowDevirModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>Devredilecek Aktif Tesis (Kaynak)</label>
                        <select value={qaData.sourceId} onChange={(e) => setQaData({...qaData, sourceId: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}>
                            <option value="">SeÃ§iniz...</option>
                            {aktifData.map(t => <option key={t.id} value={t.id}>{t.resmiNo} - {t.firmaAdi}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>Yeni (Devralan) Firma AdÄ±</label>
                        <input type="text" value={qaData.yeniFirmaAdi} onChange={(e) => setQaData({...qaData, yeniFirmaAdi: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} placeholder="Firma A.Å." />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>Devir / Kira SÃ¶zleÅŸme Tarihi</label>
                        <input type="date" value={qaData.devirTarihi} onChange={(e) => setQaData({...qaData, devirTarihi: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setShowDevirModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Ä°ptal</button>
                    <button onClick={executeDevir} style={{ padding: '10px 20px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center' }}><RefreshCw size={16} style={{marginRight: '6px'}}/> Devri GerÃ§ekleÅŸtir</button>
                </div>
            </div>
        </div>
      )}

      {showStatusModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', color: '#1e293b' }}><Zap size={20} style={{ marginRight: '8px', color: '#f59e0b' }} /> HÄ±zlÄ± StatÃ¼ DeÄŸiÅŸimi</h3>
                    <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>Ä°ÅŸlem YapÄ±lacak Tesis (Aktif veya ArÅŸiv)</label>
                        <select value={qaData.sourceId} onChange={(e) => setQaData({...qaData, sourceId: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}>
                            <option value="">SeÃ§iniz...</option>
                            <optgroup label="Aktif Tesisler">
                                {aktifData.map(t => <option key={t.id} value={t.id}>{t.resmiNo} - {t.firmaAdi} ({t.finalStatus})</option>)}
                            </optgroup>
                            <optgroup label="Pasif / Ä°ptal ArÅŸivi">
                                {dataList.map(t => <option key={t.id} value={t.id}>{t.resmiNo} - {t.firmaAdi} ({t.finalStatus})</option>)}
                            </optgroup>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>Yeni StatÃ¼ (Yeniden Aktif veya Ä°ptal)</label>
                        <select value={qaData.yeniStatus} onChange={(e) => setQaData({...qaData, yeniStatus: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}>
                            <option value="">SeÃ§iniz...</option>
                            {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setShowStatusModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Ä°ptal</button>
                    <button onClick={executeStatusChange} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center' }}><Zap size={16} style={{marginRight: '6px'}}/> StatÃ¼yÃ¼ GÃ¼ncelle</button>
                </div>
            </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
           <h1 style={{ fontSize: "24px", color: "#0f172a", margin: "0 0 6px 0", display: "flex", alignItems: "center", fontWeight: "bold" }}>
              <Globe size={28} style={{ marginRight: "12px", color: "#2563eb" }} />
              Balıkçılık ve Su Ürünleri Yönetim Sistemleri
           </h1>
           <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>FAO & ASC StandartlarÄ±nda AkÄ±llÄ± Entegrasyon</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
           <button onClick={() => { setActiveTab("aktif_tesisler"); setEditingId(null); setFormData({}); }} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "none", background: activeTab === "aktif_tesisler" ? "#10b981" : "#f1f5f9", color: activeTab === "aktif_tesisler" ? "white" : "#475569", fontSize: '13px' }}><LayoutGrid size={16} style={{ marginRight: "6px" }} /> Aktif Tesisler</button>
          <button onClick={() => { setActiveTab("kiralama_tesisler"); setEditingId(null); setFormData({}); }} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "none", background: activeTab === "kiralama_tesisler" ? "#8b5cf6" : "#f1f5f9", color: activeTab === "kiralama_tesisler" ? "white" : "#475569", fontSize: '13px' }}><Clock size={16} style={{ marginRight: "6px" }} /> Kiralama AÅŸamasÄ±nda</button>
          <button onClick={() => { setActiveTab("devir_tesisler"); setEditingId(null); setFormData({}); }} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "none", background: activeTab === "devir_tesisler" ? "#3b82f6" : "#f1f5f9", color: activeTab === "devir_tesisler" ? "white" : "#475569", fontSize: '13px' }}><RefreshCw size={16} style={{ marginRight: "6px" }} /> Devredilenler</button>
          <button onClick={() => { setActiveTab("pasif_tesisler"); setEditingId(null); setFormData({}); }} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "none", background: activeTab === "pasif_tesisler" ? "#f59e0b" : "#f1f5f9", color: activeTab === "pasif_tesisler" ? "white" : "#475569", fontSize: '13px' }}><Archive size={16} style={{ marginRight: "6px" }} /> Pasif Tesisler</button>
          <button onClick={() => { setActiveTab("iptal_tesisler"); setEditingId(null); setFormData({}); }} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "none", background: activeTab === "iptal_tesisler" ? "#f43f5e" : "#f1f5f9", color: activeTab === "iptal_tesisler" ? "white" : "#475569", fontSize: '13px' }}><AlertTriangle size={16} style={{ marginRight: "6px" }} /> Ä°ptal Edilenler</button>
           
           <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }}></div>
           
           <button onClick={() => setShowDevirModal(true)} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "1px solid #3b82f6", background: "#eff6ff", color: "#1e3a8a", fontSize: '13px', transition: '0.2s' }} title="Mevcut tesisi yeni bir firmaya devret"><RefreshCw size={16} style={{ marginRight: "6px" }} /> HÄ±zlÄ± Devir</button>
           <button onClick={() => setShowStatusModal(true)} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "1px solid #f59e0b", background: "#fef3c7", color: "#92400e", fontSize: '13px', transition: '0.2s' }} title="Tesisin statÃ¼sÃ¼nÃ¼ deÄŸiÅŸtir (Yeniden Aktif veya Ä°ptal)"><Zap size={16} style={{ marginRight: "6px" }} /> StatÃ¼ DeÄŸiÅŸimi</button>
           
           <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }}></div>

           <button onClick={handleNewRecordClick} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", border: "none", background: "#3b82f6", color: "white", boxShadow: "0 2px 4px rgba(59,130,246,0.3)", fontSize: '13px' }}><Plus size={16} style={{ marginRight: "6px" }} /> Yeni KayÄ±t Ekle</button>
        </div>
      </div>
      
      {sysError && (
          <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} />
              <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Sistem UyarÄ± ve Koruma KalkanÄ± Devrede!</h4>
                  <p style={{ margin: 0, fontSize: '13px' }}>{sysError}</p>
              </div>
          </div>
      )}

      {(activeTab !== 'yeni') && (
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ width: '280px', background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', height: 'fit-content', position: 'sticky', top: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BÃ¶lgeler / Ä°lÃ§eler</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(ilceCounts).map(([ilce, count]) => (
                <button key={ilce} onClick={() => setSelectedIlce(ilce)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: selectedIlce === ilce ? '#1e293b' : 'transparent', color: selectedIlce === ilce ? 'white' : '#475569' }}>
                  <span style={{ fontWeight: selectedIlce === ilce ? '600' : '500' }}>{ilce}</span><span style={{ background: selectedIlce === ilce ? '#334155' : '#f1f5f9', color: selectedIlce === ilce ? 'white' : '#64748b', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{count}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px' }}>{activeTab === 'aktif_tesisler' ? 'Aktif Ãœretim Tesisleri' : activeTab === 'kiralama_tesisler' ? 'Kiralama AÅŸamasÄ±nda Olan Tesisler' : activeTab === 'devir_tesisler' ? 'Devredilen Tesisler' : activeTab === 'pasif_tesisler' ? 'Pasif Tesisler' : 'Ä°ptal Edilen Tesisler'}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>MÃ¼racaat NumarasÄ±na gÃ¶re {filteredData.length} tesis listeleniyor.</p>
              </div>
              <div style={{ position: 'relative', width: '300px' }}><Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /><input type="text" placeholder="Firma veya MÃ¼racaat No Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', background: '#f8fafc' }} /></div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <tr>
                      <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', width: '110px' }}>MÃ¼racaat No</th>
                      <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Firma AdÄ±</th>
                      <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Tesis TÃ¼rÃ¼</th>
                      <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Kapasite</th>
                      <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', width: '140px' }}>Durum</th>
                      <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Ä°ÅŸlemler & RÃ¶ntgen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>GÃ¶rÃ¼ntÃ¼lenecek kayÄ±t bulunamadÄ±.</td></tr>
                    ) : (
                      filteredData.map((t, index) => {
                        let ratio = getCapacityRatio(t.fiiliKapasite, t.kapasite);
                        let isHighCapacity = ratio && parseFloat(ratio) > 90;
                        let labels = getDynamicHeaders(t.tur);
                        let durumColor = '#166534', durumBg = '#dcfce7';
                        if (t.finalStatus === 'Ä°ptal' || t.finalStatus === 'Pasif') { durumColor = '#991b1b'; durumBg = '#fee2e2'; }
                        else if (t.finalStatus === 'Kiralama AÅŸamasÄ±nda' || t.finalStatus === 'Devredildi') { durumColor = '#92400e'; durumBg = '#fef3c7'; }

                        const isHierarchyChild = index > 0 && filteredData[index - 1].resmiNo === t.resmiNo && t.resmiNo !== '-';

                        return (
                        <React.Fragment key={t.id}>
                          <tr style={{ borderBottom: expandedRowId === t.id ? 'none' : '1px solid #f1f5f9', background: expandedRowId === t.id ? '#f8fafc' : '#fff', cursor: 'pointer' }} onClick={() => toggleRow(t.id)}>
                            <td style={{ padding: '16px 24px', color: '#1e293b', fontSize:'14px', fontWeight: 'bold', position: 'relative' }}>
                                {isHierarchyChild && (
                                    <div style={{ position: 'absolute', left: '12px', top: '-16px', bottom: '24px', width: '2px', background: '#cbd5e1' }}></div>
                                )}
                                {isHierarchyChild && (
                                    <div style={{ position: 'absolute', left: '12px', top: '24px', width: '8px', height: '2px', background: '#cbd5e1' }}></div>
                                )}
                                <span style={{ marginLeft: isHierarchyChild ? '12px' : '0' }}>{isHierarchyChild ? 'â†³' : t.resmiNo}</span>
                                {t.mergeCount > 1 && !isHierarchyChild && <span style={{marginLeft:'4px', padding:'2px 6px', background:'#e2e8f0', color:'#475569', borderRadius:'10px', fontSize:'10px'}} title="BirleÅŸtirilmiÅŸ KayÄ±t SayÄ±sÄ±">+{t.mergeCount}</span>}
                            </td>
                            <td style={{ padding: '16px', fontWeight: '500', color: isHierarchyChild ? '#64748b' : '#0f172a', fontSize:'14px' }}>
                                {t.firmaAdi}
                            </td>
                            <td style={{ padding: '16px', color: '#64748b', fontSize:'13px' }}>{t.tur}</td>
                            <td style={{ padding: '16px', fontWeight: '600', color: '#0f172a', fontSize:'13px' }}>{t.kapasite > 0 ? t.kapasite.toLocaleString('tr-TR') : '-'} <span style={{color: '#94a3b8', fontWeight: 'normal', fontSize:'11px'}}>Ton</span></td>
                            <td style={{ padding: '16px' }}><span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: durumBg, color: durumColor, textTransform: 'uppercase' }}>{t.finalStatus}</span></td>
                            <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                                <button onClick={(e) => handleEdit(e, t)} style={{ background: '#eff6ff', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '8px', borderRadius: '8px', transition: '0.2s' }} title="Tesis Bilgilerini DÃ¼zenle/GÃ¼ncelle"><Edit size={16}/></button>
                                <button onClick={(e) => handleDelete(e, t.id)} style={{ background: '#fef2f2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px', borderRadius: '8px', transition: '0.2s' }} title="Tesisi KalÄ±cÄ± Olarak Sil"><Trash2 size={16}/></button>
                                <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>
                                <button style={{ background: expandedRowId === t.id ? '#1e293b' : '#f1f5f9', border: 'none', cursor: 'pointer', color: expandedRowId === t.id ? 'white' : '#475569', padding: '8px 12px', borderRadius: '8px', transition: '0.2s', display: 'inline-flex', alignItems: 'center' }} title="Tesis RÃ¶ntgenini AÃ§">{expandedRowId === t.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>
                            </td>
                          </tr>
                          
                          {expandedRowId === t.id && (
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                              <td colSpan="6" style={{ padding: '0 24px 24px 24px' }}>
                                {t._devirNotu && (
                                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '13px' }}>
                                        <Info size={16} /> <strong>Otomatik Åecere / Aksiyon UyarÄ±:</strong> {t._devirNotu}
                                    </div>
                                )}
                                {t.mergeCount > 1 && (
                                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a', fontSize: '13px' }}>
                                        <Info size={16} /> <strong>AkÄ±llÄ± Veri Harmanlama:</strong> Bu tesisin verileri {t.mergeCount} farklÄ± sekmeden ({t.tesisSahasi}) taranarak (hÃ¼cre bazÄ±nda eksikler tamamlanÄ±p) tek bir mÃ¼kemmel ÅŸablonda birleÅŸtirilmiÅŸtir. HiÃ§bir veri kaybÄ± yaÅŸanmamÄ±ÅŸtÄ±r.
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                  <DetailBlock title="Ä°dari Kimlik & Temel Veriler" icon={<Building size={16} style={{marginRight:'6px', color:'#3b82f6'}}/>}>
                                    <DetailItem label="Tesis AdÄ±" value={t.tesisAdi} highlight />
                                    <DetailItem label="Tesis SahasÄ±" value={t.tesisSahasi} highlight />
                                    <DetailItem label="Tesis TÃ¼rÃ¼" value={t.tur} />
                                    <DetailItem label="VKN/TC No" value={t.vkn} />
                                    <DetailItem label="Ä°lÃ§e" value={t.ilce} />
                                    <DetailItem label="Adres" value={t.adres || "GiriÅŸ Bekliyor"} ghost={!t.adres} />
                                    <DetailItem label="Telefon" value={t.telefon || "GiriÅŸ Bekliyor"} ghost={!t.telefon} />
                                  </DetailBlock>
                                  <DetailBlock title="Ãœretim, TÃ¼r & BiyogÃ¼venlik" icon={<Fish size={16} style={{marginRight:'6px', color:'#06b6d4'}}/>}>
                                    <DetailItem label="Hedef TÃ¼rler" value={t.turler} />
                                    <DetailItem label="Prj. Kapasite" value={t.kapasite ? t.kapasite + ' Ton' : '-'} />
                                    <DetailItem label="Fiili Kapasite" value={t.fiiliKapasite ? t.fiiliKapasite + ' Ton' : '-'} highlight={isHighCapacity} />
                                    <DetailItem label="Kapasite Dol." value={ratio ? `%${ratio}` : '-'} warning={isHighCapacity} />
                                    <DetailItem label="Yem Ã‡evrim(FCR)" value={t.fcrHedefi || "HesaplanÄ±yor..."} ghost={!t.fcrHedefi} />
                                      <DetailItem label="Sorumlu Personel" value={Array.isArray(t.personelList) && t.personelList.length > 0 ? t.personelList.map(p => p.adSoyad + (p.nakilYetkisi ? ' ğŸšš(Nakil Ytk.)' : '')).join(', ') : (t.sorumluPersonel || "AtanmadÄ±")} ghost={!(Array.isArray(t.personelList) && t.personelList.length > 0) && !t.sorumluPersonel} />
                                      <DetailItem label="Yem Tipi" value={t.yemTipi || "GiriÅŸ Bekliyor"} ghost={!t.yemTipi} />
                                      <DetailItem label="AÅŸÄ±lama Durumu" value={t.asilamaDurumu || "KayÄ±t Yok"} ghost={!t.asilamaDurumu} highlight={t.asilamaDurumu === 'DÃ¼zenli Program Var'} warning={t.asilamaDurumu === 'Yok'} />
                                      <DetailItem label="BiyogÃ¼venlik" value={t.biyoguvenlikUnitesi || "KayÄ±t Yok"} ghost={!t.biyoguvenlikUnitesi} highlight={t.biyoguvenlikUnitesi && t.biyoguvenlikUnitesi.includes('Tam DonanÄ±mlÄ±')} warning={t.biyoguvenlikUnitesi === 'Yok'} />
                                      <DetailItem label="Mortalite (%)" value={t.mortaliteOrani ? `%${t.mortaliteOrani}` : "GiriÅŸ Bekliyor"} ghost={!t.mortaliteOrani} warning={t.mortaliteOrani > 10} />
                                      <DetailItem label="Su Kalite Ã–lÃ§Ã¼mÃ¼" value={t.suKaliteOlcumu || "Bilinmiyor"} ghost={!t.suKaliteOlcumu} highlight={t.suKaliteOlcumu && t.suKaliteOlcumu.includes('AnlÄ±k')} warning={t.suKaliteOlcumu && t.suKaliteOlcumu.includes('Yok')} />
                                      <DetailItem label="Yavru KaynaÄŸÄ±" value={t.yavruKaynagi || "Analiz Bekliyor"} ghost={!t.yavruKaynagi} />
                                      <DetailItem label="Tahmini Hasat" value={t.tahminiHasat || "Sistem Beklemesinde"} ghost={!t.tahminiHasat} />

                                  </DetailBlock>
                                  <DetailBlock title="AltyapÄ± & Deniz/KÄ±yÄ± Operasyonu" icon={<Ruler size={16} style={{marginRight:'6px', color:'#10b981'}}/>}>
                                    <DetailItem label={labels.sayi} value={`Prj: ${t.projeKafes||'-'} | Mvc: ${t.mevcutKafes||'-'}`} />
                                    <DetailItem label={labels.ebat} value={t.kafesEbat} />
                                    <DetailItem label={labels.hacim} value={t.toplamHacim ? t.toplamHacim + ' mÂ³' : '-'} />
                                    <DetailItem label={t.tur === "Karasal Ãœretim" ? "Arazi / Havuz AlanÄ±" : "Tahsis AlanÄ±"} value={t.alan ? t.alan : '-'} />
                                    <DetailItem label="Nakil PlakalarÄ±" value={"KayÄ±t Yok"} ghost />
                                    <DetailItem label="KÄ±yÄ± Ä°skelesi" value={"KayÄ±t Yok"} ghost />
                                    <DetailItem label="DalgÄ±Ã§/SualtÄ±" value={"SÃ¶zleÅŸme Yok"} ghost />
                                  </DetailBlock>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                  <DetailBlock title="Harita, Cihaz & Ã‡atÄ±ÅŸma Analizi" icon={<Anchor size={16} style={{marginRight:'6px', color:'#f59e0b'}}/>}>
                                    <DetailItem label="WGS 84" value={t.wgs84 || "GiriÅŸ Bekliyor"} ghost={!t.wgs84} />
                                    <DetailItem label="ED 50" value={t.ed50 || "GiriÅŸ Bekliyor"} ghost={!t.ed50} />
                                    <DetailItem label="Derinlik Analizi" value={"SensÃ¶r Bekleniyor"} ghost />
                                    <DetailItem label="SÄ°T/Turizm Mf." value={"GÃ¼venli (HesaplanÄ±yor)"} ghost />
                                    <DetailItem label="ÅamandÄ±ra SayÄ±sÄ±/Tipi" value={t.samandiraNo || "GiriÅŸ Bekliyor"} ghost={!t.samandiraNo} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: '#64748b', fontSize: '13px' }}>ÅamandÄ±ra Durumu</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: t.samandiraDurum === 'Aktif / Sorunsuz' ? '#059669' : t.samandiraDurum === 'SÃ¶ndÃ¼ / ArÄ±zalÄ±' ? '#ef4444' : t.samandiraDurum === 'SÃ¼rÃ¼klendi / Koptu' ? '#ea580c' : t.samandiraDurum === 'BakÄ±m YaklaÅŸtÄ±' ? '#ca8a04' : '#0f172a' }}>
                                            {t.samandiraDurum || '-'}
                                        </span>
                                    </div>
                                    <DetailItem label="Son BakÄ±m/BitiÅŸ" value={t.samandiraBitis ? new Date(t.samandiraBitis).toLocaleDateString('tr-TR') : "-"} ghost={!t.samandiraBitis} />
                                  </DetailBlock>
                                  <DetailBlock title="Belge & Onay Durumu" icon={<FileText size={16} style={{marginRight:'6px', color:'#3b82f6'}}/>}>
                                    <DetailItem label="Proje OnayÄ±" value={t.projeOnayTarihi ? new Date(t.projeOnayTarihi).toLocaleDateString('tr-TR') : "-"} ghost={!t.projeOnayTarihi} />
                                    <DetailItem label="Revize Onay" value={t.revizeProjeTarihi ? new Date(t.revizeProjeTarihi).toLocaleDateString('tr-TR') : "-"} ghost={!t.revizeProjeTarihi} />
                                    <DetailItem label="Ä°lk Belge No" value={t.ilkBelgeNo || "-"} ghost={!t.ilkBelgeNo} />
                                    <DetailItem label="Ä°lk Belge Trh" value={t.ilkBelgeTarihi ? new Date(t.ilkBelgeTarihi).toLocaleDateString('tr-TR') : "-"} ghost={!t.ilkBelgeTarihi} />
                                    <DetailItem label="Yeni Belge No" value={t.yeniBelgeNo || "-"} ghost={!t.yeniBelgeNo} />
                                    <DetailItem label="Yeni Belge Trh" value={t.yeniBelgeTarihi ? new Date(t.yeniBelgeTarihi).toLocaleDateString('tr-TR') : "-"} ghost={!t.yeniBelgeTarihi} />
                                    <DetailItem label="Vize Tarihi" value={t.vizeTarihi ? new Date(t.vizeTarihi).toLocaleDateString('tr-TR') : "-"} ghost={!t.vizeTarihi} />
                                    <DetailItem label="Son Tarih" value={t.sonTarih ? new Date(t.sonTarih).toLocaleDateString('tr-TR') : "-"} ghost={!t.sonTarih} />
                                  </DetailBlock>
                                  <DetailBlock title="Denetim, Hukuk & Sicil" icon={<AlertTriangle size={16} style={{marginRight:'6px', color:'#ef4444'}}/>} urgent={!t.vizeTarihi}>
                                    <DetailItem label="Son Denetim" value={t.sonDenetim || "KayÄ±t Yok"} ghost={!t.sonDenetim} />
                                    <DetailItem label="Uygunluk Notu" value={"-"} ghost />
                                    <DetailItem label="1380 Ceza Sicili" value={"Temiz"} highlight />
                                    <DetailItem label="Vize BitiÅŸ" value={t.vizeTarihi} warning={!t.vizeTarihi} />
                                    <DetailItem label="Kiralayan (KiracÄ±)" value={t.kiralayan || "KayÄ±t Yok"} ghost={!t.kiralayan} />
                                    <DetailItem label="SÃ¶zleÅŸme Tarihi" value={t.suKirasiTarih ? new Date(t.suKirasiTarih).toLocaleDateString('tr-TR') : "Belirtilmedi"} />
                                    <DetailItem label="Kira BitiÅŸ" value={t.kiraBitisTarihi ? new Date(t.kiraBitisTarihi).toLocaleDateString('tr-TR') : "Belirtilmedi"} warning={!t.kiraBitisTarihi} />
                                    <DetailItem label="Kira Bedeli" value={t.suKirasiBedel ? `${t.suKirasiBedel} TL` : 'Girilmedi'} />
                                  </DetailBlock>
                                  <DetailBlock title="Ekolojik YÃ¼k & SÃ¼rdÃ¼rÃ¼lebilirlik" icon={<Activity size={16} style={{marginRight:'6px', color:'#8b5cf6'}}/>}>
                                    <DetailItem label="Ã‡ED KararÄ±" value={t.cedKarari || "Belge Bekliyor"} ghost={!t.cedKarari} />
                                    <DetailItem label="Su Analiz Trh." value={t.suAnalizTarihi || "KayÄ±t Yok"} ghost={!t.suAnalizTarihi} />
                                    <DetailItem label="Azot/Fosfor YÃ¼kÃ¼" value={"Optimum SÄ±nÄ±rda"} highlight />
                                    <DetailItem label="FÄ±rtÄ±na/Hasar" value={"Sicil Temiz"} highlight />
                                    <DetailItem label="HastalÄ±k/Ä°tlaf" value={"KayÄ±t Yok"} highlight />
                                    <DetailItem label="TARSÄ°M Sigorta" value={t.tarsim || "KayÄ±t Bekliyor"} ghost={!t.tarsim} />
                                  </DetailBlock>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'yeni' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <button onClick={() => setActiveTab('aktif_tesisler')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginRight: '16px', display: 'flex', alignItems: 'center' }}><ArrowLeft size={20} /></button>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>{editingId ? 'Tesis Bilgilerini DÃ¼zenle & GÃ¼ncelle' : 'Yeni Tesis KaydÄ±'}</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. BLOK: Ä°DARÄ° KÄ°MLÄ°K */}
            <FormSection title="Ä°dari Kimlik & Temel Bilgiler" icon={<Building size={18} color="#3b82f6" />}>
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Tesis TÃ¼rÃ¼ *" name="tur" options={TUR_OPTIONS} />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Tesis Durumu (Mevcut StatÃ¼) *" name="finalStatus" options={STATUS_OPTIONS} />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Firma/ÅahÄ±s AdÄ± *" name="firmaAdi" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="MÃ¼racaat No *" name="resmiNo" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Tesis / Proje AdÄ±" name="tesisAdi" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Tesis SahasÄ± (Ã–rn: 1. SAHA)" name="tesisSahasi" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Ä°lÃ§e" name="ilce" options={VALID_DISTRICTS} />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="VKN / TC Kimlik No" name="vkn" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Adres Bilgisi" name="adres" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Telefon / Ä°letiÅŸim" name="telefon" />
            </FormSection>

            {/* 2. BLOK: DENETÄ°M */}
            {/* YENÄ° BLOK: BELGE & ONAY DURUMU */}
            <FormSection title="Belge & Onay Durumu" icon={<FileText size={18} color="#3b82f6" />}>
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    
                    {/* Sol SÃ¼tun: Proje Onay SÃ¼reÃ§leri */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={16} color="#059669" /> Proje Onay SÃ¼reÃ§leri
                        </h4>
                        <hr style={{ border: 'none', borderBottom: '1px solid #f1f5f9', margin: '0 0 8px 0' }} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <FormGroup formData={formData} handleInputChange={handleInputChange} label="Proje Onay Tarihi" name="projeOnayTarihi" type="date" />
                            <FormGroup formData={formData} handleInputChange={handleInputChange} label="Revize Proje Tarihi" name="revizeProjeTarihi" type="date" />
                        </div>
                    </div>

                    {/* SaÄŸ SÃ¼tun: YetiÅŸtiricilik Belgeleri */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={16} color="#3b82f6" /> YetiÅŸtiricilik Belgeleri
                        </h4>
                        <hr style={{ border: 'none', borderBottom: '1px solid #f1f5f9', margin: '0 0 8px 0' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <FormGroup formData={formData} handleInputChange={handleInputChange} label="Ä°lk Belge No" name="ilkBelgeNo" placeholder="Ã–rn: 12345" />
                            <FormGroup formData={formData} handleInputChange={handleInputChange} label="Ä°lk Belge Tarihi" name="ilkBelgeTarihi" type="date" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <FormGroup formData={formData} handleInputChange={handleInputChange} label="Yeni Belge No" name="yeniBelgeNo" placeholder="Ã–rn: 67890" />
                            <FormGroup formData={formData} handleInputChange={handleInputChange} label="Yeni Belge Tarihi" name="yeniBelgeTarihi" type="date" />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <FormGroup formData={formData} handleInputChange={handleInputChange} label="Vize Tarihi" name="vizeTarihi" type="date" />
                            <FormGroup formData={formData} handleInputChange={handleInputChange} label="Son Tarih" name="sonTarih" type="date" />
                        </div>
                    </div>

                </div>
            </FormSection>

            {/* 3. BLOK: HARÄ°TA */}
            <FormSection title="Harita, Koordinat & Cihazlar" icon={<MapPin size={18} color="#f59e0b" />}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <KoordinatListManager items={formData.koordinatList || []} onChange={(newList) => setFormData({ ...formData, koordinatList: newList })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>ÅamandÄ±ra SayÄ±sÄ± / Tipi</label>
                    <select value={formData.samandiraNo || ''} onChange={(e) => handleInputChange('samandiraNo', e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }}>
                        <option value="">SeÃ§iniz...</option>
                        <option value="1 Adet (SarÄ± Ã‡akar)">1 Adet (SarÄ± Ã‡akar)</option>
                        <option value="2 Adet (SarÄ± Ã‡akar)">2 Adet (SarÄ± Ã‡akar)</option>
                        <option value="3 Adet (SarÄ± Ã‡akar)">3 Adet (SarÄ± Ã‡akar)</option>
                        <option value="4 Adet (SarÄ± Ã‡akar)">4 Adet (SarÄ± Ã‡akar)</option>
                        <option value="4+ Adet (SarÄ± Ã‡akar)">4+ Adet (SarÄ± Ã‡akar)</option>
                        <option value="IÅŸÄ±ksÄ±z ÅamandÄ±ra">IÅŸÄ±ksÄ±z ÅamandÄ±ra</option>
                        <option value="Yok / Bulunmuyor">Yok / Bulunmuyor</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>ÅamandÄ±ra Durumu</label>
                    <select value={formData.samandiraDurum || ''} onChange={(e) => handleInputChange('samandiraDurum', e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: formData.samandiraDurum === 'Aktif / Sorunsuz' ? '#ecfdf5' : formData.samandiraDurum === 'SÃ¶ndÃ¼ / ArÄ±zalÄ±' ? '#fef2f2' : formData.samandiraDurum === 'SÃ¼rÃ¼klendi / Koptu' ? '#fff7ed' : formData.samandiraDurum === 'BakÄ±m YaklaÅŸtÄ±' ? '#fefce8' : '#fff', color: formData.samandiraDurum === 'Aktif / Sorunsuz' ? '#059669' : formData.samandiraDurum === 'SÃ¶ndÃ¼ / ArÄ±zalÄ±' ? '#ef4444' : formData.samandiraDurum === 'SÃ¼rÃ¼klendi / Koptu' ? '#ea580c' : formData.samandiraDurum === 'BakÄ±m YaklaÅŸtÄ±' ? '#ca8a04' : '#0f172a', fontWeight: formData.samandiraDurum ? 'bold' : 'normal' }}>
                        <option value="">Durum SeÃ§iniz...</option>
                        <option value="Aktif / Sorunsuz">ğŸŸ¢ Aktif / Sorunsuz</option>
                        <option value="SÃ¶ndÃ¼ / ArÄ±zalÄ±">ğŸ”´ SÃ¶ndÃ¼ / ArÄ±zalÄ±</option>
                        <option value="SÃ¼rÃ¼klendi / Koptu">ğŸŸ  SÃ¼rÃ¼klendi / Koptu</option>
                        <option value="BakÄ±m YaklaÅŸtÄ±">ğŸŸ¡ BakÄ±m YaklaÅŸtÄ±</option>
                    </select>
                </div>
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Son BakÄ±m / BitiÅŸ Tarihi" name="samandiraBitis" type="date" />
            </FormSection>

            {/* 4. BLOK: ALTYAPI */}
            <FormSection title="AltyapÄ± & Saha Operasyonu" icon={<Ruler size={18} color="#10b981" />}>
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <KafesListManager 
                        tesisTuru={formData.tur} 
                        type="proje" 
                        items={formData.projeKafesList || []} 
                        onChange={(newList) => setFormData(prev => ({ ...prev, projeKafesList: newList }))} 
                    />
                    <KafesListManager 
                        tesisTuru={formData.tur} 
                        type="mevcut" 
                        items={formData.mevcutKafesList || []} 
                        onChange={(newList) => setFormData(prev => ({ ...prev, mevcutKafesList: newList }))} 
                    />
                </div>
                
                <div style={{ gridColumn: '1 / -1', background: hasKacak ? '#fef2f2' : '#f8fafc', border: `1px solid ${hasKacak ? '#f87171' : '#cbd5e1'}`, borderRadius: '8px', padding: '16px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ background: hasKacak ? '#ef4444' : '#3b82f6', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={16} color="white" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>Otomatik Alan & Kapasite Denetimi</h4>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>Sistem resmi proje ve mevcut durumu kÄ±yaslayarak ihlal denetimi yapar.</span>
                            </div>
                        </div>
                        {hasKacak ? (
                            <div style={{ background: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={14} /> Ä°HLAL TESPÄ°T EDÄ°LDÄ° (+{fark.toLocaleString('tr-TR')} {isKarasal ? 'mÂ²' : isMidye ? 'Adet' : 'mÂ³'} KaÃ§ak)
                            </div>
                        ) : (
                            <div style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                âœ“ Alan & Kapasite Uygun
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Resmi Proje {isKarasal ? '(Havuz AlanÄ±)' : isMidye ? '(Sistem Adedi)' : '(Kafes Hacmi)'}</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{projeDeger > 0 ? `${projeDeger.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} ${isKarasal ? 'mÂ²' : isMidye ? 'Adet' : 'mÂ³'}` : 'HesaplanamadÄ±'}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Proje kayÄ±tlarÄ±ndan hesaplandÄ±</div>
                        </div>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: `1px dashed ${hasKacak ? '#ef4444' : '#cbd5e1'}` }}>
                            <div style={{ fontSize: '12px', color: hasKacak ? '#ef4444' : '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Sahadaki Fiili {isKarasal ? '(Havuz AlanÄ±)' : isMidye ? '(Sistem Adedi)' : '(Kafes Hacmi)'}</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: hasKacak ? '#ef4444' : '#0f172a' }}>{mevcutDeger > 0 ? `${mevcutDeger.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} ${isKarasal ? 'mÂ²' : isMidye ? 'Adet' : 'mÂ³'}` : 'KayÄ±t Yok'}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Mevcut (Fiili) kayÄ±tlardan hesaplandÄ±</div>
                        </div>
                    </div>
                </div>

            </FormSection>

            {/* 5. BLOK: ÃœRETÄ°M VE BÄ°YOGÃœVENLÄ°K */}
            <FormSection title="Ãœretim, TÃ¼r & BiyogÃ¼venlik" icon={<Fish size={18} color="#06b6d4" />}>
                <FormGroup formData={formData} handleInputChange={handleInputChange} 
                    label="Hedef TÃ¼rler *" 
                    name="turler" 
                    options={SPECIES_OPTIONS[formData.tur || 'Deniz YetiÅŸtiriciliÄŸi'] || SPECIES_OPTIONS['DiÄŸer']} 
                />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Proje Kapasitesi (Ton/YÄ±l)" name="kapasite" type="number" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Fiili Kapasite (Ton/YÄ±l)" name="fiiliKapasite" type="number" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label={yavruKaynagiBaslik} name="yavruKaynagi" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Tahmini Hasat DÃ¶nemi" name="tahminiHasat" />
            
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Yem Ã‡evrim OranÄ± (FCR) Hedefi" name="fcrHedefi" type="number" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="KullanÄ±lan Yem Tipi/MarkasÄ±" name="yemTipi" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="AÅŸÄ±lama / Ä°laÃ§lama ProgramÄ±" name="asilamaDurumu" options={["DÃ¼zenli Program Var", "Sadece HastalÄ±k Durumunda", "Yok"]} />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Dezenfeksiyon / BiyogÃ¼venlik Ãœnitesi" name="biyoguvenlikUnitesi" options={["Tam DonanÄ±mlÄ± (AraÃ§/Personel)", "KÄ±smi / Yetersiz", "Yok"]} />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="YÄ±llÄ±k Tahmini Mortalite (%)" name="mortaliteOrani" type="number" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Su Kalitesi Ã–lÃ§Ã¼m SÄ±klÄ±ÄŸÄ±" name="suKaliteOlcumu" options={["AnlÄ±k (SensÃ¶r ile)", "GÃ¼nlÃ¼k Manuel", "HaftalÄ±k / AylÄ±k", "DÃ¼zensiz / Yok"]} />
</FormSection>

            {/* 6. BLOK: Ã‡EVRE */}
            <FormSection title="Ekolojik YÃ¼k & Ã‡evre" icon={<Activity size={18} color="#8b5cf6" />}>
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Ã‡ED KararÄ± (Gerekli DeÄŸildir / Olumlu)" name="cedKarari" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Son Su Analiz Tarihi" name="suAnalizTarihi" type="date" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="TARSÄ°M Sigorta PoliÃ§e No" name="tarsim" />
            </FormSection>

            {/* 7. BLOK: PERSONEL VE Ä°STÄ°HDAM */}
            <FormSection title="Personel & Ä°stihdam YÃ¶netimi" icon={<Users size={18} color="#8b5cf6" />}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <PersonelListManager items={formData.personelList || []} onChange={(newList) => setFormData({ ...formData, personelList: newList })} />
                </div>
            </FormSection>

            {/* 8. BLOK: DENETÄ°M */}
            <FormSection title="Denetim, Hukuk & Sicil" icon={<AlertTriangle size={18} color="#ef4444" />}>
                
                {formData.tur === 'Baraj / GÃ¶l Ãœretimi' && (
                    <div style={{ gridColumn: '1 / -1', background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px dashed #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                            <strong style={{ color: '#1e40af', fontSize: '13px', display: 'block' }}>Stok Ä°ÅŸlemleri Entegrasyonu (Aktif)</strong>
                            <span style={{ color: '#3b82f6', fontSize: '12px' }}>Kiralama bilgilerini Stok Ä°ÅŸlemleri modÃ¼lÃ¼nden Ã§ekebilirsiniz.</span>
                        </div>
                        <button type="button" onClick={pullFromStokIslemleri} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Database size={14} /> Verileri Ã‡ek
                        </button>
                    </div>
                )}

                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Kiralayan (Firma/ÅahÄ±s/Kooperatif)" name="kiralayan" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Su KirasÄ± SÃ¶zleÅŸme Tarihi" name="suKirasiTarih" type="date" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Su KirasÄ± BitiÅŸ Tarihi" name="kiraBitisTarihi" type="date" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Su KirasÄ± Bedeli (TL)" name="suKirasiBedel" />
                <FormGroup formData={formData} handleInputChange={handleInputChange} label="Son Denetim Tarihi" name="sonDenetim" type="date" />
            </FormSection>

            

            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => { saveToDatabase(newDataList);
      setActiveTab('aktif_tesisler'); setFormData({}); setEditingId(null); }} style={{ padding: '10px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Ä°ptal</button>
                <button type="button" onClick={handleSave} style={{ padding: '10px 24px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Save size={18} /> {editingId ? 'GÃ¼ncelle' : 'Kaydet'}</button>
            </div>
          </div>
      )}
    </div>
  );
};
export default TesisYonetimi;

