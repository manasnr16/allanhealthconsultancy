# Allan Health Consultancy: website and mobile web app template

Plain HTML, CSS and JavaScript. No build step is needed to run it.

## Files
- `index.html`, `about-us.html`, `services.html`, `health-packages.html`, `gift-of-health-coupons.html`, `hospitals.html`, `blog.html`, `faqs.html`, `contact-us.html`
- `assets/css/styles.css`: design tokens at the top (colours, fonts, radii); light and dark themes
- `assets/js/main.js`: theme, language switch, menu, scroll animations, forms, FAQ and filters
- `manifest.webmanifest` + `sw.js`: installable PWA with an offline shell
- `sitemap.xml`, `robots.txt`, `.htaccess` (clean URLs on Apache; Netlify and Vercel do this automatically)

## Run locally
Use any static server, for example `npx serve .` or `python3 -m http.server`. The service worker only registers on http(s).

## Before launch (client to confirm)
1. Hospitals page: cards marked "Template placeholder" need real partner hospital names.
2. Blog page: cards marked "Sample post" need real articles.
3. Services > Travel, visa & accommodation: confirm the scope of visa documentation guidance.
4. Bengali strings in `main.js` (`I18N.bn`) are a starter set. Have a native speaker review them, then add Assamese as `I18N.as` and a button for it.
5. Contact form: set `data-endpoint` on the form to your backend URL (multipart POST). With no endpoint the form opens a pre-filled WhatsApp message instead.
6. Replace Google Fonts links with self-hosted fonts if you need fully offline or privacy-strict delivery.
7. Add real photography (hospital, team, arrival pickup) where the design leaves room for it.

## Editing the look
Change colours in the `:root` block of `styles.css`. Dark mode tokens are defined twice (OS setting and manual toggle). Motion respects `prefers-reduced-motion`.
