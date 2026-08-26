import pandas as pd
import json

filepath = r"C:\Users\Bahadır\Desktop\Bahadır\1380 Sayılı Su Ürünleri Kanunu İhlaline İlişkin Ceza İşlemleri.xlsx"

try:
    df = pd.read_excel(filepath, sheet_name='Tüm Sayfalar (2-76)')
    print(df.head(15).to_string())
except Exception as e:
    print("Error:", e)
