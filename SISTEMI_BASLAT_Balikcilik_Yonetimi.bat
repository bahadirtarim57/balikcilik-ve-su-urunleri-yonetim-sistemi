@echo off
title 1380 Yasa Ihlalleri Baslatici
color 0A
echo ===================================================
echo 1380 Yasa Ihlalleri Projesi (Localhost) Baslatiliyor...
echo.
echo Lutfen acilan YENI SIYAH PENCEREYI KAPATMAYIN!
echo O pencere acik kaldikca projeniz yerelde calisir.
echo ===================================================
echo.

start "1380 Sunucusu" cmd /k "title 1380 Yasa Ihlalleri && npm run dev"

echo Islem tamamlandi! Bu pencereyi kapatabilirsiniz.
pause
