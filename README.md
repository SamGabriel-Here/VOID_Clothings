# VOID Clothings

Streetwear brand storefront — **Black Flag, Phase 1**. A fast, self-contained single-page shop with a working cart.

**Live:** https://samgabriel-here.github.io/VOID_Clothings/

## Features

- Dark, monochrome streetwear design (Tailwind via CDN + custom CSS)
- Product grid rendered from a single catalog in `script.js`
- Cart drawer with add / remove / quantity, live subtotal, and **localStorage persistence** (survives refresh)
- Rupee (`en-IN`) price formatting
- Responsive layout, mobile menu, animated marquee, toast notifications
- No build step — just static files

## Structure

```
index.html          Markup + Tailwind config
style.css           Hero grid, marquee, scrollbar, motion
script.js           Product catalog + cart logic
assets/logo.svg     Wordmark
assets/products/    Placeholder product images (SVG)
```

## Run locally

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Swap in real assets

- Replace the SVGs in `assets/products/` (keep the filenames, or update the `image` paths in the `products` array in `script.js`).
- Replace `assets/logo.svg` with your logo.
- Edit product names/prices in the `products` array in `script.js`.

## Notes

Checkout is a front-end demo — it takes no payment. Wiring a real checkout (Stripe, Razorpay, Shopify) is the natural next step.
