$HOST_NAME = "89.117.169.57"
$USER_NAME = "u488549652"
$REMOTE_PATH = "domains/runvaucluse.fr/public_html"


Write-Host "--- Construction du projet ---" -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Le build a echoue !"
    exit 1
}

Write-Host "--- Deploiement vers Hostinger ---" -ForegroundColor Cyan
# On se place dans le dossier out pour envoyer tout le contenu sans l'etoile *
Set-Location -Path "out"

# On construit la cible proprement
$TARGET = "${USER_NAME}@${HOST_NAME}:${REMOTE_PATH}/"

# On lance scp sur le point . (tout le contenu du dossier courant 'out')
scp -P $PORT -r . $TARGET

# On revient au dossier racine
Set-Location -Path ".."

if ($LASTEXITCODE -ne 0) {
    Write-Error "Le deploiement a echoue !"
    exit 1
}

Write-Host "--- Deploiement termine avec succes ! ---" -ForegroundColor Green
