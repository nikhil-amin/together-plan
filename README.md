
# TogetherPlan - Collaborative Wedding Planning App

TogetherPlan is a web application designed to help couples collaboratively plan their wedding. It offers features like a shared checklist, a wedding calendar, and a countdown to the big day, all in a user-friendly interface.

## ✨ Key Features

*   **Dashboard:** A central hub displaying a countdown to the wedding, quick links to other sections, a summary of tasks, and today's focus.
*   **Collaborative Checklist:** Create, assign, and track wedding tasks. Partners can see and update tasks in real-time. Filter tasks by status (all, my tasks, pending, completed, overdue).
*   **Wedding Calendar:** Visualize task deadlines and important dates on a calendar.
*   **User Authentication:** Secure sign-up and login using email/password or Google Sign-In.
*   **Wedding Session Management:**
    *   Create a new wedding plan.
    *   Join an existing wedding plan using a unique share code.
    *   Manage wedding date and other settings.
*   **Responsive Design:** Works smoothly on desktop and mobile devices.

## 🚀 Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (App Router, configured for static export)
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

## 📋 Prerequisites

*   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A Firebase project.

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
        *   Add your app's domain to the "Authorized domains" list (e.g., `localhost` for development, and your `your-username.github.io` for GitHub Pages deployment).
    *   **Enable Cloud Firestore:**
        *   Go to Firestore Database -> Create database.
        *   Start in **"test mode"** for development (remember to secure your rules for production).
        *   Choose a location for your database.
    *   **(Optional) Enable Firebase Storage:**
        *   Go to Storage -> Get started.
        *   Follow the prompts to set up default security rules.

4.  **Configure Environment Variables:**
    *   Create a `.env` file in the root of your project.
    *   Add the following Firebase configuration variables:
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

## 🛠️ Building for Static Export (GitHub Pages)

To prepare your application for deployment to GitHub Pages, you need to build it as a static site:
```bash
npm run build
# or
yarn build
```
This command will now generate a static version of your site in the `out` folder in your project's root directory. This `out` folder contains all the HTML, CSS, JavaScript, and other assets needed to run your application.

## 🚀 Deployment to GitHub Pages

GitHub Pages is a great way to host static websites directly from your GitHub repository.

1.  **Repository Setup:**
    *   Ensure your project is a public GitHub repository (GitHub Pages for private repositories is a paid feature).
    *   Go to your repository settings on GitHub (`https://github.com/your-username/your-repository/settings`).
    *   Navigate to the "Pages" section in the left sidebar.
    *   Under "Build and deployment", for "Source", select "Deploy from a branch".
    *   For "Branch", select the `gh-pages` branch (you might need to create this branch first or set up an action to push to it) and the `/ (root)` folder.

2.  **Deploying the `out` Folder:**
    The contents of the `out` folder generated by `npm run build` are what you need to deploy.

    *   **Manual Deployment (for testing or simple cases):**
        1.  Build your project: `npm run build`.
        2.  Initialize the `out` folder as a new Git repository (or copy contents to `gh-pages` branch).
        3.  Push the contents of the `out` folder to the `gh-pages` branch of your repository.
        A common way to do this is using the `gh-pages` package:
        ```bash
        npm install --save-dev gh-pages
        ```
        Then add a script to your `package.json`:
        ```json
        "scripts": {
          "deploy": "next build && gh-pages -d out"
        }
        ```
        Run `npm run deploy`.

    *   **Automated Deployment (Recommended - using GitHub Actions):**
        Create a GitHub Actions workflow file (e.g., `.github/workflows/deploy.yml`) to automate the build and deployment process whenever you push to your `main` (or `master`) branch.

        Here's a basic example of such a workflow:
        ```yaml
        name: Deploy to GitHub Pages

        on:
          push:
            branches:
              - main # Or your default branch

        jobs:
          build-and-deploy:
            runs-on: ubuntu-latest
            steps:
              - name: Checkout 🛎️
                uses: actions/checkout@v4

              - name: Set up Node.js
                uses: actions/setup-node@v4
                with:
                  node-version: '18' # Or your preferred Node.js version
                  cache: 'npm'

              - name: Install dependencies 🔧
                run: npm install

              - name: Build application 🏗️
                run: npm run build
                env: # Pass your Firebase public env vars here
                  NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
                  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
                  NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
                  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
                  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
                  NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
                  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }}
              
              - name: Add .nojekyll file
                run: touch ./out/.nojekyll

              - name: Deploy to GitHub Pages 🚀
                uses: JamesIves/github-pages-deploy-action@v4
                with:
                  branch: gh-pages # The branch the action should deploy to.
                  folder: out # The folder the action should deploy.
        ```
        **Important for GitHub Actions:**
        *   You'll need to add your Firebase public environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) as "Secrets" in your GitHub repository settings (Settings > Secrets and variables > Actions > New repository secret). The workflow uses these secrets during the build process.
        *   The `touch ./out/.nojekyll` step is important for GitHub Pages to correctly serve sites generated by frameworks like Next.js, preventing Jekyll from processing the site.

3.  **Base Path (If deploying to a subpath like `your-username.github.io/togetherplan`):**
    If your GitHub Pages site is served from a subpath (e.g., `https://your-username.github.io/repository-name/`), you'll need to configure the `basePath` in your `next.config.js`:
    ```javascript
    // next.config.js
    const nextConfig = {
      output: 'export',
      basePath: '/your-repository-name', // Replace with your repository name
      // ... other configs
    };
    ```
    And also update asset prefixes if needed, though Next.js often handles this well with `basePath`. If you deploy to `your-username.github.io` directly (by naming your repository `your-username.github.io`), then `basePath` is not needed.

4.  **Accessing Your Site:**
    Once deployed, your site should be accessible at `https://your-username.github.io/your-repository-name/` (if using a subpath) or `https://your-username.github.io/` (if your repository is named `your-username.github.io`). Remember to add this URL to your Firebase Authentication "Authorized domains".

---

Happy Planning! 💍
