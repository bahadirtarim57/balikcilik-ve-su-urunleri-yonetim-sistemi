import fitz  # PyMuPDF
import urllib.request
import json
import re

url = "https://www.mevzuat.gov.tr/MevzuatMetin/1.5.1380.pdf"
file_path = "1380_kanun.pdf"
print("Downloading PDF...")

req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
)

with urllib.request.urlopen(req) as response, open(file_path, 'wb') as out_file:
    data = response.read()
    out_file.write(data)

print("Opening PDF...")
doc = fitz.open(file_path)
text = ""
for page in doc:
    text += page.get_text("text") + "\n"

# Clean up headers and footers that interrupt text
text = re.sub(r'Mevzuat\s*Tarihi\s*:\s*.*?\n', '', text, flags=re.IGNORECASE)
text = re.sub(r'Mevzuat\s*No\s*:\s*\d+.*?\n', '', text, flags=re.IGNORECASE)
text = re.sub(r'Mevzuat\s*Tertibi\s*:\s*.*?\n', '', text, flags=re.IGNORECASE)
text = re.sub(r'Sayfa\s*\d+', '', text, flags=re.IGNORECASE)

# Extract sections
# Match "Madde X", "Ek Madde X", "Geçici Madde X"
pattern = re.compile(r'((?:Ek\s+|Geçici\s+)?Madde\s+(\d+[A-Z]?)\s*[-–].*?)(?=(?:Ek\s+|Geçici\s+)?Madde\s+\d+[A-Z]?\s*[-–]|Yürürlük|Yürütme|$)', re.DOTALL | re.IGNORECASE)

articles = []
for match in pattern.finditer(text):
    full_text = match.group(1).strip()
    madde_no = match.group(2)
    
    # Try to determine if it is Ek or Geçici
    prefix = ""
    first_line = full_text.split('\n')[0]
    if 'Ek Madde' in first_line:
        prefix = "Ek "
    elif 'Geçici Madde' in first_line:
        prefix = "Geçici "
        
    madde_key = prefix + str(madde_no)
    madde_title = first_line.split('-')[0].split('–')[0].strip()
    
    articles.append({
        "madde": madde_key,
        "baslik": madde_title,
        "icerik": full_text
    })

with open("src/data/law_articles.json", "w", encoding="utf-8") as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(articles)} articles and saved to src/data/law_articles.json.")
