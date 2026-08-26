@echo off
npm run build
git add dist -f
git add .
git commit -m "dist guncellemesi"
git push origin master