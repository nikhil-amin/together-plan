
# TogetherPlan - Collaborative Wedding Planning App

TogetherPlan is a web application designed to help couples collaboratively plan their wedding. It offers features like a shared checklist, a wedding calendar, AI-powered vendor suggestions, and a countdown to the big day, all in a user-friendly interface.

## ✨ Key Features

*   **Dashboard:** A central hub displaying a countdown to the wedding, quick links to other sections, a summary of tasks, and today's focus.
*   **Collaborative Checklist:** Create, assign, and track wedding tasks. Partners can see and update tasks in real-time. Filter tasks by status (all, my tasks, pending, completed, overdue).
*   **Wedding Calendar:** Visualize task deadlines and important dates on a calendar.
*   **AI Vendor Suggestions:** Get personalized vendor recommendations (e.g., photographers, florists) based on location, budget, style, and other criteria, powered by Genkit and Google's Gemini models.
*   **User Authentication:** Secure sign-up and login using email/password or Google Sign-In.
*   **Wedding Session Management:**
    *   Create a new wedding plan.
    *   Join an existing wedding plan using a unique share code.
    *   Manage wedding date and other settings.
*   **Responsive Design:** Works smoothly on desktop and mobile devices.

## 🚀 Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (App Router)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [ShadCN UI](https://ui.shadcn.com/) (Component Library)
    *   [Tailwind CSS](https://tailwindcss.com/) (Styling)
    *   [Lucide React](https://lucide.dev/) (Icons)
    *   `react-hook-form` & `zod` (Form handling and validation)
    *   `date-fns` (Date utility)
*   **Backend & Database:**
    *   [Firebase](https://firebase.google.com/)
        *   Firebase Authentication (User management)
        *   Cloud Firestore (NoSQL Database for sessions, tasks, user profiles)
        *   Firebase Storage (Configured, for potential future file uploads)
*   **Generative AI:**
    *   [Genkit (Firebase Genkit)](https://firebase.google.com/docs/genkit)
    *   Google AI (Gemini models for vendor suggestions)
*   **Deployment (Assumed):**
    *   Firebase Hosting or a similar platform that supports Next.js (like Vercel). App Hosting is configured in `apphosting.yaml`.

## 📋 Prerequisites

*   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A Firebase project.
*   A Google Cloud project (usually the same as your Firebase project) with the necessary AI/ML APIs enabled (e.g., "Generative Language API" or "Vertex AI API") for Genkit and billing enabled if required.

## ⚙️ Setup & Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nikhil-amin/togetherplan.git
    cd togetherplan
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Firebase:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Create a new project or use an existing one.
    *   **Enable Firebase Authentication:**
        *   Go to Authentication -> Sign-in method.
        *   Enable "Email/Password" and "Google" providers.
        *   Add your app's domain to the "Authorized domains" list (e.g., `localhost` for development).
    *   **Enable Cloud Firestore:**
        *   Go to Firestore Database -> Create database.
        *   Start in **"test mode"** for development (remember to secure your rules for production).
        *   Choose a location for your database.
    *   **(Optional) Enable Firebase Storage:**
        *   Go to Storage -> Get started.
        *   Follow the prompts to set up default security rules.
    *   **Enable Google AI APIs for Genkit:**
        *   In your Google Cloud Console (linked to your Firebase project), ensure the "Generative Language API" or a similar API providing access to Gemini models is enabled.
        *   Ensure billing is enabled on your Google Cloud project if required for the API usage.

4.  **Configure Environment Variables:**
    *   Create a `.env` file in the root of your project.
    *   Copy the contents of `.env.example` (if one exists) or add the following Firebase configuration variables:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
        NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here (optional, for Analytics)
        ```
    *   You can find these values in your Firebase project settings:
        *   Project settings (gear icon) > General tab > Your apps > Web app > SDK setup and configuration > Config.

5.  **Important Firestore Security Rules Note for Development:**
    For the application to work during development, especially with user data and wedding sessions, ensure your Firestore security rules are permissive for authenticated users. A basic rule set for development could be:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow authenticated users to read and write to all documents
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```
    Publish these rules in the "Rules" tab of your Firestore Database section in the Firebase console. **Remember to create more secure, granular rules before deploying to production.**

6.  **Composite Indexes for Firestore:**
    The application uses queries that may require composite indexes. If you encounter errors like "The query requires an index...", Firebase will typically provide a link in the error message to create the required index directly in the console.
    For example, for the tasks list, an index on `tasks` collection with `weddingId` (Ascending) and `deadline` (Ascending) is needed.

## ධ Running the Development Server

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This usually starts the app on `http://localhost:9002` (as configured in `package.json`).

2.  **Start the Genkit development server (for AI features):**
    Open a new terminal window/tab and run:
    ```bash
    npm run genkit:dev
    # or to watch for changes in AI flows:
    # npm run genkit:watch
    ```
    This will start the Genkit development flow server, typically on port 3100. The Next.js app will make requests to this server for AI functionalities.

    Ensure both servers are running for all features to work.

## 🛠️ Building for Production

```bash
npm run build
# or
yarn build
```
This will create an optimized production build in the `.next` folder.

## 🚀 Deployment

*   **Firebase Hosting:** You can deploy your Next.js app using Firebase Hosting. Refer to the [Firebase documentation for deploying Next.js apps](https://firebase.google.com/docs/hosting/frameworks/nextjs). The `apphosting.yaml` file is configured for Firebase App Hosting.
*   **Vercel:** As a Next.js application, deployment to Vercel is also a straightforward option.

---

Happy Planning! 💍
