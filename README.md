# 🏋️ IronPulse - Gym Management System

A modern, fast, professional web-based Gym Management System built with a sleek SaaS aesthetic. Designed for effortless gym desk operations with automated membership expiry calculations, 7-day warning alerts, standard PKR 1,500 monthly payment tracking, and complete member profile management.

---

## ⚡ Core Features

### 1. 👥 Member Management
- **Add New Member**:
  - Full Name
  - Phone Number
  - Profile picture (custom file upload or sleek avatar presets)
  - Membership start date (defaults to today)
  - Membership end date (automatically computed as **+1 month**, fully editable)
  - Automatic initial payment recording (**PKR 1,500 default**)
- **Members Directory**:
  - Live real-time search by **name**, **phone number**, or **Member ID**.
  - Quick filter tabs: **All**, **Active**, **Expiring in 7 Days**, and **Expired**.
  - Profile previews, validity tags, and quick-action buttons (Profile, Renew, Edit, Delete).

### 2. 📇 Dedicated Member Profile
- Comprehensive athlete overview:
  - Avatar, Full Name, Contact info, Member ID (e.g. `MEM-1001`)
  - Real-time **Status Pill** (`Active`, `Expiring in X days`, `Expired X days ago`)
  - Membership validity dates
  - **Financial breakdown**: Total lifetime amount paid (PKR), total number of renewals
  - **Payment History Table**: Detailed ledger of every transaction with coverage dates and payment methods
  - **One-Click WhatsApp Reminder**: Direct message generation to remind athletes of upcoming dues
  - **Receipt Generation**: View and print official payment receipts with gym header and signature lines

### 3. ⏳ Automated Status & 7-Day Expiry Warnings
- **Automatic Status Engine** (no manual status toggles needed):
  - **Active**: Current date $\le$ Membership End Date ($> 7$ days left)
  - **Expiring Soon (Warning)**: $0 \le \text{Days Remaining} \le 7$ (e.g., *"Ali Khan — membership expires in 3 days"*, *"Expires today"*, *"Expires tomorrow"*)
  - **Expired**: Current date $>$ Membership End Date (e.g., *"Expired 4 days ago"*)
- Dedicated **Expiry Warnings Center** showing both 7-day upcoming expirations and overdue expired members.

### 4. 💵 Payments & Renewals
- Standard monthly fee: **PKR 1,500** (customizable).
- Flexible payment methods: Cash, JazzCash, EasyPaisa, Bank Transfer.
- Automatic renewal calculation:
  - For active/expiring members: auto-sets next start date to the day after current expiry and +1 month end date.
  - For expired members: auto-sets new start date to today and +1 month end date.
- Updating payment automatically extends member's membership end date.
- Printable receipt modal with `@media print` support.

### 5. 📊 Executive Dashboard
- 4 Key Metric Cards:
  - Total Members
  - Active Members
  - Expiring in 7 Days (urgent warning counter)
  - Expired Members
- Priority Expiry Alerts list with 1-click renewal.
- Recent payment transactions table.
- Total collection revenue stats.

### 6. 💾 Local Persistence & Data Portability
- Persists all data in browser `localStorage`.
- **Export Backup (JSON)**: Download complete gym data.
- **Restore Backup (JSON)**: Restore data anytime.
- **Reset Demo Data**: Quick restore of sample realistic data.

---

## 🚀 How to Run

1. Simply double-click `run_app.bat` or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Opera).
2. No server, Node.js, or complex dependencies required!

---

## 📁 Project Structure

```
gym-management-system/
│
├── index.html          # Main application Single Page Application (SPA) layout
├── run_app.bat         # One-click launcher for Windows
├── README.md           # Documentation and user manual
│
├── css/
│   └── styles.css      # Custom styles, fonts, scrollbars, print layout
│
└── js/
    ├── storage.js      # LocalStorage state management, seed data & CRUD
    └── app.js          # Core app controller, status calculations, views & modals
```
