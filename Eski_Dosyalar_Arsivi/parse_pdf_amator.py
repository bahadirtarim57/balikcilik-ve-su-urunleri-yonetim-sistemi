import fitz
import json
import re

pdf_path = r"C:\Users\Bahadır\Desktop\Bahadır\Yeni klasör (3)\Tebliğ6.2.pdf"
doc = fitz.open(pdf_path)

text = ""
for page in doc:
    text += page.get_text("text") + "\n"

pattern = re.compile(r'(MADDE\s+(\d+)\s*[-–].*?)(?=MADDE\s+\d+\s*[-–]|$)', re.DOTALL | re.IGNORECASE)

articles = []
for match in pattern.finditer(text):
    full_text = match.group(1).strip()
    madde_no = str(match.group(2))
    
    first_line = full_text.split('\n')[0]
    madde_title = first_line.split('-')[0].split('–')[0].strip()
    
    articles.append({
        "madde": madde_no,
        "baslik": madde_title,
        "icerik": full_text
    })

# Overwrite teblig_amator.json
with open(r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\teblig_amator.json", 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(articles)} articles from 6.2.")
