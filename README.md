# Roxilor Store Rating Management System

A full-stack web application developed as part of the **FullStack Intern Coding Challenge** for Roxilor Systems.

The platform allows users to discover and rate registered stores, while administrators manage users and stores and store owners monitor customer feedback.

## Project Overview

The application provides a role-based system with three types of users:

- **System Administrator**
- **Normal User**
- **Store Owner**

Each role has access to its own dashboard and functionality.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite |
| Routing | React Router |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Database Driver | mysql2 |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcryptjs |
| Email | Nodemailer |
| Icons | Lucide React |

## Features

### 1. System Administrator

- Dashboard displaying total users, stores and submitted ratings.
- Add new users, administrators and stores.
- View registered users and stores.
- Filter listings by name, email, address and role.
- View user details and store-owner rating information.
- Delete users and stores.
- Sort listings in ascending and descending order.

### 2. Normal User

- Register and log in.
- Change password.
- Browse all registered stores.
- Search stores by name and address.
- View store details and overall ratings.
- Submit ratings between 1 and 5.
- Update previously submitted ratings.
- View personal rating information.

### 3. Store Owner

- Log in and change password.
- View their registered stores.
- View customer ratings and feedback.
- Monitor the average rating of their stores.

## Validation

The application implements the challenge's input validation requirements:

| Field | Requirement |
|---|---|
| Name | 20–60 characters |
| Address | Maximum 400 characters |
| Password | 8–16 characters, at least one uppercase letter and one special character |
| Email | Valid email format |
| Rating | Integer between 1 and 5 |

## Project Structure

```text
Store-Rating-System/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── index.html
│
├── database/
│   └── database.sql
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

Install the following before running the application:

- Node.js and npm
- MySQL Server
- MySQL Workbench (recommended)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/akashkishorbandekar/Roxilor-store-rating-system.git

cd Roxilor-store-rating-system
```

### 2. Set Up the MySQL Database

1. Open MySQL Workbench.
2. Connect to your MySQL server.
3. Open `database/database.sql`.
4. Execute the SQL script to create the database and tables.

The database is named:

```text
store_rating_db
```

### 3. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

Configure the database connection using your own MySQL credentials:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
DB_PORT=3307
```

Use the port configured on your MySQL server. The example above reflects the development configuration.

Add any additional authentication and email configuration required by the application.

### 4. Start the Backend

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The backend API runs on:

```text
http://127.0.0.1:5000
```

### 5. Configure and Start the Frontend

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, normally:

```text
http://localhost:5173
```

## Database Design

The application uses three primary tables:

### Users

Stores user information, authentication details and roles.

### Stores

Stores registered store information and the associated store owner.

### Ratings

Stores user ratings for individual stores.

A unique constraint on `(user_id, store_id)` ensures that a user has one rating per store, which can subsequently be updated.

## Security

- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based access control.
- Server-side input validation.
- Environment variables for sensitive configuration.
- Database constraints for rating validation and relationships.

## Screenshots

Application screenshots will be added here to demonstrate:

- Login and Registration
- Administrator Dashboard
- Normal User Dashboard
- Store Owner Dashboard
- Store Rating Functionality

## Assessment

**Challenge:** FullStack Intern Coding Challenge – V1.1  
**Company:** Roxilor Systems, Pune  
**Project:** Store Rating Management System

---

Developed as part of the Roxilor Systems FullStack Intern Coding Challenge.