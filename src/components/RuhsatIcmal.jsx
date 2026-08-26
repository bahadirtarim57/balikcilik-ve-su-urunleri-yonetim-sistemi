import React, { useState, useMemo } from "react";
import { Filter, Download, Ship, AlertCircle, FileText, CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import masterArsiv from "../data/master_arsiv.json";

const RuhsatIcmal = () => {
  const [filterDurum, setFilterDurum] = useState("");
  const [filterVize, setFilterVize] = useState("");
  const [vizeGun, setVizeGun] = useState("30");
  const [filterCeza, setFilterCeza] = useState("");
  const [filterArsivDurumu, setFilterArsivDurumu] = useState("AKTİF_KAYIT");
  const [filterRuhsatTipi, setFilterRuhsatTipi] = useState("");

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const cleanDate = dateStr.replace(/\//g, '.');
    const parts = cleanDate.split(".");
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    return null;
  };

  const filteredData = useMemo(() => {
    return masterArsiv.filter((gemi) => {
      // 0. Arşiv Türü Filtresi
      if (filterArsivDurumu === "AKTİF_KAYIT" && gemi.arsivDurumu === "PASİF") return false;
      if (filterArsivDurumu === "PASİF" && gemi.arsivDurumu !== "PASİF") return false;

      // 0.1 Ruhsat Tipi Filtresi
      if (filterRuhsatTipi && gemi.kimlik?.ruhsatTipi !== filterRuhsatTipi) return false;

      // 1. Durum Filtresi
      if (filterDurum) {
        if (filterDurum === "AKTIF" && gemi.guncelDurum !== "AKTİF") return false;
        if (filterDurum === "IPTAL" && !gemi.guncelDurum.includes("İPTAL")) return false;
        if (filterDurum === "BASKA_ILE" && !gemi.guncelDurum.includes("BAŞKA İLE")) return false;
        if (filterDurum === "DESTEKLEME" && !gemi.guncelDurum.includes("DESTEKLEME")) return false;
      }

      // 2. Vize Filtresi
      if (filterVize) {
        const vizeBitis = parseDate(gemi.tarihler?.vizeBitisTarihi);
        const now = new Date();
        
        if (filterVize === "YOK" && gemi.tarihler?.vizeBitisTarihi) return false;
        if (filterVize === "VAR" && !gemi.tarihler?.vizeBitisTarihi) return false;
        
        if (filterVize === "BITMIS") {
          if (!vizeBitis || vizeBitis >= now) return false;
        }
        
        if (filterVize === "YAKLASIYOR") {
          if (!vizeBitis) return false;
          const diffTime = vizeBitis - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const targetDays = parseInt(vizeGun, 10) || 30;
          if (diffDays < 0 || diffDays > targetDays) return false;
        }
      }

      // 3. Ceza Filtresi
      if (filterCeza) {
        const hasCeza1 = !!gemi.cezaVeIptal?.ceza1Tarihi;
        const hasCeza2 = !!gemi.cezaVeIptal?.ceza2Tarihi;
        if (filterCeza === "YOK" && (hasCeza1 || hasCeza2)) return false;
        if (filterCeza === "VAR" && !hasCeza1 && !hasCeza2) return false;
        if (filterCeza === "1" && (!hasCeza1 || hasCeza2)) return false;
        if (filterCeza === "2" && !hasCeza2) return false;
        if (filterCeza === "SURE_BITEN") {
          const now = new Date();
          const c1 = parseDate(gemi.cezaVeIptal?.ceza1Tarihi);
          const c2 = parseDate(gemi.cezaVeIptal?.ceza2Tarihi);
          const isC1Expired = c1 && (now - c1) > (2 * 365 * 24 * 60 * 60 * 1000);
          const isC2Expired = c2 && (now - c2) > (2 * 365 * 24 * 60 * 60 * 1000);
          if (!isC1Expired && !isC2Expired) return false;
        }
      }

      return true;
    });
  }, [filterDurum, filterVize, vizeGun, filterCeza, filterArsivDurumu, filterRuhsatTipi]);

  const exportToExcel = () => {
    const exportData = filteredData.map((g, idx) => {
      return {
        "SIRA NO": idx + 1,
        "SAYFA NO": g.ruhsatOzellikleri?.defterSayfa || "",
        "YENİ DEFTER SAYFA NO": g.ruhsatOzellikleri?.yeniDefterSayfa || "",
        "HOLOGRAM": g.guncelHologram || "",
        "İÇSU PLAKASI": g.kimlik?.ruhsatTipi === "İÇ SU" ? g.plakaNo : "",
        "DENİZ PLAKASI": g.kimlik?.ruhsatTipi === "DENİZ" ? g.plakaNo : "",
        "YEDEK GEMİ PLAKASI": g.kimlik?.ruhsatTipi === "YEDEK" ? g.plakaNo : "",
        "YEDEK GEMİNİN ANA GEMİ PLAKASI": (g.kimlik?.anaGemiPlakasi && !g.kimlik.anaGemiPlakasi.includes("-")) ? g.kimlik.anaGemiPlakasi : "",
        "YET.TES. NUMARASI": (g.kimlik?.anaGemiPlakasi && g.kimlik.anaGemiPlakasi.includes("-")) ? g.kimlik.anaGemiPlakasi : "",
        "YEDEK GEMİ FAALİYET ALANI": g.kimlik?.faaliyetAlani || "",
        "ESKİ PLAKASI": g.kimlik?.eskiPlaka || "",
        "GEMİ ADI": g.kimlik?.gemiAdi || "",
        "BAĞLAMA NUMARASI": g.kimlik?.baglamaNumarasi || "",
        "BAĞLAMA LİMANI": g.kimlik?.liman || "",
        "TAM BOY": g.teknikOzellikler?.tamBoy || "",
        "TESCİL BOY": g.teknikOzellikler?.tescilBoy || "",
        "KÜTÜK BOY": g.teknikOzellikler?.kutukBoy || "",
        "EN": g.teknikOzellikler?.en || "",
        "DERİNLİK": g.teknikOzellikler?.derinlik || "",
        "GROSTONAJ": g.teknikOzellikler?.grostonaj || "",
        "GEMİ TÜRÜ": g.teknikOzellikler?.gemiTuru || "",
        "YAPIM MALZEMESİ": g.teknikOzellikler?.yapimMalzemesi || "",
        "YAPIM YILI": g.teknikOzellikler?.yapimYili || "",
        "MOTOR MARKASI": g.teknikOzellikler?.motorMarkasi || "",
        "MOTOR GÜCÜ (HP/KW)": g.teknikOzellikler?.motorGucu || "",
        "MOTOR SERİ NO": g.teknikOzellikler?.motorSeriNo || "",
        "BOY HAKKI": g.ruhsatOzellikleri?.boyHakki || "",
        "12 MÜ": g.ruhsatOzellikleri?.onIkiMu || "",
        "AV ARACI": g.ruhsatOzellikleri?.avAraci || "",
        "ASKI DURUMU": g.ruhsatOzellikleri?.askiDurumu || "",
        "VİZE TARİHİ": g.tarihler?.vizeBitisTarihi || "",
        "GEMİ SAHİBİ": g.kimlik?.sahibi || "",
        "VERGİ NO": g.kimlik?.vergiNo || "",
        "TC KİMLİK NO": g.kimlik?.tcKimlik || "",
        "TELEFON": g.kimlik?.telefon || "",
        "E-POSTA": g.kimlik?.eposta || "",
        "ADRESİ": g.kimlik?.adres || "",
        "İLİ": "SİNOP",
        "İLÇESİ": g.kimlik?.ilce || "",
        "GİDİŞ TARİHİ": g.cezaVeIptal?.gidisTarihi || "",
        "GİTTİĞİ İL": g.cezaVeIptal?.gittigiIl || "",
        "RUHSAT İPTAL TARİHİ": g.cezaVeIptal?.iptalTarihi || "",
        "RUHSAT İPTAL NEDENİ": g.cezaVeIptal?.iptalNedeni || "",
        "GEMİ İ.P.C. (CEZA) MADDESİ": g.cezaVeIptal?.cezaMaddesi || "",
        "1.CEZA TARİHİ": g.cezaVeIptal?.ceza1Tarihi || "",
        "1. CEZA TUTARI": "",
        "1. CEZA EL KOYMA SÜRESİ": g.cezaVeIptal?.elKoymaSuresi || "",
        "1.CEZA RUHSAT EL KOYMA TARİHİ": g.cezaVeIptal?.elKoymaTarihi || "",
        "1.CEZA RUHSAT EL KOYMA TESLİM TARİHİ": g.cezaVeIptal?.ruhsatTeslimTarihi || "",
        "1.CEZANIN SONA ERME TARİHİ": g.cezaVeIptal?.cezaSonaErmeTarihi || "",
        "2.CEZA TARİHİ": g.cezaVeIptal?.ceza2Tarihi || "",
        "2. CEZA TUTARI": "",
        "2. CEZA EL KOYMA SÜRESİ": g.cezaVeIptal?.elKoymaSuresi2 || "",
        "2.CEZA RUHSAT EL KOYMA TARİHİ": g.cezaVeIptal?.elKoymaTarihi2 || "",
        "2.CEZA RUHSAT EL KOYMA TESLİM TARİHİ": "",
        "2.CEZANIN SONA ERME TARİHİ": "",
        "3.CEZA TARİHİ": "",
        "3. CEZA TUTARI": "",
        "3. CEZA RUHSAT İPTAL": "",
        "ZAMAN AŞIMI DURUMU (SİLİNEN)": "",
        "ŞAHIS İ.P.C": g.cezaVeIptal?.sahisIpc || "",
        "ŞAHIS Adı Soyadı": g.cezaVeIptal?.sahisAdi || "",
        "1.CEZA TARİHİ ": g.cezaVeIptal?.sahis1Ceza || "",
        "1. CEZA TUTARI ": "",
        "1. CEZA EL KOYMA SÜRESİ ": g.cezaVeIptal?.sahisElKoymaSuresi || "",
        "1.CEZA RUHSAT EL KOYMA TARİHİ ": g.cezaVeIptal?.sahisElKoymaTarihi || "",
        "1.CEZA RUHSAT EL KOYMA TESLİM TARİHİ ": "",
        "1.CEZANIN SONA ERME TARİHİ ": "",
        "2.CEZA TARİHİ ": g.cezaVeIptal?.sahis2Ceza || "",
        "2. CEZA TUTARI ": "",
        "2. CEZA EL KOYMA SÜRESİ ": "",
        "2.CEZA RUHSAT EL KOYMA TARİHİ ": "",
        "2.CEZA RUHSAT EL KOYMA TESLİM TARİHİ ": "",
        "2.CEZANIN SONA ERME TARİHİ ": ""
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ruhsat Icmal");
    XLSX.writeFile(wb, "Ruhsat_Icmal_Raporu.xlsx");
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1600px", margin: "0 auto", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>Ruhsat İcmal Motoru</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "16px" }}>Mevcut tüm teknelerin geçmiş, iptal, ceza ve vize verilerini filtreleyin.</p>
        </div>
        <button onClick={exportToExcel} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#10b981", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)" }}>
          <Download size={20} /> Excel Olarak İndir
        </button>
      </div>

      <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}><Filter size={20} color="#3b82f6" /> Akıllı Filtreler</h2>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>Kayıt (Arşiv) Türü</label>
            <select value={filterArsivDurumu} onChange={e => setFilterArsivDurumu(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <option value="AKTİF_KAYIT">Sadece Güncel/Aktif Kayıtlar</option>
              <option value="TÜMÜ">Tüm Tarihçeyi Göster</option>
              <option value="PASİF">Sadece Devredilmiş (Pasif)</option>
            </select>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>Ruhsat Tipi</label>
            <select value={filterRuhsatTipi} onChange={e => setFilterRuhsatTipi(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <option value="">Tümü</option>
              <option value="DENİZ">Deniz</option>
              <option value="İÇ SU">İç Su</option>
              <option value="YEDEK">Yedek</option>
            </select>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>Genel Durum</label>
            <select value={filterDurum} onChange={e => setFilterDurum(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <option value="">Tümü (Tüm Arşiv)</option>
              <option value="AKTIF">Sadece Aktif Ruhsatlar</option>
              <option value="IPTAL">İptal Edilenler</option>
              <option value="BASKA_ILE">Başka İle Gidenler (Nakil Giden)</option>
              <option value="DESTEKLEME">Desteklemeye Gidenler</option>
            </select>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>Vize Durumu</label>
            <select value={filterVize} onChange={e => setFilterVize(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <option value="">Tümü</option>
              <option value="BITMIS">Vizesi Bitenler (Süresi Dolanlar)</option>
              <option value="YAKLASIYOR">Vize Bitişi Yaklaşanlar</option>
              <option value="YOK">Vizesi Olmayanlar (Boş)</option>
              <option value="VAR">Vizesi Olanlar</option>
            </select>
          </div>
          {filterVize === "YAKLASIYOR" && (
            <div style={{ flex: "0 0 150px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>Kalan Gün</label>
              <input type="number" value={vizeGun} onChange={e => setVizeGun(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            </div>
          )}
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>Ceza Sicili</label>
            <select value={filterCeza} onChange={e => setFilterCeza(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <option value="">Tümü</option>
              <option value="YOK">Hiç Ceza Yemeyenler (Temiz)</option>
              <option value="VAR">Ceza Yiyenler (1 veya 2)</option>
              <option value="1">Sadece 1. Cezada Olanlar</option>
              <option value="2">Sadece 2. Cezada Olanlar</option>
              <option value="SURE_BITEN">Cezası Zaman Aşımına Uğrayanlar (Süresi Bitenler)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Sonuçlar</h3>
          <div style={{ background: "#3b82f6", color: "white", padding: "6px 16px", borderRadius: "20px", fontWeight: "600" }}>{filteredData.length} Tekne Bulundu</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>PLAKA</th>
                <th style={{ padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>ESKİ PLAKA</th>
                <th style={{ padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>GEMİ ADI</th>
                <th style={{ padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>DURUM</th>
                <th style={{ padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>VİZE BİTİŞ</th>
                <th style={{ padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>GİTTİĞİ İL / İPTAL</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 100).map((gemi, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px", fontWeight: "700", color: "#0f172a" }}>{gemi.plakaNo}</td>
                  <td style={{ padding: "16px", color: "#64748b" }}>{gemi.kimlik?.eskiPlaka || "-"}</td>
                  <td style={{ padding: "16px", fontWeight: "600" }}>{gemi.kimlik?.gemiAdi || "İsimsiz"}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ 
                      padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600",
                      background: gemi.guncelDurum === "AKTİF" ? "#dcfce7" : gemi.guncelDurum.includes("İPTAL") ? "#fee2e2" : "#e0f2fe",
                      color: gemi.guncelDurum === "AKTİF" ? "#166534" : gemi.guncelDurum.includes("İPTAL") ? "#991b1b" : "#075985"
                    }}>{gemi.guncelDurum}</span>
                  </td>
                  <td style={{ padding: "16px", color: "#475569", fontWeight: "500" }}>{gemi.tarihler?.vizeBitisTarihi || "-"}</td>
                  <td style={{ padding: "16px", color: "#64748b" }}>{gemi.cezaVeIptal?.gittigiIl || gemi.cezaVeIptal?.iptalTarihi || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length > 100 && (
            <div style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc" }}>
              Performans için ilk 100 kayıt gösteriliyor. Tamamını görmek için Excel olarak indirebilirsiniz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuhsatIcmal;