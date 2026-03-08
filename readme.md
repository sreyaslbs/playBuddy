# playBuddy - Your Ultimate Sports Partner

**playBuddy** is a modern, high-performance sports venue booking platform built with React Native and Firebase. It streamlines the connection between sports facility managers and sports enthusiasts, making it easy to list, discover, and book sports venues in real-time.

---

## 🚀 Key Features

### 🏢 For Managers (Venue Owners)
- **Complex Management**: Add and manage multiple sports hubs with details like address, landmark, and location.
- **Court Configuration**: Add specific courts (Turf, Football, Badminton, etc.) to each complex.
- **Dynamic Pricing**: Set custom hourly rates (in INR) for each court.
- **Flexible Slots**: Define operational hours and booking intervals for every court.
- **Hub Dashboard**: Overview of all complexes and courts with the ability to edit or delete them.

### ⚽ For Players (Customers)
- **Discovery**: Browse various sports complexes and hubs in your city.
- **Real-time Availability**: View available slots for any court on a specific date.
- **Seamless Booking**: Instant booking process with real-time state updates.
- **Personal Dashboard**: Track all upcoming and past bookings in one place.

### 🛠️ Core Functionalities
- **One-time Role Selection**: New users choose their role (Manager or Player) upon first login, ensuring a tailored experience.
- **Location-based Services**: Built-in support for major Indian cities and states.
- **Cross-Platform**: Designed to run seamlessly on Web, Android, and iOS.

---

## 💻 Technical Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Google Sign-In)
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Language**: TypeScript

---

## 📂 Project Structure

```text
playBuddy/
├── app/                  # Expo Router directory (Screens & Layouts)
│   ├── (auth)/           # Authentication & Role Selection
│   ├── (tabs)/           # Main Application Tab Navigation
│   ├── modal/            # Full-screen Modals (Add Court, Booking, etc.)
│   └── _layout.tsx       # Root Navigation Logic & Protection
├── components/           # Reusable UI Components (Button, Card, Input)
├── context/              # State Management (AuthContext, DataContext)
├── constants/            # Global Config (Styles, Firebase, Locations)
├── assets/               # Fonts, Images, and Logos
└── package.json          # Dependencies and Scripts
```

---

## 🎨 Design Philosophy

The app follows a **Premium, High-Contrast** design system:
- **Primary Color**: `#2DD4BF` (Teal-400) - Vibrant and energetic.
- **Secondary Color**: `#0F172A` (Slate-900) - Professional and deep dark tones.
- **Typography**: Focused on readability with a tiered font size system and semi-bold weights for hierarchy.
- **Aesthetics**: Glassmorphism effects, smooth transitions, and subtle shadows for a modern mobile feel.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
- **Web**:
  ```bash
  npm run web
  ```
- **Android**:
  ```bash
  npm run android
  ```
- **iOS**:
  ```bash
  npm run ios
  ```

---

## 🔒 Security & Rules
The app uses Firebase Security Rules to ensure:
1. Managers can only modify/delete complexes and courts they own.
2. Customers can only view bookings and create their own.
3. Authenticated users can access their own metadata based on their UID.

---

*Developed with ❤️ for the Sports Community.*
