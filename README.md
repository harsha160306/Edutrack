# EduTrack 🎓📱

> **A Comprehensive Cross-Platform Campus Governance, Academic Analytics & Attendance Management Platform.**
> Designed for DVR & Dr. HS MIC College of Technology (Autonomous). Built with React Native & Expo for Android, iOS, and Web.

---

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Framework](https://img.shields.io/badge/Framework-Expo%20SDK%2051-black?style=for-the-badge&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Offline--First-green?style=for-the-badge)](#system-architecture)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Student Portal](#1-student-portal-)
  - [Faculty & Committee Portal](#2-faculty--vigilance-committee-portal-)
  - [Security & Access Control](#3-security--access-control-)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Design System & Theme](#-design-system--theme)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**EduTrack** is an enterprise-grade institutional mobile and web solution engineered to bridge students, faculty members, and campus vigilance committees into a synchronized, transparent ecosystem. 

The application resolves critical administrative and student challenges:
1. **Real-time punctuality tracking** with automated biometric and ID-barcode scanning at campus entrance gates.
2. **Transparent student accountability** allowing students to monitor their own attendance, disciplinary logs, and notices in real-time.
3. **Academic performance evaluation** featuring SGPA/CGPA progression tables, semester backlog tracking, and subject-wise grade drill-downs.
4. **Offline-first synchronization** ensuring gate vigilance operations continue uninterrupted regardless of network connectivity drops.

---

## 🚀 Key Features

### 1. Student Portal 🎓

- **Segmented Quick Actions**: Divided into intuitive **DAILY** and **MORE** action tiers:
  - **DAILY**: `My Record`, `View Notices`, `Student Profile`, `Attendance`.
  - **MORE**: `Academic Marks`, `Help Center`, `App Settings`, `Lock App`.
- **Attendance Module**:
  - Circular progress indicator showing overall attendance percentage with minimum requirement indicators (75% threshold).
  - Subject-wise mobile cards with attended/total class tallies and alert badges for condonation risks.
  - Interactive monthly attendance navigator (`Previous Month` ↔ `Next Month`).
- **Academic Performance & Marks**:
  - High-level metric summary: Current SGPA, Cumulative CGPA, Completed Credits, and Registered Batch.
  - Full SGPA & CGPA progression table across completed semesters.
  - Semester-wise backlogs matrix with paper codes and status indicators.
  - Drill-down into **Semester Wise Subject Details** (Credits, Grades, Grade Points, Exam Session, and Pass/Fail status).
  - Desktop-web responsive split view (side-by-side tables) and fluid mobile card layouts.
- **My Disciplinary & Attendance Records**:
  - Live log of student's personal latecomer entries and in-discipline reports.
  - Filterable by `ALL`, `LATE-COMER`, and `IN-DISCIPLINE`.
  - Displays reporting faculty name, vigilance committee, gate location, penalty, and fine payment status.
  - Tap-to-expand incident descriptions and institutional actions taken.
- **Faculty Circulars & View Notices**:
  - Official memos issued by Faculty HODs, Examination Cell, and Campus Administration.
  - Category filters: `Discipline`, `Exams`, `Academic`, and `Campus Events`.
  - Priority markers: `URGENT`, `IMPORTANT`, and `GENERAL` with pinned notices.
  - Attached circulars (PDF support) and full-screen memo reader.
- **Comprehensive Student Profile**:
  - Verified student identity header with copy-to-clipboard roll number.
  - Multi-tab profile dossiers covering **Academic Details**, **Personal Identity**, **Contact & Residence**, **Parents & Guardians**, and **Campus Transport / Bus Routes**.

---

### 2. Faculty & Vigilance Committee Portal 📋

- **Barcode & ID Card Scanner**:
  - Hardware camera scanner for student institutional ID cards.
  - Supports **Auto Approval Mode** (instant mark upon barcode detection) and **Manual Review Mode**.
  - Dual infraction marking: `Latecomer` and `In-Discipline` (dress code, uniform, lab violations).
- **Offline Sync Engine**:
  - Records latecomers locally in encrypted storage when offline.
  - Automatic background synchronization with status indicators (`Synced`, `Pending`, `Offline`).
  - Pull-to-refresh sync gesture for immediate bulk push.
- **Shift & Activity Dashboard**:
  - Real-time counters: `Marked by you`, `Total latecomers today`, and `Shift duration`.
  - Activity switcher: Filter between personal entries (`By You`) and campus-wide records (`By Committee`).
  - Toggle between Grid Cards view and compact List view.
- **Committee Directory**:
  - Searchable directory of active faculty committee officers with direct call and email shortcuts.

---

### 3. Security & Access Control 🔐

- **Role-Based Experience**: Strict separation of concerns between `Faculty` and `Student` modes.
- **Biometric Authentication**: Fingerprint and Face ID unlock support via device biometric hardware.
- **MPIN Protection**: Fast 4-digit or 6-digit PIN setup, verification, and app-lock functionality.
- **Multi-Level Storage**: Sensitive session tokens and security credentials securely isolated from general state.

---

## 🏗 System Architecture

EduTrack adopts a modular, state-driven architecture that works reliably across iOS, Android, and Web browsers without heavy third-party routing overhead:

```
                              ┌────────────────────────┐
                              │      App Root Router   │
                              │       (State Driven)   │
                              └───────────┬────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
      ┌───────────────────────┐                       ┌───────────────────────┐
      │     Faculty Mode      │                       │     Student Mode      │
      └───────────┬───────────┘                       └───────────┬───────────┘
                  │                                               │
      ┌───────────┴───────────┐                       ┌───────────┴───────────┐
      │ - ID Barcode Scan     │                       │ - Attendance Analytics│
      │ - Latecomer Recording │                       │ - Marks & SGPA/CGPA   │
      │ - Offline Queue Sync  │                       │ - My Disciplinary Logs│
      │ - Committee History   │                       │ - Faculty Circulars   │
      │ - Shift Management    │                       │ - Full Student Dossier│
      └───────────────────────┘                       └───────────────────────┘
```

- **Navigation**: Controlled by centralized state transitions in `App.js` with integrated hardware back-button handling in `navigation/appBackNavigation.js`.
- **State Persistence**: Lightweight asynchronous local persistence for offline queues, user settings, MPIN status, and theme preferences.
- **Responsive Layout**: Powered by React Native's `Platform.select` and flexbox mechanics, automatically providing mobile screens with responsive cards and web browsers with centered multi-column layouts.

---

## 📁 Project Directory Structure

```plaintext
MICFacultyApp/
├── App.js                         # Application entry root & state router
├── app.json                       # Expo configuration & app manifests
├── package.json                   # Dependencies and scripts
│
├── assets/                        # Institutional logos, icons, and textures
│
├── components/                    # Core shared UI components
│   ├── AppleActionSheet.js        # iOS-inspired action sheets
│   ├── AppleAlertModal.js         # Unified cross-platform dialogs
│   ├── DashboardBottomNav.js      # Bottom navigation bar
│   ├── dashboard_screen.js        # Main dashboard coordinator
│   └── role_select_screen.js      # Initial authentication entry
│
├── features/                      # Domain feature modules
│   ├── account/                   # Account display & barcode utilities
│   ├── app-search/                # Global campus directory search
│   ├── faculty-members/           # Vigilance committee roster
│   ├── faculty-offline-sync/      # Offline storage & background sync engine
│   ├── id-card-scan/              # Camera barcode scanner
│   ├── marked-latecomers/         # Latecomer history & logs
│   ├── mpin-setup-status/         # MPIN configuration & notifications
│   ├── network-status/            # Network connectivity monitor
│   ├── student-attendance/        # Student attendance module
│   ├── student-discipline/        # Discipline fines and actions card
│   ├── student-marks/             # Academic performance & grades
│   ├── student-notices/           # Faculty notices & circulars feed
│   ├── student-profile/           # Comprehensive student dossier
│   ├── student-record/            # Student latecomer & indiscipline logs
│   ├── theme/                     # Dark / Light theme engine
│   └── typography/                # Typography & font declarations
│
├── navigation/                    # Hardware back & routing helpers
│   └── appBackNavigation.js       # Back-stack resolution logic
│
└── security/                      # Cryptography, MPIN, & session management
    ├── mpin/                      # MPIN keypads, dots, & verification
    └── session/                   # Session tokens & storage
```

---

## 🛠 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18.x or 20.x recommended)
- [Git](https://git-scm.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For Mobile Testing: [Expo Go](https://expo.dev/client) app installed on your Android or iOS device.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harsha160306/Edutrack.git
   cd Edutrack
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

### Running the Application

- **Run on Web Browser**:
  ```bash
  npm run web
  # or
  npx expo start --web
  ```
  The app will open automatically at `http://localhost:8081`.

- **Run on Android**:
  ```bash
  npm run android
  # or press 'a' in the interactive terminal
  ```

- **Run on iOS** (macOS required):
  ```bash
  npm run ios
  # or press 'i' in the interactive terminal
  ```

- **Run on Physical Mobile Device**:
  ```bash
  npx expo start
  ```
  Scan the terminal QR code using **Expo Go** (Android) or the **Camera app** (iOS).

---

## 🎨 Design System & Theme

EduTrack features a curated design system modeled around modern Apple Human Interface Guidelines and Google Material Design 3:

- **Color Palette**:
  - `Brand Blue`: `#2563EB` / `#3B82F6` (Primary action accent)
  - `Success Emerald`: `#10B981` / `#059669` (Good attendance & passed grades)
  - `Warning Amber`: `#F59E0B` / `#D97706` (Attendance alert & late arrivals)
  - `Danger Crimson`: `#EF4444` / `#DC2626` (In-discipline & fee alerts)
- **Fluid Dark / Light Modes**: Dynamically adapts to system OS settings or user-configured manual theme toggle with deep charcoal slate (`#0F172A`) dark surfaces and crisp porcelain (`#F8FAFC`) light surfaces.
- **Haptic Feedback**: Integrated micro-vibrations for quick action button taps and list switcher interactions.

---

## 📄 Contributing & License

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/harsha160306/Edutrack/issues).

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <b>Developed for DVR & Dr. HS MIC College of Technology</b><br>
  Built with ❤️ for educational excellence and campus accountability.
</p>
