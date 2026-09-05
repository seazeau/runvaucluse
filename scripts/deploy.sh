#!/bin/bash

# Configuration
HOST="89.117.169.57"
USER="u488549652"
PORT="65002"
REMOTE_PATH="public_html"

echo "🚀 Construction du projet Next.js..."
npm run build

echo "📤 Déploiement vers Hostinger ($USER@$HOST:$PORT)..."
# Note: Le mot de passe sera demandé. Pour l'automatiser totalement, utilisez une clé SSH.
scp -P $PORT -r out/* $USER@$HOST:$REMOTE_PATH/

echo "✅ Déploiement terminé !"
