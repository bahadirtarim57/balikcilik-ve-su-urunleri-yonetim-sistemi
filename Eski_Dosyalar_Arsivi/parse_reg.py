import json
import re

with open('temp_reg.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Pattern to match "Madde X- " or "Madde X -" and extract until the next Madde
pattern = re.compile(r'(Madde\s+(\d+)\s*[-–].*?)(?=Madde\s+\d+\s*[-–]|$)', re.DOTALL | re.IGNORECASE)

articles = []
for match in pattern.finditer(text):
    full_text = match.group(1).strip()
    madde_no = str(match.group(2))
    
    # In the text, there are headings BEFORE the Madde. We won't easily capture those cleanly without complex logic, 
    # but we can just use "Madde X" as title.
    first_line = full_text.split('\n')[0]
    madde_title = first_line.split('-')[0].split('–')[0].strip()
    
    articles.append({
        "madde": madde_no,
        "baslik": madde_title,
        "icerik": full_text
    })

with open('src/data/regulation_articles.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Parsed {len(articles)} articles.")
