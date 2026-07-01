#  Market Analysis — Vessel Performance Tracker

A full-stack web application that tracks vessel performance region-wise, comparing daily **market rates** against **hire rates**, with role-based access for Office Admins and Office Users.

Built as part of a technical assignment — implements PostgreSQL, Django REST Framework, and React exactly as specified in the brief.
 

---

##  Features

-  **Region-wise performance view** — daily market rate vs. hire rate comparison per vessel/region, including HS code
-  **Aggregated performance view** — all-region daily averages, with HS codes intentionally excluded (enforced at the API level, not just hidden in the UI)
-  **Daily data entry** — Office Admins can log new rates; Office Users have read-only access
-  **Role-based access control** — enforced server-side via a custom DRF permission class, not just hidden UI elements
-  **Token-based authentication** — simple, stateless login flow
-  **Interactive charts** — hover to see HS code and exact values, built with Recharts

---

##  Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Database   | PostgreSQL                          |
| Backend    | Django + Django REST Framework      |
| Frontend   | React (Vite)                        |
| Auth       | DRF Token Authentication            |
| Charts     | Recharts                            |

---

##  Project Structure

```
market_analysis/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── market_analysis/       # project settings, urls
│   └── core/                  # models, serializers, views, permissions
│       └── management/commands/seed_demo_data.py
└── frontend/
    ├── package.json
    └── src/
        ├── api/                # axios client
        ├── pages/              # Login, AdminDashboard, UserDashboard
        └── components/         # forms, tables, charts
```

---

##  Getting Started

### Prerequisites
- Python 3.11+
- Node.js (LTS)
- PostgreSQL

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a PostgreSQL database named `market_analysis_db` (or set your own via env vars — see `market_analysis/settings.py`), then:

```bash
python manage.py migrate
python manage.py seed_demo_data   # creates demo users, regions, vessels & sample data
python manage.py runserver 0.0.0.0:8000
```

Demo logins:

| Role         | Username     | Password   |
|--------------|--------------|------------|
| Office Admin | `admin`      | `admin123` |
| Office User  | `officeuser` | `user123`  |

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

---

## 🔌 API Endpoints

| Method & Path                         | Access        | Purpose                                   |
|----------------------------------------|---------------|--------------------------------------------|
| `POST /api/auth/login/`               | Public        | Log in, receive a token                    |
| `GET /api/auth/whoami/`               | Authenticated | Current user's role                        |
| `GET /api/regions/`                   | Authenticated | List regions                               |
| `GET /api/vessels/`                   | Authenticated | List vessels                               |
| `GET /api/entries/?region=&vessel=`   | Authenticated | Region-wise entries (includes HS code)     |
| `POST /api/entries/`                  | Admin only    | Create a new daily entry                   |
| `GET /api/entries/aggregated/`        | Authenticated | Daily averages, all regions (no HS code)   |

---

##  Design Notes

- **Roles** use Django's built-in `User.is_staff` flag — no separate roles table needed.
- **HS code visibility** is enforced with two distinct serializers: the aggregated response has no `hs_code` field defined at all, so it can never leak that data.
- **Write access** is restricted server-side via `IsOfficeAdminOrReadOnly`, so it can't be bypassed by calling the API directly.

---

 
