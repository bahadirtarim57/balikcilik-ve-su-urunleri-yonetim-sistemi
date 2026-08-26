import pandas as pd
import json

file1 = r"C:\Users\Bahadır\Desktop\Bahadır\1380 Sayılı Su Ürünleri Kanunu İhlaline İlişkin Ceza İşlemleri.xlsx"
file2 = r"C:\Users\Bahadır\Desktop\Bahadır\2022 YILI İDARİ PARA CEZALARI.xlsx"

def inspect_excel(filepath):
    print(f"\n--- Inspecting {filepath} ---")
    try:
        xls = pd.ExcelFile(filepath)
        print(f"Sheet names: {xls.sheet_names}")
        
        for sheet in xls.sheet_names[:5]: # inspect first 5 sheets
            df = pd.read_excel(filepath, sheet_name=sheet, nrows=5)
            print(f"\nSheet '{sheet}' columns:")
            print(df.columns.tolist())
            print(f"\nSheet '{sheet}' first 2 rows:")
            print(df.head(2).to_dict('records'))
    except Exception as e:
        print(f"Error: {e}")

inspect_excel(file1)
inspect_excel(file2)
