import pandas as pd
import json
import math

filepath = r"C:\Users\Bahadır\Desktop\Bahadır\1380 Sayılı Su Ürünleri Kanunu İhlaline İlişkin Ceza İşlemleri.xlsx"
out_json_path = r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\excel_cezalar.json"

def clean_val(val):
    if pd.isna(val) or val == 'nan' or val == '':
        return "-"
    return str(val).strip()

try:
    df = pd.read_excel(filepath, sheet_name='Tüm Sayfalar (2-76)')
    
    extracted_data = {
        "TümCezalar": []
    }
    
    current_category = "Genel"
    
    for i, row in df.iterrows():
        # Skip header rows
        if i < 2: continue
        
        # Determine violation reason
        col1 = clean_val(row.iloc[1])
        col2 = clean_val(row.iloc[2])
        
        # If col2 is empty but col1 has text, it might be a category header or a main row
        if col2 == "-" and col1 != "-":
            # Just use col1 as reason
            ihlal_nedeni = col1
        elif col2 != "-":
            ihlal_nedeni = col2
            if col1 != "-":
                current_category = col1 # Update overarching category
        else:
            continue # both empty
            
        kanun = clean_val(row.iloc[3])
        yonetmelik = clean_val(row.iloc[4])
        teblig = clean_val(row.iloc[5])
        bend_36 = clean_val(row.iloc[6])
        
        base_fine = clean_val(row.iloc[7])
        girgir_multiplier = clean_val(row.iloc[8])
        boy_12_alti = clean_val(row.iloc[9])
        boy_12_22 = clean_val(row.iloc[10])
        boy_22_ustu = clean_val(row.iloc[11])
        
        ruhsat_1 = clean_val(row.iloc[12])
        ruhsat_2 = clean_val(row.iloc[13])
        ruhsat_iptal = clean_val(row.iloc[14])
        
        el_koyma_urun = clean_val(row.iloc[15])
        el_koyma_vasita = clean_val(row.iloc[16])
        if len(row) > 17:
             el_koyma_vasita += " " + clean_val(row.iloc[17])
             
        item = {
            "id": f"ceza-{i}",
            "kategori": current_category,
            "ihlal_nedeni": ihlal_nedeni,
            "kanun_maddesi": kanun,
            "yonetmelik": yonetmelik,
            "teblig": teblig,
            "madde_36_bendi": bend_36,
            "para_cezasi_tl": base_fine,
            "ceza_oranlari": {
                "girgir": girgir_multiplier,
                "boy_12_alti": boy_12_alti,
                "boy_12_22": boy_12_22,
                "boy_22_ustu": boy_22_ustu
            },
            "ruhsat_geri_alma": {
                "kez_1": ruhsat_1,
                "kez_2": ruhsat_2,
                "kez_3": ruhsat_iptal
            },
            "el_koyma_urun": el_koyma_urun,
            "el_koyma_vasita": el_koyma_vasita
        }
        
        extracted_data["TümCezalar"].append(item)
        
    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(extracted_data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully extracted {len(extracted_data['TümCezalar'])} rows to {out_json_path}")

except Exception as e:
    print("Error parsing Excel:", e)
