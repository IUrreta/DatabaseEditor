@echo off
REM Ejecutar server.py en la carpeta "back" usando Python

for %%I in ("%CD%") do set "last_folder=%%~nI"
if "%last_folder%" NEQ "launcher" (
    cd launcher
)

set /p version=<version.conf
echo Version: %version%
cd ..

cd backend/dist/back
start "" /B back.exe
cd ../../..


REM Instalar las dependencias y ejecutar "npm start" en la carpeta actual
call npm install --no-audit
call npm start

taskkill /F /IM back.exe