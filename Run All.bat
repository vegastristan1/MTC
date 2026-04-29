@echo off
echo ========================================
echo Starting MTC Server and Client...
echo ========================================
start "MTC Server" cmd /k "cd /d "%~dp0server" && npm start"
timeout /t 3 /nobread >nul
start "MTC Client" cmd /k "cd /d "%~dp0client" && npm start"
echo.
echo Both Server and Client are starting...
echo Server will run at: http://localhost:5000
echo Client will run at: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
