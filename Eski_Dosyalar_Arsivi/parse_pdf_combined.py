import fitz
import json
import re

pdf_path = r"C:\Users\Bahadır\Desktop\Bahadır\Yeni klasör (3)\Tebliğ 6.1-6.2.pdf"
doc = fitz.open(pdf_path)

text = ""
for page in doc:
    text += page.get_text("text") + "\n"

pattern = re.compile(r'(MADDE\s+(\d+)\s*[-–].*?)(?=MADDE\s+\d+\s*[-–]|$)', re.DOTALL | re.IGNORECASE)

ticari_articles = []
amator_articles = []
is_amator = False

for match in pattern.finditer(text):
    full_text = match.group(1).strip()
    madde_no = str(match.group(2))
    
    first_line = full_text.split('\n')[0]
    madde_title = first_line.split('-')[0].split('–')[0].strip()
    
    article_obj = {
        "madde": madde_no,
        "baslik": madde_title,
        "icerik": full_text
    }
    
    # If we see Madde 1 again after having already parsed some articles, we switch to Amator.
    if madde_no == '1' and len(ticari_articles) > 0:
        is_amator = True
        
    if not is_amator:
        ticari_articles.append(article_obj)
    else:
        amator_articles.append(article_obj)

with open(r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\teblig_ticari.json", 'w', encoding='utf-8') as f:
    json.dump(ticari_articles, f, ensure_ascii=False, indent=2)

with open(r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\teblig_amator.json", 'w', encoding='utf-8') as f:
    json.dump(amator_articles, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(ticari_articles)} for Ticari and {len(amator_articles)} for Amator.")
