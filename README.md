# Library Management System (CUET Bookworld)

A role-based digital library management system designed exclusively for Chittagong University of Engineering & Technology (CUET). It offers a professional, student-centric interface for borrowing books, renewing them with video call verification, reading e-books, and managing records.

---

## 🔗 Live Sites
* **Frontend client:** [https://client-asifhasan973s-projects.vercel.app](https://client-asifhasan973s-projects.vercel.app) (Alternative: [https://client-mu-five-98.vercel.app](https://client-mu-five-98.vercel.app))
* **Backend API server:** [https://cuet-book-world-server.vercel.app/api](https://cuet-book-world-server.vercel.app/api)

---

## 🔐 Demo Accounts

The following demo accounts are pre-configured for testing all three roles:

| Role | Email | Password | Name |
|------|-------|----------|------|
| 🎓 **Student** | `student@cuet.ac.bd` | `Student@123` | Rafiq Ahmed (CSE, 3rd Year) |
| 📚 **Librarian** | `librarian@cuet.ac.bd` | `Librarian@123` | Dr. Nazrul Islam (Faculty) |
| ⚙️ **Admin** | `admin@cuet.ac.bd` | `Admin@123` | Prof. Kamal Hossain (Faculty) |

> **Note:** These accounts must be created in the Firebase Console under Authentication → Email/Password. The MongoDB user profiles are seeded automatically via `node seed.js` in the server.

---

## ✨ Features

- **Role-based Authentication:** 3 roles (Student, Librarian, Admin) with secure routing.
- **Book Catalog:** Browse physical and electronic books with search, multi-field filters, and sorting.
- **Borrow & Return System:** Borrow books with auto-limit enforcement (3 books for 1st-3rd year, 4 for 4th year).
- **Video consultation renewal system:** Auto-generate Jitsi Meet video consultation links upon approval to verify student ID visually before renewing books.
- **E-Book Reader:** Read PDF e-books online with an embedded PDF viewer.
- **Admin Panel:** Complete system-wide analytics, user management (activate/suspend/change roles), and announcement management (promoted site-wide banners).
- **Librarian Panel:** Manage books catalog (CRUD), review and approve borrow/renewal requests, and manage student borrowing records/fines.
- **Notifications & In-App Alerts:** Real-time feedback for borrow actions, renewal meeting links, and overdue reminders.
- **Interactive UI:** Smooth dark/light mode toggle, floating micro-animations, statistics counter animations, and page transitions.
- **Mobile Responsive:** Fully responsive mobile layout with collapsing navbar drawer.

---

## 🛠 Tech Stack

- **Frontend:** React.js (v19), React Router DOM (v7), Vite, Tailwind CSS (v4)
- **Backend:** Node.js, Express.js (v5)
- **Database:** MongoDB Atlas (via Mongoose)
- **Authentication & Storage:** Firebase Auth & Firebase Storage
- **Video Call Consultation:** Jitsi Meet API Integration
- **Formatting & HTTP:** Axios, date-fns

---

## 📸 Screenshots & UI Tour

### 🏠 Home & Catalog
| Landing Page (Light Mode) | Landing Page (Dark Mode) |
|:---:|:---:|
| ![Home](Preview%20Images/Home.png) | ![Home Dark](Preview%20Images/Home-page-dark-mode.png) |

| Book Catalog & Filters | Book Details & Reviews |
|:---:|:---:|
| ![Booklist](Preview%20Images/Booklist.png) | ![Book Details](Preview%20Images/Book-details.png) |

### 📖 Reading & Renewal Process
| PDF E-Book Viewer | Book Renewal Request |
|:---:|:---:|
| ![PDF Viewer](Preview%20Images/PDF-read-from-website.png) | ![Book Renew](Preview%20Images/Book%20renew.png) |

| Video Consultation Call | Notifications Center |
|:---:|:---:|
| ![Video Call](Preview%20Images/Join-video-call.png) | ![Notifications](Preview%20Images/Notifications.png) |

### 📊 Dashboards & Role Panels
| Student Dashboard | Librarian Control Panel |
|:---:|:---:|
| ![Student Dashboard](Preview%20Images/User-dashboard.png) | ![Librarian Dashboard](Preview%20Images/Librarian%20Dashboard.png) |

| Admin Dashboard | User Accounts Management |
|:---:|:---:|
| ![Admin Dashboard](Preview%20Images/Admin-dashboard.png) | ![User Management](Preview%20Images/user%20management%20by%20admin.png) |

---

## ⚙️ Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/asifhasan973/CUET-book-world.git
cd CUET-book-world
```

### 2. Configure Environment Variables
Copy `.env.example` files to `.env` in both folders and fill in your Firebase and MongoDB credentials:

* **For Client:**
  ```bash
  cd client
  cp .env.example .env.local
  ```
  *(Then open `.env.local` and add your VITE_FIREBASE_* credentials)*

* **For Server:**
  ```bash
  cd ../server
  cp .env.example .env
  ```
  *(Then open `.env` and add your `MONGODB_URI` connection string)*

### 3. Install Dependencies & Seed Database
* **Server Setup:**
  ```bash
  cd server
  npm install
  node seed.js  # Seeding demo data
  ```

* **Client Setup:**
  ```bash
  cd ../client
  npm install
  ```

### 4. Run Development Servers
* **Start Server (Backend):**
  ```bash
  cd server
  npm run dev
  ```
* **Start Client (Frontend):**
  ```bash
  cd client
  npm run dev
  ```
  *The app will be available at [http://localhost:5173/](http://localhost:5173/)*

---

## 📂 Project Structure

```
CUET-book-world/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios API config
│   │   ├── assets/         # Images, icons
│   │   ├── components/     # Reusable UI pieces
│   │   ├── context/        # React context files (Auth, Theme)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Route-level page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   └── librarian/  # Librarian pages
│   │   ├── utils/          # Helper functions
│   │   ├── firebase.js     # Firebase connection setup
│   │   └── App.jsx         # Routes registration
│   └── .env.example        # Client env variables template
└── server/                 # Express backend
    ├── config/             # DB configuration folder
    ├── controllers/        # Route controllers (MVC Pattern)
    ├── middleware/         # Custom authentication middleware
    ├── models/             # Mongoose Schemas (User, Book, BorrowRecord, etc.)
    ├── routes/             # API routes
    ├── utils/              # Helper modules
    ├── seed.js             # DB Seeder script
    └── .env.example        # Server env variables template
```

---

*Built with ❤️ for Chittagong University of Engineering & Technology (CUET) Students*
