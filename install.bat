@echo off
setlocal enabledelayedexpansion

title Adobe Discord RPC - Enhanced by Cane (Installer)
color 0b

echo =====================================================================
echo       Adobe Discord RPC - Enhanced Edition by Cane
echo       Repository: https://github.com/canefly/adobe-discord-rpc
echo =====================================================================
echo.

set "TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\com.tee.discord-rpc"
set "SRC_DIR=%~dp0"
:: Remove trailing backslash if present
if "%SRC_DIR:~-1%"=="\" set "SRC_DIR=%SRC_DIR:~0,-1%"

echo [1/3] Preparing target directory...
if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%" >nul 2>&1
)

echo [2/3] Installing extension files to:
echo       %TARGET_DIR%

:: Copy necessary directories
for %%D in (client-dist rpc_client-dist host CSXS icons libs) do (
    if exist "%SRC_DIR%\%%D" (
        echo       - Copying %%D...
        xcopy "%SRC_DIR%\%%D" "%TARGET_DIR%\%%D\" /E /I /Y /Q >nul 2>&1
    )
)

:: Copy root files
for %%F in (index.html rpc.html package.json README.md LICENSE) do (
    if exist "%SRC_DIR%\%%F" (
        copy /Y "%SRC_DIR%\%%F" "%TARGET_DIR%\" >nul 2>&1
    )
)

echo.
echo [3/3] Configuring Windows Registry (PlayerDebugMode)...
:: Set PlayerDebugMode for Adobe CSXS 9 through 17
for /L %%V in (9,1,17) do (
    reg add "HKCU\Software\Adobe\CSXS.%%V" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
)

echo.
echo =====================================================================
echo [SUCCESS] Adobe Discord RPC has been installed successfully!
echo.
echo Next steps:
echo 1. Launch Adobe After Effects or Premiere Pro.
echo 2. Navigate to the top menu:
echo    Window -^> Extensions -^> Discord RPC
echo 3. Enjoy real-time presence with fake elapsed time spoofing!
echo =====================================================================
echo.
pause
