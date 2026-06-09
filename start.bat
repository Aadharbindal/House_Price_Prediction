@echo off
title House Price Prediction — Server
color 0A

echo.
echo  ═══════════════════════════════════════════════════
echo    Starting House Price Prediction Server...
echo    URL: http://127.0.0.1:8000
echo  ═══════════════════════════════════════════════════
echo.

cd backend
node server.js

pause
