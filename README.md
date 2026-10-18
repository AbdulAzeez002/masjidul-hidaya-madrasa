# നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ
## Nasruthul Islam Madrasa - Monthly Fee & Member Tracker

An accessible, elegant, and user-friendly web application created specifically for **Nasruthul Islam Madrasa (Kiyakethala Branch)** to track monthly contributions, monitor paid vs pending dues, generate printable receipts, manage members, and publish madrasa announcements.

---

### 🌟 Key Features

1. **Admin Control Panel**:
   - **Standard Fixed Monthly Fee & Next-Month Transition**: Every member pays a uniform fixed monthly fee. When the committee/admin changes the amount, the new rate automatically takes effect from the 1st of the following month, preserving past contribution records and accurate historical calculations.
   - **Members Directory**: Add and manage members with contact info and house name.
   - **Credentials Management**: Individual members cannot self-register. Admin assigns unique usernames and passwords for each member and can view or reset passwords if an elderly member forgets.
   - **Who Gives Money & Who Does Not**: Interactive **12-Month Grid (Jan to Dec)** showing real-time green/red visual indicators for each member's monthly status.
   - **Record Payments**: Select member, month, amount, payment mode (Cash, UPI, Bank Transfer), and generate receipts.
   - **Printable Receipts & WhatsApp Share**: Official computer-generated receipts ready for single-click printing or sending directly to member's WhatsApp.
   - **Defaulters & Arrears Report**: Outstanding balance breakdown with 1-click WhatsApp payment reminders and printable statement for committee meetings.
   - **Announcements Board**: Post pinned, normal, or urgent notices to members.
   - **Data Backup**: Instant JSON database backup download.


2. **Member Portal (Elderly-Friendly & Accessible)**:
   - **Simple Login**: Sign in with admin-provided username and password.
   - **High-Visibility Status**: Clear, large green/red cards: "ഈ മാസത്തെ വരിസംഖ്യ അടച്ചിട്ടുണ്ട് (PAID)" or "അടയ്ക്കാനുണ്ട് (PENDING)".
   - **Clear Balance Breakdown**: Shows monthly fee, total amount contributed, and outstanding arrears.
   - **Receipts History**: View and print past receipts at any time.
   - **Madrasa Announcements**: Read notices published by the committee.
   - **Accessibility Controls**:
     - Font size scaler (`A`, `A+`, `A++`) for comfortable reading by senior members.
     - High Contrast toggle for sharp visual distinction.
     - Dual-language labels (Malayalam & English) with helpline support numbers.

---

### 🚀 Getting Started

#### 1. Navigate to Project Directory
```bash
cd /Users/abdulazeez/.gemini/antigravity/scratch/nasruthul-islam-tracker
```

#### 2. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:3000`**

---

### 📁 Database & Persistence
- Primary persistent storage is hosted on **MongoDB Atlas Cloud**.
- Collections: `members`, `payments`, `announcements`, and `meta`.
- Live JSON database backups can be exported anytime directly from the **Reports** section.
