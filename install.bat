@echo off
setlocal enabledelayedexpansion

title Adobe Discord RPC - Enhanced by Cane (Installer)
color 0b

echo =====================================================================
echo       Adobe Discord RPC - Enhanced Edition by Cane
echo       Repository: https://github.com/canefly/adobe-discord-rpc
echo =====================================================================
echo.

set "EXT=Adobe\CEP\extensions\com.tee.discord-rpc"
set "USER_DIR=%APPDATA%\%EXT%"
set "CF=%CommonProgramFiles(x86)%"
if not defined CF set "CF=%CommonProgramFiles%"
set "GLOBAL_DIR=%CF%\%EXT%"

set "SRC_DIR=%~dp0"
if "%SRC_DIR:~-1%"=="\" set "SRC_DIR=%SRC_DIR:~0,-1%"

:: The choice can be passed in as an argument (used when we relaunch as admin)
set "CHOICE=%~1"
if defined CHOICE goto :have_choice

echo Where should the extension be installed?
echo.
echo   [1] Only for me          %USER_DIR%
echo   [2] All users            %GLOBAL_DIR%
echo                            (needs Administrator)
echo   [3] Both
echo.
echo Tip: if Discord status doesn't update, an old copy may be hiding in the
echo other folder. Adobe loads extensions from both places.
echo.
set /p "CHOICE=Choose 1, 2 or 3 [1]: "
if not defined CHOICE set "CHOICE=1"

:have_choice
if "%CHOICE%"=="1" goto :admin_ok
if "%CHOICE%"=="2" goto :need_admin
if "%CHOICE%"=="3" goto :need_admin
echo Invalid choice "%CHOICE%". Please run the script again and choose 1, 2 or 3.
pause
exit /b 1

:need_admin
net session >nul 2>&1
if %errorlevel%==0 goto :admin_ok
echo.
echo Administrator rights are needed for the all-users folder.
echo A permission prompt will open - please accept it...
powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -ArgumentList '%CHOICE%' -Verb RunAs"
exit /b

:admin_ok
echo.
if "%CHOICE%"=="1" call :install "%USER_DIR%"
if "%CHOICE%"=="2" call :install "%GLOBAL_DIR%"
if "%CHOICE%"=="3" call :install "%USER_DIR%"
if "%CHOICE%"=="3" call :install "%GLOBAL_DIR%"

echo.
echo [Registry] Configuring PlayerDebugMode (Adobe CSXS 9 through 17)...
for /L %%V in (9,1,17) do (
    reg add "HKCU\Software\Adobe\CSXS.%%V" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
)

:: Warn about a copy left behind in the folder we did NOT install to
if "%CHOICE%"=="1" if exist "%GLOBAL_DIR%\CSXS\manifest.xml" echo [!] Another copy exists at %GLOBAL_DIR% - Adobe may load that one instead. Re-run and choose 2 or 3 to update it too.
if "%CHOICE%"=="2" if exist "%USER_DIR%\CSXS\manifest.xml" echo [!] Another copy exists at %USER_DIR% - Adobe may load that one instead. Re-run and choose 1 or 3 to update it too.

echo.
echo =====================================================================
echo [SUCCESS] Adobe Discord RPC has been installed successfully!
echo.
echo Next steps:
echo 1. Restart After Effects, Premiere Pro, Photoshop, etc.
echo 2. Navigate to the top menu:
echo    Window -^> Extensions -^> Discord RPC
echo 3. Open the Config tab to try the new Fun Features.
echo =====================================================================
echo.
pause
exit /b 0

:install
set "TARGET_DIR=%~1"
echo Installing extension files to:
echo       %TARGET_DIR%
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%" >nul 2>&1

for %%D in (client-dist rpc_client-dist host CSXS icons libs) do (
    if exist "%SRC_DIR%\%%D" (
        echo       - Copying %%D...
        xcopy "%SRC_DIR%\%%D" "%TARGET_DIR%\%%D\" /E /I /Y /Q >nul 2>&1
    )
)

for %%F in (index.html rpc.html package.json README.md LICENSE) do (
    if exist "%SRC_DIR%\%%F" copy /Y "%SRC_DIR%\%%F" "%TARGET_DIR%\" >nul 2>&1
)
exit /b 0
