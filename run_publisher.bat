@echo off
cd /d "%~dp0"
python "%~dp0ahazone_publisher.py" %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start Python script.
    pause
)
