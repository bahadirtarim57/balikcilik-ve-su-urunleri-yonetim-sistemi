import json
import re

with open('temp_reg2.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Load existing JSON
with open('src/data/regulation_articles.json', 'r', encoding='utf-8') as f:
    articles = json.load(f)

# Remove the incomplete Madde 41
if articles and articles[-1]['madde'] == '41':
    articles.pop()

# Pattern to match "(Geçici |Ek )?Madde X- "
pattern = re.compile(r'((?:Geçici\s+|Ek\s+)?Madde\s+(\d+)\s*[-–].*?)(?=(?:Geçici\s+|Ek\s+)?Madde\s+\d+\s*[-–]|$)', re.DOTALL | re.IGNORECASE)

for match in pattern.finditer(text):
    full_text = match.group(1).strip()
    madde_no = str(match.group(2))
    
    first_line = full_text.split('\n')[0]
    madde_title = first_line.split('-')[0].split('–')[0].strip()
    
    prefix = ""
    if 'Ek Madde' in first_line:
        prefix = "Ek "
    elif 'Geçici Madde' in first_line:
        prefix = "Geçici "
        
    articles.append({
        "madde": prefix + madde_no,
        "baslik": madde_title,
        "icerik": full_text
    })

with open('src/data/regulation_articles.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Updated regulation_articles.json. Total articles: {len(articles)}")
