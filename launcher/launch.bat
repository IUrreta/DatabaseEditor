@echo off
REM Ejecutar server.py en la carpeta "back" usando Python
cd back
pip install websockets
start "" /B py back.py
cd ..

REM Instalar las dependencias y ejecutar "npm start" en la carpeta actual
call npm install
call npm start

taskkill /F /IM python.exe