@echo off
setlocal

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

if exist "back.py" (
    echo Executing back.py...
    python back.py
) else (
    echo back.py not found.
)


endlocal
