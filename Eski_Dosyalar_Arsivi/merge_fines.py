import json
import re
import ast

transcript_path = r"C:\Users\Bahadır\.gemini\antigravity\brain\67abb4d4-3652-45eb-b395-888b7ff806fb\.system_generated\logs\transcript.jsonl"
merged_fines = []

try:
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                step = json.loads(line)
                content = step.get("content", "")
                if "[Message]" in content and "content=[" in content:
                    parts = content.split("content=[", 1)
                    if len(parts) > 1:
                        json_part = "[" + parts[1]
                        if "</SYSTEM_MESSAGE>" in json_part:
                            json_part = json_part.split("</SYSTEM_MESSAGE>")[0]
                        json_part = json_part.strip()
                        
                        # Remove possible markdown ticks
                        if json_part.startswith("```json"):
                            json_part = json_part[7:]
                        elif json_part.startswith("```"):
                            json_part = json_part[3:]
                        if json_part.endswith("```"):
                            json_part = json_part[:-3]
                            
                        json_part = json_part.strip()
                        
                        try:
                            # strict=False allows unescaped control characters
                            fines = json.loads(json_part, strict=False)
                            if isinstance(fines, list):
                                merged_fines.extend(fines)
                        except Exception as e:
                            # If JSON decoding fails, try ast.literal_eval as a fallback
                            # JSON is very close to Python dicts, this sometimes works if there are minor syntax errors
                            try:
                                fines = ast.literal_eval(json_part)
                                if isinstance(fines, list):
                                    merged_fines.extend(fines)
                            except:
                                print(f"Failed to parse block completely")
                                pass
            except Exception as e:
                pass
except Exception as e:
    print(f"File error: {e}")

unique_fines = []
seen = set()
for fine in merged_fines:
    ihlal = str(fine.get("ihlal_nedeni", "")).strip()
    ceza = str(fine.get("para_cezasi_tl", "")).strip()
    key = (ihlal, ceza)
    if key not in seen:
        seen.add(key)
        unique_fines.append(fine)

output_path = r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\src\data\cezalar_yeni.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(unique_fines, f, ensure_ascii=False, indent=2)

with open(r"C:\Users\Bahadır\Desktop\1380_SAYILI_YASA_IHLALLERI\merge_log.txt", "w", encoding="utf-8") as f:
    f.write(f"Merged {len(merged_fines)} raw fines.\n")
    f.write(f"Unique fines: {len(unique_fines)}.\n")
