import json
import os
import uuid

def categorize_fines():
    yeni_path = 'src/data/cezalar_yeni.json'
    hedef_path = 'src/data/cezalar.json'

    if not os.path.exists(yeni_path):
        print(f"File not found: {yeni_path}")
        return

    with open(yeni_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    categorized = {
        "Sayfa1": [],
        "Sayfa2": [],
        "İPC": []
    }

    for item in data:
        ihlal = str(item.get("ihlal_nedeni", "")).lower()
        
        # Determine category based on keywords
        if "yetiştiricilik" in ihlal or "tesis" in ihlal or "kuluçkahane" in ihlal or "barınak" in ihlal or "akarsu" in ihlal or "su ürünleri işletmelerinde" in ihlal or "hijyen" in ihlal or "arıtma" in ihlal:
            category = "Sayfa2"
        elif "zaman" in ihlal or "yasak" in ihlal or "sportif" in ihlal or "amatör" in ihlal:
            category = "İPC"
        else:
            category = "Sayfa1"

        # Give item a unique ID to avoid React key errors and support editing
        if "id" not in item:
            item["id"] = str(uuid.uuid4())

        # Ensure all fields are strings or correct types to avoid React rendering object errors
        for key in item:
            if item[key] is None:
                item[key] = ""
            elif isinstance(item[key], float) and str(item[key]) == 'nan':
                item[key] = ""
            else:
                item[key] = str(item[key])

        categorized[category].append(item)

    with open(hedef_path, 'w', encoding='utf-8') as f:
        json.dump(categorized, f, indent=2, ensure_ascii=False)

    print(f"Categorized {len(data)} fines into:")
    print(f"Sayfa1: {len(categorized['Sayfa1'])}")
    print(f"Sayfa2: {len(categorized['Sayfa2'])}")
    print(f"İPC: {len(categorized['İPC'])}")

if __name__ == '__main__':
    categorize_fines()
