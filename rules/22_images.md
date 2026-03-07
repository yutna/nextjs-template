# Images Folder Style Guide

This guide defines how to organize static image assets inside:

- `src/shared/images`
- `src/modules/<module-name>/images`

Use these folders for source-owned static image assets such as logos, icons, banners, illustrations, and similar files that belong to the application codebase.

## 1. Decide whether an asset belongs in `images`

Put an asset in an `images` folder when it does one or more of the following:

- is a static image owned by the app source
- belongs to one shared UI concern or one feature module
- is imported by components, containers, screens, or layouts
- should live near the code that owns its meaning

Examples:

- product or brand logos
- feature-specific icons
- hero or banner artwork
- empty-state illustrations
- decorative section images

Do **not** use `images` for:

- assets that need a stable public URL and are better owned by `public/`
- non-image files
- generated runtime files
- code wrappers, React components, or icon component implementations

Rule of thumb:

- if the asset is source-owned and imported by app code, `images/` is usually correct
- if the asset is primarily served by URL, `public/` is usually correct

## 2. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/images`

Prefer module-level image assets when the asset is owned by one feature module.

Good fits:

- a checkout banner
- a dashboard empty-state illustration
- a profile feature logo variant used only in that module

Examples:

- `src/modules/checkout/images/banner-payment-success.webp`
- `src/modules/dashboard/images/empty-state-analytics.svg`

### `src/shared/images`

Promote an asset to shared only when it is truly cross-module or app-wide.

Good fits:

- primary brand logos
- app-wide decorative assets
- shared empty-state or onboarding artwork
- shared icon files that are not module-specific

Examples:

- `src/shared/images/logo-brand.svg`
- `src/shared/images/banner-auth.webp`

Avoid moving module-owned assets into `shared` too early. Promote only when:

- multiple unrelated modules use the same asset
- the asset is generic and not feature-branded
- shared ownership is clearer than module ownership

## 3. Relationship to `public/`

Use `public/` for assets that are primarily URL-addressed.

Good fits for `public/`:

- favicon and app icon files
- Open Graph or social share images referenced by metadata
- assets referenced by stable URL strings
- files used outside the React component tree
- assets that must be reachable directly by the browser at a known path

Examples:

- `public/favicon.ico`
- `public/og-image.png`
- `public/icons/icon-192.png`

Use `src/shared/images` or `src/modules/<module-name>/images` when:

- the asset is imported from TypeScript or TSX
- ownership belongs clearly to shared UI or one module
- colocating the asset with the owning source code improves clarity

Rule of thumb:

- import-based ownership -> `src/**/images`
- URL-based ownership -> `public/`

Do not duplicate the same asset in both `public/` and `src/**/images` unless there is a deliberate reason.

## 4. File and folder structure

Follow the project's kebab-case convention for files and folders.

Keep image folders simple and ownership-based.

### Flat structure for small sets

Use direct files when the folder has only a few assets:

```txt
src/shared/images/
├── logo-brand.svg
├── banner-auth.webp
└── icon-app-mark.svg
```

```txt
src/modules/dashboard/images/
├── banner-analytics.webp
└── empty-state-analytics.svg
```

### Subfolders for one clear concern

Introduce subfolders only when they help group one clear asset concern.

```txt
src/shared/images/brand/
├── logo-brand.svg
└── logo-brand-mark.svg

src/modules/checkout/images/payment/
├── banner-success.webp
└── icon-card.svg
```

Rules:

- keep folder structure shallow and obvious
- group by ownership or concern, not by vague buckets
- use subfolders only when they improve clarity
- do not create `index.ts` or barrel exports for image folders
- do not mix unrelated asset families in one subfolder

## 5. Naming

Name assets by what they represent, not by where they happen to be used.

Prefer:

- `logo-brand.svg`
- `logo-brand-mark.svg`
- `icon-search.svg`
- `banner-auth.webp`
- `empty-state-orders.svg`
- `illustration-onboarding-step-1.svg`

Avoid:

- `image1.png`
- `icon-new.svg`
- `banner-final-final.webp`
- `temp-logo.svg`
- `shared-banner.png`

Rules:

- use kebab-case
- include the asset role in the name when it helps clarity, such as `logo-`, `icon-`, `banner-`, `illustration-`, or `empty-state-`
- make names meaningful outside their immediate file location
- prefer stable names over workflow or revision names such as `final`, `v2`, or `new`

## 6. Format guidance

Choose the simplest format that fits the asset.

Prefer:

- `svg` for logos, icons, and vector illustrations
- `webp` or `avif` for banners, photos, and raster artwork when supported by the asset pipeline
- `png` when transparency or source constraints make it the practical choice
- `jpg` or `jpeg` only when transparency is unnecessary and the source is photographic

Use formats intentionally:

- do not convert everything to one format for consistency alone
- do not use large raster files for simple vector assets
- avoid low-signal duplicates of the same asset in many formats unless they serve a real purpose

## 7. Usage guidance

Use source image folders as asset ownership folders, not as code folders.

- import image assets from `src/**/images` when they are owned by app code
- keep image rendering logic in components, containers, screens, or layouts
- keep raw assets separate from code that renders them
- do not store React icon components in `images/`

Good:

```tsx
import Image from "next/image";

import bannerAuth from "@/shared/images/banner-auth.webp";

export function HeroBanner() {
  return <Image alt="" src={bannerAuth}  />;
}
```

Also good:

```tsx
import Image from "next/image";

import illustrationOrderSuccess from "@/modules/orders/images/illustration-order-success.webp";

export function OrdersEmptyState() {
  return <Image alt="" src={illustrationOrderSuccess}  />;
}
```

For `public/` assets, use URL paths when direct public serving is the reason the asset lives there.

## 8. Optimization and quality

Keep image assets intentional and lightweight.

- prefer optimized source files over oversized originals
- avoid committing very large files when a smaller export would preserve quality
- keep exact duplicates out of the repository
- use descriptive alt text at the rendering site, not in the asset file name
- review whether a shared asset should become module-owned, or vice versa, as the UI evolves

## 9. Boundaries with other folders

This guide stays focused on `images`, so adjacent folders are mentioned here only to define boundaries.

- use `images/` for raw static image assets
- use UI folders for code that renders those assets
- use `public/` for URL-addressed assets

If the item is code, it does not belong in `images/`.

## 10. Example patterns

### Good shared images folder

```txt
src/shared/images/
├── brand/
│   ├── logo-brand.svg
│   └── logo-brand-mark.svg
├── banner-auth.webp
└── icon-app-mark.svg
```

Why it fits:

- shared ownership is clear
- names are descriptive
- structure stays shallow

### Good module images folder

```txt
src/modules/orders/images/
├── banner-orders-summary.webp
└── illustration-order-success.webp
```

Why it fits:

- assets are owned by one module
- no unnecessary barrel or code wrapper is added
- file names still make sense when imported elsewhere

### Good `public/` assets

```txt
public/
├── favicon.ico
├── og-image.png
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

Why it fits:

- assets are URL-addressed
- browser and metadata use cases are clear
- they do not need source-level ownership under one module

## 11. Final checklist

Before adding an asset, check:

- is it a static image asset rather than code?
- does it belong to one module first, or is it truly shared?
- should it live in `src/**/images` or in `public/`?
- is the file name descriptive and stable?
- is the format appropriate for the asset type?
- is the folder structure as shallow as possible while still clear?
