# HSAIT Website

React + Vite website with Firebase Authentication and Firestore integration.

## Features

- Email/password sign in and sign up
- Email verification required before sign-in
- Password reset flow from the sign-in page
- Auth state persisted across the app using context
- Lazy-loaded route pages for better first-load performance
- Firestore user profile + enrolled/completed/certificate tracking
- Course enrollment with sign-in redirect and per-user writes
- Functional newsletter subscription persistence on home page
- Legal pages for Terms & Conditions and Privacy Policy

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Fill `.env` with your Firebase project credentials.

4. Enable providers in Firebase Console:

- Authentication > Sign-in method > Email/Password (enable)

5. Create Firestore database and add security rules suited to your app.

6. Deploy security rules from this repo:

```bash
firebase deploy --only firestore:rules
```

Rules template is included in `firestore.rules`.

## Development

```bash
npm run dev
```

## CI

- GitHub Actions workflow at `.github/workflows/ci.yml`
- Runs `npm ci`, `npm run lint`, and `npm run build` on push and pull requests

## Available Routes

- `/` home
- `/services`
- `/products`
- `/courses`
- `/courses/:slug` (individual course page)
- `/learn/:slug` (course LMS workspace, authenticated + enrolled users)
- `/about`
- `/signin`
- `/profile` (authenticated users only)
- `/terms`
- `/privacy`

## Firestore Structure For User Profile

- `users/{uid}`: basic account profile
- `users/{uid}/profile/summary`: aggregate stats
	- `completedCourses` (number)
	- `certificatesAchieved` (number)
	- `hoursLearned` (number)
- `users/{uid}/completedCourses/{courseId}`
	- `title` (string)
	- `score` (number)
	- `completedAt` (timestamp)
- `users/{uid}/certificates/{certificateId}`
	- `title` (string)
	- `credentialId` (string)
	- `issuedAt` (timestamp)
- `users/{uid}/enrolledCourses/{courseSlug}`
	- `courseTitle` (string)
	- `courseCategory` (string)
	- `instructor` (string)
	- `enrolledAt` (timestamp)
	- `status` (string)
- `users/{uid}/courseProgress/{courseSlug}`
	- `completedLessonIds` (array)
	- `completedLessonsCount` (number)
	- `totalLessons` (number)
	- `progressPercent` (number)
	- `isCompleted` (boolean)
	- `startedAt` (timestamp)
	- `updatedAt` (timestamp)
	- `completedAt` (timestamp|null)
- `courses/{courseSlug}/enrollments/{uid}`
	- `email` (string)
	- `displayName` (string)
	- `enrolledAt` (timestamp)
- `newsletterSubscribers/{subscriberId}`
	- `email` (string)
	- `source` (string)
	- `subscribedAt` (timestamp)
	- `updatedAt` (timestamp)
	- `status` (string)

## Auth UX Notes

- New sign-ups receive an email verification link.
- Users must verify email before sign-in is allowed.
- Sign-in page supports password reset and verification resend.
- When redirected to sign-in from enrollment, successful login returns the user to the original course page.
