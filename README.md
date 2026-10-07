# Pixelsprings — Homepage & WordPress Conversion Blueprint

> **Live Deployment Proof**: [https://jibranpcccc.github.io/pixelsprings-homepage/](https://jibranpcccc.github.io/pixelsprings-homepage/)  
> **React 18 SPA Version**: [https://jibranpcccc.github.io/pixelsprings-homepage/react-spa.html](https://jibranpcccc.github.io/pixelsprings-homepage/react-spa.html)

---

## 1. Executive Summary & Forensic Audit of Replit's Build

We conducted a deep audit of the Replit project (`PIXELSPRINGS-Homepage.zip`) against the 16-point final polish brief and the high-resolution screencapture PDF.

### ✅ What Replit Implemented Well:
1. **Design System & Typography**: Replit accurately respected the dual-font system specified in the brief—**Satoshi** (`400, 500, 600, 700`) for headers/display elements and **Plus Jakarta Sans** for body, FAQ, and UI text.
2. **Color Palette Contrast Safeguards**: Accurately implemented `--brand-lime: #BFFF00` (Pixelsprings electric lime) paired with deep forest green `--green: #3e6326` on white backgrounds to ensure WCAG AA readability.
3. **Structured Content Accuracy**: 
   - 3-step rhythm (*01 Choose Your Plan, 02 Share Your Vision, 03 Review, Refine & Deliver*).
   - *Room to Grow* 3-column value props (*More capacity, One flexible team, Predictable production*).
   - *Our Capabilities* 3 disciplines (*Design, Digital, Development*).
   - *Your Behind the Scenes Advantage* with the *Seamless Partnership Loop* diagram.
   - *Pricing Table* with Spark ($799), Flow ($1,499 featured), and Forge ($2,499) with full capability checklist.
   - Complete 11-question FAQ accordion.

### ⚠️ Subtle Defects & Bugs Discovered in Replit's Build:
1. **Absolute Root Pathing Bug (404 Failures on Subdirectories / WordPress)**:
   - Replit compiled assets with hardcoded root paths: `<script src="/assets/index-CcULs4t9.js">`, `<link href="/assets/index-CZJyEekO.css">`, and in JS `{ image: "/images/portfolio/work-01.jpg" }`.
   - On GitHub Pages (`/<repo>/`) or WordPress subfolder environments (`/wp-content/themes/...`), this causes fatal **HTTP 404 errors** and renders a blank screen.
   - *Fix applied*: Converted all paths to relative `./assets/...` and `./images/...`.
2. **Missing Cohort Announcement Banner**:
   - The design brief and PDF screencapture prominently feature a top announcement bar:  
     *"Pixelsprings is currently accepting new clients, but spaces for each cohort are limited. Claim your spot for priority onboarding and immediate production."* with a *"Book a Call"* badge.
   - Replit completely omitted this banner.
   - *Fix applied*: Built sticky/top announcement bar with animated live status indicator.
3. **Omission of the Founder Note (Section 9)**:
   - Section 9 of the brief explicitly requested a minimal founder note:  
     *“We built Pixelsprings to give growing teams access to great creative work without the overhead of building another full-time team.” — Noman & Umair, Founders, Pixelsprings*.
   - Replit jumped straight from Portfolio to Pricing without the founder note.
   - *Fix applied*: Added understated editorial founder block with elegant borders and attribution.
4. **Branding Mismatch in Favicon**:
   - `favicon.svg` contained an unrelated red/orange square (`#FF3C00`), conflicting with Pixelsprings branding.
   - *Fix applied*: Replaced with authentic dark obsidian mark with `#BFFF00` signature electric lime leaf.
5. **Form Submission UX Dead-End**:
   - Replit handled the contact form with `window.location.href = mailto:...`. If a user lacks a default desktop email app, nothing happened.
   - *Fix applied*: Added `localStorage` persistence, animated toast feedback, and graceful mailto generation.
6. **Vite SPA Bundle vs. WordPress Slicing**:
   - Compiling into a single minified React blob creates unnecessary friction for WordPress theme slicing.
   - *Solution*: We provide both the **WordPress-Ready Semantic HTML5/CSS3/Vanilla JS** architecture and the **React 18 SPA bundle**.

---

## 2. WordPress Conversion Blueprint

To convert this homepage into WordPress, follow this production architecture:

```
wp-content/themes/pixelsprings-theme/
├── style.css                 # Theme header metadata
├── functions.php             # Asset enqueuing, CPT registration, ACF JSON
├── header.php                # Announcement bar, <head>, global navigation
├── front-page.php            # Homepage modular template
├── footer.php                # Site footer, legal links, modal lightbox
├── assets/
│   ├── css/
│   │   ├── satoshi.css       # Fontshare Satoshi webfonts
│   │   ├── main.css          # Pixelsprings core layout & tokens
│   │   └── custom.css        # Announcement, founder note, lightbox styles
│   ├── js/
│   │   └── pixelsprings.js   # Marquee, lightbox, accordion, form handlers
│   └── images/
│       ├── favicon.svg
│       └── portfolio/
│           ├── work-01.jpg ... work-06.jpg
└── template-parts/
    ├── hero.php
    ├── room-to-grow.php
    ├── how-it-works.php
    ├── capabilities.php
    ├── agency-loop.php
    ├── portfolio.php
    ├── founder-note.php
    ├── pricing-table.php
    ├── faq-accordion.php
    └── contact-section.php
```

### Step 1: Enqueue Scripts & Styles (`functions.php`)
```php
<?php
function pixelsprings_enqueue_scripts() {
    // Fonts
    wp_enqueue_style('fontshare-satoshi', 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap', array(), null);
    wp_enqueue_style('google-jakarta', 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap', array(), null);

    // Core Styles
    wp_enqueue_style('pixelsprings-main', get_template_directory_uri() . '/assets/css/main.css', array(), '1.0.0');
    wp_enqueue_style('pixelsprings-custom', get_template_directory_uri() . '/assets/css/custom.css', array('pixelsprings-main'), '1.0.0');

    // Frontend Interactive Engine
    wp_enqueue_script('pixelsprings-script', get_template_directory_uri() . '/assets/js/pixelsprings.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'pixelsprings_enqueue_scripts');
```

### Step 2: Custom Post Type for Portfolio Works
```php
function pixelsprings_register_portfolio_cpt() {
    register_post_type('portfolio_work', array(
        'labels' => array(
            'name' => __('Portfolio Works', 'pixelsprings'),
            'singular_name' => __('Portfolio Work', 'pixelsprings'),
        ),
        'public' => true,
        'has_archive' => false,
        'supports' => array('title', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-portfolio',
    ));
}
add_action('init', 'pixelsprings_register_portfolio_cpt');
```

### Step 3: ACF (Advanced Custom Fields) Field Groups
- **Cohort Announcement**:
  - `announcement_badge` (Text, default: "LIMITED COHORT")
  - `announcement_text` (Textarea)
  - `announcement_link` (URL, default: "mailto:contact@pixelsprings.com")
- **Pricing Plans (Repeater)**:
  - `plan_name` (Text: Pixel Spark, Pixel Flow, Pixel Forge)
  - `plan_price` (Number: 799, 1499, 2499)
  - `plan_capacity` (Text: "1 active request", etc.)
  - `is_featured` (True/False toggle for Pixel Flow)
- **FAQ Repeater**:
  - `question` (Text)
  - `answer` (Wysiwyg / Textarea)

### Step 4: Contact Form 7 / Fluent Forms Integration
Replace the static `<form>` with the WordPress shortcode:
```php
<?php echo do_shortcode('[fluentform id="1"]'); ?>
<!-- Or Contact Form 7: -->
<?php echo do_shortcode('[contact-form-7 id="123" title="Pixelsprings Inquiry"]'); ?>
```

---

## 3. Live Verification Checklist
- [x] All 6 portfolio assets load with HTTP 200 (no 404s).
- [x] Smooth infinite marquee animation.
- [x] Asymmetric portfolio grid with click-to-zoom Lightbox modal.
- [x] Lightbox keyboard navigation (ESC, Arrow Left/Right).
- [x] Interactive FAQ accordions with ARIA attributes.
- [x] Form submission with local storage persistence and email client launcher.
- [x] Responsive on desktop (1920px), tablet (900px), and mobile (390px).
- [x] GitHub Pages deployed and live.
