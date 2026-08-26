-- Balikcilik ve Su Urunleri Sistemi Tablo Kurulumlari

-- 1. Tesisler Tablosu
CREATE TABLE IF NOT EXISTS tesisler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sira_no TEXT,
    yetistirme_turu TEXT,
    tesis_adi TEXT,
    ilce TEXT,
    isletme_no TEXT,
    su_sistem_no TEXT,
    ag_kafes_hacmi TEXT,
    kara_havuz_hacmi TEXT,
    proje_kapasitesi TEXT,
    fiili_kapasite TEXT,
    koordinatlar TEXT,
    status TEXT,
    finalStatus TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cezalar Tablosu
CREATE TABLE IF NOT EXISTS cezalar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dosya_no TEXT,
    ceza_tarihi TEXT,
    kisi_adi TEXT,
    tc_kimlik TEXT,
    ceza_nedeni TEXT,
    para_cezasi_tl TEXT,
    ilce TEXT,
    durum TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Gecici olarak herkesin erisimine acik
ALTER TABLE tesisler ENABLE ROW LEVEL SECURITY;
ALTER TABLE cezalar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes gorebilir ve yazabilir tesisler" ON tesisler FOR ALL USING (true);
CREATE POLICY "Herkes gorebilir ve yazabilir cezalar" ON cezalar FOR ALL USING (true);
