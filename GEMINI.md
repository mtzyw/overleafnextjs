# GEMINI.md

## Project Overview

This is the frontend for the Overleaf Invitation Management System, a web application designed to manage Overleaf premium memberships. The application is built with Next.js, React, and TypeScript, and uses Tailwind CSS for styling.

The frontend interacts with a FastAPI backend that provides a comprehensive API for managing Overleaf accounts, invitations, and members.

### Key Features:

*   **Invitation Management:** Allows users to accept invitations to join a premium Overleaf group using an invitation code.
*   **Dynamic Pages:** Uses Next.js dynamic routing to create unique invitation pages for each code.
*   **API Integration:** Communicates with the backend to send invitations and manage users.

## Building and Running

To get the development environment running, use the following command:

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`.

### Other available scripts:

*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts a production server.
*   `npm run lint`: Lints the project files.

## Development Conventions

*   **Framework:** The project uses the [Next.js](https://nextjs.org/) framework.
*   **Language:** The codebase is written in [TypeScript](https://www.typescriptlang.org/).
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) is used for styling.
*   **API:** The frontend communicates with a FastAPI backend. The API documentation can be found in `API接口文档.md`.
