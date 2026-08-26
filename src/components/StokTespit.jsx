import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calculator, Edit2, Check, Map, Fish, Plus, Trash2, FileSpreadsheet, Printer, ArrowRight, Save, ShieldAlert, CheckCircle2, LayoutDashboard, ArrowLeft, Download, Database, Calendar, ChevronDown, ChevronUp, TrendingUp, Droplets, Target, Activity, ClipboardList, X, FileText } from 'lucide-react';
import { getPersonnelByUnit } from '../utils/excelData';
import './ArchiveReports.css'; 

const defaultStudies = [
  {
    id: 'boyabat-2021',
    title: 'Boyabat Baraj Gölü Stok Tespiti',
    lakeName: 'Boyabat Baraj Gölü',
    institution: 'T.C.\nSİNOP VALİLİĞİ\nİl Tarım ve Orman Müdürlüğü\nBalıkçılık ve Su Ürünleri Şube Müdürlüğü',
    dateRange: '22.06.2021-24.06.2021',
    totalArea: 20000000,
    createdAt: new Date('2021-06-25').toISOString(),
    stations: [
      {
        id: 1,
        name: "1. İstasyon",
        zoneArea: 6259314,
        coords: "41°19'07.0\"N 34°55'08.5\"E",
        surveys: [
          {
            id: 1, date: "22.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [
                { id: 1, species: "Sazan", weight: 1.300, length: 49 },
                { id: 2, species: "Sazan", weight: 1.230, length: 47 },
                { id: 3, species: "Sazan", weight: 1.340, length: 47 },
                { id: 4, species: "Sazan", weight: 1.310, length: 45 },
                { id: 5, species: "Sazan", weight: 1.435, length: 47 },
                { id: 6, species: "Sudak", weight: 2.710, length: 67 },
                { id: 7, species: "Sudak", weight: 2.520, length: 61 },
                { id: 8, species: "Yayın", weight: 1.650, length: 70 }
              ] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          },
          {
            id: 2, date: "23.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [
                { id: 1, species: "Sazan", weight: 1.050, length: 43 },
                { id: 2, species: "Sazan", weight: 1.330, length: 46 },
                { id: 3, species: "Sazan", weight: 1.560, length: 49 },
                { id: 4, species: "Sazan", weight: 1.290, length: 45 },
                { id: 5, species: "Sazan", weight: 1.330, length: 46 },
                { id: 6, species: "Sazan", weight: 1.540, length: 49 },
                { id: 7, species: "Sazan", weight: 1.470, length: 48 },
                { id: 8, species: "Sazan", weight: 1.300, length: 45 },
                { id: 9, species: "Sudak", weight: 2.760, length: 69 },
                { id: 10, species: "Yayın", weight: 0.880, length: 48 }
              ] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          },
          {
            id: 3, date: "24.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [
                { id: 1, species: "Sazan", weight: 1.280, length: 46 },
                { id: 2, species: "Sazan", weight: 1.250, length: 42 },
                { id: 3, species: "Sazan", weight: 0.890, length: 40 },
                { id: 4, species: "Sazan", weight: 1.350, length: 45 },
                { id: 5, species: "Sudak", weight: 2.680, length: 65 },
                { id: 6, species: "Sudak", weight: 2.560, length: 63 },
                { id: 7, species: "Yayın", weight: 1.400, length: 66 }
              ] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          }
        ]
      },
      {
        id: 2,
        name: "2. İstasyon",
        zoneArea: 6855440,
        coords: "41°18'45.2\"N 34°55'22.0\"E",
        surveys: [
          {
            id: 1, date: "22.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [{ id: 1, species: "Pullu Sazan", weight: 6.510, length: 45 }, { id: 2, species: "Sudak", weight: 4.0, length: 50 }, { id: 3, species: "Yayın", weight: 4.0, length: 60 }] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          },
          {
            id: 2, date: "23.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [{ id: 1, species: "Pullu Sazan", weight: 6.0, length: 45 }, { id: 2, species: "Sudak", weight: 3.170, length: 50 }, { id: 3, species: "Yayın", weight: 4.0, length: 60 }] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          },
          {
            id: 3, date: "24.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [{ id: 1, species: "Pullu Sazan", weight: 4.0, length: 45 }, { id: 2, species: "Sudak", weight: 2.0, length: 50 }, { id: 3, species: "Yayın", weight: 3.040, length: 60 }] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          }
        ]
      },
      {
        id: 3,
        name: "3. İstasyon",
        zoneArea: 6885246,
        coords: "41°17'30.1\"N 34°55'48.6\"E",
        surveys: [
          {
            id: 1, date: "22.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [{ id: 1, species: "Pullu Sazan", weight: 5.410, length: 45 }, { id: 2, species: "Sudak", weight: 3.0, length: 50 }, { id: 3, species: "Yayın", weight: 3.0, length: 60 }] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          },
          {
            id: 2, date: "23.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [{ id: 1, species: "Pullu Sazan", weight: 3.210, length: 45 }, { id: 2, species: "Sudak", weight: 2.0, length: 50 }, { id: 3, species: "Yayın", weight: 2.0, length: 60 }] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          },
          {
            id: 3, date: "24.06.2021", nets: [
              { id: 1, length: 150, depth: 6, mesh: 70, fishes: [{ id: 1, species: "Pullu Sazan", weight: 4.760, length: 45 }, { id: 2, species: "Tatlısu Kefali", weight: 2.0, length: 50 }, { id: 3, species: "Yayın", weight: 4.0, length: 60 }] },
              { id: 2, length: 100, depth: 6, mesh: 60, fishes: [] },
              { id: 3, length: 100, depth: 6, mesh: 60, fishes: [] }
            ]
          }
        ]
      }
    ]
  }
];

const StokTespit = () => {
  const [viewMode, setViewMode] = useState('archive');
  const [studies, setStudies] = useState([]);
  
  const [activeTab, setActiveTab] = useState('veri-girisi');
  const [currentStudyId, setCurrentStudyId] = useState(null);
  const [studyTitle, setStudyTitle] = useState('Yeni Stok Çalışması');
  const [lakeName, setLakeName] = useState('Bilinmeyen Göl');
  const [province, setProvince] = useState('Sinop');
  const [district, setDistrict] = useState('');
  const [institution, setInstitution] = useState('T.C.\nSİNOP VALİLİĞİ\nİl Tarım ve Orman Müdürlüğü\nBalıkçılık ve Su Ürünleri Şube Müdürlüğü');

  const [totalArea, setTotalArea] = useState(0);
  const [leasableArea, setLeasableArea] = useState(0);
  const [efficiency, setEfficiency] = useState(0.50);
  const [waterTemp, setWaterTemp] = useState('');
  const [team, setTeam] = useState('');
  const [stations, setStations] = useState([]);
  const [editingFish, setEditingFish] = useState(null);
  const [expandedStationId, setExpandedStationId] = useState(null);
  const [activeStationTab, setActiveStationTab] = useState(null);
  const [activeSurveyTab, setActiveSurveyTab] = useState(null);
  const [bulkEntryNetId, setBulkEntryNetId] = useState(null);
  const [bulkEntryText, setBulkEntryText] = useState('');
  
  const [teamInputValue, setTeamInputValue] = useState('');
  
  const handleAddTeamMember = (member) => {
    if (!member.trim()) return;
    const currentTeam = team ? team.split(',').map(s=>s.trim()).filter(Boolean) : [];
    if (!currentTeam.includes(member)) {
      setTeam([...currentTeam, member].join(', '));
    }
    setTeamInputValue('');
  };
  
  const handleRemoveTeamMember = (member) => {
    const currentTeam = team ? team.split(',').map(s=>s.trim()).filter(Boolean) : [];
    setTeam(currentTeam.filter(m => m !== member).join(', '));
  };
  
  const [expandedSurveyIds, setExpandedSurveyIds] = useState([]);

  const toggleSurveyAccordion = (svId) => {
    setExpandedSurveyIds(prev => prev.includes(svId) ? prev.filter(id => id !== svId) : [...prev, svId]);
  };

  const handleDeleteNetFromIcmal = (stationId, surveyId, netId) => {
    if (!window.confirm("Bu ağı (ve içindeki tüm balıkları) silmek istediğinize emin misiniz?")) return;
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      return {
        ...s,
        surveys: s.surveys.map(sv => {
          if (sv.id !== surveyId) return sv;
          return {
            ...sv,
            nets: sv.nets.filter(n => n.id !== netId)
          };
        })
      };
    }));
  };

  const handleDeleteFishFromIcmal = (stationId, surveyId, netId, fishId) => {
    if (!window.confirm("Bu balık kaydını silmek istediğinize emin misiniz?")) return;
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      return {
        ...s,
        surveys: s.surveys.map(sv => {
          if (sv.id !== surveyId) return sv;
          return {
            ...sv,
            nets: sv.nets.map(n => {
              if (n.id !== netId) return n;
              return {
                ...n,
                fishes: n.fishes.filter(f => f.id !== fishId)
              };
            })
          };
        })
      };
    }));
  };
  
  const [inlineEditFishId, setInlineEditFishId] = useState(null);
  const [inlineEditData, setInlineEditData] = useState({ species: '', length: '', weight: '' });

  const handleStartInlineEdit = (stationId, surveyId, netId, f) => {
    setInlineEditFishId(`${stationId}-${surveyId}-${netId}-${f.id}`);
    setInlineEditData({ species: f.species, length: f.length, weight: f.weight });
  };

  const handleSaveInlineEdit = (stationId, surveyId, netId, fishId) => {
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      return {
        ...s,
        surveys: s.surveys.map(sv => {
          if (sv.id !== surveyId) return sv;
          return {
            ...sv,
            nets: sv.nets.map(n => {
              if (n.id !== netId) return n;
              return {
                ...n,
                fishes: n.fishes.map(f => {
                  if (f.id !== fishId) return f;
                  return {
                    ...f,
                    species: inlineEditData.species,
                    length: parseFloat(inlineEditData.length) || f.length,
                    weight: parseFloat(inlineEditData.weight) || f.weight
                  };
                })
              };
            })
          };
        })
      };
    }));
    setInlineEditFishId(null);
  };
  
  const [inlineEditNetId, setInlineEditNetId] = useState(null);
  const [inlineEditNetData, setInlineEditNetData] = useState({ netNo: '', length: '', depth: '', mesh: '' });

  const handleStartNetEdit = (stationId, surveyId, net) => {
    setInlineEditNetId(`${stationId}-${surveyId}-${net.id}`);
    setInlineEditNetData({ netNo: net.netNo || net.id, length: net.length, depth: net.depth, mesh: net.mesh });
  };

  const handleSaveNetEdit = (stationId, surveyId, netId) => {
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      return {
        ...s,
        surveys: s.surveys.map(sv => {
          if (sv.id !== surveyId) return sv;
          return {
            ...sv,
            nets: sv.nets.map(n => {
              if (n.id !== netId) return n;
              return {
                ...n,
                netNo: inlineEditNetData.netNo || n.netNo,
                length: parseFloat(inlineEditNetData.length) || n.length,
                depth: parseFloat(inlineEditNetData.depth) || n.depth,
                mesh: parseFloat(inlineEditNetData.mesh) || n.mesh
              };
            })
          };
        })
      };
    }));
    setInlineEditNetId(null);
  };

  const handleAddNetToStation = (stationId, surveyId) => {
    const newNetId = `net-${Date.now()}`;
    const newNet = { id: newNetId, netNo: '', length: '', depth: '', mesh: '', fishes: [] };
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      return {
        ...s,
        surveys: s.surveys.map(sv => {
          if (sv.id !== surveyId) return sv;
          return { ...sv, nets: [...sv.nets, newNet] };
        })
      };
    }));
    handleStartNetEdit(stationId, surveyId, newNet);
  };

  const handleAddFishToNet = (stationId, surveyId, netId) => {
    const newFishId = `fish-${Date.now()}`;
    const newFish = { id: newFishId, species: '', weight: '', length: '' };
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      return {
        ...s,
        surveys: s.surveys.map(sv => {
          if (sv.id !== surveyId) return sv;
          return {
            ...sv,
            nets: sv.nets.map(n => {
              if (n.id !== netId) return n;
              return { ...n, fishes: [...n.fishes, newFish] };
            })
          };
        })
      };
    }));
    handleStartInlineEdit(stationId, surveyId, netId, newFish);
  };

  // TERMINAL STATE
  const [termContext, setTermContext] = useState({
    locked: false,
    date: new Date().toLocaleDateString('tr-TR'),
    stationNo: '1',
    coords: '',
    netNo: '1',
    netLength: '100',
    netDepth: '6',
    netMesh: '60'
  });
  const [termFish, setTermFish] = useState({ species: '', weight: '', length: '' });
  const [isListening, setIsListening] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const speciesInputRef = useRef(null);

  // Otomatik Koordinat Maskeleme
  const formatCoordinates = (val) => {
    const raw = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let formatted = '';
    
    if (raw.length > 0) formatted += raw.substring(0, 2);
    if (raw.length >= 2) formatted += '°';
    
    if (raw.length > 2) formatted += raw.substring(2, 4);
    if (raw.length >= 4) formatted += "'";
    
    if (raw.length > 4) formatted += raw.substring(4, 6);
    if (raw.length >= 6) formatted += ".";
    
    if (raw.length > 6) formatted += raw.substring(6, 7);
    if (raw.length >= 7) formatted += '"';
    
    if (raw.length > 7) formatted += raw.substring(7, 8);
    if (raw.length >= 8) formatted += ' ';
    
    if (raw.length > 8) formatted += raw.substring(8, 10);
    if (raw.length >= 10) formatted += '°';
    
    if (raw.length > 10) formatted += raw.substring(10, 12);
    if (raw.length >= 12) formatted += "'";
    
    if (raw.length > 12) formatted += raw.substring(12, 14);
    if (raw.length >= 14) formatted += ".";
    
    if (raw.length > 14) formatted += raw.substring(14, 15);
    if (raw.length >= 15) formatted += '"';
    
    if (raw.length > 15) formatted += raw.substring(15, 16);
    
    return formatted;
  };
  
  const printRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('stok_calismalari_v4');
    if (saved) {
      setStudies(JSON.parse(saved));
    } else {
      localStorage.setItem('stok_calismalari_v4', JSON.stringify(defaultStudies));
      setStudies(defaultStudies);
    }
  }, []);

  useEffect(() => {
    if (stations.length > 0 && !activeStationTab) setActiveStationTab(stations[0].id);
    else if (stations.length === 0) setActiveStationTab(null);
  }, [stations, activeStationTab]);

  useEffect(() => {
    if (activeStationTab) {
      const st = stations.find(s => s.id === activeStationTab);
      if (st && (st.surveys||[]).length > 0 && (!activeSurveyTab || !st.surveys.find(sv=>sv.id===activeSurveyTab))) {
        setActiveSurveyTab(st.surveys[0].id);
      }
      if (st && (st.surveys||[]).length === 0) setActiveSurveyTab(null);
    }
  }, [activeStationTab, stations, activeSurveyTab]);

  const saveToLocalStorage = (data) => {
    localStorage.setItem('stok_calismalari_v4', JSON.stringify(data));
    setStudies(data);
  };

  const handleCreateNew = () => {
    setCurrentStudyId(`new-${Date.now()}`);
    setStudyTitle('Yeni Stok Çalışması');
    setLakeName('');
    setProvince('Sinop');
    setDistrict('');
    setInstitution('T.C.\nSİNOP VALİLİĞİ\nİl Tarım ve Orman Müdürlüğü\nBalıkçılık ve Su Ürünleri Şube Müdürlüğü');

    setTotalArea(0);
    setLeasableArea(0);
    setEfficiency(0.50);
    setWaterTemp('');
    setTeam('');
    setStations([{ id: 1, name: '1. İstasyon', zoneArea: 0, coords: '', surveys: [] }]);
    setActiveTab('veri-girisi');
    setViewMode('editor');
  };

  const handleEdit = (study) => {
    setCurrentStudyId(study.id);
    setStudyTitle(study.title);
    setLakeName(study.lakeName);
    setProvince(study.province || 'Sinop');
    setDistrict(study.district || '');
    setInstitution(study.institution || 'T.C.\nSİNOP VALİLİĞİ\nİl Tarım ve Orman Müdürlüğü\nBalıkçılık ve Su Ürünleri Şube Müdürlüğü');

    setTotalArea(study.totalArea || 0);
    setLeasableArea(study.leasableArea || 0);
    setEfficiency(study.efficiency || 0.50);
    setWaterTemp(study.waterTemp || '');
    setTeam(study.team || '');
    setStations(study.stations || []);
    setActiveTab('veri-girisi');
    setViewMode('editor');
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu çalışmayı kalıcı olarak silmek istediğinize emin misiniz?')) {
      const updated = studies.filter(s => s.id !== id);
      saveToLocalStorage(updated);
    }
  };

  const handleSave = () => {
    const newStudy = {
      id: currentStudyId.startsWith('new-') ? `study-${Date.now()}` : currentStudyId,
      title: studyTitle,
      lakeName,
      province,
      district,
      institution,

      totalArea,
      leasableArea,
      efficiency,
      waterTemp,
      team,
      createdAt: new Date().toISOString(),
      stations
    };
    let updated = currentStudyId.startsWith('new-') ? [...studies, newStudy] : studies.map(s => s.id === currentStudyId ? newStudy : s);
    saveToLocalStorage(updated);
    setCurrentStudyId(newStudy.id);
    alert('Çalışma başarıyla kaydedildi!');
  };

  const getDynamicDateRange = (targetStations) => {
    if (!targetStations || targetStations.length === 0) return '-';
    const dates = [];
    targetStations.forEach(s => {
      (s.surveys || []).forEach(sv => {
        if (sv.date) dates.push(sv.date);
      });
    });
    if (dates.length === 0) return '-';
    
    const parsedDates = dates.map(d => {
      const parts = d.includes('-') ? d.split('-') : d.split('.');
      if (d.includes('-')) {
         return new Date(parts[0], parts[1]-1, parts[2]);
      } else {
         return new Date(parts[2], parts[1]-1, parts[0]);
      }
    }).filter(d => !isNaN(d.getTime())).sort((a, b) => a - b);

    if (parsedDates.length === 0) return '-';
    
    const formatDate = (dateObj) => {
      const d = String(dateObj.getDate()).padStart(2, '0');
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const y = dateObj.getFullYear();
      return `${d}.${m}.${y}`;
    };

    const firstStr = formatDate(parsedDates[0]);
    const lastStr = formatDate(parsedDates[parsedDates.length - 1]);
    
    return firstStr === lastStr ? firstStr : `${firstStr} - ${lastStr}`;
  };

  const getCalculatedStations = (targetStations, overrideLeasableArea) => {
    const areaToUse = overrideLeasableArea !== undefined ? overrideLeasableArea : leasableArea;
    const equalZoneArea = targetStations.length > 0 ? (parseFloat(areaToUse) || 0) / targetStations.length : 0;

    return targetStations.map(s => {
      // Calculate per survey
      const calculatedSurveys = (s.surveys || []).map(survey => {
        const enrichedNets = survey.nets.map(n => {
          const area = (parseFloat(n.length) || 0) * (parseFloat(n.depth) || 0);
          const catchTotal = n.fishes.reduce((sum, f) => sum + (parseFloat(f.weight) || 0), 0);
          return { ...n, area, catchTotal };
        });
        const totalNetArea = enrichedNets.reduce((sum, n) => sum + n.area, 0);
        const totalCatch = enrichedNets.reduce((sum, n) => sum + n.catchTotal, 0);
        const density = totalNetArea > 0 ? (totalCatch / totalNetArea) : 0;
        const estimatedStock = density * equalZoneArea;
        return { ...survey, enrichedNets, totalNetArea, totalCatch, density, estimatedStock };
      });

      // Station Average
      const totalEstimatedStockAllSurveys = calculatedSurveys.reduce((sum, surv) => sum + surv.estimatedStock, 0);
      const avgEstimatedStock = calculatedSurveys.length > 0 ? (totalEstimatedStockAllSurveys / calculatedSurveys.length) : 0;
      
      const totalNetsAcrossAllSurveys = calculatedSurveys.reduce((sum, surv) => sum + surv.enrichedNets.length, 0);

      return { ...s, calculatedSurveys, avgEstimatedStock, totalNetsAcrossAllSurveys, zoneArea: equalZoneArea };
    });
  };

  // --- EDITOR Fonksiyonları ---
  const addStation = () => {
    const newId = stations.length ? Math.max(...stations.map(s => s.id)) + 1 : 1;
    setStations([...stations, { id: newId, name: `${newId}. İstasyon`, zoneArea: 0, coords: '', surveys: [] }]);
    setExpandedStationId(newId);
  };
  const updateStation = (id, field, value) => setStations(stations.map(s => s.id === id ? { ...s, [field]: value } : s));
  const removeStation = (id) => setStations(stations.filter(s => s.id !== id));

  const addSurvey = (stationId) => {
    setStations(stations.map(s => {
      if (s.id === stationId) {
        const newSurveyId = (s.surveys || []).length ? Math.max(...s.surveys.map(sv => sv.id)) + 1 : 1;
        return { ...s, surveys: [...(s.surveys || []), { id: newSurveyId, date: '', nets: [] }] };
      }
      return s;
    }));
  };
  const updateSurvey = (stationId, surveyId, field, value) => {
    setStations(stations.map(s => {
      if (s.id === stationId) return { ...s, surveys: s.surveys.map(sv => sv.id === surveyId ? { ...sv, [field]: value } : sv) };
      return s;
    }));
  };
  const removeSurvey = (stationId, surveyId) => {
    setStations(stations.map(s => {
      if (s.id === stationId) return { ...s, surveys: s.surveys.filter(sv => sv.id !== surveyId) };
      return s;
    }));
  };

  const addNet = (stationId, surveyId) => {
    setStations(stations.map(s => {
      if (s.id === stationId) {
        return { ...s, surveys: s.surveys.map(sv => {
          if (sv.id === surveyId) {
            const newNetId = sv.nets.length ? Math.max(...sv.nets.map(n => n.id)) + 1 : 1;
            return { ...sv, nets: [...sv.nets, { id: newNetId, length: 100, depth: 6, mesh: 60, fishes: [] }] };
          }
          return sv;
        })};
      }
      return s;
    }));
  };
  const updateNet = (stationId, surveyId, netId, field, value) => {
    setStations(stations.map(s => {
      if (s.id === stationId) {
        return { ...s, surveys: s.surveys.map(sv => {
          if (sv.id === surveyId) {
            return { ...sv, nets: sv.nets.map(n => n.id === netId ? { ...n, [field]: parseFloat(value) || 0 } : n) };
          }
          return sv;
        })};
      }
      return s;
    }));
  };
  const removeNet = (stationId, surveyId, netId) => {
    setStations(stations.map(s => {
      if (s.id === stationId) {
        return { ...s, surveys: s.surveys.map(sv => {
          if (sv.id === surveyId) return { ...sv, nets: sv.nets.filter(n => n.id !== netId) };
          return sv;
        })};
      }
      return s;
    }));
  };

  const handleBulkEntry = (stationId, surveyId, netId) => {
    if (!bulkEntryText.trim()) {
      setBulkEntryNetId(null);
      return;
    }

    const lines = bulkEntryText.split('\n').filter(line => line.trim());
    const newFishes = lines.map((line, idx) => {
      const cols = line.split('\t');
      // Format: Tür | Ağırlık | Boy
      const species = cols[0] ? cols[0].trim() : 'Diğer (Tanımsız)';
      const weight = cols[1] ? cols[1].replace(',', '.').trim() : '';
      const length = cols[2] ? cols[2].replace(',', '.').trim() : '';

      return {
        id: Date.now() + idx,
        species: species,
        weight: weight,
        length: length
      };
    });

    setStations(stations.map(s => {
      if (s.id === stationId) {
        return { ...s, surveys: s.surveys.map(sv => {
          if (sv.id === surveyId) {
            return { ...sv, nets: sv.nets.map(n => {
              if (n.id === netId) {
                return { ...n, fishes: [...n.fishes, ...newFishes] };
              }
              return n;
            })};
          }
          return sv;
        })};
      }
      return s;
    }));

    setBulkEntryText('');
    setBulkEntryNetId(null);
  };

  const addFish = (stationId, surveyId, netId) => {
    let newlyCreatedFishId = null;
    setStations(stations.map(s => {
      if (s.id === stationId) {
        return { ...s, surveys: s.surveys.map(sv => {
          if (sv.id === surveyId) {
            return { ...sv, nets: sv.nets.map(n => {
              if (n.id === netId) {
                const newFishId = n.fishes.length ? Math.max(...n.fishes.map(f => f.id)) + 1 : 1;
                newlyCreatedFishId = newFishId;
                return { ...n, fishes: [...n.fishes, { id: newFishId, species: 'Sazan (Cyprinus carpio)', weight: 0, length: 0 }] };
              }
              return n;
            })};
          }
          return sv;
        })};
      }
      return s;
    }));

    setTimeout(() => {
      if (newlyCreatedFishId !== null) {
        setEditingFish(newlyCreatedFishId);
      }
    }, 0);
  };
  const updateFish = (stationId, surveyId, netId, fishId, field, value) => {
    setStations(stations.map(s => {
      if (s.id === stationId) {
        return { ...s, surveys: s.surveys.map(sv => {
          if (sv.id === surveyId) {
            return { ...sv, nets: sv.nets.map(n => {
              if (n.id === netId) return { ...n, fishes: n.fishes.map(f => f.id === fishId ? { ...f, [field]: field === 'species' ? value : (parseFloat(value) || 0) } : f) };
              return n;
            })};
          }
          return sv;
        })};
      }
      return s;
    }));
  };
  const removeFish = (stationId, surveyId, netId, fishId) => {
    setStations(stations.map(s => {
      if (s.id === stationId) {
        return { ...s, surveys: s.surveys.map(sv => {
          if (sv.id === surveyId) {
            return { ...sv, nets: sv.nets.map(n => {
              if (n.id === netId) return { ...n, fishes: n.fishes.filter(f => f.id !== fishId) };
              return n;
            })};
          }
          return sv;
        })};
      }
      return s;
    }));
  };

  const handleTerminalSave = () => {
    if (!termContext.locked) {
      alert("Lütfen önce üst bilgileri (Tarih, İstasyon vb.) kilitleyin.");
      return;
    }
    if (!termFish.species || !termFish.weight || !termFish.length) {
      return; // Do not save empty
    }

    const stName = `${termContext.stationNo}. İstasyon`;
    let currentStations = [...stations];
    
    // Find or Create Station
    let stIndex = currentStations.findIndex(s => s.name === stName);
    if (stIndex === -1) {
      currentStations.push({ id: Date.now() + Math.random(), name: stName, zoneArea: totalArea || 0, coords: termContext.coords, surveys: [] });
      stIndex = currentStations.length - 1;
    } else {
      // Update coords if they were empty
      if (!currentStations[stIndex].coords && termContext.coords) {
        currentStations[stIndex].coords = termContext.coords;
      }
    }

    // Find or Create Survey
    let svIndex = currentStations[stIndex].surveys.findIndex(sv => sv.date === termContext.date);
    if (svIndex === -1) {
      currentStations[stIndex].surveys.push({ id: Date.now() + Math.random(), date: termContext.date, nets: [] });
      svIndex = currentStations[stIndex].surveys.length - 1;
    }

    // Find or Create Net (Match specs or just create Net 1)
    let netIndex = currentStations[stIndex].surveys[svIndex].nets.findIndex(n => 
      (n.netNo && n.netNo === termContext.netNo) || (!n.netNo && n.length === termContext.netLength && n.depth === termContext.netDepth && n.mesh === termContext.netMesh)
    );
    if (netIndex === -1) {
      currentStations[stIndex].surveys[svIndex].nets.push({
        id: Date.now() + Math.random(),
        netNo: termContext.netNo,
        length: termContext.netLength,
        depth: termContext.netDepth,
        mesh: termContext.netMesh,
        fishes: []
      });
      netIndex = currentStations[stIndex].surveys[svIndex].nets.length - 1;
    }

    // Add Fish
    const newFishId = currentStations[stIndex].surveys[svIndex].nets[netIndex].fishes.length ? 
                      Math.max(...currentStations[stIndex].surveys[svIndex].nets[netIndex].fishes.map(f => f.id)) + 1 : 1;
    
    currentStations[stIndex].surveys[svIndex].nets[netIndex].fishes.push({
      id: newFishId,
      species: termFish.species,
      weight: parseFloat(termFish.weight) || 0,
      length: parseFloat(termFish.length) || 0
    });

    setStations(currentStations);
    // Reset Terminal Inputs
    setTermFish({ species: '', weight: '', length: '' });
    
    // Auto-focus species input for fast entry
    setTimeout(() => {
      if (speciesInputRef.current) {
        speciesInputRef.current.focus();
      }
    }, 10);
  };

  const handleCompleteNet = () => {
    setTermContext(prev => ({
      ...prev,
      locked: false,
      netNo: String(parseInt(prev.netNo || '1') + 1)
    }));
  };

  const handleCompleteStation = () => {
    setTermContext(prev => ({
      ...prev,
      locked: false,
      stationNo: String(parseInt(prev.stationNo || '1') + 1),
      netNo: '1',
      coords: ''
    }));
  };

  // WEB SPEECH API LOGIC
  useEffect(() => {
    let recognition = null;
    let timeoutId = null;

    if (recognitionActive && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = true; // Keep listening
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.toLowerCase();
        
        console.log("Duyulan metin: ", transcript);

        // Pattern matching: "Sazan 2 kilo 45 santim kaydet"
        // This is a simplified regex for demo. It extracts species, weight, length.
        const match = transcript.match(/(.+?)\s+([\d,.]+)\s*(kilo|kilogram|gram)\s+([\d,.]+)\s*santim\s*kaydet/i);
        
        if (match) {
          const sp = match[1].trim(); // Species might need mapping to exact dropdown value, or just keep as is
          let w = parseFloat(match[2].replace(',', '.'));
          if (match[3] === 'gram') w = w / 1000;
          const l = parseFloat(match[4].replace(',', '.'));

          // Update state and save
          setTermFish({ species: sp, weight: w, length: l });
          
          // Small delay to let state update then save
          setTimeout(() => {
             document.getElementById('btn-terminal-save')?.click();
          }, 100);
        }

        // Reset the sleep timeout
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setRecognitionActive(false); // Go to sleep after 15 secs of silence
        }, 15000);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'no-speech') {
           // do nothing, let timeout handle it
        } else {
           setRecognitionActive(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If it ended naturally but we are still active, restart it
        if (recognitionActive) {
          try { recognition.start(); } catch(e){}
        }
      };

      recognition.start();

      // Initial timeout
      timeoutId = setTimeout(() => {
        setRecognitionActive(false);
      }, 15000);

    } else {
      setIsListening(false);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      clearTimeout(timeoutId);
    };
  }, [recognitionActive]);

  const calculatedStations = getCalculatedStations(stations);
  
  const icmalByDate = useMemo(() => {
    const datesMap = {};
    
    calculatedStations.forEach(station => {
      station.calculatedSurveys.forEach(sv => {
        // TALEBİNİZ ÜZERİNE DEĞİŞTİRİLDİ: Boş ağlar gizlenmeyecek, hepsi listelenecek.
        const activeNets = sv.enrichedNets;
        if (activeNets.length === 0) return;

        if (!datesMap[sv.date]) {
          datesMap[sv.date] = {
            date: sv.date,
            stations: [],
            totalArea: 0,
            totalCatch: 0,
            totalEstimatedStock: 0
          };
        }
        
        datesMap[sv.date].stations.push({
          stationId: station.id,
          stationName: station.name,
          zoneArea: station.zoneArea,
          surveyId: sv.id,
          totalNetArea: sv.totalNetArea,
          totalCatch: sv.totalCatch,
          density: sv.density,
          estimatedStock: sv.estimatedStock,
          activeNets: activeNets
        });

        datesMap[sv.date].totalArea += sv.totalNetArea;
        datesMap[sv.date].totalCatch += sv.totalCatch;
        datesMap[sv.date].totalEstimatedStock += sv.estimatedStock;
      });
    });

    return Object.values(datesMap).sort((a, b) => {
      const partsA = a.date.split('.');
      const partsB = b.date.split('.');
      if(partsA.length === 3 && partsB.length === 3) {
         const dA = new Date(partsA[2], partsA[1]-1, partsA[0]);
         const dB = new Date(partsB[2], partsB[1]-1, partsB[0]);
         return dA - dB;
      }
      return 0;
    });
  }, [calculatedStations]);
  const globalTotalStock = calculatedStations.reduce((sum, s) => sum + s.avgEstimatedStock, 0);
  const globalTotalZoneArea = calculatedStations.reduce((sum, s) => sum + (parseFloat(s.zoneArea) || 0), 0);

  const kpiTotalNetArea = calculatedStations.reduce((sum, s) => sum + s.calculatedSurveys.reduce((sSum, sv) => sSum + sv.totalNetArea, 0), 0);
  const kpiTotalCatch = calculatedStations.reduce((sum, s) => sum + s.calculatedSurveys.reduce((sSum, sv) => sSum + sv.totalCatch, 0), 0);
  const kpiAvgDensity = kpiTotalNetArea > 0 ? (kpiTotalCatch / kpiTotalNetArea) : 0;
  
  const pTotalArea = parseFloat(totalArea) || 0;
  const pLeasableArea = parseFloat(leasableArea) || 0;
  const pEfficiency = parseFloat(efficiency) || 0;

  const areaToUse = pLeasableArea > 0 ? pLeasableArea : pTotalArea;
  const kpiKirayaEsasYillikStok = (kpiAvgDensity * areaToUse / 1000) * pEfficiency;

  return (
    <div className="stok-tespit-container">
      
      {/* -------------------- ARŞİV GÖRÜNÜMÜ -------------------- */}
      {viewMode === 'archive' && (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={32} color="#8b5cf6" /> Stok Çalışmaları Arşivi
              </h2>
              <p style={{ color: '#64748b', marginTop: '6px' }}>Kayıtlı tüm stok tespit ve analiz çalışmalarınızı yönetin.</p>
            </div>
            <button onClick={handleCreateNew} style={{ background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
              <Plus size={20} /> Yeni Çalışma Başlat
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Çalışma Adı</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Göl / Baraj</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Tarih</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>İstasyon</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Ort. Nihai Stok (Ton)</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {studies.length === 0 && (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Kayıtlı çalışma bulunmuyor.</td></tr>
                )}
                {studies.map(study => {
                  const calc = getCalculatedStations(study.stations || [], study.leasableArea);
                  const totalTon = calc.reduce((sum, s) => sum + s.avgEstimatedStock, 0) / 1000;
                  
                  return (
                    <tr key={study.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'all 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '16px 24px', fontWeight: '700', color: '#0f172a' }}>{study.title}</td>
                      <td style={{ padding: '16px 24px', color: '#475569', fontWeight: '500' }}>{study.lakeName}</td>
                      <td style={{ padding: '16px 24px', color: '#64748b' }}>{getDynamicDateRange(study.stations)}</td>
                      <td style={{ padding: '16px 24px', color: '#64748b' }}>{(study.stations||[]).length} Adet</td>
                      <td style={{ padding: '16px 24px', color: '#059669', fontWeight: '800' }}>{totalTon.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} Ton</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(study)} style={{ background: '#f1f5f9', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Görüntüle / Düzenle</button>
                          <button onClick={() => handleDelete(study.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- EDİTÖR GÖRÜNÜMÜ -------------------- */}
      {viewMode === 'editor' && (
        <>
          <div className="no-print" style={{ padding: '24px 24px 0 24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setViewMode('archive')} style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '600' }}>
                  <ArrowLeft size={16} /> Arşive Dön
                </button>
                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '4px 12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <input type="text" value={studyTitle} onChange={(e) => setStudyTitle(e.target.value)} style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', border: 'none', outline: 'none', width: '320px', background: 'transparent' }} placeholder="Çalışma Adı" />
                  <Edit2 size={16} color="#94a3b8" />
                </div>
              </div>
              <button onClick={handleSave} style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>
                <Save size={18} /> Kaydet
              </button>
            </div>

            <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '12px', gap: '4px', width: 'fit-content', marginBottom: '24px' }}>
              <button onClick={() => setActiveTab('veri-girisi')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', background: activeTab === 'veri-girisi' ? 'white' : 'transparent', color: activeTab === 'veri-girisi' ? '#0f172a' : '#64748b', boxShadow: activeTab === 'veri-girisi' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={16} /> 1. Saha Veri Girişi</button>
              <button onClick={() => setActiveTab('sonuc')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', background: activeTab === 'sonuc' ? 'white' : 'transparent', color: activeTab === 'sonuc' ? '#0f172a' : '#64748b', boxShadow: activeTab === 'sonuc' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutDashboard size={16} /> 2. İcmal (Güncel Ortalama)</button>
              <button onClick={() => setActiveTab('rapor')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', background: activeTab === 'rapor' ? 'white' : 'transparent', color: activeTab === 'rapor' ? '#1d4ed8' : '#64748b', boxShadow: activeTab === 'rapor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><Printer size={16} /> 3. A4 Rapor</button>
              <button onClick={() => setActiveTab('resmi-rapor')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', background: activeTab === 'resmi-rapor' ? 'white' : 'transparent', color: activeTab === 'resmi-rapor' ? '#1d4ed8' : '#64748b', boxShadow: activeTab === 'resmi-rapor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> 4. Resmi Rapor</button>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* TAB 1: VERİ GİRİŞİ */}
            {activeTab === 'veri-girisi' && (
              <div className="no-print" style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* KPI ZİRVE GÖSTERGELERİ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><Target size={100}/></div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={16} color="#3b82f6"/> Toplam Taranan Alan</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '12px', color: '#0f172a' }}>{kpiTotalNetArea.toLocaleString('tr-TR')} <span style={{ fontSize: '14px', color: '#64748b' }}>m²</span></div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><Activity size={100}/></div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={16} color="#059669"/> Toplam Örneklem Av</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '12px', color: '#0f172a' }}>{kpiTotalCatch.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} <span style={{ fontSize: '14px', color: '#64748b' }}>kg</span></div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><Droplets size={100}/></div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><Droplets size={16} color="#8b5cf6"/> Birim Biyokütle</div>
<div style={{ fontSize: '28px', fontWeight: '800', marginTop: '12px', color: '#0f172a' }}>{kpiAvgDensity.toLocaleString('tr-TR', { maximumFractionDigits: 6 })} <span style={{ fontSize: '14px', color: '#64748b' }}>kg/m²</span></div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '20px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}><TrendingUp size={100} color="white"/></div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} color="#34d399"/> Kiraya Esas Yıllık Stok</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '12px', color: '#34d399' }}>{kpiKirayaEsasYillikStok.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Ton (E={pEfficiency.toFixed(2)})</span></div>
                  </div>
                </div>

                {/* POS TERMINAL UI */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                  
                  {/* SAHA VE KİRALAMA PARAMETRELERİ */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ClipboardList size={20} color="#3b82f6" /> 
                      Proje Temel Bilgileri & Saha Parametreleri
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Göl / Baraj Adı</label>
                        <input type="text" value={lakeName} onChange={(e) => setLakeName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} placeholder="Örn: Boyabat Barajı" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>İl / İlçe</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select value={province} onChange={(e) => setProvince(e.target.value)} style={{ width: '50%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', backgroundColor: 'white' }}>
                            <option value="Sinop">Sinop</option>
                          </select>
                          <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '50%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', backgroundColor: 'white' }}>
                            <option value="">İlçe Seçin</option>
                            <option value="Merkez">Merkez</option>
                            <option value="Ayancık">Ayancık</option>
                            <option value="Boyabat">Boyabat</option>
                            <option value="Dikmen">Dikmen</option>
                            <option value="Durağan">Durağan</option>
                            <option value="Erfelek">Erfelek</option>
                            <option value="Gerze">Gerze</option>
                            <option value="Saraydüzü">Saraydüzü</option>
                            <option value="Türkeli">Türkeli</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Göl/Baraj Toplam Alanı (m²)</label>
                        <input type="number" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Kiralanabilir Alan (m²)</label>
                        <input type="number" value={leasableArea} onChange={(e) => setLeasableArea(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} placeholder="Varsayılan: Toplam Alan" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Avlanabilirlik (E) Katsayısı</label>
                        <input type="number" step="0.01" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Su Sıcaklığı (°C)</label>
                        <input type="text" value={waterTemp} onChange={(e) => setWaterTemp(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} placeholder="Örn: 18.5" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Görevli Personel / Çalışma Ekibi</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {(team ? team.split(',').map(s=>s.trim()).filter(Boolean) : []).map(member => (
                            <span key={member} style={{ background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {member}
                              <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTeamMember(member)} />
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            list="personnel-options"
                            value={teamInputValue}
                            onChange={(e) => setTeamInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTeamMember(teamInputValue);
                              }
                            }}
                            placeholder="Sistemden seçin veya manuel yazıp Enter'a basın..." 
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} 
                          />
                          <datalist id="personnel-options">
                            {getPersonnelByUnit('Balıkçılık ve Su Ürünleri Şube Müdürlüğü').map(p => <option key={p.name} value={p.name} />)}
                          </datalist>
                          <button 
                            type="button"
                            onClick={() => handleAddTeamMember(teamInputValue)}
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TERMINAL CONTEXT (ÜST BİLGİ ALANI) */}
                  <div style={{ background: termContext.locked ? '#f8fafc' : 'white', padding: '24px', borderRadius: '16px', border: '1px solid', borderColor: termContext.locked ? '#cbd5e1' : '#3b82f6', boxShadow: termContext.locked ? 'none' : '0 4px 12px -2px rgba(59, 130, 246, 0.2)', transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Map size={20} color={termContext.locked ? "#64748b" : "#3b82f6"} /> 
                        Terminal Bağlamı (İstasyon & Ağ Bilgileri)
                      </h3>
                      <button 
                        onClick={() => setTermContext({ ...termContext, locked: !termContext.locked })} 
                        style={{ background: termContext.locked ? '#e2e8f0' : '#10b981', color: termContext.locked ? '#475569' : 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {termContext.locked ? <><ArrowLeft size={16}/> Değiştir (Kilidi Aç)</> : <><Save size={16}/> Kilitle (Sabitle)</>}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', opacity: termContext.locked ? 0.7 : 1, pointerEvents: termContext.locked ? 'none' : 'auto' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Tarih</label>
                        <input 
                          type="date" 
                          value={termContext.date ? termContext.date.split('.').reverse().join('-') : ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const [y, m, d] = val.split('-');
                              setTermContext({...termContext, date: `${d}.${m}.${y}`});
                            } else {
                              setTermContext({...termContext, date: ''});
                            }
                          }} 
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>İstasyon No</label>
                        <input type="text" value={termContext.stationNo} onChange={(e) => setTermContext({...termContext, stationNo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Koordinat</label>
                        <input type="text" value={termContext.coords} onChange={(e) => setTermContext({...termContext, coords: formatCoordinates(e.target.value)})} placeholder='Örn: 41°19&#39;07.0"N 34°55&#39;08.5"E' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', fontFamily: 'monospace' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Ağ No</label>
                        <input type="text" value={termContext.netNo} onChange={(e) => setTermContext({...termContext, netNo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Ağ Boyu (m)</label>
                        <input type="number" value={termContext.netLength} onChange={(e) => setTermContext({...termContext, netLength: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Ağ Derinlik (m)</label>
                        <input type="number" value={termContext.netDepth} onChange={(e) => setTermContext({...termContext, netDepth: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Göz Açıklığı (mm)</label>
                        <input type="number" value={termContext.netMesh} onChange={(e) => setTermContext({...termContext, netMesh: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600' }} />
                      </div>
                    </div>
                  </div>

                  {/* TERMINAL ENTRY (TEK ATIMLIK GİRİŞ) */}
                  <div style={{ background: '#0f172a', padding: '32px', borderRadius: '16px', position: 'relative', overflow: 'hidden', opacity: termContext.locked ? 1 : 0.5, pointerEvents: termContext.locked ? 'auto' : 'none', transition: 'all 0.3s' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Target size={24} color="#34d399" />
                        Hızlı Veri Girişi
                      </h3>
                      
                      {/* VOICE COMMAND BUTTON */}
                      <button 
                        onClick={() => setRecognitionActive(!recognitionActive)}
                        style={{ 
                          background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)', 
                          color: 'white', 
                          border: isListening ? '2px solid #fca5a5' : '1px solid rgba(255,255,255,0.2)', 
                          padding: '10px 20px', 
                          borderRadius: '24px', 
                          fontWeight: '700', 
                          fontSize: '14px', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          animation: isListening ? 'pulse 1.5s infinite' : 'none'
                        }}
                      >
                        <Activity size={18} />
                        {isListening ? 'Dinleniyor... (Otomatik Kapanır)' : 'Sesli Kayıt Başlat'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>Türler</label>
                        <input 
                          type="text" 
                          ref={speciesInputRef}
                          list="fish-species-list"
                          value={termFish.species} 
                          onChange={(e) => setTermFish({...termFish, species: e.target.value})} 
                          placeholder="Balık türü seçin veya yazın..." 
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #334155', background: '#1e293b', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '700' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>Ağırlık (kg)</label>
                        <input 
                          type="number" 
                          value={termFish.weight} 
                          onChange={(e) => setTermFish({...termFish, weight: e.target.value})} 
                          onKeyDown={(e) => { if(e.key === 'Enter') document.getElementById('btn-terminal-save')?.click(); }}
                          placeholder="0.00" 
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #334155', background: '#1e293b', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '700' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>Boy (cm)</label>
                        <input 
                          type="number" 
                          value={termFish.length} 
                          onChange={(e) => setTermFish({...termFish, length: e.target.value})} 
                          onKeyDown={(e) => { if(e.key === 'Enter') document.getElementById('btn-terminal-save')?.click(); }}
                          placeholder="0" 
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #334155', background: '#1e293b', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '700' }} 
                        />
                      </div>
                      <button 
                        id="btn-terminal-save"
                        onClick={handleTerminalSave} 
                        style={{ height: '56px', padding: '0 32px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}
                      >
                        <Save size={20} /> Kaydet
                      </button>
                    </div>
                    
                    {/* HIZLI GEÇİŞ / TAMAMLAMA BUTONLARI */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                      <button onClick={handleCompleteNet} style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', hover: { background: 'rgba(255,255,255,0.2)' } }}>
                        Ağı Tamamla (Sonraki Ağa Geç)
                      </button>
                      <button onClick={handleCompleteStation} style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', hover: { background: 'rgba(255,255,255,0.2)' } }}>
                        İstasyonu Tamamla (Yeni İstasyon)
                      </button>
                    </div>



                    {/* Sequence Indicator Helper */}
                    {(() => {
                      const stName = `${termContext.stationNo}. İstasyon`;
                      const st = stations.find(s => s.name === stName);
                      let sv, net, cnt = 0;
                      if (st) sv = st.surveys.find(x => x.date === termContext.date);
                      if (sv) net = sv.nets.find(n => (n.netNo && n.netNo === termContext.netNo) || (!n.netNo && n.length === termContext.netLength && n.depth === termContext.netDepth && n.mesh === termContext.netMesh));
                      if (net) cnt = net.fishes.length;
                      
                      return (
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>
                            Sıradaki Kayıt No: <span style={{ color: '#34d399', fontWeight: '800', fontSize: '16px', marginLeft: '4px' }}>{cnt + 1}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: İCMAL */}
            {activeTab === 'sonuc' && (
              <div className="no-print" style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '24px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Ortalama Nihai Stok</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#34d399' }}>{(globalTotalStock / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} <span style={{ fontSize: '16px', color: '#cbd5e1' }}>Ton</span></div>
                  </div>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Göl Toplam Alanı</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>{totalArea.toLocaleString('tr-TR')} <span style={{ fontSize: '14px', color: '#64748b' }}>m²</span></div>
                  </div>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Aktif İstasyon</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>{stations.length} <span style={{ fontSize: '14px', color: '#64748b' }}>Adet</span></div>
                  </div>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Toplam Ağ (Tüm Günler)</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>{calculatedStations.reduce((sum, s) => sum + s.totalNetsAcrossAllSurveys, 0)} <span style={{ fontSize: '14px', color: '#64748b' }}>Adet</span></div>
                  </div>
                </div>

                {icmalByDate.length === 0 && <div style={{ color: '#64748b' }}>Görüntülenecek veri bulunmamaktadır.</div>}
                {icmalByDate.map(dayItem => (
                  <div key={`icmal-day-${dayItem.date}`} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                         Tarih: {dayItem.date} <span style={{fontWeight:'normal', fontSize:'13px', color:'#64748b'}}>(Günlük Toplam Av: {dayItem.totalCatch.toLocaleString('tr-TR', { maximumFractionDigits: 3 })} kg)</span>
                      </h3>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1d4ed8' }}>
                         Günlük Ortalama Stok: {(dayItem.totalEstimatedStock / dayItem.stations.length || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} kg
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>İstasyon</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Ağ Toplam Alanı (m²)</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Avlanan Miktar (kg)</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Birim Yoğunluk (kg/m²)</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Tahmini Stok (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayItem.stations.map(st => {
                            const uniqueAccordionKey = `${dayItem.date}-${st.stationId}-${st.surveyId}`;
                            const isExpanded = expandedSurveyIds.includes(uniqueAccordionKey);
                            return (
                            <React.Fragment key={uniqueAccordionKey}>
                              <tr 
                                onClick={() => toggleSurveyAccordion(uniqueAccordionKey)} 
                                style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', background: isExpanded ? '#f8fafc' : 'transparent', transition: 'background 0.2s' }}
                              >
                                <td style={{ padding: '12px 24px', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {isExpanded ? <ChevronUp size={16} color="#3b82f6"/> : <ChevronDown size={16} color="#94a3b8"/>}
                                  {st.stationName} <span style={{fontWeight:'normal', fontSize:'12px', color:'#64748b'}}>(Otomatik Alan: {st.zoneArea.toLocaleString('tr-TR', {maximumFractionDigits: 0})} m²)</span>
                                </td>
                                <td style={{ padding: '12px 24px', color: '#64748b' }}>{st.totalNetArea.toLocaleString('tr-TR')}</td>
                                <td style={{ padding: '12px 24px', color: '#059669', fontWeight: '600' }}>{st.totalCatch.toFixed(3)}</td>
                                <td style={{ padding: '12px 24px', color: '#64748b' }}>{st.density.toFixed(6)}</td>
                                <td style={{ padding: '12px 24px', fontWeight: '600', color: '#334155' }}>{st.estimatedStock.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan="5" style={{ padding: '0', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <div style={{ padding: '16px 24px', borderLeft: '4px solid #3b82f6' }}>
                                      <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Fish size={14} color="#3b82f6"/> Giriş Kayıtları (Ağlar ve Balıklar)
                                      </h4>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {st.activeNets.map(net => {
                                          const isEditingNet = inlineEditNetId === `${st.stationId}-${st.surveyId}-${net.id}`;
                                          return (
                                          <div key={`n-${net.id}`} style={{ background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed #e2e8f0' }}>
                                              {isEditingNet ? (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Ağ No:</span>
                                                  <input type="text" value={inlineEditNetData.netNo} onChange={e => setInlineEditNetData({...inlineEditNetData, netNo: e.target.value})} style={{ width: '50px', padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="No" />
                                                  <span style={{ fontSize: '13px', color: '#64748b' }}>(</span>
                                                  <input type="number" value={inlineEditNetData.length} onChange={e => setInlineEditNetData({...inlineEditNetData, length: e.target.value})} style={{ width: '60px', padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Uzunluk" />
                                                  <span style={{ fontSize: '13px', color: '#64748b' }}>m x</span>
                                                  <input type="number" value={inlineEditNetData.depth} onChange={e => setInlineEditNetData({...inlineEditNetData, depth: e.target.value})} style={{ width: '50px', padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Derinlik" />
                                                  <span style={{ fontSize: '13px', color: '#64748b' }}>m,</span>
                                                  <input type="number" value={inlineEditNetData.mesh} onChange={e => setInlineEditNetData({...inlineEditNetData, mesh: e.target.value})} style={{ width: '50px', padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Göz" />
                                                  <span style={{ fontSize: '13px', color: '#64748b' }}>mm)</span>
                                                </div>
                                              ) : (
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                                                  Ağ No: {net.netNo || net.id} <span style={{ fontWeight: 'normal', color: '#64748b' }}>({net.length}m x {net.depth}m, {net.mesh}mm) - Toplam Av: {net.catchTotal.toFixed(3)}kg</span>
                                                </div>
                                              )}
                                              <div style={{ display: 'flex', gap: '4px' }}>
                                                {isEditingNet ? (
                                                  <>
                                                    <button onClick={() => handleSaveNetEdit(st.stationId, st.surveyId, net.id)} style={{ background: '#10b981', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title="Kaydet"><Check size={14} /></button>
                                                    <button onClick={() => setInlineEditNetId(null)} style={{ background: '#64748b', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title="İptal"><X size={14} /></button>
                                                  </>
                                                ) : (
                                                  <>
                                                    <button onClick={() => handleStartNetEdit(st.stationId, st.surveyId, net)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Ağı Düzenle"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteNetFromIcmal(st.stationId, st.surveyId, net.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Ağı Sil"><Trash2 size={14} /></button>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              <div style={{ display: 'flex', gap: '8px', padding: '0 12px', fontSize: '11px', color: '#64748b', fontWeight: '700', marginTop: '4px', paddingBottom: '4px' }}>
                                                <div style={{ width: '20px' }}>#</div>
                                                <div style={{ width: '150px' }}>TÜR</div>
                                                <div style={{ width: '70px' }}>AĞIRLIK (kg)</div>
                                                <div style={{ width: '70px' }}>BOY (cm)</div>
                                              </div>
                                              
                                              {net.fishes.length === 0 ? (
                                                <div style={{ padding: '8px 12px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', background: '#f8fafc', borderRadius: '4px', border: '1px dashed #cbd5e1', marginTop: '4px' }}>
                                                  Bu ağa kaydedilmiş balık bulunmamaktadır. Sağ üstteki çöp kutusuna tıklayarak silebilirsiniz.
                                                </div>
                                              ) : (
                                                net.fishes.map((f, i) => {
                                                  const isEditing = inlineEditFishId === `${st.stationId}-${st.surveyId}-${net.id}-${f.id}`;
                                                  return (
                                                    <div key={`f-${f.id || i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: '1px solid #e2e8f0', minHeight: '36px' }}>
                                                      {isEditing ? (
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                                          <span style={{ fontWeight: '600', color: '#64748b', width: '20px' }}>{i + 1}.</span>
                                                          <input type="text" list="fish-species-list" value={inlineEditData.species} onChange={e => setInlineEditData({...inlineEditData, species: e.target.value})} style={{ width: '150px', padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} placeholder="Tür" />
                                                          <input type="number" step="0.001" value={inlineEditData.weight} onChange={e => setInlineEditData({...inlineEditData, weight: e.target.value})} style={{ width: '70px', padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} placeholder="Ağ.(kg)" />
                                                          <input type="number" step="0.1" value={inlineEditData.length} onChange={e => setInlineEditData({...inlineEditData, length: e.target.value})} style={{ width: '70px', padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} placeholder="Boy(cm)" />
                                                        </div>
                                                      ) : (
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                                          <span style={{ fontWeight: '600', color: '#64748b', width: '20px' }}>{i + 1}.</span>
                                                          <span style={{ fontWeight: '600', color: '#0f172a', width: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.species}</span> 
                                                          <span style={{ color: '#64748b', width: '70px' }}>{f.weight}</span>
                                                          <span style={{ color: '#64748b', width: '70px' }}>{f.length}</span>
                                                        </div>
                                                      )}
                                                      <div style={{ display: 'flex', gap: '4px' }}>
                                                        {isEditing ? (
                                                          <>
                                                            <button onClick={() => handleSaveInlineEdit(st.stationId, st.surveyId, net.id, f.id)} style={{ background: '#10b981', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title="Kaydet"><Check size={12} /></button>
                                                            <button onClick={() => setInlineEditFishId(null)} style={{ background: '#64748b', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title="İptal"><X size={12} /></button>
                                                          </>
                                                        ) : (
                                                          <>
                                                            <button onClick={() => handleStartInlineEdit(st.stationId, st.surveyId, net.id, f)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '2px' }} title="Balığı Düzenle"><Edit2 size={12} /></button>
                                                            <button onClick={() => handleDeleteFishFromIcmal(st.stationId, st.surveyId, net.id, f.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }} title="Balığı Sil"><Trash2 size={12} /></button>
                                                          </>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })
                                              )}
                                              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                                                <button onClick={() => handleAddFishToNet(st.stationId, st.surveyId, net.id)} style={{ background: '#f1f5f9', color: '#3b82f6', border: '1px dashed #cbd5e1', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                  <Plus size={12} /> Yeni Balık Ekle
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                          )
                                        })}
                                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                                          <button onClick={() => handleAddNetToStation(st.stationId, st.surveyId)} style={{ background: '#f8fafc', color: '#0f172a', border: '1px dashed #94a3b8', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Plus size={14} /> Yeni Ağ Ekle
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: RESMİ RAPOR */}
            {activeTab === 'rapor' && (
              (() => {
                const speciesBreakdown = (() => {
                  const speciesMap = {};
                  let totalCatchWeight = 0;
                  calculatedStations.forEach(s => {
                    s.calculatedSurveys.forEach(sv => {
                      sv.enrichedNets.forEach(net => {
                        net.fishes.forEach(f => {
                          const w = parseFloat(f.weight) || 0;
                          if (w > 0 && f.species) {
                            if (!speciesMap[f.species]) speciesMap[f.species] = 0;
                            speciesMap[f.species] += w;
                            totalCatchWeight += w;
                          }
                        });
                      });
                    });
                  });
                  const arr = [];
                  Object.keys(speciesMap).forEach(species => {
                    const ratio = totalCatchWeight > 0 ? (speciesMap[species] / totalCatchWeight) : 0;
                    const estimatedStock = globalTotalStock * ratio;
                    arr.push({ 
                      species, 
                      catchWeight: speciesMap[species],
                      estimatedStock, 
                      rentableStock: estimatedStock * 0.1 // E=0.10 for official DOCX alignment
                    });
                  });
                  return arr.sort((a,b) => b.estimatedStock - a.estimatedStock);
                })();

                const totalRentable = speciesBreakdown.reduce((sum, item) => sum + item.rentableStock, 0);

                return (
                  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div className="no-print" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <CheckCircle2 color="#3b82f6" />
                        <span style={{ color: '#1e3a8a', fontWeight: '600' }}>Rapor yazdırmaya hazır. Çıktı aldığınızda bu menüler gizlenecek.</span>
                      </div>
                      <button onClick={() => window.print()} style={{ background: '#2563eb', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Printer size={18} /> Yazdır
                      </button>
                    </div>

                    <div className="print-a4-page" ref={printRef} style={{ background: 'white', padding: '40px 50px', margin: '0 auto', maxWidth: '210mm', minHeight: '297mm', boxShadow: '0 0 20px rgba(0,0,0,0.1)', color: 'black' }}>
                      <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '0' }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'pre-line', textTransform: 'uppercase' }}>{institution}</p>
                        <h1 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase', lineHeight: '1.4' }}>
                          {getDynamicDateRange(stations)} <br/> {lakeName.toLocaleUpperCase('tr-TR')} STOK TESPİT ÇALIŞMASI SONUÇLARI
                        </h1>
                        <div style={{ width: '100%', height: '2px', background: 'black', margin: '10px 0 0 0' }}></div>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>1. Genel Parametreler</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid black' }}>
                          <tbody>
                            <tr><td style={{ border: '1px solid black', padding: '4px 8px', fontWeight: 'bold', width: '35%' }}>Çalışma Adı</td><td style={{ border: '1px solid black', padding: '4px 8px' }}>{studyTitle}</td></tr>
                            <tr><td style={{ border: '1px solid black', padding: '4px 8px', fontWeight: 'bold' }}>Avlak Sahası Adı</td><td style={{ border: '1px solid black', padding: '4px 8px' }}>{lakeName}</td></tr>
                            <tr><td style={{ border: '1px solid black', padding: '4px 8px', fontWeight: 'bold' }}>Genel Çalışma Tarihi</td><td style={{ border: '1px solid black', padding: '4px 8px' }}>{getDynamicDateRange(stations)}</td></tr>
                            <tr><td style={{ border: '1px solid black', padding: '4px 8px', fontWeight: 'bold' }}>Göl Toplam Alanı</td><td style={{ border: '1px solid black', padding: '4px 8px' }}>{totalArea.toLocaleString('tr-TR')} m² ({totalArea / 1000000} km²)</td></tr>
                            <tr><td style={{ border: '1px solid black', padding: '4px 8px', fontWeight: 'bold' }}>Yakalanan Türler</td><td style={{ border: '1px solid black', padding: '4px 8px' }}>{speciesBreakdown.map(s => s.species).join(', ')}</td></tr>
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>2. İstasyon ve Avcılık (Çekim) Verileri</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', textAlign: 'center' }}>
                          <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                              <th style={{ border: '1px solid black', padding: '4px' }}>İstasyon</th>
                              <th style={{ border: '1px solid black', padding: '4px' }}>Avcılık Tarihi</th>
                              <th style={{ border: '1px solid black', padding: '4px' }}>Ağ Sayısı</th>
                              <th style={{ border: '1px solid black', padding: '4px' }}>Ağ Toplam Alanı (m²)</th>
                              <th style={{ border: '1px solid black', padding: '4px' }}>Avlanan Miktar (kg)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {calculatedStations.map(s => 
                              s.calculatedSurveys.map((sv, svIdx) => (
                                <tr key={`rapor-sv-${s.id}-${sv.id}`}>
                                  {svIdx === 0 && <td rowSpan={s.calculatedSurveys.length} style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>{s.name} <br/><span style={{fontWeight:'normal', fontSize:'8px'}}>{s.coords}</span></td>}
                                  <td style={{ border: '1px solid black', padding: '4px' }}>{sv.date || '-'}</td>
                                  <td style={{ border: '1px solid black', padding: '4px' }}>{sv.enrichedNets.length}</td>
                                  <td style={{ border: '1px solid black', padding: '4px' }}>{sv.totalNetArea} m²</td>
                                  <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>{sv.totalCatch.toFixed(3)} kg</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>3. Türlere Göre Dağılım ve Avlanabilir Stok Miktarı</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
                          <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                              <th style={{ border: '1px solid black', padding: '6px' }}>Su Ürünleri Türü</th>
                              <th style={{ border: '1px solid black', padding: '6px' }}>Avlanabilir Stok Miktarı (kg/yıl)*</th>
                            </tr>
                          </thead>
                          <tbody>
                            {speciesBreakdown.map(sb => (
                              <tr key={`sb-${sb.species}`}>
                                <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>{sb.species}</td>
                                <td style={{ border: '1px solid black', padding: '4px' }}>{sb.rentableStock.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
                              </tr>
                            ))}
                            <tr style={{ background: '#e0e0e0', fontWeight: 'bold' }}>
                              <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>TOPLAM:</td>
                              <td style={{ border: '1px solid black', padding: '6px' }}>{totalRentable.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{ fontSize: '9px', marginTop: '6px', color: '#555' }}>* Avlanabilir stok miktarı, sürdürülebilir avcılık katsayısı E=0.10 kullanılarak hesaplanmıştır.</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', marginTop: '30px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <div><p style={{ fontWeight: 'bold', margin: '0 0 24px 0', fontSize: '12px' }}>Komisyon Üyesi</p><p style={{ margin: 0, fontSize: '12px' }}>.....................................</p><p style={{ margin: 0, fontSize: '11px' }}>Su Ürünleri Mühendisi</p></div>
                        <div><p style={{ fontWeight: 'bold', margin: '0 0 24px 0', fontSize: '12px' }}>Komisyon Üyesi</p><p style={{ margin: 0, fontSize: '12px' }}>.....................................</p><p style={{ margin: 0, fontSize: '11px' }}>Su Ürünleri Mühendisi</p></div>
                        <div><p style={{ fontWeight: 'bold', margin: '0 0 24px 0', fontSize: '12px' }}>Komisyon Başkanı</p><p style={{ margin: 0, fontSize: '12px' }}>.....................................</p><p style={{ margin: 0, fontSize: '11px' }}>Şube Müdürü</p></div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* TAB 4: RESMİ RAPOR (WORD FORMATI) */}
            {activeTab === 'resmi-rapor' && (
              (() => {
                const speciesBreakdown = (() => {
                  const speciesMap = {};
                  let totalCatchWeight = 0;
                  calculatedStations.forEach(s => {
                    s.calculatedSurveys.forEach(sv => {
                      sv.enrichedNets.forEach(net => {
                        net.fishes.forEach(f => {
                          const w = parseFloat(f.weight) || 0;
                          if (w > 0 && f.species) {
                            if (!speciesMap[f.species]) speciesMap[f.species] = 0;
                            speciesMap[f.species] += w;
                            totalCatchWeight += w;
                          }
                        });
                      });
                    });
                  });
                  const arr = [];
                  Object.keys(speciesMap).forEach(species => {
                    const ratio = totalCatchWeight > 0 ? (speciesMap[species] / totalCatchWeight) : 0;
                    const estimatedStock = globalTotalStock * ratio;
                    arr.push({ 
                      species, 
                      catchWeight: speciesMap[species],
                      estimatedStock, 
                      rentableStock: estimatedStock * 0.1
                    });
                  });
                  return arr.sort((a,b) => b.estimatedStock - a.estimatedStock);
                })();

                const totalRentable = speciesBreakdown.reduce((sum, item) => sum + item.rentableStock, 0);

                return (
                  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div className="no-print" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <CheckCircle2 color="#3b82f6" />
                        <span style={{ color: '#1e3a8a', fontWeight: '600' }}>Resmi rapor yazdırmaya hazır. Çıktı aldığınızda bu menüler gizlenecek.</span>
                      </div>
                      <button onClick={() => window.print()} style={{ background: '#2563eb', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Printer size={18} /> Yazdır
                      </button>
                    </div>

                    <div className="print-a4-page" ref={printRef} style={{ background: 'white', padding: '60px 80px', margin: '0 auto', maxWidth: '210mm', minHeight: '297mm', boxShadow: '0 0 20px rgba(0,0,0,0.1)', color: 'black', fontFamily: '"Times New Roman", Times, serif', fontSize: '14.5px', lineHeight: '1.5' }}>
                      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase', lineHeight: '1.4' }}>
                          {`${province || '.......'} İLİ ${district || '.......'} İLÇESİ ${studyTitle || '................'}`.toLocaleUpperCase('tr-TR')}
                        </h1>
                      </div>
                      
                      <div style={{ marginBottom: '20px', textAlign: 'justify' }}>
                        <h3 style={{ fontSize: '14.5px', fontWeight: 'bold', margin: '0 0 10px 0' }}>1. BARAJ GÖLÜNÜN YERİ VE ÖZELLİKLERİ</h3>
                        <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                          {province || '.......'} ili {district || '.......'} ilçesi sınırları içerisinde bulunan {lakeName || '................'}, su ürünleri potansiyelinin değerlendirilmesi amacıyla incelenmiştir. {(parseFloat(totalArea) / 10000 || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ha alana sahip olan bölgede gerekli stok tespiti işlemleri gerçekleştirilmiştir.
                        </p>
                      </div>

                      <div style={{ marginBottom: '20px', textAlign: 'justify' }}>
                        <h3 style={{ fontSize: '14.5px', fontWeight: 'bold', margin: '0 0 10px 0' }}>2. ETÜT ÇALIŞMALARI</h3>
                        <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                          Baraj göl alanındaki etüt çalışmaları ve araştırmalar sonucunda aşağıdaki balık türleri tespit edilmiştir:
                        </p>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '50px', margin: '0' }}>
                          {speciesBreakdown.map((sb, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{sb.species}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ marginBottom: '20px', textAlign: 'justify' }}>
                        <h3 style={{ fontSize: '14.5px', fontWeight: 'bold', margin: '0 0 10px 0' }}>3. AVLANABİLİR STOK TESPİTİ ÇALIŞMALARI</h3>
                        <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                          Stok tespiti çalışmaları rezervuarda bulunan balık populasyonlarının cins ve miktarlarının tespiti ile işletilmesi sırasında verimin en yüksek düzeyde tutulması için uyulması gereken av teknik şartlarının belirlenmesini amaçlamaktadır.
                        </p>
                        
                        <h4 style={{ fontSize: '14.5px', fontWeight: 'bold', margin: '15px 0 10px 20px' }}>3.1 Materyal ve Metot</h4>
                        <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                          Avlanabilir stok miktarının göl alanının farklı derinlikleri de dikkate alınarak belirlenmesi amacıyla istasyonlar belirlenerek örnekleme çalışmaları yapılmıştır. "Av Yoğunluğu" yöntemi kullanılarak çeşitli göz açıklıklı fanyalı ve fanyasız ağlarla çalışılmıştır. Ağlardan çıkan balıkların biyometrileri ağ gözlerine göre ayrı ayrı yapılmıştır. Avlanan balık örneklerinin toplam boyları milimetrik ölçüm tahtası ile ağırlıkları ise 2 g duyarlığa sahip terazi ile ölçülmüştür.
                        </p>

                        <h4 style={{ fontSize: '14.5px', fontWeight: 'bold', margin: '15px 0 10px 20px' }}>3.2 Değerlendirme Çalışmaları</h4>
                        <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                          Baraj Gölü'nün işletilmesi sırasında balık türlerine göre kullanılacak minimum ağ göz açıklıkları DSİ 7. Bölge Müdürlüğünce hazırlanan kira teknik şartnamesinde belirtilmiştir.
                        </p>
                        <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                          <strong>{lakeName || '................'} Avlak Bölgesi (Sinop);</strong> {getDynamicDateRange(stations)} tarihlerini kapsamaktadır. Bölgenin Rezervuar alanı {(parseFloat(totalArea) / 10000 || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} hektardır.
                        </p>
                      </div>

                      <div style={{ pageBreakBefore: 'always', textAlign: 'justify', marginBottom: '20px' }}>
                        <p style={{ margin: '0 0 20px 0', textIndent: '30px' }}>
                          Tarafımızdan yapılmış olan stok tespiti ve istihsal kontrolü çalışmalarının değerlendirilmesi sonucu tahmin edilen avlanabilir su ürünleri tür ve miktarları aşağıdaki tabloda verilmiştir.
                        </p>

                        <table style={{ width: '80%', margin: '0 auto 20px auto', borderCollapse: 'collapse', fontSize: '14.5px', textAlign: 'center', border: '1px solid black' }}>
                          <thead>
                            <tr>
                              <th style={{ border: '1px solid black', padding: '8px' }}>Su Ürünleri Türü</th>
                              <th style={{ border: '1px solid black', padding: '8px' }}>Avlanabilir Stok Miktarı (kg/yıl)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {speciesBreakdown.map(sb => (
                              <tr key={`resmi-sb-${sb.species}`}>
                                <td style={{ border: '1px solid black', padding: '6px' }}>{sb.species}</td>
                                <td style={{ border: '1px solid black', padding: '6px' }}>{sb.rentableStock.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
                              </tr>
                            ))}
                            <tr style={{ fontWeight: 'bold' }}>
                              <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>TOPLAM:</td>
                              <td style={{ border: '1px solid black', padding: '6px' }}>{totalRentable.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginBottom: '40px', textAlign: 'justify' }}>
                        <h3 style={{ fontSize: '14.5px', fontWeight: 'bold', margin: '0 0 10px 0' }}>4. SONUÇ</h3>
                        <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                          Yapılan çalışmalar sonucu {lakeName || '................'} Avlak Bölgesinin (Sinop) tahmin edilen <strong>{totalRentable.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} Kg/yıl</strong> stok tespit edilmiştir.
                        </p>
                        <p style={{ margin: '0 0 10px 0', textIndent: '30px' }}>
                          İşbu tespit çalışması mahallinde yapılan çalışmalar sonucu hazırlanarak imza altına alınmıştır.<br/>
                          {new Date().toLocaleDateString('tr-TR')}
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${team && team.length > 0 ? team.length : 3}, 1fr)`, textAlign: 'center', marginTop: '50px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        {team && team.length > 0 ? (
                          team.map((t, idx) => (
                            <div key={idx}>
                              <p style={{ margin: '0 0 50px 0', fontSize: '14.5px' }}>{t.name}</p>
                              <p style={{ margin: 0, fontSize: '14.5px' }}>{t.title || 'Su Ürünleri Mühendisi'}</p>
                            </div>
                          ))
                        ) : (
                          <>
                            <div><p style={{ margin: '0 0 50px 0', fontSize: '14.5px' }}>.....................................</p><p style={{ margin: 0, fontSize: '14.5px' }}>Su Ürünleri Mühendisi</p></div>
                            <div><p style={{ margin: '0 0 50px 0', fontSize: '14.5px' }}>.....................................</p><p style={{ margin: 0, fontSize: '14.5px' }}>Su Ürünleri Mühendisi</p></div>
                            <div><p style={{ margin: '0 0 50px 0', fontSize: '14.5px' }}>.....................................</p><p style={{ margin: 0, fontSize: '14.5px' }}>Şube Müdürü</p></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </>
      )}

      <datalist id="fish-species-list">
        <option value="Alabalık (Salmo trutta)" />
        <option value="Bıyıklı Balık (Barbus spp.)" />
        <option value="Çapak (Abramis brama)" />
        <option value="Çizgili Sazan (Alburnoides bipunctatus)" />
        <option value="Eğrez (Vimba vimba)" />
        <option value="Gökkuşağı Alabalığı (Oncorhynchus mykiss)" />
        <option value="Göl Alası (Salmo trutta lacustris)" />
        <option value="Gümüş Balığı (Atherina boyeri)" />
        <option value="Gümüş Sazan (Hypophthalmichthys molitrix)" />
        <option value="Havuz Balığı (Carassius gibelio)" />
        <option value="İnci Kefali (Alburnus tarichi)" />
        <option value="İncir Balığı (Chondrostoma regium)" />
        <option value="Kadife Balığı (Tinca tinca)" />
        <option value="Karabalık (Clarias gariepinus)" />
        <option value="Karaburun (Vimba vimba)" />
        <option value="Kaya Balığı (Gobius spp.)" />
        <option value="Kızılgöz (Rutilus rutilus)" />
        <option value="Kızılkanat (Scardinius erythrophthalmus)" />
        <option value="Ot Sazanı (Ctenopharyngodon idella)" />
        <option value="Sazan (Cyprinus carpio)" />
        <option value="Şabut (Barbus grypus)" />
        <option value="Şiraz (Capoeta spp.)" />
        <option value="Sudak (Sander lucioperca)" />
        <option value="Taşkın Balığı (Cobitis taenia)" />
        <option value="Tatlısu Kefali (Squalius cephalus)" />
        <option value="Tatlısu Levreği (Perca fluviatilis)" />
        <option value="Turna (Esox lucius)" />
        <option value="Yayın (Silurus glanis)" />
        <option value="Yılan Balığı (Anguilla anguilla)" />
        <option value="Diğer (Tanımsız)" />
      </datalist>

    </div>
  );
};

export default StokTespit;
