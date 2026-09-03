@echo off
title Balikcilik Ve Su Urunleri Sube Yonetimi Baslatici
color 0A
echo ===================================================
echo Balikcilik Ve Su Urunleri Sube Yonetim Sistemi Baslatiliyor...
echo.
echo Lutfen acilan YENI SIYAH PENCEREYI KAPATMAYIN!
echo O pencere acik kaldikca projeniz yerelde calisir.
echo ===================================================
echo.

cd /d "%USERPROFILE%\Desktop\Balikcilik_Ve_Su_Urunleri_Sube_Yonetimi"
start "Balikcilik Sunucusu" cmd /k "title Balikcilik Ve Su Urunleri && cd /d ""%USERPROFILE%\Desktop\Balikcilik_Ve_Su_Urunleri_Sube_Yonetimi"" && npm run dev"

echo Islem tamamlandi! Bu pencereyi kapatabilirsiniz.
pause
