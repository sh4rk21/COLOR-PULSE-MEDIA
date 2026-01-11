# Color Pulse Media - Landing Page

Landing page B2B premium pour Color Pulse Media - Acteur média opérationnel.

## 🚀 Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl (FR/EN)
- **Animations**: CSS + IntersectionObserver (reveal on scroll)

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🌍 Langues

Le site est disponible en français et anglais:
- Français: http://localhost:3000/fr
- English: http://localhost:3000/en

## 📝 Structure du Projet

```
├── app/
│   ├── [locale]/          # Routing i18n
│   │   ├── layout.tsx     # Layout global avec SEO
│   │   ├── page.tsx       # Page d'accueil
│   │   └── globals.css    # Styles globaux
│   ├── sitemap.ts         # Génération sitemap
│   └── robots.ts          # Fichier robots.txt
├── components/
│   ├── layout/
│   │   └── Header.tsx     # Header avec navigation + langue toggle
│   └── sections/
│       ├── Hero.tsx       # Section Hero avec KPIs
│       ├── Services.tsx   # Section Services (4 piliers)
│       ├── Showcase.tsx   # Section Showcase projets/médias
│       ├── About.tsx      # Section About (Why Us)
│       ├── Contact.tsx    # Section Contact avec formulaire
│       └── Footer.tsx     # Footer
├── i18n/
│   ├── request.ts         # Configuration i18n
│   └── routing.ts         # Routing i18n
├── lib/
│   └── structuredData.ts  # Structured data JSON-LD
├── messages/
│   ├── fr.json           # Traductions français
│   └── en.json           # Traductions anglais
└── middleware.ts         # Middleware i18n
```

## 🎨 Design System

### Typographie
- **Hero**: clamp(3rem, 8vw, 6rem) - Font weight 900
- **Section**: clamp(2.5rem, 6vw, 4.5rem) - Font weight 800
- **Subsection**: clamp(1.75rem, 4vw, 3rem) - Font weight 700

### Espacements
- **Section padding**: clamp(80px, 12vw, 160px)
- **Block padding**: clamp(60px, 8vw, 120px)

### Couleurs
- **Primary**: #0A0A0A (noir)
- **Accent**: #FF4D4D (rouge)
- **Accent Hover**: #FF3333

## ✨ Fonctionnalités

### Animations
- Reveal on scroll avec IntersectionObserver
- Stagger effects (délais progressifs entre éléments)
- Respect de `prefers-reduced-motion` (accessibilité)

### Accessibilité (WCAG 2.1 AA)
- Navigation clavier complète (Tab, Enter, Space)
- Focus visible sur tous les éléments interactifs
- Contrastes de couleurs conformes (ratio 4.5:1)
- Support lecteurs d'écran (balisage sémantique HTML5)
- Respect `prefers-reduced-motion`

### SEO
- Meta tags complets (title, description, OG, Twitter)
- Sitemap.xml généré automatiquement
- Balises hreflang FR/EN
- Structured data JSON-LD (Organization, WebSite, WebPage)
- URLs canoniques
- Open Graph image générée dynamiquement

## 🚢 Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Variables d'environnement

Créer un fichier `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://colorpulsemedia.com
```

## 📊 Performance

Objectifs (Lighthouse):
- **Performance**: 90+
- **Accessibilité**: 90+
- **Best Practices**: 90+
- **SEO**: 100

Core Web Vitals:
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **INP**: < 200ms

## 🛠️ Scripts

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer le serveur de production
npm run start

# Linter
npm run lint
```

## 📝 Personnalisation

### Modifier les contenus

Les contenus sont dans `messages/fr.json` et `messages/en.json`.

### Modifier les médias du showcase

Éditer le tableau `medias` dans `components/sections/Showcase.tsx`:

```typescript
const medias = [
  {
    id: 1,
    name: 'Nom du média',
    description: 'Description du média',
    type: 'Blog', // Blog, Newsletter, Podcast
    url: 'https://exemple.com',
  },
  // ...
]
```

### Modifier les KPIs

Éditer les valeurs dans `messages/fr.json` et `messages/en.json`:

```json
"kpis": {
  "media_count": {
    "value": "12",
    "label": "Médias actifs"
  },
  // ...
}
```

## 📄 Licence

© 2026 Color Pulse Media. Tous droits réservés.
