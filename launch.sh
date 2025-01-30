#!/bin/bash

# Ejecutar server.py en la carpeta "back" usando Python
last_folder=$(basename "$PWD")
if [ "$last_folder" != "launcher" ]; then
    cd launcher || exit
fi

version=$(<version.conf)
echo "Version: $version"
cd ..

cd back

# Crear entorno virtual si no existe
if [ ! -d "DBEditor" ]; then
    echo "No virtual environment found, creating one..."
    python3 -m venv DBEditor
    echo "Virtual environment created."
else
    echo "Virtual environment found."
fi

# Activar el entorno virtual
source DBEditor/bin/activate

# Instalar dependencias si existe requirements.txt
if [ -f "requirements.txt" ]; then
    echo "Installing requirements..."
    pip install -r requirements.txt
else
    echo "requirements.txt not found."
fi

# Ejecutar el script back.py en segundo plano
python3 back.py &
cd ..

# Instalar las dependencias y ejecutar "npm start" en la carpeta actual
npm install --no-audit
npm start

# Matar el proceso python
pkill -f back.py
