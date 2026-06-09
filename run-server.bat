@echo off
title B.Tech Calculator Server
cd /d "%~dp0server"
echo =======================================================
echo   B.TECH STUDENT CALCULATOR - BACKEND SERVER
echo =======================================================
echo.
if not exist node_modules (
    echo Installing server dependencies, please wait...
    call npm install
)
echo Starting server...
echo.
echo -------------------------------------------------------
echo   To open the Calculator on this PC:
echo     http://localhost:5000/calculator/
echo.
echo   To access from ANY DEVICE on your local network:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "ipv4"') do (
    set ip=%%a
    goto :show_ip
)
:show_ip
set ip=%ip: =%
echo     http://%ip%:5000/calculator/
echo.
echo   To open the Database Dashboard:
echo     http://%ip%:5000/
echo -------------------------------------------------------
echo.
node server.js
pause
