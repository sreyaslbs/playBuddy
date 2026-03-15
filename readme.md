# PlayBuddy 🏟️

Welcome to **PlayBuddy**, a comprehensive platform for managing sports complexes and booking courts. The project has been refactored into a modern **Turborepo Monorepo** architecture to support both Mobile (Expo/React Native) and Web (Next.js) platforms with shared business logic and UI components.

## 🏗️ Architecture Overview

The project uses a monorepo structure managed by [Turborepo](https://turbo.build/):

### 📱 Applications (`./apps`)
- **`expo`**: The mobile application built with React Native and Expo Router. Handles member bookings, court management, and player profiles.
- **`nextjs`**: The web application built with Next.js. Primarily serves as the Manager Dashboard for analytics and high-level complex management.

### 📦 Shared Packages (`./packages`)
- **`shared`**: Core business logic, including Firebase configuration, authentication providers (`AuthContext`), and data management (`DataContext`).
- **`ui`**: The shared design system. Contains reusable React Native components (`Button`, `Card`, `Input`) and theme constants (`Colors`, `Typography`, `Spacing`) that work across both mobile and web (via React Native Web).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v10.2.4+ recommended)
- Firebase project credentials

### Installation
1. Clone the repository.
2. Install dependencies at the root:
   ```bash
   npm install
   ```

### Running Locally
You can run all platforms simultaneously from the root directory:

```bash
# Start both Expo and Next.js in development mode
npm run dev
```

Or run them individually using Turbo filters:
```bash
# Run only Mobile
npx turbo dev --filter=@playbuddy/expo

# Run only Web
npx turbo dev --filter=@playbuddy/nextjs
```

## 🔐 Security & Payments
The architecture is designed with security-first principles:
- **Shared Auth**: Unified authentication logic ensures consistent session management across platforms.
- **PCI Compliance Ready**: Integration points for payment gateways (Stripe/Razorpay) are isolated to ensure sensitive data is handled securely.
- **Firebase Rules**: Granular access control based on user roles (Manager vs. Customer).

## 🛠️ Tech Stack
- **Monorepo**: Turborepo
- **Mobile**: Expo, Expo Router, React Native
- **Web**: Next.js, React Native Web, Solito
- **Backend**: Firebase (Auth, Firestore)
- **Styling**: Shared UI Components, Vanilla CSS
- **Icons**: Lucide React / Lucide React Native
