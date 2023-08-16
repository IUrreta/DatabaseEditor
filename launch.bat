@echo off
REM Ejecutar server.py en la carpeta "back" usando Python

set /p version=<version.conf
echo Version: %version%

cd back
pip install websockets
start "" /B py back.py
cd ..

REM Instalar las dependencias y ejecutar "npm start" en la carpeta actual
call npm install --no-audit
call npm start

taskkill /F /IM python.exe