# Full-Stack E-commerce Project

## Architecture

This project is organized as a **Monorepo** using `pnpm workspaces` to ensure seamless coordination between the frontend and backend.

- **`packages/client`**: A high-performance React application built with **Vite**, **Material UI**, and **Redux Toolkit**.
- **`packages/server`**: A scalable Node.js API using **Express** and **Mongoose** (MongoDB), following a controller-service pattern.
- **`packages/shared`**: The core of our type safety. It contains **Zod schemas** and **TypeScript types** imported by both the client and server to guarantee data integrity across the entire stack.

### Design Principles
- **Logic Decoupling**: Business logic is abstracted into **Custom Hooks** (e.g., `useCart`, `useAuth`), keeping UI components clean and focused on presentation.
- **Global Error Management**: Implemented an application-wide error handling system using Axios interceptors and a dedicated Full-Screen Error UI for network or server failures.
- **End-to-End Type Safety**: Shared validation schemas ensure that a change in the data model is immediately reflected as a TypeScript error in both frontend and backend.

## Key Features

### Cart & Shopping Experience
- **Advanced Cart System**: Persistent cart state managed via Redux and synced with the backend.
- **Coupon Engine**: Real-time coupon validation with support for percentage-based or fixed discounts, including dynamic recalculation as items are added/removed.
- **Product Discovery**: Responsive product browsing with pagination and detailed product views.

### Authentication & Security
- **Role-Based Access Control (RBAC)**: Distinct workflows and permissions for **Customers** (shopping/cart) and **Sellers** (product management).
- **Secure Auth**: JWT-based authentication with protected routes and server-side validation middleware.

### Seller Dashboard
- **Product Management**: Full CRUD capabilities for sellers to manage their inventory.
- **Management Tools**: Data-grid interfaces for efficient product tracking and bulk operations.

## Tech Stack

- **Frontend**: React 19, Material UI (MUI 9), Redux Toolkit, React Router 7.
- **Backend**: Node.js, Express, MongoDB/Mongoose.
- **Validation**: Zod.
- **Tooling**: pnpm, Vite, TypeScript.

---

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Setup environment variables**:
   Create `.env` files in `packages/server` based on the configuration required (MongoDB URI, JWT Secret, etc.).

3. **Run in development mode**:
   ```bash
   pnpm dev
   ```
