@echo off
echo Starting Pelindo TNA System...
echo.

echo Starting Backend...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..

echo.
echo Starting Frontend...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo System is starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this script...
pause >nul
