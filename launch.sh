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
pip install websockets
pip install numpy
pip install pandas
pip install scikit-learn
python3 back.py &
cd ..

# Instalar las dependencias y ejecutar "npm start" en la carpeta actual
npm install --no-audit
npm start

# Matar el proceso python
pkill -f python3
