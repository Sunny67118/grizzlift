# Grizzlift 🐻

PWA iPhone qui guide les séances pas à pas : exercice → chrono de récupération → exercice suivant.
Vanilla JS, aucune dépendance, aucune étape de build.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Coquille de l'app (meta iOS plein écran) |
| `data.js` | **Contenu des séances** : exercices, séries, reps, repos, fiches ℹ︎ |
| `app.js` | Moteur : écrans, chrono à horodatage absolu, bips, sauvegarde, Wake Lock |
| `styles.css` | Thème sombre, gros boutons |
| `sw.js` | Service Worker (hors-ligne complet) |
| `manifest.webmanifest`, `icons/` | Installation sur l'écran d'accueil |
| `assets/exercises/` | Images/GIF des exercices (optionnel) |

## Tester en local

```bash
python3 -m http.server 8765
# puis http://localhost:8765
```

## Mettre en ligne (HTTPS gratuit)

- **Netlify Drop** (le plus simple) : glisser le dossier sur https://app.netlify.com/drop.
- **GitHub Pages** : pousser le dossier dans un dépôt, puis *Settings › Pages › Deploy from branch*.
  Tous les chemins sont relatifs, donc l'app marche aussi dans un sous-dossier (`/grizzlift/`).

Sur iPhone, ouvrir l'URL dans **Safari**, puis **Partager › Sur l'écran d'accueil**.

## Ajouter les visuels d'exercice

Déposer `assets/exercises/<id>.webp`, où `<id>` est l'`id` de l'exercice dans `data.js`
(ex. `assets/exercises/dips_leste.webp`). Pour un GIF ou un autre nom, ajouter
`image: 'mon-fichier.gif'` à l'exercice. Sans fichier, un pictogramme s'affiche.
Les deux côtés d'un étirement partagent une image (`couch_stretch.webp`, `ischio.webp`, `quad_debout.webp`).

## Modifier une séance

Tout se passe dans `data.js`. Après une modification, l'iPhone affiche l'ancienne version une fois
(réponse instantanée depuis le cache), puis la nouvelle au lancement suivant. Pour forcer, changer
`CACHE` dans `sw.js` (`grizzlift-v2`, …).

Pour verrouiller une séance (ex. Legs si le genou fait mal) : ajouter `locked: true` et
`lockedLabel: '…'` ; la carte reste visible mais grisée.

## Comportements iOS à connaître

- **Musique** : les bips passent par Web Audio avec `navigator.audioSession.type = "ambient"` :
  Spotify et Apple Music ne sont ni coupés ni mis en pause. Réglage ⚙️ « Prioritaires » : la musique
  baisse brièvement pendant le bip. En mode « Mixés », les bips sont muets si l'iPhone est en mode silencieux.
- **Écran verrouillé** : iOS suspend les apps web, donc aucun bip ne peut sonner écran verrouillé.
  L'app garde l'écran allumé pendant la séance (Wake Lock, iOS 18.4+ en mode écran d'accueil).
  Si l'écran se verrouille quand même, le chrono reste exact au déverrouillage.
- **Reprise** : la séance est sauvegardée à chaque action ; si iOS recharge l'app, elle reprend
  à la seconde près (y compris l'avancement automatique de la Mobilité).
- **Vibration** : l'API Vibration n'existe pas sur iPhone. L'app utilise à la place un retour
  haptique via un interrupteur HTML (Safari 18+), sans garantie ; le bip reste le signal principal.
- **Activer le son** : iOS exige un toucher d'écran pour démarrer l'audio. Si l'app a été rechargée
  pendant une séance, un bandeau « Touche l'écran pour activer les bips » s'affiche.
