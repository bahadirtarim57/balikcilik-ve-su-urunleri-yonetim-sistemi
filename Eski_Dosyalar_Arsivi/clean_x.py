import json
import re

filepath = r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\excel_cezalar.json"

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

count = 0
for item in data['TümCezalar']:
    urun = str(item.get('el_koyma_urun', ''))
    vasita = str(item.get('el_koyma_vasita', ''))
    
    # Check if 'x' is at the end or standalone
    has_x = False
    
    # We clean both fields and set the flag if we find "x"
    if 'x' in urun.lower() or 'x' in vasita.lower() or 'x' in str(item.get('para_cezasi_tl', '')).lower():
        has_x = True
        
    item['tekerrur_ikikat'] = has_x
    
    # Clean the 'x'
    # Use regex to remove 'x' or '- x' or 'x -' at the end or anywhere if it's standalone
    urun = re.sub(r'(?i)\b[xX]\b', '', urun).replace('- -', '-').strip()
    vasita = re.sub(r'(?i)\b[xX]\b', '', vasita).replace('- -', '-').strip()
    
    # Also clean trailing hyphens if left empty
    if urun.endswith('-'): urun = urun[:-1].strip()
    if vasita.endswith('-'): vasita = vasita[:-1].strip()
    
    item['el_koyma_urun'] = urun if urun else 'Hayır'
    item['el_koyma_vasita'] = vasita if vasita else 'Hayır'
    
    if has_x:
        count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated {count} items with tekerrur_ikikat flag and cleaned the 'x'")
