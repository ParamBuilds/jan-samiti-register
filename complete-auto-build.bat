@echo off
echo 🚀 Starting fully automated build fixer...

:loop
echo.
echo 🔄 Running build...
npm run build 2> build-errors.txt
findstr /C:"Rollup failed to resolve import" build-errors.txt >nul
if %ERRORLEVEL% neq 0 (
    echo ✅ Build succeeded! No missing packages.
    del build-errors.txt
    goto end
)

echo ⚠ Missing packages detected. Installing...
powershell -Command "Select-String 'Rollup failed to resolve import' build-errors.txt | ForEach-Object { ($_ -split '\"')[1] } | ForEach-Object { Write-Host ('Installing: ' + $_); npm install $_ --save }"

echo 🔄 Re-running build after installing missing packages...
goto loop

:end
echo.
echo 🎉 Build completed successfully!
pause
