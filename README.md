# 🎓 Campus Lost & Found Registry

A modern web-based **Campus Lost & Found Registry** that helps students and staff report, discover, and reclaim lost belongings within the university campus.

The platform provides a centralized place to report lost or found items, browse existing reports, search and filter items, and eventually verify ownership and manage item status.

---

## 📌 Project Overview

Students frequently lose personal belongings such as:

* ID cards
* Wallets
* Keys
* Books
* Bags
* Earphones
* Mobile phones
* Accessories

Traditional lost-and-found systems often depend on announcements, security desks, or manual registers, making it difficult to efficiently connect lost belongings with their owners.

The **Campus Lost & Found Registry** provides a centralized digital platform where users can:

* Report lost belongings
* Report found belongings
* Browse reported items
* Search and filter items
* View item details
* Identify the location where an item was lost or found
* Track the status of an item
* Eventually verify ownership and claim items

---

# 🎯 Objectives

1. Create a centralized campus lost-and-found platform.
2. Make reporting lost and found items simple.
3. Allow students to search and filter reported belongings.
4. Provide location-based information for reported items.
5. Reduce administrative work involved in maintaining lost-and-found records.
6. Provide a clean and responsive user interface.
7. Build the project in a way that can later be extended into a complete MERN application.

---

# 🛠️ Current Technology Stack

The current phase focuses on **Lectures 1–30** of the course.

### Frontend

* React
* Vite
* JavaScript
* JSX
* HTML
* CSS

### Browser Features

* Local Storage
* JSON
* Form Handling
* Event Handling

### JavaScript Concepts

* Variables
* Data Types
* Operators
* Conditional Statements
* Loops
* Functions
* Arrow Functions
* Arrays
* Objects
* Array Methods
* Higher-Order Functions
* Destructuring
* JSON
* ES6 Features
* Promises
* Async/Await
* Fetch API

---

# 🚧 Future Technology Stack

Backend technologies will be introduced later as the course progresses.

Planned future stack:

```text
React
   ↓
Node.js
   ↓
Express.js
   ↓
REST API
   ↓
MongoDB
   ↓
Mongoose
   ↓
JWT Authentication
```

The current version intentionally does **not** contain:

* Node.js backend
* Express.js
* MongoDB
* Mongoose
* JWT authentication
* Real-time messaging backend
* Axios

---

# ✨ Features

## 🏠 Home Page

The homepage provides an overview of the platform and navigation to the major sections.

Users can quickly access:

* Lost Items
* Found Items
* Report Lost
* Report Found

---

## 🔴 Report Lost Item

Students can submit information about an item they have lost.

Information includes:

* Item name
* Category
* Description
* Date
* Location
* Image
* Status

Submitted items are stored using browser Local Storage.

---

## 🟢 Report Found Item

Students can report belongings they have found on campus.

Information includes:

* Item name
* Category
* Description
* Found date
* Found location
* Image
* Status

---

## 🔎 Lost Items

Users can browse all reported lost items.

Features include:

* Search
* Category filtering
* Location filtering
* Status filtering
* Sorting
* Item cards
* Item details navigation

---

## 🔍 Found Items

Users can browse all reported found belongings.

Features include:

* Search
* Category filtering
* Location filtering
* Status filtering
* Sorting
* Item cards
* Item details navigation

---

## 📄 Item Details

Users can open an individual item to view complete information.

The future version will also support:

* Ownership verification
* Claim requests
* Secure messaging
* Status updates

---

# 💾 Data Storage

During the current frontend-only phase, item information is stored in the browser using **Local Storage**.

The common Local Storage key is:

```javascript
campusItems
```

Example item:

```javascript
{
    id: 1,
    type: "lost",
    title: "AirPods Pro",
    category: "Electronics",
    description: "White AirPods Pro case",
    location: "Library",
    date: "2026-08-20",
    image: "",
    status: "Open",
    createdBy: "Student",
    createdAt: "2026-08-20"
}
```

---

# 📊 Item Types

Items can have one of two types:

```text
lost
found
```

---

# 📌 Item Status

The project uses three standard statuses:

```text
Open
Claimed
Archived
```

### Open

The item is currently active and has not been claimed.

### Claimed

The item has been successfully claimed.

### Archived

The report is no longer active.

---

# 🏷️ Categories

The project currently supports:

* Electronics
* Documents
* Accessories
* Books
* Clothing
* Bags
* Keys
* Other

---

# 📍 Campus Locations

The current location options include:

* Main Gate
* Library
* Cafeteria
* Block A
* Block B
* Auditorium
* Sports Complex
* Parking
* Hostel
* Other

---

# 📁 Project Structure

```text
campus-lost-found/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ItemCard.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterBar.jsx
│   │   └── StatusBadge.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── LostItems.jsx
│   │   ├── FoundItems.jsx
│   │   ├── ReportLost.jsx
│   │   ├── ReportFound.jsx
│   │   └── ItemDetails.jsx
│   │
│   ├── utils/
│   │   ├── storage.js
│   │   ├── validation.js
│   │   └── helpers.js
│   │
│   ├── data/
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── README.md
```

---

# 👥 Team Responsibilities

The project is developed by a team of four members.

| Member   | Responsibility                 |
| -------- | ------------------------------ |
| Member 1 | Lost Item Reporting            |
| Member 2 | Found Item Reporting           |
| Member 3 | Browse, Search & Filtering     |
| Member 4 | Item Details & Claim Interface |

Each team member maintains their own Git branch and contributes meaningful commits to the project.

---

# 🎨 UI Design

The project follows a consistent modern university portal design.

### Color Palette

```text
Primary:       #1E3A8A
Secondary:     #3B82F6
Background:    #F8FAFC
Card:          #FFFFFF
Text:          #0F172A
Muted Text:    #64748B
Success:       #16A34A
Warning:       #F59E0B
Danger:        #DC2626
Border:        #E2E8F0
```

The interface uses:

* Responsive layouts
* Rounded cards
* Soft shadows
* Consistent spacing
* Clear typography
* Accessible form controls
* Mobile-friendly design

---

# 🔄 Application Flow

```text
                     HOME
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
     LOST ITEMS    FOUND ITEMS   REPORT ITEM
          │            │            │
          │            │       ┌────┴────┐
          │            │       ↓         ↓
          │            │     LOST      FOUND
          │            │       │         │
          └────────────┴───────┴─────────┘
                       ↓
                 ITEM DETAILS
                       │
                       ↓
                CLAIM / VERIFY
                       │
                       ↓
                    STATUS
                       │
             Open → Claimed → Archived
```

---

# 🔀 Git Workflow

The team uses feature branches to keep individual contributions organized.

Example branches:

```text
main

feature/report-lost
feature/report-found
feature/item-listing
feature/item-details
```

Each member should create meaningful commits describing their actual work.

Example:

```bash
git add .
git commit -m "feat: create lost and found item listings"
```

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone <repository-url>
```

## 2. Enter the project directory

```bash
cd campus-lost-found
```

## 3. Install dependencies

```bash
npm install
```

## 4. Start the development server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🧪 Testing

Before pushing changes, verify:

* Application starts without errors.
* All pages load correctly.
* Navigation works.
* Forms validate user input.
* Items are saved to Local Storage.
* Items appear on the correct Lost/Found page.
* Search works.
* Filters work.
* Sorting works.
* Item cards display correctly.
* Responsive layout works on different screen sizes.
* No existing team member functionality is broken.

---

# 🔮 Future Enhancements

As the course progresses, the project can be expanded into a complete MERN application.

### Backend

* Node.js
* Express.js
* REST APIs
* MongoDB
* Mongoose

### Authentication

* Registration
* Login
* JWT authentication
* Protected routes
* User profiles

### Lost & Found Features

* Real image uploads
* Interactive campus map
* Ownership verification
* Claim management
* Secure messaging
* Notifications
* User-specific reports

### Administration

* Admin dashboard
* Report management
* User management
* Archived item management
* Analytics

---

# 🎓 Course Relevance

This project provides practical implementation of concepts covered throughout the course.

### Lectures 1–30

* JavaScript fundamentals
* Functions
* Arrays
* Objects
* Higher-order functions
* JSON
* DOM concepts
* Event handling
* Form validation
* Local Storage
* ES6
* Promises
* Async/Await
* Fetch API

### Lectures 31–48 — Future

* React components
* Props
* State
* React Router
* Context API
* Axios
* Tailwind CSS
* Authentication UI

### Lectures 49–60 — Future

* Node.js
* Express.js
* REST APIs
* JWT
* Multer
* MongoDB
* Mongoose
* React–Express integration

---

# 📜 License

This project is developed as an academic project for educational purposes.

---

## 👨‍💻 Project Team

**Campus Lost & Found Registry**

Developed by a team of 4 students as part of the **Back End Engineering** course.

**Chitkara University, Rajpura**

©️ 2026 Campus Lost & Found Registry
