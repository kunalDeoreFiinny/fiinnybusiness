<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Karan Arjun Power Plus

This app now uses **Firebase Authentication + Firestore** for real backend data.

## Run locally

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and keep/update Firebase values.
3. Run:
   `npm run dev`

## Firebase collections used

- `users` (profile + role)
- `products`
- `blogs`
- `orders`
- `grievances`
- `settings/company`

## Firestore rules

Rules are added in `firestore.rules`.

In Firebase Console:
1. Go to **Firestore Database → Rules**
2. Replace existing rules with contents of `firestore.rules`
3. Click **Publish**

## Admin access

- Set `VITE_ADMIN_EMAILS` (comma-separated) to force admin accounts, **or**
- leave it empty and the first registered user becomes admin automatically.
