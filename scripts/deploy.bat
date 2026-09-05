@echo off
echo --- Construction du projet ---
call npm run build
if %errorlevel% neq 0 (
    echo Le build a echoue !
    exit /b %errorlevel%
)

echo --- Deploiement vers Hostinger ---
cd out
:: On envoie tout le contenu du dossier out vers domains/runvaucluse.fr/public_html
scp -P 65002 -r . u488549652@89.117.169.57:domains/runvaucluse.fr/public_html/

cd ..

echo --- Deploiement termine avec succes ! ---
pause
