# 🚀 PlayBuddy Deployment Guide

This document provides detailed instructions for deploying both the **Mobile App (Android)** and the **Web UI (Next.js Dashboard)**.

---

## **📱 Mobile App (Android APK)**

We use **Expo EAS (Expo Application Services)** to build the Android APK locally within a GitHub Actions runner.

### **1. Automated Branch Testing**
Whenever you push to a branch (other than `main`) or open a Pull Request, the `PR & Branch Build Test` workflow runs automatically.
- **Steps**:
    1. Go to the **Actions** tab on GitHub.
    2. Select the latest run of **"PR & Branch Build Test"**.
    3. Once completed, scroll down to the **Artifacts** section.
    4. Download `playbuddy-android-preview-apk`.
    5. Transfer the `.apk` file to your Android device and install it to test changes.

### **2. Production Build (Main Branch)**
When changes are merged into the `main` branch, the `Build Android APK` workflow triggers.
- **Artifact Name**: `playbuddy-android-apk`.
- This is intended for final testing before release.

---

## **🌐 Web UI (Next.js Dashboard)**

The Web UI is deployed to **Firebase Hosting** as a Static Site (compatible with the Firebase Spark/Free plan).

### **Option A: Automated Deployment via GitHub Actions (Recommended)**
I have created a manual workflow that allows you to deploy any branch to your live site.

- **Prerequisites (One-time Setup)**:
    1. Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service Accounts.
    2. Generate a new private key (JSON).
    3. In your GitHub Repo, go to **Settings > Secrets > Actions**.
    4. Add a secret named `FIREBASE_SERVICE_ACCOUNT_PLAY_BUDDY_APP` and paste the entire JSON content.
    5. Add other Firebase secrets (`FIREBASE_API_KEY`, etc.) if not already present.

- **Deployment Steps**:
    1. Go to the **Actions** tab on GitHub.
    2. Select the **"Deploy Web to Firebase"** workflow.
    3. Click **"Run workflow"**.
    4. Choose the branch you want to deploy and click the button.
    5. Your site will be live at `https://play-buddy-app.web.app` in minutes.

### **Option B: Manual Local Deployment**
If you have the Firebase CLI installed on your computer:

1.  **Build the project**:
    ```bash
    npm run build:web
    ```
2.  **Deploy to Hosting**:
    ```bash
    firebase deploy --only hosting
    ```

---

## **🛠 Required GitHub Secrets**

To ensure all workflows function correctly, ensure the following secrets are configured in your GitHub Repository:

| Secret Name | Description |
| :--- | :--- |
| `EXPO_TOKEN` | Your Expo Access Token (from [expo.dev](https://expo.dev/settings/access-tokens)) |
| `FIREBASE_SERVICE_ACCOUNT_PLAY_BUDDY_APP` | JSON key from Firebase Service Account |
| `FIREBASE_API_KEY` | Your Firebase Web API Key |
| `FIREBASE_AUTH_DOMAIN` | e.g., `play-buddy-app.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | e.g., `play-buddy-app` |
| `FIREBASE_STORAGE_BUCKET` | e.g., `play-buddy-app.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `FIREBASE_APP_ID` | Your Firebase App ID |

---

## **🔗 Useful Links**
- [GitHub Actions Dashboard](https://github.com/sreyaslbs/playBuddy/actions)
- [Firebase Hosting Console](https://console.firebase.google.com/project/play-buddy-app/hosting/sites)
- [Expo Dashboard](https://expo.dev/projects)
