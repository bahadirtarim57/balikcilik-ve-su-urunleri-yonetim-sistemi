import fitz
import json
import re

pdf_path = r"C:\Users\Bahadır\Desktop\Bahadır\Yeni klasör (3)\Tebliğ 6.1-6.2.pdf"
doc = fitz.open(pdf_path)

text = ""
for page in doc:
    text += page.get_text("text") + "\n"

# A pattern to catch MADDE X, GEÇİCİ MADDE X, EK MADDE X
# We look for "MADDE", optionally preceded by "GEÇİCİ" or "EK"
pattern = re.compile(r'((?:GEÇİCİ\s+|EK\s+)?MADDE\s+(\d+)\s*[-–].*?)(?=(?:GEÇİCİ\s+|EK\s+)?MADDE\s+\d+\s*[-–]|$)', re.DOTALL | re.IGNORECASE)

ticari_articles = []
amator_articles = []

# Since we know 6.1 and 6.2 are combined, 6.1 has some number of articles (e.g., up to ~54, plus Geçici articles).
# Then 6.2 starts with "MADDE 1" again.
# We will use this logic: if we see "MADDE 1" and we already have a significant number of articles (like > 10), we switch to Amator.

is_amator = False

for match in pattern.finditer(text):
    full_text = match.group(1).strip()
    madde_no = str(match.group(2))
    
    first_line = full_text.split('\n')[0].strip()
    
    # Extract the full title prefix, e.g. "GEÇİCİ MADDE 1" or "MADDE 1"
    # The title might contain a dash, we just want the first part before the dash.
    madde_title = first_line.split('-')[0].split('–')[0].strip()
    
    # Determine what to use for "madde" string. If it's "GEÇİCİ MADDE", we might store "Geçici 1".
    prefix = ""
    if "GEÇİCİ" in madde_title.upper():
        prefix = "Geçici "
    elif "EK" in madde_title.upper():
        prefix = "Ek "
        
    final_madde_key = prefix + madde_no
    
    article_obj = {
        "madde": final_madde_key,
        "baslik": madde_title,
        "icerik": full_text
    }
    
    # Detect switch to 6.2 (Amator)
    # The switch happens when we see exactly "MADDE 1" (not GEÇİCİ MADDE 1) and we're already deep in 6.1
    if madde_no == '1' and prefix == "" and len(ticari_articles) > 10:
        is_amator = True
        
    if not is_amator:
        ticari_articles.append(article_obj)
    else:
        amator_articles.append(article_obj)

with open(r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\teblig_ticari.json", 'w', encoding='utf-8') as f:
    json.dump(ticari_articles, f, ensure_ascii=False, indent=2)

with open(r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\teblig_amator.json", 'w', encoding='utf-8') as f:
    json.dump(amator_articles, f, ensure_ascii=False, indent=2)

print(f"Ticari: {len(ticari_articles)} articles")
print(f"Amator: {len(amator_articles)} articles")

# Check if we actually found "Geçici"
print("Ticari Geçici:", [a['madde'] for a in ticari_articles if 'Geçici' in a['madde']])
print("Amator Geçici:", [a['madde'] for a in amator_articles if 'Geçici' in a['madde']])
