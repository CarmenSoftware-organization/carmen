# Project: Carmen - ERP System

## Project Overview

This project, named "carmen," is a comprehensive Enterprise Resource Planning (ERP) system built with Next.js. It appears to be a modern, full-stack application with a focus on modularity and a rich user interface. The system includes modules for a wide range of business functions, including finance, inventory management, procurement, production, and more. The codebase is written in TypeScript and utilizes a variety of modern technologies, including React, Tailwind CSS, shadcn/ui, and a PostgreSQL database.

## Key Technologies

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, shadcn/ui
*   **State Management:** Zustand, TanStack Query
*   **Forms:** React Hook Form
*   **Database:** PostgreSQL (likely with Supabase)
*   **Testing:** Vitest, Playwright
*   **Linting:** ESLint

## Building and Running

To get started with the development environment, you'll need to have Node.js and npm (or yarn/pnpm/bun) installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Conventions

*   **TypeScript:** The project uses TypeScript with strict type checking enabled.
*   **Path Aliases:** The project uses the `@/` path alias to refer to the root directory.
*   **Linting:** The project uses ESLint to enforce code quality. You can run the linter with `npm run lint`.
*   **Testing:** The project uses Vitest for unit testing and Playwright for end-to-end testing. You can run the tests with `npm test`.
*   **Code Analysis:** The project has several scripts for code analysis, which can be run with `npm run analyze`.

## Project Structure

The project follows a standard Next.js `app` directory structure. The main application logic is located in the `app/(main)` directory, which is further divided into modules for each business function.

*   `app/(auth)`: Contains the authentication-related pages.
*   `app/(main)`: Contains the main application pages, organized by feature.
*   `app/api`: Contains the API routes.
*   `components`: Contains the reusable React components.
*   `contexts`: Contains the React context providers.
*   `database`: Contains the database schema and migrations.
*   `lib`: Contains the library code.
*   `scripts`: Contains the utility scripts.
*   `tests`: Contains the tests.
