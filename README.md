# CUET Bookworld — Digital Library Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

A role-based digital library management system designed for Chittagong University of Engineering & Technology (CUET). It provides a professional, student-centric interface for borrowing books, renewing them with video call verification, reading e-books, and managing library records across three distinct user roles.

**🔗 Live Site:** [cuet-book-world-delta.vercel.app](https://cuet-book-world-delta.vercel.app/)

---

## ✨ Features

- **Role-based Authentication:** 3 roles (Student, Librarian, Admin) with protected routing and Firebase ID token validation.
- **Book Catalog:** Browse physical and electronic books with search, multi-field filters, sorting, and pagination.
- **Borrow & Return System:** Borrow books with auto-limit enforcement (3 books for 1st–3rd year, 4 for 4th year).
- **Video Consultation Renewal:** Auto-generated Jitsi Meet video links upon approval for student ID verification before renewing books.
- **E-Book Reader:** Read PDF e-books online with an embedded viewer.
- **Admin Panel:** System-wide analytics, user management (activate/suspend/change roles), and site-wide announcement banners.
- **Librarian Panel:** CRUD operations on book catalog, borrow/renewal request management, and student fine tracking.
- **Notifications:** In-app alerts for borrow actions, renewal meeting links, overdue reminders, and fine updates.
- **Interactive UI:** Dark/light mode, glassmorphism effects, floating micro-animations, and smooth page transitions.
- **Mobile Responsive:** Fully responsive layout with a collapsing navbar drawer.

---

## 🏗 Key Technical Highlights

| Area | Implementation |
|------|---------------|
| **Authentication** | Firebase ID tokens validated server-side via `firebase-admin` SDK — no client-trust model |
| **Authorization** | `requireRole()` middleware enforces role-based access (student/librarian/admin) per route |
| **Security** | Regex injection prevention via `escapeRegex()`, input allowlists on all write endpoints, CUET email domain enforcement |
| **Error Handling** | Custom error class hierarchy (`BadRequestError`, `NotFoundError`, etc.) with centralized middleware — dev mode shows stack traces, production masks internals |
| **Architecture** | MVC pattern: Models → Controllers → Routes, with shared utilities and middleware layers |
| **Fine System** | Automatic overdue fine calculation with librarian override capability and audit trail |
| **Video Integration** | Jitsi Meet room IDs generated via `crypto.randomBytes()` — no API key required |

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, React Router DOM 7, Vite 8, Tailwind CSS 4 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth & Storage** | Firebase Auth, Firebase Storage |
| **Video Calls** | Jitsi Meet API |
| **Utilities** | Axios, date-fns, Lucide React |

---

## 📸 Screenshots

### 🏠 Home & Catalog
| Landing Page (Light Mode) | Landing Page (Dark Mode) |
|:---:|:---:|
| ![Home](Preview%20Images/Home.png) | ![Home Dark](Preview%20Images/Home-page-dark-mode.png) |

| Book Catalog & Filters | Book Details & Reviews |
|:---:|:---:|
| ![Booklist](Preview%20Images/Booklist.png) | ![Book Details](Preview%20Images/Book-details.png) |

| Login Page | Sign Up Page |
|:---:|:---:|
| ![Login Page](Preview%20Images/login%20page.png) | ![Sign Up Page](Preview%20Images/sign%20up%20page.png) |

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

## 🔐 Demo Accounts

The following demo accounts are available for testing:

| Role | Email | Password |
|------|-------|----------|
| 🎓 **Student** | `student@cuet.ac.bd` | `Student@123` |
| 📚 **Librarian** | `librarian@cuet.ac.bd` | `Librarian@123` |
| ⚙️ **Admin** | `admin@cuet.ac.bd` | `Admin@123` |

> **Note:** Demo accounts must be created in the Firebase Console under Authentication → Email/Password. MongoDB user profiles are seeded via `npm run seed` in the server.

---

## ⚙️ Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/asifhasan973/CUET-book-world.git
cd CUET-book-world
```

### 2. Configure Environment Variables

* **Client:**
  ```bash
  cd client
  cp .env.example .env.local
  ```
  Fill in your `VITE_FIREBASE_*` credentials in `.env.local`.

* **Server:**
  ```bash
  cd ../server
  cp .env.example .env
  ```
  Fill in your `MONGODB_URI` and `FIREBASE_PROJECT_ID` in `.env`.

### 3. Install Dependencies & Seed Database
```bash
# Server
cd server
npm install
npm run seed    # Seeds demo books, users, and announcements

# Client
cd ../client
npm install
```

### 4. Run Development Servers
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```
The app will be available at [http://localhost:5173/](http://localhost:5173/)

---

## 📂 Project Structure

```
CUET-book-world/
├── client/                 # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/            # Axios instance with Firebase token interceptor
│   │   ├── components/     # Reusable UI (Navbar, Modal, Toast, Sidebar, etc.)
│   │   ├── context/        # React Context (Auth, Theme)
│   │   ├── hooks/          # Custom hooks (useAnimatedCounter, useParallax, etc.)
│   │   ├── pages/          # Route-level pages
│   │   │   ├── admin/      # Admin dashboard & user management
│   │   │   └── librarian/  # Librarian dashboard, book & student management
│   │   ├── utils/          # Shared helpers (email domain validation)
│   │   └── App.jsx         # Route definitions & layout
│   └── .env.example        # Client environment template
└── server/                 # Express REST API
    ├── config/             # MongoDB connection
    ├── controllers/        # Business logic (MVC controllers)
    ├── middleware/          # Auth (Firebase token) & error handling
    ├── models/             # Mongoose schemas (User, Book, BorrowRecord, etc.)
    ├── routes/             # Express route definitions
    ├── utils/              # Error classes, regex escaping, fine calculation
    ├── seed.js             # Database seeder with demo data
    └── .env.example        # Server environment template
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Built with ❤️ for Chittagong University of Engineering & Technology (CUET)*
