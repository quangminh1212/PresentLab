@echo off
setlocal
cd /d "%~dp0"

set "LOGFILE=%CD%\log.txt"
type nul > "%LOGFILE%"
call :log "[LOG] Cleared the previous run log: %LOGFILE%"
call :log "[RUN] PresentLab local runner started."
call :log "[RUN] Project root: %CD%"

if not "%~1"=="" set "PORT=%~1"
if not defined PORT set "PORT=4173"
call :log "[CONFIG] Local server port: %PORT%"

call :log "[CHECK] Checking Node.js installation."
where node >> "%LOGFILE%" 2>&1
if errorlevel 1 goto node_missing
node --version >> "%LOGFILE%" 2>&1
if errorlevel 1 goto node_failed

call :log "[CHECK] Checking npm installation."
where npm >> "%LOGFILE%" 2>&1
if errorlevel 1 goto npm_missing
call npm --version >> "%LOGFILE%" 2>&1
if errorlevel 1 goto npm_failed

call :log "[DEPENDENCIES] Checking project dependencies."
if exist "node_modules\" goto dependencies_ready
call :log "[DEPENDENCIES] node_modules was not found; running npm ci."
call npm ci >> "%LOGFILE%" 2>&1
set "DEPENDENCY_EXIT_CODE=%ERRORLEVEL%"
if not "%DEPENDENCY_EXIT_CODE%"=="0" goto dependencies_failed
call :log "[DEPENDENCIES] npm ci completed successfully."

:dependencies_ready
call :log "[BUILD] Running the initial Vercel build."
call npm run vercel:build >> "%LOGFILE%" 2>&1
set "BUILD_EXIT_CODE=%ERRORLEVEL%"
if not "%BUILD_EXIT_CODE%"=="0" goto build_failed
call :log "[BUILD] Initial build completed successfully."

call :log "[SERVER] Starting the local server and file watchers."
node scripts\serve-local.mjs
set "EXIT_CODE=%ERRORLEVEL%"
call :log "[SERVER] Local server exited with code %EXIT_CODE%."
goto finish

:node_missing
call :log "[ERROR] Node.js was not found on PATH. Install Node.js 22 or newer."
set "EXIT_CODE=1"
goto finish

:node_failed
call :log "[ERROR] Node.js could not report its version."
set "EXIT_CODE=1"
goto finish

:npm_missing
call :log "[ERROR] npm was not found on PATH. Install npm 10.9 or newer."
set "EXIT_CODE=1"
goto finish

:npm_failed
call :log "[ERROR] npm could not report its version."
set "EXIT_CODE=1"
goto finish

:dependencies_failed
call :log "[ERROR] npm ci failed with exit code %DEPENDENCY_EXIT_CODE%. Review the output above in log.txt."
set "EXIT_CODE=1"
goto finish

:build_failed
call :log "[ERROR] The initial Vercel build failed with exit code %BUILD_EXIT_CODE%. Review the output above in log.txt."
set "EXIT_CODE=1"

:finish
call :log "[EXIT] Returning code %EXIT_CODE%."
exit /b %EXIT_CODE%

:log
echo [%date% %time%] %~1
>> "%LOGFILE%" echo [%date% %time%] %~1
exit /b 0
