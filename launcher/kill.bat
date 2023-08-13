@echo off

REM Matar proceso de "npm start"
taskkill /F /IM node.exe

REM Matar proceso de "python"
taskkill /F /IM python.exe
