# E-Commerce Maneka ERP — Claude Context File

## Project Overview
Full-stack ERP system for E-Commerce Maneka, a UK-based e-commerce agency managing 40+ marketplace accounts (OnBuy, eBay, Amazon, TikTok Shop) with 50+ staff.

---

## Infrastructure
- **Server**: Hostinger KVM4 VPS, Ubuntu 24.04, IP: 2.24.130.53, UK Manchester
- **Frontend**: React/Vite → `/var/www/erp-frontend/src/App.jsx`
- **Backend**: Node.js/Express → `/var/www/erp/index.js` (port 3002)
- **Database**: PostgreSQL → DB: `maneka_erp`, User: `maneka_user`, Password: `Maneka2026`
- **Process Manager**: PM2 (`maneka-erp`)
- **Web Server**: Nginx reverse proxy → port 3002
- **Domain**: erp.abdullahmaneka.com
- **GitHub**: https://github.com/manekaportal-ux/erp-maneka.git

## Deploy Workflow
```bash
# After editing App.jsx:
cd /var/www/erp-frontend && npm run build

# Restart backend:
pm2 restart maneka-erp

# Manual backup:
PGPASSWORD='Maneka2026' pg_dump -U maneka_user -h 127.0.0.1 -d maneka_erp > /root/backups/maneka_erp_$(date +%Y%m%d_%H%M).sql
cp -r /var/www/erp-frontend/src /root/backups/erp-frontend-src_$(date +%Y%m%d_%H%M)
cp /var/www/erp/index.js /root/backups/index_$(date +%Y%m%d_%H%M).js
pm2 save

# Fix DB permissions (if needed):
sudo -u postgres psql -d maneka_erp -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO maneka_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO maneka_user;"

# Fix password (if SASL errors):
sudo -u postgres psql -c "ALTER USER maneka_user WITH PASSWORD 'Maneka2026';"

# Check port mismatch:
grep listen /var/www/erp/index.js
grep proxy_pass /etc/nginx/sites-enabled/maneka-erp
```

---

## User Roles & Login
| Role | Username | Password | Access |
|------|----------|----------|--------|
| CEO | abdullah42 | Maneka2026! | Full access |
| Admin | admin | Admin2026! | Restricted |

### Admin Restrictions (hidden from admin):
- Dashboard & Analytics — completely hidden
- All Departments sidebar — hidden (only OnBuy/eBay/Amazon/TikTok shown)
- Employees section — hidden
- User Management in Settings — hidden
- Monthly Sheet: Net Profit & VA GBP show "—"
- Monthly totals cards — hidden
- PKR Rate footer — hidden from both roles

---

## Calculation Rules (CRITICAL)
```
Agency Share   = Total Profit × Agency%
VA Gross       = Total Profit × VA%
VA Final       = VA Gross − All Penalties   ← penalties from VA only, NOT agency
Client Share   = Total Profit × Client%
Client% + Agency% + VA% = 100% (validated on save)
```

### Penalty Types (all deducted from VA share only):
- HMRC Fee, Counterfeit, Leaves Penalty, Feedback Deduction
- Late Arrival, Warning Penalty, Other Penalty
- Office Penalty PKR (currently hidden)

---

## Database Tables
```sql
accounts          -- VA + Store data
entries           -- Monthly financial entries (key: accountId_YYYY-MM)
va_trash          -- VA soft delete (30-day recovery)
clients           -- Client profiles
client_stores     -- Client-Store-VA links
client_trash      -- Client soft delete (30-day recovery)
employees         -- Staff employee profiles
salary_history    -- Employee salary increment history
salary_payments   -- Monthly salary payment tracking (due: 5th)
expenses          -- Business expenses
donations         -- Monthly donation recipients
donation_payments -- Donation payment tracking
users             -- Login credentials (username/password/role)
settings          -- GBP rate, email config (key-value)
```

---

## Completed Modules

### 1. Dashboard (CEO only)
- KPI cards: Total Store Profit, Agency Earnings, Net to VAs, Total Penalties
- Month-over-month ↑↓ arrows vs last month
- Best VA 🏆, Best Department 🏅, Active Accounts
- Department breakdown cards (click to drill down)
- Color-coded month dropdown (MONTH_COLORS array)
- Color-coded year dropdown

### 2. Monthly Sheet
- Click-to-expand rows per VA/Store
- All penalty fields + status dropdowns
- Auto-calculated: Net Profit, Agency GBP, VA GBP
- Admin sees "—" for Net Profit and VA GBP
- Department filter buttons + Search
- Bottom totals (CEO only)

### 3. Analytics & Reports (CEO only)
- Monthly view: bar chart + table
- Yearly comparison: 2024-2027
- Per VA view: ranked by profit with 🏆
- Per Dept view: bar charts + yearly stats

### 4. Client Management
- Full profile: name, company, company number, email, phone, address, join date, status, notes
- Onboarding: Add client + stores + VAs + percentages all at once (% must = 100%)
- Edit: client info + linked VA/store data (fresh fetch on edit click)
- Department badges shown on client list
- Link Store removed from view mode
- Delete → Client Trash (database-backed, 30-day recovery)
- Invoice preview modal → Send Now / Mark Pending
- Email invoice via Gmail SMTP

### 5. Employees Module (CEO only)
- **Staff Employees tab**: Complete profile (CNIC, DOB, gender, joining date, designation, department, employment type, status, phone, WhatsApp, email, emergency contact, bank details)
- **Salary History**: All increments with date and reason
- **Monthly Salary Payments**: Generate salary (auto due date 5th), status Pending/Paid/Overdue, 📧 Send Slip
- **VA List tab**: All VAs grouped by name, shows all stores, monthly earnings, penalties, bank details
- **Trash tab**: 30-day recovery

### 6. Finance Module (CEO + Admin)
- **Expenses tab**: Add/edit/delete with date, category, description, GBP/PKR amounts
- Summary cards: This Month, This Year, All Time
- Categories: Rent, Salary, Software, Marketing, Travel, Utilities, Equipment, Tax, Other
- **Donations tab**: Recipients with bank details, monthly amount, status (Active/Paused/Stopped)
- Total monthly donations summary

### 7. Settings
- **General**: GBP→PKR rate
- **VA Management**: Add/edit/delete VAs with bank details, VA Trash (30-day)
- **User Management** (CEO only): Add/edit/delete users, passwords visible in edit, role management

---

## UI Design
```javascript
// Colors
background: '#0a0b11'  // main
content:    '#0e1018'
cards:      '#13151f'
primary:    '#6366f1'  // indigo
success:    '#22c55e'
warning:    '#f59e0b'
danger:     '#ef4444'

// Department colors
DEPT_COLORS = {
  OnBuy:       '#f97316',
  eBay:        '#f59e0b',
  Amazon:      '#ef4444',
  'TikTok Shop': '#8b5cf6'
}

// Month colors (MONTH_COLORS array)
Jan='#3b82f6', Feb='#8b5cf6', Mar='#22c55e', Apr='#f59e0b',
May='#ef4444', Jun='#06b6d4', Jul='#f97316', Aug='#ec4899',
Sep='#84cc16', Oct='#6366f1', Nov='#14b8a6', Dec='#e11d48'

// Year colors
2024='#3b82f6', 2025='#8b5cf6', 2026='#6366f1', 2027='#ec4899'

// Font: Inter
// Style: Corporate dark, similar to Linear/Stripe
```

---

## Key Backend API Routes
```
GET/POST    /api/accounts          -- VA/Store CRUD
GET/POST    /api/entries           -- Monthly entry data
GET/POST/DELETE /api/va-trash      -- VA trash
GET/POST/PUT/DELETE /api/clients   -- Client CRUD
GET/POST/DELETE /api/client-stores -- Client-Store links
GET/POST/DELETE /api/client-trash  -- Client trash
GET/POST/PUT/DELETE /api/employees -- Employee CRUD
GET/POST    /api/salary-history/:id -- Salary increments
GET/POST/PUT /api/salary-payments  -- Monthly salary tracking
POST        /api/send-salary-invoice -- Email salary slip
GET/POST/PUT/DELETE /api/expenses  -- Expenses CRUD
GET/POST/PUT/DELETE /api/donations -- Donations CRUD
GET/POST/PUT /api/donation-payments -- Donation payment tracking
GET/POST/PUT/DELETE /api/users     -- User management
POST        /api/login             -- Username/password auth
GET/POST    /api/rate              -- GBP/PKR rate
GET/POST    /api/email-config      -- Gmail SMTP config
POST        /api/send-invoice      -- Client/VA invoice email
```

---

## Known Issues Fixed
- Backend must run on port 3002; Nginx proxies to 3002
- DB password standardized (no special chars) to avoid SASL errors
- `maneka_user` requires explicit GRANT ALL on tables and sequences
- `client_stores` UNIQUE constraint required for ON CONFLICT
- Client delete must cascade: delete client_stores first, then clients
- `editClientStores` populated with fresh fetch on edit button click
- Admin login redirects to Monthly Sheet (not Dashboard)
- `company_no` field added to both POST and PUT client routes

---

## Deliberately Removed Features (Do NOT re-add)
- Monthly entry trash (errors are edited, not deleted)
- FBR tax (0.25%) — removed from all calculations
- PKR salary display (payments are GBP-only for now)
- Link Store button in client view mode

---

## VA Accounts (43 total, IDs start from 72)
Departments: OnBuy (28), eBay (9), Amazon (6), TikTok Shop

---

## Auto Backup
Daily cron at 2am → `/root/backups/`
Manual backup files stored in `/root/backups/`

---

## Email Setup (Gmail SMTP)
- Configured in Settings > Email Setup
- Requires Gmail App Password (16 chars)
- Google Account → Security → 2-Step Verification → App Passwords
- Saved in `settings` table with key `email_config`

---

## Pending Features
- WhatsApp invoice integration
- Assets & Liabilities module
- Per VA/Store yearly reports
- Expense/Donation monthly payment tracking UI
- Mobile PWA

