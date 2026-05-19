# 🪲 Beetle — City Delivery Marketplace

> Multi-vendor delivery platform for Kampala, Uganda.  
> **Stack:** React + Vite + Tailwind (frontend) · Node.js + Express + MongoDB (backend)

---

## Project Structure

```
beetle/
├── frontend/          # React app (customer landing + vendor dashboard)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/    LandingPage.jsx
│   │   │   ├── auth/      RegisterPage.jsx  LoginPage.jsx
│   │   │   └── vendor/    DashboardPage.jsx  ProductsPage.jsx
│   │   │                  OrdersPage.jsx     ProfilePage.jsx
│   │   ├── components/
│   │   │   └── layout/    VendorLayout.jsx
│   │   ├── store/         authStore.js  (Zustand + persist)
│   │   └── services/      api.js  (Axios + JWT interceptor)
│   └── package.json
│
└── backend/           # Express API
    ├── src/
    │   ├── models/    Vendor.js  Product.js  Order.js
    │   ├── routes/    auth.js  products.js  orders.js  vendor.js  store.js
    │   ├── middleware/ auth.js  (JWT protect + requireApproved)
    │   ├── config/    db.js
    │   └── server.js
    └── package.json
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/beetle.git
cd beetle

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Set up MongoDB Atlas (free)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. Click **Connect** → **Drivers** → copy the connection string
3. Replace `<username>` and `<password>` in the string

### 3. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/beetle
JWT_SECRET=generate_a_long_random_string_here
CLIENT_URL=http://localhost:3000
```

> Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 4. Run the backend

```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
# Test: http://localhost:5000/api/health
```

### 5. Run the frontend

```bash
cd frontend
npm run dev
# App starts on http://localhost:3000
```

---

## Pages & Routes

| URL | Description |
|---|---|
| `/` | Landing page (public) |
| `/vendor/register` | Vendor registration (3-step form) |
| `/vendor/login` | Vendor login |
| `/vendor/dashboard` | Stats + recent orders |
| `/vendor/products` | Product listing management |
| `/vendor/orders` | Incoming orders + status updates |
| `/vendor/profile` | Store settings + password change |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Vendor registration |
| POST | `/api/auth/login` | Vendor login → returns JWT |
| GET  | `/api/auth/me` | Get current vendor (protected) |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/change-password` | Change password |

### Products (protected — JWT required)
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/products` | Get vendor's products |
| POST   | `/api/products` | Create product |
| PUT    | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| PATCH  | `/api/products/:id/toggle` | Toggle availability |

### Orders (protected)
| Method | Endpoint | Description |
|---|---|---|
| GET   | `/api/orders` | Get vendor's orders |
| GET   | `/api/orders/stats` | Dashboard stats |
| GET   | `/api/orders/:id` | Single order |
| PATCH | `/api/orders/:id/status` | Update order status |

### Vendor Profile (protected)
| Method | Endpoint | Description |
|---|---|---|
| GET   | `/api/vendor/profile` | Get profile |
| PUT   | `/api/vendor/profile` | Update profile |
| PATCH | `/api/vendor/toggle-open` | Open/close store |

### Public Store (no auth)
| Method | Endpoint | Description |
|---|---|---|
| GET  | `/api/store/vendors` | List all approved vendors |
| GET  | `/api/store/vendors/:id` | Vendor + products |
| POST | `/api/store/orders` | Place order |
| GET  | `/api/store/orders/:orderNumber` | Track order |

---

## Brand

| Token | Value |
|---|---|
| Primary orange | `#FF6B00` |
| Background dark | `#0A0A0A` |
| Card dark | `#111111` |
| Font display | Bebas Neue |
| Font heading | Barlow Condensed |
| Font body | Barlow |

---

## Deployment

### Backend → Railway
1. Push to GitHub
2. New project on [railway.app](https://railway.app) → Deploy from repo → select `backend/`
3. Add env vars in Railway dashboard (same as `.env`)
4. Railway gives you a URL like `https://beetle-api.up.railway.app`

### Frontend → Vercel
1. New project on [vercel.com](https://vercel.com) → Import repo → set root to `frontend/`
2. Add env var: `VITE_API_URL=https://beetle-api.up.railway.app`
3. Update `vite.config.js` proxy to use `VITE_API_URL` in production

### Database → MongoDB Atlas
- Already cloud-hosted — just keep the `MONGODB_URI` secure

---

## Next Steps (Phase 2)

- [ ] Customer-facing storefront (browse vendors, cart, checkout)
- [ ] Flutterwave payment integration (MTN MoMo + Airtel Money)
- [ ] Real-time order notifications (Socket.io)
- [ ] Rider app and delivery tracking
- [ ] Image uploads via Cloudinary
- [ ] Admin panel for vendor approval
- [ ] SMS notifications via Africa's Talking
