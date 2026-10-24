# Stride demo shop — deployment guide (Bangladesh)

## What this package is
This is a starter/demo storefront built with plain HTML/CSS/JavaScript and a Node.js/Express API. The backend serves the frontend and exposes `/api/*` routes. A `/health` endpoint is included.

## Run locally
1. Install a current Node.js LTS release.
2. Open a terminal in the `backend` folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`.
5. Run `npm start`.
6. Open `http://localhost:4000`.

## Deploy to Render (starter instructions)
1. Create a private GitHub repository and upload the contents of this ZIP. Do not upload `.env`, credentials, or customer data.
2. In Render, create a **Web Service** connected to the repository.
3. Set **Root Directory** to `backend`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
4. Add environment variables `NODE_ENV=production` and `JWT_SECRET` (a unique random value of at least 32 characters).
5. Deploy and open `/health` on the Render URL; it should return `{"ok":true}`. Then test product browsing, registration/login and a COD test order.
6. Confirm persistent disk/database setup before saving real customer or order data. The current JSON file database is not suitable for production or concurrent orders and may be reset on redeploy/restart depending on host storage.

## Before accepting real customers — REQUIRED
- **Replace all sample product prices** in `backend/data/db.json` with your actual prices. Current BDT prices are illustrative placeholders only, not a pricing recommendation.
- Confirm the shipping charge and free-shipping threshold in `backend/routes/orders.js` and `frontend/js/checkout.js` with your courier. Current demo values: ৳80 shipping below ৳3,000, free shipping at/above ৳3,000.
- Tax is set to zero in this demo; confirm applicable tax/legal requirements with a qualified local adviser before launch.
- Online card payments are disabled. Do not re-enable them until you integrate and test a real approved payment provider (for example, a Bangladesh-supported gateway), including verified server-side payment callbacks. The demo `/api/payment/charge` endpoint intentionally returns 503.
- Replace JSON-file storage with a persistent managed database (e.g., PostgreSQL) and migrate all route code. Do not rely on `db.json` for live orders, stock or customer accounts.
- Replace simulated order tracking, which advances based on elapsed time, with real admin/courier status updates before displaying it to customers.
- Add an admin interface/secure operations process for product prices, inventory, orders, returns and refunds.
- Review input validation, rate limiting, session/token handling, privacy policy, terms, returns policy, delivery policy and backups. Do a security review before production.
- Use your own domain and configure DNS/HTTPS after the deployment is stable.

## Current demo behaviour
- Checkout is Cash on Delivery only.
- BDT is used for display. Product prices in `db.json` are demo placeholders.
- Shipping is configured as demo values above; tax is not added.
- Payment endpoint does not accept card data or report fake success.
- JSON-file database and time-based order tracking are not production-ready.

This package is a safer deployment starting point, **not a fully production-ready e-commerce system**.
