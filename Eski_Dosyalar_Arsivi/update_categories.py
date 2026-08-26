import json

filepath = r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\excel_cezalar.json"

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data['TümCezalar']:
    cat = item.get('kategori', '')
    cat_lower = cat.lower()
    
    if 'avcı' in cat_lower or 'ruhsat' in cat_lower or 'tür' in cat_lower:
        ana_baslik = "Avcılık İhlalleri"
    elif 'yetiştiricilik' in cat_lower or 'istihsal' in cat_lower:
        ana_baslik = "Yetiştiricilik İhlalleri"
    elif 'barınak' in cat_lower:
        ana_baslik = "Barınak İhlalleri"
    elif 'su' in cat_lower or 'akarsu' in cat_lower or 'arıtma' in cat_lower or 'çakıl' in cat_lower or 'patlayıcı' in cat_lower:
        ana_baslik = "Çevre ve Su Kalitesi"
    elif 'personel' in cat_lower:
        ana_baslik = "Yetiştiricilik İhlalleri" # Teknik personel is usually for aquaculture
    else:
        ana_baslik = "Diğer İhlaller"
        
    item['ana_baslik'] = ana_baslik

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated JSON with ana_baslik")
