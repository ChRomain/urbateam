# Guide Déploiement — VPS OVH + Urbateam

## 1. Créer le VPS OVH

1. Aller sur [ovhcloud.com](https://www.ovhcloud.com/fr/vps/) → **VPS Starter** (~6€/mois)
2. Système : **Ubuntu 24.04 LTS**
3. Localisation : **Gravelines (GRA)** ou **Roubaix (RBX)** 🇫🇷
4. Activer la **clé SSH** lors de la commande (ou en ajouter une après)

---

## 2. Premier accès et configuration du serveur

```bash
# Connexion SSH (remplacer avec ton IP OVH)
ssh ubuntu@VOTRE_IP_OVH

# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Vérification
docker --version
docker compose version
```

---

## 3. Cloner le dépôt sur le VPS

```bash
# Créer le répertoire du projet
sudo mkdir -p /opt/urbateam
sudo chown $USER:$USER /opt/urbateam

# Cloner le repo GitHub (remplacer avec ton URL)
git clone https://github.com/TON_COMPTE/urbateam.git /opt/urbateam
cd /opt/urbateam
```

---

## 4. Créer le fichier .env.production

```bash
cd /opt/urbateam
cp .env.example .env.production
nano .env.production
```

Remplir toutes les valeurs :
```env
DIRECTUS_SECRET=CHANGER_AVEC_64_CARACTERES_ALEATOIRES
DIRECTUS_ADMIN_EMAIL=admin@urbateam.fr
DIRECTUS_ADMIN_PASSWORD=MOT_DE_PASSE_TRES_SECURE
DB_DATABASE=urbateam
DB_USER=urbateam
DB_PASSWORD=MOT_DE_PASSE_DB_SECURE
DIRECTUS_API_TOKEN=TOKEN_GENERE_DANS_DIRECTUS
NEXT_PUBLIC_DIRECTUS_URL=https://admin.urbateam.fr
```

> **Générer une clé secrète Directus :**
> ```bash
> openssl rand -hex 32
> ```

---

## 5. Configurer le DNS chez OVH

Dans le panneau DNS OVH, ajouter :

| Sous-domaine | Type | Valeur |
|---|---|---|
| `urbateam.fr` | A | `VOTRE_IP_OVH` |
| `www.urbateam.fr` | A | `VOTRE_IP_OVH` |
| `admin.urbateam.fr` | A | `VOTRE_IP_OVH` |

Attendre la propagation DNS (5 à 30 minutes).

---

## 6. Premier démarrage (sans SSL)

Avant d'activer SSL, démarrer temporairement sans Nginx pour obtenir les certificats :

```bash
cd /opt/urbateam

# Démarrer PostgreSQL + Directus d'abord
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production \
  up -d postgres directus

# Attendre ~30 secondes que Directus initialise la DB
sleep 30

# Générer les certificats SSL (remplacer les emails et domaines)
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@urbateam.fr \
  --agree-tos \
  --no-eff-email \
  -d urbateam.fr \
  -d www.urbateam.fr

docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@urbateam.fr \
  --agree-tos \
  --no-eff-email \
  -d admin.urbateam.fr
```

---

## 7. Démarrage complet avec SSL

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  --env-file .env.production \
  up -d --build
```

Vérifier que tout tourne :
```bash
docker compose ps
# Tous les services doivent être "Up"
```

---

## 8. Migrer les données JSON vers Directus

Depuis ta machine locale (pas le VPS) :

```bash
# S'assurer que Directus local tourne
npm run docker:up
sleep 30

# Copier le .env.example en .env.local et remplir
cp .env.example .env.local

# Lancer la migration
npm run seed
```

> Ou directement sur le VPS une fois déployé, en pointant vers `https://admin.urbateam.fr`.

---

## 9. Configurer le CI/CD GitHub Actions

Dans ton dépôt GitHub → **Settings → Secrets and variables → Actions** :

| Secret | Valeur |
|---|---|
| `VPS_HOST` | Ton IP OVH (ex: `51.210.x.x`) |
| `VPS_USER` | `ubuntu` (ou ton user SSH) |
| `VPS_SSH_KEY` | Contenu de ta clé SSH privée (`~/.ssh/id_rsa`) |
| `VPS_PORT` | `22` (optionnel) |

**Générer une clé SSH dédiée pour le déploiement :**
```bash
# Sur ta machine locale
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/urbateam_deploy

# Copier la clé publique sur le VPS
ssh-copy-id -i ~/.ssh/urbateam_deploy.pub ubuntu@VOTRE_IP_OVH

# Le contenu de ~/.ssh/urbateam_deploy va dans le secret VPS_SSH_KEY
cat ~/.ssh/urbateam_deploy
```

---

## 10. Générer le token API Directus

1. Aller sur `https://admin.urbateam.fr`
2. Se connecter avec les credentials admin
3. **Settings → API Access Tokens → Create Token**
4. Nom : "Next.js Read Only", accès : **Lecture seule** sur les collections publiques
5. Copier le token dans `.env.production` → `DIRECTUS_API_TOKEN=...`
6. Relancer : `docker compose ... up -d --build nextjs`

---

## Commandes utiles sur le VPS

```bash
# Voir les logs en temps réel
docker compose logs -f nextjs
docker compose logs -f directus

# Redémarrer un service
docker compose restart nextjs

# Voir l'état des conteneurs
docker compose ps

# Forcer un redéploiement manuel
cd /opt/urbateam && git pull && docker compose \
  -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production \
  up -d --build
```
