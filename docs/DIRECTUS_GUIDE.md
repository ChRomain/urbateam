# Guide CMS Directus — Urbateam

## Accès à l'interface

- **Local** : http://localhost:8055
- **Production** : https://admin.urbateam.fr
- **Login** : `admin@urbateam.fr` / mot de passe configuré dans `.env`

---

## Collections disponibles

| Collection | Description | Champs clés |
|---|---|---|
| **articles** | Articles du blog | `slug`, `title`, `excerpt`, `content` (HTML), `featured_image`, `tags`, `date_published` |
| **projets** | Réalisations | `slug`, `title`, `description`, `location`, `category`, `missions`, `image_before`, `image_after` |
| **clients** | Références clients | `name`, `logo`, `tags` |
| **partenaires** | Partenaires | `name`, `logo`, `url` |
| **faq** | FAQ | `question`, `answer`, `category` |

---

## Publier un article de blog

1. Aller dans **Content → articles**
2. Cliquer sur **"+ Create Item"**
3. Remplir les champs :
   - **Slug** : identifiant URL unique (ex: `mon-nouvel-article`) — pas d'espaces, pas de majuscules
   - **Title** : titre de l'article
   - **Excerpt** : résumé court (150-200 caractères, utilisé pour le SEO)
   - **Content** : contenu complet en HTML (éditeur WYSIWYG disponible)
   - **Featured Image** : URL ou upload de l'image principale
   - **Tags** : mots-clés (ex: `Foncier`, `Scanner 3D`)
   - **Date Published** : date de publication
   - **Status** : mettre à `published` pour publier
4. Sauvegarder → l'article apparaît sur le site dans les **60 secondes**

---

## Ajouter une réalisation (projet)

1. **Content → projets → + Create Item**
2. Champs importants :
   - **Category** : `foncier`, `topographie`, `vrd`, `copropriete`, ou `urbanisme`
   - **Missions** : liste de missions (tags)
   - **Image Before/After** : URLs des photos avant/après
3. Status `published` → visible sur le site

---

## Upload d'images

Directus gère ses propres assets. Pour les images :

1. Aller dans **File Library** (icône photos dans le menu)
2. Uploader une image
3. Copier l'ID de l'asset (UUID)
4. Dans un article, utiliser l'URL : `https://admin.urbateam.fr/assets/UUID_DE_L_IMAGE`

> **Conseil** : Pour les images existantes déjà dans `/public/uploads/`, elles continueront de fonctionner (elles restent dans le dossier public de Next.js).

---

## Gestion des droits d'accès

Par défaut, toutes les collections sont **privées** (nécessitent un token pour la lecture).

Pour permettre la lecture publique des collections :
1. **Settings → Roles & Permissions → Public**
2. Pour chaque collection (`articles`, `projets`, `clients`) : activer **Read**
3. Filtrer sur `status = published`

> Ou utiliser le **token API statique** configuré dans `.env` (approche recommandée, plus sécurisée).

---

## ISR — Délai d'apparition du contenu

Le contenu est mis à jour automatiquement sur le site toutes les **60 secondes** (ISR configuré dans Next.js).

Si tu veux une mise à jour immédiate :
- En local : relancer `npm run dev`
- En production : appeler l'API de revalidation ou attendre 60s

---

## FAQ dépannage

**Q : J'ai mis un article en "published" mais il n'apparaît pas sur le site**
→ Attendre 60 secondes (délai ISR). Vérifier que le `slug` est unique et que le `status = published`.

**Q : L'interface Directus est inaccessible**
→ Vérifier que Docker tourne : `docker compose ps`. Voir les logs : `docker compose logs directus`.

**Q : Une image ne s'affiche pas**
→ Vérifier que l'URL est correcte. Les images Directus sont servies via `/assets/UUID`. Les anciennes images `/uploads/...` restent servies par Next.js.
