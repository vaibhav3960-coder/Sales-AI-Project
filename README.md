# 📅 Calendly Clone - Fullstack Assignment

A professional-grade scheduling and booking application built for the Scaler SDE Intern Fullstack Assignment. This project replicates core Calendly functionality with a focus on **clean architecture**, **conflict-free scheduling**, and a **premium user experience**.

## ✨ Key Features

- **Dynamic Event Types**: Full CRUD management of appointment types with custom durations, unique URL slugs, and buffer time configurations.
- **Smart Availability System**: Robust configuration for recurring weekly schedules, supporting multiple time intervals per day (e.g., morning and afternoon blocks).
- **Conflict-Resilient Booking**: Custom logic that perfectly calculates available slots by cross-referencing availability patterns and existing bookings, while respecting "Buffer Times" between meetings.
- **Seamless Rescheduling & Cancellation**: Dedicated workflows for invitees to move or cancel their appointments, with automated backend consistency checks.
- **Mock Email Notifications**: Integration with Ethereal Email (Nodemailer) to simulate real-world confirmation and rescheduling emails.
- **Aesthetic UI/UX**: A modern, responsive design system built with Vanilla CSS, featuring glassmorphism, smooth transitions (hover effects), and a high-fidelity calendar interface.

## 🚀 Tech Stack

- **Frontend**: 
  - **React.js + TypeScript**: Strongly typed component architecture.
  - **Vite**: Ultra-fast build tool and dev server.
  - **Vanilla CSS**: Custom-built design system (No Tailwind) for maximum stylistic control.
  - **date-fns**: Precise date/time manipulation and formatting.
- **Backend**:
  - **Node.js + Express**: Scalable REST API architecture.
  - **Prisma ORM**: Modern database access and schema management.
  - **SQLite**: Zero-config, file-based database (perfect for local evaluation).
  - **Nodemailer**: For transactional email simulation.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16.x or later)
- npm or yarn

### 1. Setup Backend
```bash
cd backend
npm install
# Push the schema and initialize SQLite database
npx prisma db push
# Seed with default event types and 9-5 availability
npm run seed
# Start the server
npx ts-node src/server.ts
```
*The API will be available at `http://localhost:3001`.*

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*The app will be available at `http://localhost:5173`.*

## 📂 Architecture Overview

The project follows a decoupled architecture:
1.  **Client-Side**: React handles the state for the booking wizard and administrative dashboards. It communicates with the backend via the `api.ts` utility.
2.  **Server-Side**: Express handles routing and business logic (like slot availability calculation).
3.  **Data Layer**: Prisma provides type-safe queries to the SQLite database.

## 🧪 Verification Walkthrough

1.  **Dashboard**: Navigate to `/dashboard` to manage events and availability.
2.  **Edit Flow**: Click the **Pencil Icon** on any event card to update its duration or name.
3.  **Public Booking**: Visit `/book/[slug]` (e.g., `/book/30min`) to experience the 3-step booking flow.
4.  **No Double-Booking**: Once a slot is booked, it is immediately removed from the available options for that date.
5.  **Buffer Times**: Meetings take into account the "Buffer Time" set in the event configuration, preventing back-to-back meetings if a buffer is required.

---
*Created with ❤️ for the Scaler SDE Internship Assignment.*
