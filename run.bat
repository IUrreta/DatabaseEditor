@echo off
REM Ejecutar server.py en la carpeta "back" usando Python

for %%I in ("%CD%") do set "last_folder=%%~nI"
if "%last_folder%" NEQ "launcher" (
    cd launcher
)

set /p version=<version.conf
echo Version: %version%
cd ..

cd back
if not exist "DBEditor" (
    echo No virtual environment found, creating one...
    python -m venv DBEditor
    echo Virtual environment created.
) else (
    echo Virtual enviorment found.
)

call DBEditor\Scripts\activate

if exist "requirements.txt" (
    echo Installing requirements...
    pip install -r requirements.txt
) else (
    echo requirements.txt not found.
)
start "" /B python back.py
cd ../


REM Instalar las dependencias y ejecutar "npm start" en la carpeta actual
call npm install --no-audit
call npm start

taskkill /F /IM python.exe