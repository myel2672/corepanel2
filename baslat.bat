@echo off
start cmd /k "cd /d C:\Users\Lenovo\corepanel\server && npm run dev"
timeout /t 3 /nobreak
start cmd /k "cd /d C:\Users\Lenovo\corepanel\client && npm run dev"
timeout /t 3 /nobreak
start chrome http://localhost:5173
