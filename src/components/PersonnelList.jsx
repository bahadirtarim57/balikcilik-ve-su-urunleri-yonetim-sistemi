import { sortPersonnelByHierarchy } from '../utils/hierarchy';
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Edit2, Trash2, Search, ArrowRightLeft, X, Save, PlusCircle, Filter, Download, Upload, Mail, Send, Key, CheckCircle2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { uploadLocalToSupabase } from '../lib/storage'
import { PERSONELLER, EXCEL_PROVINCE, getBranches } from '../utils/excelData'
import * as XLSX from 'xlsx'
import { DISTRICTS } from '../utils/turkeyData'
import { useAuth } from '../context/AuthContext'
import { generatePassword, hashPassword, isEmailTaken, savePersonnelEmail, savePersonnelPassword, sendPasswordEmail, isEmailJSConfigured } from '../utils/emailService'

export default function PersonnelList({ selectedProvince, selectedUnit, selectedUnitType, selectedDistrict, currentRole }) {

  const getDisplayTitle = (title) => {
    if (!title) return 'Personel';
    const t = title.toLowerCase();
    if (t.includes('müdür') || t.includes('koordinatör') || t.includes('yönetici') || t.includes('sorumlu') || t.includes('başkan')) {
      return title;
    }
    return 'Personel';
  };

  // Telefon numarasını "0 XXX XXX XX XX" formatına çevirir
  const formatPhone = (phone) => {
    if (!phone) return '';
    const digits = phone.toString().replace(/\D/g, '');
    if (digits.length === 10) {
      return `0 ${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,8)} ${digits.slice(8,10)}`;
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      return `0 ${digits.slice(1,4)} ${digits.slice(4,7)} ${digits.slice(7,9)} ${digits.slice(9,11)}`;
    }
    if (digits.length === 12 && digits.startsWith('90')) {
      return `0 ${digits.slice(2,5)} ${digits.slice(5,8)} ${digits.slice(8,10)} ${digits.slice(10,12)}`;
    }
    return phone;
  };
  const { user, sendImpersonationEmail, hasRole } = useAuth()
  const location = useLocation()

  const isManagerRole = currentRole && currentRole !== 'Personel';
  const canDelete = isManagerRole && currentRole !== 'Birim Sorumlusu';
  const [showFilters, setShowFilters] = useState(false)
  const [dynamicBranches, setDynamicBranches] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUnit, setFilterUnit] = useState('')
  const [quickUnit, setQuickUnit] = useState('')
  const [historyData, setHistoryData] = useState({})
  const [editedData, setEditedData] = useState({})
  const [branchData, setBranchData] = useState({})
  const [modulePermissions, setModulePermissions] = useState({})
  
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthlyCheckboxes, setMonthlyCheckboxes] = useState({});
  const [leaves, setLeaves] = useState([]);

  const [transferModal, setTransferModal] = useState({ isOpen: false, personnel: null, newUnit: '', ayrilisTarihi: '', baslangicTarihi: '' })
  const [profileModal, setProfileModal] = useState({ isOpen: false, personnel: null, tasks: [], isLoading: false, stats: {} })
  const [pendingChanges, setPendingChanges] = useState([])

  const [editModal, setEditModal] = useState({ 
    isOpen: false, originalName: '', historyIndex: -1, 
    name: '', title: '', profession: '', brans: '', contact: '', kontrolGorevNo: '', phone: '', email: '',
    baslangic: '', ayrilis: '',
    reportsTo: '', yillikIzin: '', yillikIzinGecmis: '', gorevMahalli: '', gorevKonulari: '',
    h_tazminat: false, h_kontrol: false, h_arazi: false, h_diger1: false, h_diger2: false, h_soforluk: false
  })
  const [personnelEmailData, setPersonnelEmailData] = useState({})
  const [sendingPassword, setSendingPassword] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)

  useEffect(() => {
    const hData = localStorage.getItem('personnelHistoryData')
    if (hData) {
      try { setHistoryData(JSON.parse(hData)) } catch (e) {}
    }
    const eData = localStorage.getItem('editedPersonnelData')
    if (eData) {
      try { 
        const parsed = JSON.parse(eData)
        if (parsed['Bahadır ŞENOĞLU'] && parsed['Bahadır ŞENOĞLU'].isDeleted) {
          delete parsed['Bahadır ŞENOĞLU'].isDeleted;
          localStorage.setItem('editedPersonnelData', JSON.stringify(parsed));
        }
        setEditedData(parsed) 
      } catch (e) {}
    }
    const bData = localStorage.getItem('branchPersonnelData')
    if (bData) {
      try { setBranchData(JSON.parse(bData)) } catch (e) {}
    }
    const mData = localStorage.getItem('modulePermissionsData')
    if (mData) {
      try { setModulePermissions(JSON.parse(mData)) } catch (e) {}
    }
    const pChanges = localStorage.getItem('pendingPersonnelChanges')
    if (pChanges) {
      try { setPendingChanges(JSON.parse(pChanges)) } catch (e) {}
    }
    const eMailData = localStorage.getItem('personnelEmailData')
    if (eMailData) {
      try { setPersonnelEmailData(JSON.parse(eMailData)) } catch (e) {}
    }

    const mDataStr = localStorage.getItem('monthlyCheckboxesData')
    if (mDataStr) {
      try { setMonthlyCheckboxes(JSON.parse(mDataStr)) } catch(e){}
    }


    // Mevcut telefon verilerini formatla (tek seferlik)
    const phoneFormatted = localStorage.getItem('phoneFormatted_v1');
    if (!phoneFormatted) {
      const ed = JSON.parse(localStorage.getItem('editedPersonnelData') || '{}');
      let changed = false;
      for (const [name, data] of Object.entries(ed)) {
        if (data.phone) {
          const digits = data.phone.toString().replace(/\D/g, '');
          let formatted = data.phone;
          if (digits.length === 10) formatted = `0 ${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,8)} ${digits.slice(8,10)}`;
          else if (digits.length === 11 && digits.startsWith('0')) formatted = `0 ${digits.slice(1,4)} ${digits.slice(4,7)} ${digits.slice(7,9)} ${digits.slice(9,11)}`;
          else if (digits.length === 12 && digits.startsWith('90')) formatted = `0 ${digits.slice(2,5)} ${digits.slice(5,8)} ${digits.slice(8,10)} ${digits.slice(10,12)}`;
          if (formatted !== data.phone) { ed[name].phone = formatted; changed = true; }
        }
      }
      if (changed) {
        setEditedData(ed);
        localStorage.setItem('editedPersonnelData', JSON.stringify(ed));
      }
      localStorage.setItem('phoneFormatted_v1', 'true');
    }
  }, [])

  const saveHistoryData = (newData) => {
    setHistoryData(newData)
    localStorage.setItem('personnelHistoryData', JSON.stringify(newData))
  }

  const addPendingChange = async (type, payload, alertMsg) => {
    if (user?.role === 'Birim Sorumlusu') {
      const newChange = {
        id: Date.now().toString(),
        type,
        payload,
        requestedBy: user.name,
        timestamp: new Date().toISOString()
      };
      const updated = [...pendingChanges, newChange];
      setPendingChanges(updated);
      localStorage.setItem('pendingPersonnelChanges', JSON.stringify(updated));
      await uploadLocalToSupabase();
      return true;
    }
    return false;
  };

  const checkDateOverlap = (historyArray, activeIndex, newBaslangic, newAyrilis) => {
    const parse = d => d ? new Date(d).getTime() : null;
    const start1 = parse(newBaslangic);
    const end1 = parse(newAyrilis) || Infinity;
    
    if (start1 && end1 && start1 > end1) return true;

    return historyArray.some((h, idx) => {
      if (idx === activeIndex) return false;
      const start2 = parse(h.baslangic);
      if (!start2) return false;
      const end2 = parse(h.ayrilis) || Infinity;
      if (start1 && start1 <= end2 && end1 >= start2) return true;
      return false;
    });
  }

  const handleInlineBransChange = async (personOriginalName, value) => {
    if (await addPendingChange('INLINE_EDIT', { originalName: personOriginalName, field: 'brans', value }, "Branş değişikliği onay için Genel Koordinatör'e iletildi.")) return;

    const newData = { ...editedData };
    if (!newData[personOriginalName]) {
      const base = PERSONELLER.find(x => x.name === personOriginalName) || {};
      newData[personOriginalName] = { ...base };
    }
    newData[personOriginalName].brans = value;
    
    setEditedData(newData);
    localStorage.setItem('editedPersonnelData', JSON.stringify(newData));
    await uploadLocalToSupabase();
  };

  const handleDateChange = async (personOriginalName, historyIndex, defaultUnit, field, value) => {
    const data = { ...historyData }
    if (!data[personOriginalName] || data[personOriginalName].length === 0) {
      data[personOriginalName] = [{ unit: defaultUnit, baslangic: '', ayrilis: '' }]
    }
    const history = data[personOriginalName]
    const activeIndex = historyIndex === -1 ? 0 : historyIndex;
    
    if (await addPendingChange('DATE_CHANGE', { personOriginalName, historyIndex: activeIndex, defaultUnit, field, value }, "Tarih değişikliği onay için Genel Koordinatör'e iletildi.")) return;

    const oldVal = history[activeIndex][field];
    history[activeIndex][field] = value;
    
    if (checkDateOverlap(history, activeIndex, history[activeIndex].baslangic, history[activeIndex].ayrilis)) {
      if (!window.confirm("İKAZ: Personelin bu tarihleri kendi diğer görevleriyle çakışıyor veya başlangıç bitişten büyük!\n\nYine de bu şekilde kaydetmek istediğinize emin misiniz?")) {
        history[activeIndex][field] = oldVal;
        return;
      }
    }

    saveHistoryData(data)
  }

  const getFilteredPersonnel = () => {
    if (!selectedProvince) return [];

    let list = [];
    const baseNames = new Set(PERSONELLER.map(p => p.name));
    
    const processPerson = (pName, baseObj, defaultProvince) => {
      const edits = editedData[pName] || {};
      const personProvince = edits.province || defaultProvince || EXCEL_PROVINCE;
      
      if (personProvince.toLowerCase() !== selectedProvince.toLowerCase()) return;

      const history = historyData[pName];
      if (history && history.length > 0) {
        history.forEach((h, idx) => {
          list.push({
            ...baseObj,
            ...edits,
            originalName: pName,
            activeUnit: h.unit,
            baslangic: h.baslangic,
            ayrilis: h.ayrilis,
            historyIndex: idx,
            province: personProvince
          });
        });
      } else {
        list.push({
          ...baseObj,
          ...edits,
          originalName: pName,
          activeUnit: edits.unit || baseObj.unit || '',
          baslangic: '',
          ayrilis: '',
          historyIndex: -1,
          province: personProvince
        });
      }
    };

    PERSONELLER.forEach(p => processPerson(p.name, p, EXCEL_PROVINCE));
    [...Object.keys(editedData), ...Object.keys(historyData)].forEach(name => {
      if (!baseNames.has(name) && !list.find(x => x.originalName === name)) {
        processPerson(name, { name, unit: '', title: '', profession: '', phone: '', contact: '' }, editedData[name]?.province || EXCEL_PROVINCE);
      }
    });

    if (searchTerm) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.activeUnit.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterUnit) {
      list = list.filter(p => p.activeUnit === filterUnit);
    }
    return list;
  }

  const filteredPersonnel = sortPersonnelByHierarchy(getFilteredPersonnel());
  const uniquePersonnelCount = [...new Set(filteredPersonnel.map(p => p.originalName))].length;

  const openTransferModal = (p) => {
    setTransferModal({
      isOpen: true,
      personnel: p,
      newUnit: '',
      ayrilisTarihi: new Date().toISOString().split('T')[0],
      baslangicTarihi: new Date().toISOString().split('T')[0]
    })
  }

  const openProfileModal = async (p) => {
    setProfileModal({ isOpen: true, personnel: p, tasks: [], isLoading: true, stats: {} });
    const { data } = await supabase.from('tasks').select('*');
    if (data) {
      const pTasks = data.filter(t => {
        const pList = Array.isArray(t.personeller) ? t.personeller : (t.personeller || '').split(',').map(x=>x.trim()).filter(Boolean);
        return pList.includes(p.originalName);
      });
      
      let totalKm = 0;
      pTasks.forEach(t => {
        if (t.km) totalKm += Number(t.km) || 0;
      });

      // Basit bir tahmini hakediş hesaplaması (Günlük 250 TL varsayalım)
      const estimatedHakedis = pTasks.length * 250;

      setProfileModal({
        isOpen: true,
        personnel: p,
        tasks: pTasks,
        isLoading: false,
        stats: { taskCount: pTasks.length, totalKm, estimatedHakedis }
      });
    } else {
      setProfileModal(prev => ({ ...prev, isLoading: false }));
    }
  }


  const handleLeaveChangeInline = (personName, field, newValStr, displayedVal) => {
    const newVal = parseInt(newValStr);
    if (isNaN(newVal)) {
      if (newValStr === '') {
        const bData = { ...branchData };
        if (!bData[personName]) bData[personName] = {};
        bData[personName][field] = '';
        setBranchData(bData);
      }
      return;
    }
    const delta = newVal - displayedVal;
    
    setBranchData(prev => {
      const person = prev[personName] || {};
      const currentBase = parseInt(person[field]) || 0;
      const newBase = currentBase + delta;
      const newState = {
        ...prev,
        [personName]: {
          ...person,
          [field]: newBase.toString()
        }
      };
      return newState;
    });
  };

  const handleCheckboxChange = (personName, field) => {
    const monthKey = `${selectedYear}-${selectedMonth}`;
    setMonthlyCheckboxes(prev => {
      const monthData = prev[monthKey] || {};
      const person = monthData[personName] || {};
      const currentValue = person[field];
      const newState = {
        ...prev,
        [monthKey]: {
          ...monthData,
          [personName]: {
            ...person,
            [field]: currentValue === 'X' ? '' : 'X'
          }
        }
      };
      return newState;
    });
  };

  const handleCopyFromPreviousMonth = () => {
    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevKey = `${prevYear}-${prevMonth}`;
    const currKey = `${selectedYear}-${selectedMonth}`;
    
    setMonthlyCheckboxes(prev => {
      const prevData = prev[prevKey] || {};
      const newState = {
        ...prev,
        [currKey]: JSON.parse(JSON.stringify(prevData))
      };
      return newState;
    });
    alert('Geçen ayın çarpıları başarıyla kopyalandı!');
  };

  const handleInlineSave = async () => {
    localStorage.setItem('monthlyCheckboxesData', JSON.stringify(monthlyCheckboxes));
    localStorage.setItem('branchPersonnelData', JSON.stringify(branchData));
    await uploadLocalToSupabase();
  };

  const toggleModulePermission = (originalName, moduleKey) => {
    const updated = { ...modulePermissions };
    if (!updated[originalName]) updated[originalName] = {};
    updated[originalName][moduleKey] = !updated[originalName][moduleKey];
    setModulePermissions(updated);
    localStorage.setItem('modulePermissionsData', JSON.stringify(updated));
  };

  const renderCheckbox = (isChecked) => {
    if (isChecked) {
      return <div style={{ width: '18px', height: '18px', border: '1px solid #333', background: '#fff', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', fontWeight: '900', fontSize: '14px', userSelect: 'none', lineHeight: '1', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>X</div>;
    }
    return <div style={{ width: '18px', height: '18px', border: '1px solid #cbd5e1', background: '#f8fafc', margin: '0 auto', userSelect: 'none', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}></div>;
  };

  const handleExportExcelBranch = () => {
    const exportData = finalPersonnel.map(p => {
      const data = branchData[p.originalName] || {};
      const emailD = personnelEmailData[p.originalName] || {};
      return {
        'Adı Soyadı': p.name,
        'Görevi': p.title || '',
        'Ünvanı': p.profession || '',
        'Bölümü / Branşı': p.brans || '',
        'Sicil No': p.contact || '',
        'Kontrol Görev No': p.kontrolGorevNo || '',
        'Telefon': formatPhone(p.phone) || '',
        'E-Posta': emailD.email || '',
        'Görev Başlama': p.baslangic || '',
        'Görevden Ayrılış': p.ayrilis || ''
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Birim Personelleri");
    XLSX.writeFile(wb, `birim_personelleri_${selectedYear}_${selectedMonth}.xlsx`);
  };

  const openEditModal = (p) => {
    const bD = branchData[p.originalName] || {};
    const emailD = personnelEmailData[p.originalName] || {};
    setEditModal({
      isOpen: true,
      originalName: p.originalName,
      historyIndex: p.historyIndex,
      name: p.name,
      title: p.title || '',
      profession: p.profession || '',
      brans: p.brans || '',
      unit: p.activeUnit || '',
      contact: p.contact || '',
      kontrolGorevNo: p.kontrolGorevNo || '',
      phone: p.phone || '',
      email: emailD.email || '',
      baslangic: p.baslangic || '',
      ayrilis: p.ayrilis || '',
      yillikIzin: bD.yillikIzin || '',
      yillikIzinGecmis: bD.yillikIzinGecmis || '',
      gorevMahalli: bD.gorevMahalli !== undefined ? bD.gorevMahalli : '8 İlçe ve Merkez dahil köyler',
      gorevKonulari: bD.gorevKonulari !== undefined ? bD.gorevKonulari : '5996 S. Kanun kapsamında Gıda Denetimi',
      h_tazminat: bD.h_tazminat === 'X',
      h_kontrol: bD.h_kontrol === 'X',
      h_arazi: bD.h_arazi === 'X',
      h_diger1: bD.h_diger1 === 'X',
      h_diger2: bD.h_diger2 === 'X',
      h_soforluk: bD.h_soforluk === 'X'
    })
  }

  const handleEditSubmit = async () => {
    const { originalName, historyIndex, name, title, profession, contact, kontrolGorevNo, phone, baslangic, ayrilis, isNew, unit } = editModal;
    if (!name.trim()) {
      alert('Personel adı boş bırakılamaz.');
      return;
    }
    if (isNew && !unit) {
      alert('Lütfen personelin bağlı olduğu birimi seçiniz.');
      return;
    }

    // E-posta benzersizlik kontrolü
    if (editModal.email) {
      const takenBy = isEmailTaken(editModal.email, isNew ? null : originalName);
      if (takenBy) {
        alert(`Bu e-posta adresi zaten "${takenBy}" isimli personele kayıtlı. Her personelin benzersiz bir e-posta adresi olmalıdır.`);
        return;
      }
    }

    const actualOriginalName = isNew ? name : originalName;

    // 1. Check Date Overlap
    const hData = { ...historyData };
    if (!hData[actualOriginalName] || hData[actualOriginalName].length === 0) {
      hData[actualOriginalName] = [{ unit: unit || PERSONELLER.find(x => x.name === actualOriginalName)?.unit, baslangic: baslangic || '', ayrilis: ayrilis || '' }];
    }
    const history = hData[actualOriginalName];
    const activeIdx = historyIndex === -1 ? 0 : historyIndex;
    
    if (checkDateOverlap(history, activeIdx, baslangic, ayrilis)) {
      if (!window.confirm("İKAZ: Personelin bu tarihleri kendi diğer görevleriyle çakışıyor veya başlangıç bitişten büyük!\n\nYine de bu şekilde kaydetmek istediğinize emin misiniz?")) {
        return;
      }
    }

    if (addPendingChange('EDIT', { originalName: actualOriginalName, historyIndex: activeIdx, name, title, profession, brans: editModal.brans, contact, kontrolGorevNo, phone, unit, province: isNew ? selectedProvince : (editedData[originalName]?.province || EXCEL_PROVINCE), baslangic, ayrilis, branchFields: { yillikIzin: editModal.yillikIzin, yillikIzinGecmis: editModal.yillikIzinGecmis, gorevMahalli: editModal.gorevMahalli, gorevKonulari: editModal.gorevKonulari, h_tazminat: editModal.h_tazminat ? 'X' : '', h_kontrol: editModal.h_kontrol ? 'X' : '', h_arazi: editModal.h_arazi ? 'X' : '', h_diger1: editModal.h_diger1 ? 'X' : '', h_diger2: editModal.h_diger2 ? 'X' : '', h_soforluk: editModal.h_soforluk ? 'X' : '' } }, "Personel bilgileri değişikliği onay için Genel Koordinatör'e iletildi.")) {
      setEditModal({ ...editModal, isOpen: false });
      return;
    }

    history[activeIdx].baslangic = baslangic;
    history[activeIdx].ayrilis = ayrilis;
    if (unit) history[activeIdx].unit = unit;

    // 2. Save Edited Base Details
    const newData = {
      ...editedData,
      [actualOriginalName]: { name, title, profession, brans: editModal.brans, contact, kontrolGorevNo, phone, unit, province: isNew ? selectedProvince : (editedData[originalName]?.province || EXCEL_PROVINCE) }
    };

    // 3. Save Branch Fields
    const bData = { ...branchData };
    if (!bData[originalName]) bData[originalName] = {};
    bData[originalName] = {
      ...bData[originalName],
      yillikIzin: editModal.yillikIzin,
      yillikIzinGecmis: editModal.yillikIzinGecmis,
      gorevMahalli: editModal.gorevMahalli,
      gorevKonulari: editModal.gorevKonulari,
      h_tazminat: editModal.h_tazminat ? 'X' : '',
      h_kontrol: editModal.h_kontrol ? 'X' : '',
      h_arazi: editModal.h_arazi ? 'X' : '',
      h_diger1: editModal.h_diger1 ? 'X' : '',
      h_diger2: editModal.h_diger2 ? 'X' : '',
      h_soforluk: editModal.h_soforluk ? 'X' : '',
    }

    setHistoryData(hData);
    localStorage.setItem('personnelHistoryData', JSON.stringify(hData));

    setEditedData(newData);
    localStorage.setItem('editedPersonnelData', JSON.stringify(newData));

    setBranchData(bData);
    localStorage.setItem('branchPersonnelData', JSON.stringify(bData));

    // E-posta kaydet
    if (editModal.email !== undefined) {
      const updatedEmailData = { ...personnelEmailData };
      if (!updatedEmailData[actualOriginalName]) updatedEmailData[actualOriginalName] = {};
      updatedEmailData[actualOriginalName].email = editModal.email;
      setPersonnelEmailData(updatedEmailData);
      localStorage.setItem('personnelEmailData', JSON.stringify(updatedEmailData));
    }

    setEditModal({ ...editModal, isOpen: false });
    await uploadLocalToSupabase();
  }
  const handleSendPassword = async (personnelName) => {
    const emailInfo = personnelEmailData[personnelName];
    if (!emailInfo?.email) {
      alert('Bu personel için kayıtlı bir e-posta adresi yok. Lütfen önce e-posta ekleyiniz.');
      return;
    }

    setSendingPassword(personnelName);
    const newPassword = generatePassword();
    const hash = hashPassword(newPassword);

    // Parolayı kaydet
    const updatedEmailData = { ...personnelEmailData };
    if (!updatedEmailData[personnelName]) updatedEmailData[personnelName] = {};
    updatedEmailData[personnelName].passwordHash = hash;
    setPersonnelEmailData(updatedEmailData);
    localStorage.setItem('personnelEmailData', JSON.stringify(updatedEmailData));
    syncSettingsToSupabase();

    // E-posta gönder
    if (isEmailJSConfigured()) {
      const result = await sendPasswordEmail(emailInfo.email, personnelName, newPassword);
      setSendingPassword(null);
      if (result.success) {
        alert(`✅ Parola başarıyla gönderildi!\n\nAlıcı: ${emailInfo.email}\nParola: ${newPassword}\n\nPersonel bu parolayla sisteme giriş yapabilir.`);
      } else {
        alert(`⚠️ Parola kaydedildi ama e-posta gönderilemedi.\n${result.message}\n\nParola: ${newPassword}\n\nBu parolayı personele manuel olarak iletiniz.`);
      }
    } else {
      setSendingPassword(null);
      alert(`📋 EmailJS henüz yapılandırılmamış.\n\nParola sisteme kaydedildi.\nPersonele manuel olarak iletiniz:\n\nParola: ${newPassword}\n\nEmailJS'i yapılandırmak için src/utils/emailService.js dosyasını güncelleyiniz.`);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`${p.name} isimli personelin bu görev kaydını silmek istediğinize emin misiniz?`)) return;

    if (await addPendingChange('DELETE', { p }, "Silme işlemi onay için Genel Koordinatör'e iletildi.")) return;

    if (p.historyIndex >= 0) {
      const hData = { ...historyData };
      const history = hData[p.originalName];
      history.splice(p.historyIndex, 1);
      
      if (history.length === 0) {
        // Eğer tüm geçmiş silindiyse personeli tamamen silinmiş işaretle
        const newData = {
          ...editedData,
          [p.originalName]: { ...(editedData[p.originalName] || {}), isDeleted: true }
        };
        setEditedData(newData);
        localStorage.setItem('editedPersonnelData', JSON.stringify(newData));
      }
      
      setHistoryData(hData);
      localStorage.setItem('personnelHistoryData', JSON.stringify(hData));
    } else {
      // Hiç history'si olmayan (başlangıç durumu) bir personelse tamamen sil
      const newData = {
        ...editedData,
        [p.originalName]: { ...(editedData[p.originalName] || {}), isDeleted: true }
      };
      setEditedData(newData);
      localStorage.setItem('editedPersonnelData', JSON.stringify(newData));
    }
    await uploadLocalToSupabase();
  }

  const handleTransferSubmit = async () => {
    const { personnel, newUnit, ayrilisTarihi, baslangicTarihi } = transferModal
    if (!newUnit || !ayrilisTarihi || !baslangicTarihi) {
      alert('Lütfen tüm alanları doldurunuz.')
      return
    }

    if (await addPendingChange('TRANSFER', { personnel, newUnit, ayrilisTarihi, baslangicTarihi }, "Transfer işlemi onay için Genel Koordinatör'e iletildi.")) {
      setTransferModal({ ...transferModal, isOpen: false });
      return;
    }

    const data = { ...historyData }
    if (!data[personnel.originalName] || data[personnel.originalName].length === 0) {
      data[personnel.originalName] = [{ unit: personnel.activeUnit, baslangic: personnel.baslangic || '', ayrilis: '' }]
    }
    
    const history = data[personnel.originalName]
    const latest = history[history.length - 1] // or should be the one at personnel.historyIndex!
    // Wait, transfer modal operates on the specific row!
    const activeIdx = personnel.historyIndex === -1 ? 0 : personnel.historyIndex;
    const targetHistory = history[activeIdx];
    
    // Check overlap for current assignment's ayrilis update
    if (checkDateOverlap(history, activeIdx, targetHistory.baslangic, ayrilisTarihi)) {
       if (!window.confirm("İKAZ: Ayrılış tarihi personelin diğer görevleriyle çakışıyor!\n\nYine de bu şekilde kaydetmek istediğinize emin misiniz?")) {
         return;
       }
    }

    // Eski birimi kapat
    targetHistory.ayrilis = ayrilisTarihi
    targetHistory.ayrilisNedeni = newUnit === 'İl Dışı' ? 'İl Dışına Tayin' : 'Birimler Arası Transfer'

    // Yeni birimi ekle
    history.push({
      unit: newUnit,
      baslangic: baslangicTarihi || ayrilisTarihi, // İl dışı için başlangıç tarihi ayrılışla aynı sayılır
      ayrilis: ''
    })

    saveHistoryData(data)
    setTransferModal({ ...transferModal, isOpen: false })
    await uploadLocalToSupabase();
  }

  const uniqueDistricts = [...new Set(DISTRICTS[EXCEL_PROVINCE] || [])]
  const allUnits = [...dynamicBranches, ...uniqueDistricts.map(i => `${i} İlçe Tarım ve Orman Müdürlüğü`), 'İl Dışı', 'Emekli']

  let targetUnit = null;
  if (selectedUnitType === 'Şube' && selectedUnit) {
    targetUnit = selectedUnit;
  } else if (selectedUnitType === 'İl Dışı' || selectedUnitType === 'Emekli') {
    targetUnit = selectedUnitType;
  } else if (selectedUnitType === 'İlçe' && selectedDistrict) {
    targetUnit = selectedDistrict;
  }
  const unitScopedRoles = ['Birim Sorumlusu', 'Şube Müdürü', 'İlçe Müdürü'];
  const isUnitScopedRole = unitScopedRoles.includes(user?.role);
  const isUnitView = !!targetUnit || isUnitScopedRole;
  if (isUnitScopedRole && user?.unit) {
      targetUnit = user.unit.replace(' İlçe Tarım ve Orman Müdürlüğü', '').replace(' İlçe Tarım Müdürlüğü', '');
  }

  const parseDateForBranch = (dStr) => {
    if (!dStr) return null;
    if (dStr.includes('-')) {
      const parts = dStr.split('-');
      if (parts.length === 3) return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
    }
    if (dStr.includes('.')) {
      const parts = dStr.split('.');
      if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return null;
  };

  const targetStart = new Date(selectedYear, selectedMonth - 1, 1);
  const targetEnd = new Date(selectedYear, selectedMonth, 0);

  // Filter out completely deleted ones and sort
  let finalPersonnel = [...filteredPersonnel.filter(p => {
    if (p.isDeleted && !showDeleted) return false;
    
    if (isUnitView) {
      if (!p.activeUnit || !p.activeUnit.includes(targetUnit)) return false;
      const b = parseDateForBranch(p.baslangic) || new Date(2000, 0, 1);
      const a = parseDateForBranch(p.ayrilis) || new Date(2100, 0, 1);
      return b <= targetEnd && a >= targetStart;
    } else {
       // All personnel view logic. 
       // In the old getFilteredPersonnel it returned all history records! We only want the LATEST one for All Personnel view?
       // Wait, the old PersonnelList rendered ALL history rows for a person? Yes! "Birim görev yerleri ve transfer işlemleri".
       return true;
    }
  })] /* sorted */;
  
  const isCurrentlyOut = (originalName) => {
    const history = historyData[originalName];
    if (history && history.length > 0) {
      const latest = history[history.length - 1].unit;
      return latest === 'İl Dışı' || latest === 'Emekli';
    }
    const baseP = PERSONELLER.find(x => x.name === originalName);
    return baseP && (baseP.unit === 'İl Dışı' || baseP.unit === 'Emekli');
  };

  const handleApprove = async (change) => {
    if (change.type === 'DELETE') {
      const p = change.payload.p;
      if (p.historyIndex >= 0) {
        const hData = { ...historyData };
        const history = hData[p.originalName];
        history.splice(p.historyIndex, 1);
        if (history.length === 0) {
          const newData = { ...editedData, [p.originalName]: { ...(editedData[p.originalName] || {}), isDeleted: true } };
          setEditedData(newData);
          localStorage.setItem('editedPersonnelData', JSON.stringify(newData));
        }
        setHistoryData(hData);
        localStorage.setItem('personnelHistoryData', JSON.stringify(hData));
      } else {
        const newData = { ...editedData, [p.originalName]: { ...(editedData[p.originalName] || {}), isDeleted: true } };
        setEditedData(newData);
        localStorage.setItem('editedPersonnelData', JSON.stringify(newData));
      }
    } else if (change.type === 'TRANSFER') {
      const { personnel, newUnit, ayrilisTarihi, baslangicTarihi } = change.payload;
      const data = { ...historyData };
      if (!data[personnel.originalName]) {
        data[personnel.originalName] = [{ unit: personnel.activeUnit, baslangic: personnel.baslangic || '', ayrilis: '' }];
      }
      const history = data[personnel.originalName];
      const activeIdx = personnel.historyIndex === -1 ? 0 : personnel.historyIndex;
      const targetHistory = history[activeIdx];
      targetHistory.ayrilis = ayrilisTarihi;
      targetHistory.ayrilisNedeni = newUnit === 'İl Dışı' ? 'İl Dışına Tayin' : 'Birimler Arası Transfer';
      history.push({
        unit: newUnit,
        baslangic: baslangicTarihi || ayrilisTarihi,
        ayrilis: ''
      });
      saveHistoryData(data);
    } else if (change.type === 'DATE_CHANGE') {
      const { personOriginalName, historyIndex, field, value } = change.payload;
      const data = { ...historyData };
      if (!data[personOriginalName] || data[personOriginalName].length === 0) {
        data[personOriginalName] = [{ unit: '', baslangic: '', ayrilis: '' }];
      }
      const history = data[personOriginalName];
      history[historyIndex][field] = value;
      saveHistoryData(data);
    } else if (change.type === 'INLINE_EDIT') {
      const { originalName, field, value } = change.payload;
      const newData = { ...editedData };
      if (!newData[originalName]) newData[originalName] = {};
      newData[originalName][field] = value;
      setEditedData(newData);
      localStorage.setItem('editedPersonnelData', JSON.stringify(newData));
    } else if (change.type === 'EDIT') {
      const { originalName, historyIndex, name, title, profession, brans, contact, kontrolGorevNo, phone, unit, province, baslangic, ayrilis, branchFields } = change.payload;
      const hData = { ...historyData };
      if (!hData[originalName] || hData[originalName].length === 0) {
        hData[originalName] = [{ unit: '', baslangic: '', ayrilis: '' }];
      }
      const history = hData[originalName];
      history[historyIndex].baslangic = baslangic;
      history[historyIndex].ayrilis = ayrilis;
      setHistoryData(hData);
      localStorage.setItem('personnelHistoryData', JSON.stringify(hData));

      const newData = { ...editedData, [originalName]: { name, title, profession, brans, contact, kontrolGorevNo, phone, unit, province } };
      setEditedData(newData);
      localStorage.setItem('editedPersonnelData', JSON.stringify(newData));

      const bData = { ...branchData };
      if (!bData[originalName]) bData[originalName] = {};
      bData[originalName] = { ...bData[originalName], ...branchFields };
      setBranchData(bData);
      localStorage.setItem('branchPersonnelData', JSON.stringify(bData));
    }

    const updated = pendingChanges.filter(c => c.id !== change.id);
    setPendingChanges(updated);
    localStorage.setItem('pendingPersonnelChanges', JSON.stringify(updated));
    await uploadLocalToSupabase();
  };

  const handleReject = async (id) => {
    if (!window.confirm("Bu değişikliği reddetmek istediğinize emin misiniz? İşlem iptal edilecek.")) return;
    const updated = pendingChanges.filter(c => c.id !== id);
    setPendingChanges(updated);
    localStorage.setItem('pendingPersonnelChanges', JSON.stringify(updated));
    await uploadLocalToSupabase();
  };

  const handleExportExcel = () => {
    const exportData = finalPersonnel.map(p => ({
      'Ad Soyad': p.originalName,
      'Güncel Birimi': p.unit,
      'Görevi': p.title || '',
      'Ünvanı': p.profession || '',
      'Bölümü / Branşı': p.brans || '',
      'Sicil No': p.contact || '',
      'Telefon': formatPhone(p.phone) || '',
      'Görev Başlangıç': p.baslangic || '-',
      'Görevden Ayrılış': p.ayrilis || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tüm Personeller");
    XLSX.writeFile(wb, "tum_personeller.xlsx");
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // Aynı dosyayı tekrar seçebilmek için sıfırla

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (jsonData.length === 0) {
          alert('Excel dosyası boş veya okunamadı.');
          return;
        }

        // Sütun eşleme — kullanıcı farklı sütun isimleri kullanabilir
        const findCol = (row, candidates) => {
          for (const c of candidates) {
            const key = Object.keys(row).find(k => k.toLocaleUpperCase('tr-TR').trim() === c.toLocaleUpperCase('tr-TR').trim());
            if (key && row[key] !== undefined) return key;
          }
          return null;
        };

        const firstRow = jsonData[0];
        const nameCol = findCol(firstRow, ['Ad Soyad', 'AD SOYAD', 'Adı Soyadı', 'ADI SOYADI', 'Ad Soyadı', 'İsim', 'Personel Adı', 'name']);
        const unitCol = findCol(firstRow, ['Güncel Birimi', 'Birim', 'Birimi', 'BİRİM/ŞUBESİ', 'BİRİM', 'GÜNCEL BİRİMİ', 'Şube', 'unit']);
        const titleCol = findCol(firstRow, ['Görevi', 'GÖREVİ', 'Görev', 'title']);
        const profCol = findCol(firstRow, ['Ünvanı', 'ÜNVANI', 'Unvan', 'UNVANI', 'profession']);
        const contactCol = findCol(firstRow, ['Sicil No', 'SİCİL NO', 'Sicil', 'contact']);
        const phoneCol = findCol(firstRow, ['Telefon', 'TELEFON', 'Tel', 'phone']);
        const emailCol = findCol(firstRow, ['E-Posta', 'E-POSTA', 'E POSTA', 'E Posta', 'Eposta', 'EPOSTA', 'Email', 'email', 'E-posta', 'Mail']);
        const basCol = findCol(firstRow, ['Görev Başlangıç', 'GÖREV BAŞL.', 'Başlangıç', 'baslangic']);
        const ayrCol = findCol(firstRow, ['Görevden Ayrılış', 'GÖREVDEN AYR.', 'Ayrılış', 'ayrilis']);

        if (!nameCol) {
          alert('Excel dosyasında "Ad Soyad" veya "Adı Soyadı" sütunu bulunamadı.\n\nDesteklenen sütun isimleri:\nAd Soyad, Adı Soyadı, İsim, Personel Adı');
          return;
        }

        // Mevcut personel listesini oluştur (PERSONELLER + editedData'dan eklenenler)
        const existingNames = new Set();
        PERSONELLER.forEach(p => {
          const edits = editedData[p.name] || {};
          if (!edits.isDeleted) existingNames.add(p.name);
        });

        // Benzersizlik kontrolü için mevcut bilgiler
        const existingPersonnel = {};
        PERSONELLER.forEach(p => {
          const edits = editedData[p.name] || {};
          if (!edits.isDeleted) {
            const merged = { ...p, ...edits };
            existingPersonnel[p.name] = {
              name: p.name,
              title: merged.title || '',
              profession: merged.profession || '',
              contact: merged.contact || ''
            };
          }
        });

        let imported = 0;
        let skipped = 0;
        let updated = 0;
        const newEditedData = { ...editedData };
        const newHistoryData = { ...historyData };
        const newEmailData = { ...personnelEmailData };

        for (const row of jsonData) {
          const name = (row[nameCol] || '').toString().trim();
          if (!name) continue;

          const rowUnit = unitCol ? (row[unitCol] || '').toString().trim() : '';
          const rowTitle = titleCol ? (row[titleCol] || '').toString().trim() : '';
          const rowProf = profCol ? (row[profCol] || '').toString().trim() : '';
          const rowContact = contactCol ? (row[contactCol] || '').toString().trim() : '';
          const rowPhone = phoneCol ? formatPhone((row[phoneCol] || '').toString().trim()) : '';
          const rowEmail = emailCol ? (row[rowEmail] || '').toString().trim() : '';
          const rowBas = basCol ? (row[basCol] || '').toString().trim() : '';
          const rowAyr = ayrCol ? (row[ayrCol] || '').toString().trim() : '';

          // Mevcut personel mi kontrol et
          const existing = existingPersonnel[name];
          if (existing) {
            // Adı aynı, ünvanı ve sicil no da aynıysa → mevcut verilerinde eksiklik yoksa atla
            const titleMatch = !existing.title || !rowTitle || existing.title === rowTitle;
            const profMatch = !existing.profession || !rowProf || existing.profession === rowProf;
            const contactMatch = !existing.contact || !rowContact || existing.contact === rowContact;

            if (titleMatch && profMatch && contactMatch) {
              // Mevcut personelin eksik bilgilerini tamamla
              let hasUpdate = false;
              const updates = {};
              if (!existing.title && rowTitle) { updates.title = rowTitle; hasUpdate = true; }
              if (!existing.profession && rowProf) { updates.profession = rowProf; hasUpdate = true; }
              if (!existing.contact && rowContact) { updates.contact = rowContact; hasUpdate = true; }
              if (rowPhone && !(newEditedData[name]?.phone)) { updates.phone = rowPhone; hasUpdate = true; }

              if (hasUpdate) {
                newEditedData[name] = { ...(newEditedData[name] || {}), ...updates };
                updated++;
              } else {
                skipped++;
              }

              // E-posta varsa güncelle
              if (rowEmail && !newEmailData[name]?.email) {
                if (!newEmailData[name]) newEmailData[name] = {};
                newEmailData[name].email = rowEmail;
              }
              continue;
            }
          }

          // Yeni personel — oluştur
          if (!existingNames.has(name)) {
            newEditedData[name] = {
              ...(newEditedData[name] || {}),
              isNew: true,
              title: rowTitle,
              profession: rowProf,
              contact: rowContact,
              phone: rowPhone
            };

            // Birim ve tarih bilgisi varsa history oluştur
            if (rowUnit) {
              if (!newHistoryData[name]) newHistoryData[name] = [];
              newHistoryData[name].push({
                unit: rowUnit,
                baslangic: rowBas || '',
                ayrilis: rowAyr || ''
              });
            }

            // E-posta bilgisi
            if (rowEmail) {
              if (!newEmailData[name]) newEmailData[name] = {};
              newEmailData[name].email = rowEmail;
            }

            existingNames.add(name);
            imported++;
          } else {
            skipped++;
          }
        }

        // Kaydet
        setEditedData(newEditedData);
        localStorage.setItem('editedPersonnelData', JSON.stringify(newEditedData));

        setHistoryData(newHistoryData);
        localStorage.setItem('personnelHistoryData', JSON.stringify(newHistoryData));

        setPersonnelEmailData(newEmailData);
        localStorage.setItem('personnelEmailData', JSON.stringify(newEmailData));

        alert(
          `📊 Excel Aktarım Sonucu:\n\n` +
          `✅ Yeni eklenen: ${imported} personel\n` +
          `🔄 Güncellenen: ${updated} personel\n` +
          `⏭️ Atlanan (zaten mevcut): ${skipped} personel\n\n` +
          `Toplam okunan satır: ${jsonData.length}`
        );
      } catch (err) {
        console.error('Excel import hatası:', err);
        alert('Excel dosyası okunurken bir hata oluştu.\n' + (err.message || ''));
      }
    };
    reader.readAsBinaryString(file);
  };

  const finalCount = [...new Set(finalPersonnel.filter(p => !isCurrentlyOut(p.originalName)).map(p => p.originalName))].length;

  const allUniqueUnits = [...new Set(
    [
      ...PERSONELLER.map(p => {
        const history = historyData[p.name];
        if (history && history.length > 0) return history[0].unit;
        const edits = editedData[p.name] || {};
        return edits.unit || p.unit;
      }),
      ...Object.keys(editedData).map(name => {
         const history = historyData[name];
         if (history && history.length > 0) return history[0].unit;
         return editedData[name]?.unit;
      })
    ].filter(Boolean)
  )].sort((a, b) => {
    const getUnitOrder = (unit) => {
      const lowerUnit = (unit || '').toLocaleLowerCase('tr-TR');
      if (lowerUnit.includes('müdürler') || lowerUnit === 'müdürler') return 1;
      if (lowerUnit.includes('hukuk')) return 2;
      if (lowerUnit.includes('ilçe')) return 4;
      return 3;
    };
    const orderA = getUnitOrder(a);
    const orderB = getUnitOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b, 'tr-TR');
  });

  useEffect(() => {
    if (location.state?.openProfileOriginalName && finalPersonnel.length > 0) {
      const pName = location.state.openProfileOriginalName;
      const person = finalPersonnel.find(x => x.originalName === pName);
      if (person) {
        openProfileModal(person);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, finalPersonnel]);

  return (
    <div className="module-container" style={{ position: 'relative' }}>
      <div className="module-header glass-panel">
        <div className="header-left">
          <h2>{isUnitView ? 'Birim Personelleri' : 'Tüm Personeller (İl Geneli)'}</h2>
          <p>{isUnitView ? 'Seçilen birimin personellerinin hakediş ve görev dağılım tablosu.' : 'İl genelindeki tüm personeller, birim görev yerleri ve transfer işlemleri.'}</p>
        </div>
        {isManagerRole && (
          <button className="primary-btn" onClick={() => setEditModal({
              isOpen: true, isNew: true, originalName: '', historyIndex: -1,
              name: '', title: '', profession: '', contact: '', phone: '', email: '',
              baslangic: '', ayrilis: '', unit: '',
              reportsTo: '', yillikIzin: '', yillikIzinGecmis: '', gorevMahalli: '', gorevKonulari: '',
              h_tazminat: false, h_kontrol: false, h_arazi: false, h_diger1: false, h_diger2: false, h_soforluk: false
          })}><Plus size={18} /> Yeni Personel Ekle</button>
        )}
      </div>

      {user?.role === 'Genel Koordinatör' && pendingChanges.length > 0 && (
        <div className="module-content glass-panel mt-4" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span> Bekleyen Onaylar ({pendingChanges.length})
          </h3>
          <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '15px' }}>Yöneticiler tarafından yapılan ve sistemde geçerli olması için onayınızı bekleyen işlemler:</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingChanges.map(change => (
              <div key={change.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: 'white', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '4px' }}>
                    İşlem Tipi: {change.type === 'DELETE' ? 'Silme' : change.type === 'TRANSFER' ? 'Transfer' : change.type === 'DATE_CHANGE' ? 'Tarih Değişikliği' : 'Düzenleme/Ekleme'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>
                    <strong>Personel:</strong> {change.payload.originalName || change.payload.personOriginalName || change.payload.personnel?.name || change.payload.p?.name} <br/>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>Talep Eden: {change.requestedBy} - {new Date(change.timestamp).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="primary-btn" style={{ background: '#10b981', borderColor: '#10b981', padding: '6px 12px' }} onClick={() => handleApprove(change)}>Onayla</button>
                  <button className="secondary-btn" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '6px 12px' }} onClick={() => handleReject(change.id)}>Reddet</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="module-content glass-panel mt-4">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} color="#5f6368" />
            <input 
              type="text" 
              placeholder="Personel veya birim ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {!isUnitView && (
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none',
                minWidth: '200px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Tüm Birimler</option>
              {allUniqueUnits.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          )}
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px', fontSize: '13px', cursor: 'pointer', background: '#fee2e2', padding: '6px 10px', borderRadius: '4px', color: '#b91c1c' }}>
            <input 
              type="checkbox" 
              checked={showDeleted} 
              onChange={(e) => setShowDeleted(e.target.checked)} 
              style={{ accentColor: '#ef4444' }}
            />
            Silinenleri Göster
          </label>

          <div className="toolbar-stats" style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500, display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isUnitView && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="hakedis-input" style={{ width: '110px', padding: '4px' }} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                  <option value={1}>Ocak</option>
                  <option value={2}>Şubat</option>
                  <option value={3}>Mart</option>
                  <option value={4}>Nisan</option>
                  <option value={5}>Mayıs</option>
                  <option value={6}>Haziran</option>
                  <option value={7}>Temmuz</option>
                  <option value={8}>Ağustos</option>
                  <option value={9}>Eylül</option>
                  <option value={10}>Ekim</option>
                  <option value={11}>Kasım</option>
                  <option value={12}>Aralık</option>
                </select>
                <select className="hakedis-input" style={{ width: '80px', padding: '4px' }} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                  {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button className="secondary-btn" onClick={handleCopyFromPreviousMonth} style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#374151', padding: '5px 10px' }}>
                  Önceki Aydan Kopyala
                </button>
                <button className="primary-btn" onClick={handleInlineSave} style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '5px 10px' }}>
                  <Save size={16} /> Kaydet
                </button>
              </div>
            )}
            <button className="secondary-btn" onClick={isUnitView ? handleExportExcelBranch : handleExportExcel} style={{ color: '#10b981', borderColor: '#10b981', padding: '5px 10px' }}>
              <Download size={16} /> Excel'e Aktar
            </button>
            {!isUnitView && isManagerRole && (
              <>
                <input
                  type="file"
                  id="excelImportInput"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={handleImportExcel}
                />
                <button className="secondary-btn" onClick={() => document.getElementById('excelImportInput').click()} style={{ color: '#2563eb', borderColor: '#2563eb', padding: '5px 10px' }}>
                  <Upload size={16} /> Excel'den Al
                </button>
              </>
            )}
            <span>Toplam: {finalCount} Kayıt</span>
          </div>
        </div>

        <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>Personel Seçiniz (Sadece Görüntüleme):</label>
          <select 
            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '350px', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }}
            onChange={e => {
              if (e.target.value) {
                const selectedP = finalPersonnel.find(p => p.originalName === e.target.value);
                if (selectedP) openProfileModal(selectedP);
                e.target.value = '';
              }
            }}
          >
            <option value="">-- Personel incelemek için Seçin --</option>
            {finalPersonnel.map((p, idx) => {
              let u = p.unit || p.activeUnit || 'Birim Yok';
              u = u.replace(/İlçe Tarım ve Orman Müdürlüğü/g, 'İlçe Müdürlüğü').replace(/İlçe Tarım Müdürlüğü/g, 'İlçe Müdürlüğü');
              return (
                <option key={idx} value={p.originalName}>{p.name} ({u})</option>
              );
            })}
          </select>
        </div>

          <div style={{ maxHeight: 'calc(100vh - 380px)', overflowX: 'auto', overflowY: 'auto', borderBottom: '1px solid #e5e7eb' }}>
            {isUnitView ? (
              <table className="data-table" style={{ minWidth: '1600px', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ width: '200px', borderRight: '1px solid #e5e7eb' }}>ADI SOYADI</th>
                  <th style={{ width: '130px', borderRight: '1px solid #e5e7eb' }}>GÖREVİ</th>
                  <th style={{ width: '130px', borderRight: '1px solid #e5e7eb' }}>ÜNVANI</th>
                  <th style={{ width: '90px', borderRight: '1px solid #e5e7eb' }}>SİCİL NO</th>
                  <th style={{ width: '130px', borderRight: '1px solid #e5e7eb' }}>KONTROL GÖREV NO</th>
                  <th style={{ width: '110px', borderRight: '1px solid #e5e7eb' }}>TELEFON</th>
                  <th style={{ width: '200px', borderRight: '1px solid #e5e7eb' }}>E-POSTA</th>
                  <th style={{ width: '130px', borderRight: '1px solid #e5e7eb' }}>BÖLÜMÜ/BRANŞI</th>
                  <th style={{ width: '60px', textAlign: 'center', borderRight: '1px solid #e5e7eb', fontSize: '11px', padding: '4px' }}>RUHSAT</th>
                  <th style={{ width: '60px', textAlign: 'center', borderRight: '1px solid #e5e7eb', fontSize: '11px', padding: '4px' }}>STOK</th>
                  <th style={{ width: '60px', textAlign: 'center', borderRight: '1px solid #e5e7eb', fontSize: '11px', padding: '4px' }}>YETİŞT.</th>
                  <th style={{ width: '60px', textAlign: 'center', borderRight: '1px solid #e5e7eb', fontSize: '11px', padding: '4px' }}>İHLAL</th>
                  <th style={{ width: '60px', textAlign: 'center', borderRight: '1px solid #e5e7eb', fontSize: '11px', padding: '4px' }}>AYARLAR</th>
                  <th style={{ width: '100px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>GÖREV BAŞL.</th>
                  <th style={{ width: '100px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>GÖREVDEN AYR.</th>
                  {isManagerRole && (
                    <th style={{ textAlign: 'right' }}>İŞLEMLER</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {finalPersonnel.map((p, idx) => {
                  return (
                    <tr key={`${p.originalName}-${idx}`} style={{ opacity: p.activeUnit === 'İl Dışı' || p.activeUnit === 'Emekli' ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 500, color: '#1a73e8', borderRight: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => openProfileModal(p)}>{p.name}</td>
                      <td style={{ borderRight: '1px solid #e5e7eb' }}>{getDisplayTitle(p.title)}</td>
                      <td style={{ borderRight: '1px solid #e5e7eb' }}>{p.profession || '-'}</td>
                      <td style={{ borderRight: '1px solid #e5e7eb' }}>{p.contact || '-'}</td>
                      <td style={{ borderRight: '1px solid #e5e7eb' }}>{p.kontrolGorevNo || '-'}</td>
                      <td style={{ borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{formatPhone(p.phone) || '-'}</td>
                      <td style={{ borderRight: '1px solid #e5e7eb', padding: '4px' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input
                            type="email"
                            placeholder="eposta@kurum.gov.tr"
                            style={{ flex: 1, padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '12px', minWidth: '130px' }}
                            value={personnelEmailData[p.originalName]?.email || ''}
                            onChange={e => {
                              const updatedEmailData = { ...personnelEmailData };
                              if (!updatedEmailData[p.originalName]) updatedEmailData[p.originalName] = {};
                              updatedEmailData[p.originalName].email = e.target.value;
                              setPersonnelEmailData(updatedEmailData);
                              localStorage.setItem('personnelEmailData', JSON.stringify(updatedEmailData));
                            }}
                          />
                          {isManagerRole && (
                            <button
                              title="Parola üret ve gönder"
                              onClick={() => handleSendPassword(p.originalName)}
                              disabled={sendingPassword === p.originalName}
                              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', whiteSpace: 'nowrap', opacity: sendingPassword === p.originalName ? 0.6 : 1 }}
                            >
                                            <Key size={12} />
                                            {sendingPassword === p.originalName ? '...' : 'Parola'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ borderRight: '1px solid #e5e7eb', padding: '4px' }}>
                        <select 
                          style={{ width: '100%', padding: '4px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb', fontSize: '11px', outline: 'none' }}
                          value={p.brans || ''}
                          onChange={e => handleInlineBransChange(p.originalName, e.target.value)}
                          disabled={!isManagerRole}
                        >
                          <option value="">- Seçiniz -</option>
                          <option value="Su Ürünleri Mühendisi">Su Ürünleri Müh.</option>
                          <option value="Balıkçılık Teknolojisi Mühendisi">Balıkçılık Tekn. Müh.</option>
                          <option value="Ziraat Mühendisi">Ziraat Müh.</option>
                          <option value="Veteriner Hekim">Veteriner Hekim</option>
                          <option value="Biyolog">Biyolog</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'ruhsat')}>
                        {renderCheckbox(modulePermissions[p.originalName]?.ruhsat)}
                      </td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'stok')}>
                        {renderCheckbox(modulePermissions[p.originalName]?.stok)}
                      </td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'yetistiricilik')}>
                        {renderCheckbox(modulePermissions[p.originalName]?.yetistiricilik)}
                      </td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'ihlaller')}>
                        {renderCheckbox(modulePermissions[p.originalName]?.ihlaller)}
                      </td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'ayarlar')}>
                        {renderCheckbox(modulePermissions[p.originalName]?.ayarlar)}
                      </td>
                      <td style={{ padding: '4px', borderRight: '1px solid #e5e7eb' }}>
                        <input type="date" style={{ width: '100%', padding: '4px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'center', backgroundColor: '#f9fafb' }} value={p.baslangic} disabled />
                      </td>
                      <td style={{ padding: '4px', borderRight: '1px solid #e5e7eb' }}>
                        <input type="date" style={{ width: '100%', padding: '4px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'center', backgroundColor: '#f9fafb' }} value={p.ayrilis} disabled />
                      </td>
                      {isManagerRole && (
                        <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', height: '100%', padding: '10px' }}>
                          <button className="icon-btn edit" title="Düzenle" onClick={() => openEditModal(p)}><Edit2 size={16} /></button>
                          {canDelete && (
                            <button className="icon-btn delete" title="Sil" onClick={() => handleDelete(p)}><Trash2 size={16} /></button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            ) : (
            <table className="data-table" style={{ minWidth: '1600px', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>ADI SOYADI</th>
                  <th>GÖREVİ</th>
                  <th>ÜNVANI</th>
                  <th>SİCİL NO</th>
                  <th>KONTROL GÖREV NO</th>
                  <th>TELEFON</th>
                  <th>E-POSTA</th>
                  <th>BÖLÜMÜ / BRANŞI</th>
                  <th style={{ textAlign: 'center', fontSize: '11px', padding: '4px' }}>RUHSAT</th>
                  <th style={{ textAlign: 'center', fontSize: '11px', padding: '4px' }}>STOK</th>
                  <th style={{ textAlign: 'center', fontSize: '11px', padding: '4px' }}>YETİŞT.</th>
                  <th style={{ textAlign: 'center', fontSize: '11px', padding: '4px' }}>İHLAL</th>
                  <th style={{ textAlign: 'center', fontSize: '11px', padding: '4px' }}>AYARLAR</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>GÖREV BAŞL.</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>GÖREVDEN AYR.</th>
                  {isManagerRole && (
                    <th style={{ textAlign: 'right' }}>İŞLEMLER</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {finalPersonnel.map((p, idx) => (
                  <tr key={`${p.originalName}-${idx}`} style={{ opacity: p.activeUnit === 'İl Dışı' || p.activeUnit === 'Emekli' ? 0.6 : 1 }}>
                    <td data-label="AD SOYAD" style={{ fontWeight: 500, color: '#1a73e8', cursor: 'pointer' }} onClick={() => openProfileModal(p)}>
                      {p.name}
                    </td>
                    <td data-label="ÜNVAN">{p.title || '-'}</td>
                    <td data-label="MESLEK">{p.profession || '-'}</td>
                    <td data-label="İLETİŞİM BİLGİLERİ" style={{ whiteSpace: 'nowrap' }}>{p.contact || '-'}</td>
                    <td data-label="KONTROL GÖREV NO" style={{ whiteSpace: 'nowrap' }}>{p.kontrolGorevNo || '-'}</td>
                    <td data-label="TELEFON" style={{ whiteSpace: 'nowrap' }}>{formatPhone(p.phone) || '-'}</td>
                    <td data-label="E-POSTA & ŞİFRE" style={{ padding: '4px' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="email"
                          placeholder="eposta@kurum.gov.tr"
                          style={{ flex: 1, padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '12px', minWidth: '130px' }}
                          value={personnelEmailData[p.originalName]?.email || ''}
                          onChange={e => {
                            const updatedEmailData = { ...personnelEmailData };
                            if (!updatedEmailData[p.originalName]) updatedEmailData[p.originalName] = {};
                            updatedEmailData[p.originalName].email = e.target.value;
                            setPersonnelEmailData(updatedEmailData);
                            localStorage.setItem('personnelEmailData', JSON.stringify(updatedEmailData));
                          }}
                        />
                        {isManagerRole && (
                          <button
                            title="Parola üret ve gönder"
                            onClick={() => handleSendPassword(p.originalName)}
                            disabled={sendingPassword === p.originalName}
                            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', whiteSpace: 'nowrap', opacity: sendingPassword === p.originalName ? 0.6 : 1 }}
                          >
                            <Key size={12} />
                            {sendingPassword === p.originalName ? '...' : 'Parola'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td data-label="BÖLÜMÜ / BRANŞI" style={{ borderRight: '1px solid #e5e7eb', padding: '4px' }}>
                      <select 
                        style={{ width: '100%', padding: '4px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb', fontSize: '11px', outline: 'none' }}
                        value={p.brans || ''}
                        onChange={e => handleInlineBransChange(p.originalName, e.target.value)}
                        disabled={!isManagerRole}
                      >
                        <option value="">- Seçiniz -</option>
                        <option value="Su Ürünleri Mühendisi">Su Ürünleri Müh.</option>
                        <option value="Balıkçılık Teknolojisi Mühendisi">Balıkçılık Tekn. Müh.</option>
                        <option value="Ziraat Mühendisi">Ziraat Müh.</option>
                        <option value="Veteriner Hekim">Veteriner Hekim</option>
                        <option value="Biyolog">Biyolog</option>
                      </select>
                    </td>
                    <td data-label="RUHSAT" style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'ruhsat')}>
                      {renderCheckbox(modulePermissions[p.originalName]?.ruhsat)}
                    </td>
                    <td data-label="STOK" style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'stok')}>
                      {renderCheckbox(modulePermissions[p.originalName]?.stok)}
                    </td>
                    <td data-label="YETİŞTİRİCİLİK" style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'yetistiricilik')}>
                      {renderCheckbox(modulePermissions[p.originalName]?.yetistiricilik)}
                    </td>
                    <td data-label="İHLALLER" style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'ihlaller')}>
                      {renderCheckbox(modulePermissions[p.originalName]?.ihlaller)}
                    </td>
                    <td data-label="AYARLAR" style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', cursor: isManagerRole ? 'pointer' : 'default' }} onClick={() => isManagerRole && toggleModulePermission(p.originalName, 'ayarlar')}>
                      {renderCheckbox(modulePermissions[p.originalName]?.ayarlar)}
                    </td>
                    <td data-label="BAŞLANGIÇ TARİHİ" style={{ padding: '4px' }}>
                      <input type="date" className="hakedis-input" style={{ width: '100%', padding: '6px' }} value={p.baslangic} onChange={e => handleDateChange(p.originalName, p.historyIndex, p.unit, 'baslangic', e.target.value)} disabled={p.activeUnit === 'İl Dışı' || p.activeUnit === 'Emekli' || !isManagerRole} />
                    </td>
                    <td data-label="AYRILIŞ TARİHİ" style={{ padding: '4px' }}>
                      <input type="date" className="hakedis-input" style={{ width: '100%', padding: '6px' }} value={p.ayrilis} onChange={e => handleDateChange(p.originalName, p.historyIndex, p.unit, 'ayrilis', e.target.value)} disabled={p.activeUnit === 'İl Dışı' || p.activeUnit === 'Emekli' || !isManagerRole} />
                    </td>
                    {isManagerRole && (
                      <td data-label="İŞLEMLER" style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="icon-btn" style={{ background: '#eef2ff', color: '#4f46e5' }} title="Birim Transferi / Ayrılış Ver" onClick={() => openTransferModal(p)} disabled={p.activeUnit === 'İl Dışı' || p.activeUnit === 'Emekli'}>
                          <ArrowRightLeft size={16} />
                        </button>
                        <button className="icon-btn edit-btn" onClick={() => openEditModal(p)} title="Düzenle"><Edit2 size={16} /></button>
                        {p.isDeleted ? (
                           <button className="icon-btn" onClick={() => {
                             if (!window.confirm(`${p.name} isimli personeli geri getirmek (kurtarmak) istediğinize emin misiniz?`)) return;
                             const newData = {
                               ...editedData,
                               [p.originalName]: { ...(editedData[p.originalName] || {}), isDeleted: false }
                             };
                             setEditedData(newData);
                             localStorage.setItem('editedPersonnelData', JSON.stringify(newData));
                           }} title="Kurtar" style={{ color: '#10b981', background: '#d1fae5' }}><CheckCircle2 size={16} /></button>
                        ) : (
                          canDelete && <button className="icon-btn delete-btn" onClick={() => handleDelete(p)} title="Sil"><Trash2 size={16} /></button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
        </div>
      </div>

      {transferModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '400px', padding: '24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Personel Transfer İşlemi</h3>
              <button onClick={() => setTransferModal({ ...transferModal, isOpen: false })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
              <strong>{transferModal.personnel.name}</strong> isimli personeli şu anki biriminden ({transferModal.personnel.activeUnit}) ayırıp yeni birime atamak üzeresiniz.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Şu Anki Birimden Ayrılış Tarihi</label>
              <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={transferModal.ayrilisTarihi} onChange={e => setTransferModal({ ...transferModal, ayrilisTarihi: e.target.value })} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Gideceği Yeni Birim</label>
              <select style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={transferModal.newUnit} onChange={e => setTransferModal({ ...transferModal, newUnit: e.target.value })}>
                  <option value="">Seçiniz...</option>
                  <option value="Müdürler">Müdürler (İl Müdürlüğü)</option>
                  <option value="Hukuk Birimi">Hukuk Birimi</option>
                  <optgroup label="Şube Müdürlükleri">
                    {getBranches().map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </optgroup>
                  <optgroup label="İlçe Müdürlükleri">
                    {[...new Set(DISTRICTS[selectedProvince] || DISTRICTS[selectedProvince])].map(d => (
                      <option key={d} value={`${d} İlçe Tarım ve Orman Müdürlüğü`}>{d} İlçe Tarım ve Orman Müdürlüğü</option>
                    ))}
                  </optgroup>
                  <option value="İl Dışı">İl Dışı</option>
                  <option value="Emekli">Emekli</option>
              </select>
            </div>

            {transferModal.newUnit && transferModal.newUnit !== 'İl Dışı' && transferModal.newUnit !== 'Emekli' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Yeni Birime Başlangıç Tarihi</label>
                <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={transferModal.baslangicTarihi} onChange={e => setTransferModal({ ...transferModal, baslangicTarihi: e.target.value })} />
              </div>
            )}

            <button className="primary-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleTransferSubmit}>
              İşlemi Onayla ve Kaydet
            </button>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ padding: '24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Personel & Birim Verilerini Düzenle</h3>
              <button onClick={() => setEditModal({ ...editModal, isOpen: false })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Adı Soyadı</label>
                <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.name} onChange={e => setEditModal({ ...editModal, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Bağlı Olduğu Birim</label>
                <select style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white' }} value={editModal.unit || ''} onChange={e => setEditModal({ ...editModal, unit: e.target.value })}>
                  <option value="">Seçiniz</option>
                  <option value="Müdürler">Müdürler (İl Müdürlüğü)</option>
                  <option value="Hukuk Birimi">Hukuk Birimi</option>
                  <optgroup label="Şube Müdürlükleri">
                    {getBranches().map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </optgroup>
                  <optgroup label="İlçe Müdürlükleri">
                    {[...new Set(DISTRICTS[selectedProvince] || DISTRICTS[selectedProvince])].map(d => (
                      <option key={d} value={`${d} İlçe Tarım ve Orman Müdürlüğü`}>{d} İlçe Tarım ve Orman Müdürlüğü</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Görevi</label>
                <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.title || ''} onChange={e => setEditModal({ ...editModal, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Ünvanı</label>
                <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.profession} onChange={e => setEditModal({ ...editModal, profession: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Bölümü / Branşı (Örn: Su Ürünleri)</label>
                <input list="brans-list" type="text" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.brans} onChange={e => setEditModal({ ...editModal, brans: e.target.value })} placeholder="Mezuniyet / Branş..." />
                <datalist id="brans-list">
                  <option value="Su Ürünleri Mühendisi" />
                  <option value="Balıkçılık Teknolojisi Mühendisi" />
                  <option value="Ziraat Mühendisi" />
                  <option value="Veteriner Hekim" />
                  <option value="Biyolog" />
                </datalist>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Sicil No</label>
                <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.contact} onChange={e => setEditModal({ ...editModal, contact: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Kontrol Görev No</label>
                <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.kontrolGorevNo} onChange={e => setEditModal({ ...editModal, kontrolGorevNo: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Telefon Numarası</label>
                <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.phone} onChange={e => setEditModal({ ...editModal, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>E-Posta Adresi</label>
                <input type="email" placeholder="eposta@kurum.gov.tr" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.email || ''} onChange={e => setEditModal({ ...editModal, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Görev Başlangıç Tarihi</label>
                <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.baslangic} onChange={e => setEditModal({ ...editModal, baslangic: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Görevden Ayrılış Tarihi</label>
                <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={editModal.ayrilis} onChange={e => setEditModal({ ...editModal, ayrilis: e.target.value })} />
              </div>
            </div>

            <button className="primary-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleEditSubmit}>
              Tüm Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      )}

      {profileModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '500px', padding: '24px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1a73e8' }}>Personel Performans Karnesi</h3>
              <button onClick={() => setProfileModal({ ...profileModal, isOpen: false })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', margin: '0 auto 10px' }}>
                {profileModal.personnel?.name.charAt(0)}
              </div>
              <h2 style={{ margin: 0, color: '#111827' }}>{profileModal.personnel?.name}</h2>
              <p style={{ margin: '4px 0 0', color: '#6b7280' }}>{profileModal.personnel?.title || 'Personel'} - {profileModal.personnel?.activeUnit}</p>
            </div>

            {profileModal.isLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Veriler Yükleniyor...</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{profileModal.stats.taskCount}</div>
                    <div style={{ fontSize: '12px', color: '#b45309' }}>Kayıtlı Görev Sayısı</div>
                  </div>
                  <div style={{ background: '#d1fae5', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>₺{profileModal.stats.estimatedHakedis?.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#047857' }}>Tahmini Hakediş Tutarı</div>
                  </div>
                </div>

                <h4 style={{ marginBottom: '10px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Son Görevleri</h4>
                {profileModal.tasks.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Hiç görev kaydı bulunmuyor.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {profileModal.tasks.slice(0, 5).map(t => (
                      <div key={t.id} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#f9fafb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '13px', color: '#111827' }}>{t.gidilenYer}</strong>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{t.tarih}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#4b5563' }}>{t.konu}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
