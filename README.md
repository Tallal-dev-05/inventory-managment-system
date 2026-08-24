# Inventory Management System

A full-stack inventory management application built with the MERN stack. The system provides authentication, product management, purchasing, sales tracking, and admin functionality through a modern web interface.

## Features

* 🔐 User registration and authentication
* 👤 Protected routes for authenticated users
* 🛡️ Admin functionality
* 📦 Product management
* 🛒 Purchase management
* 💰 Sales management
* 📊 Inventory-related operations
* 🔎 Organized product and transaction interfaces
* 🔒 Environment variables for sensitive configuration

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Development Tools

* Git & GitHub
* Postman
* ESLint

## Project Structure

```text
inventory-management-system/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── assets/
│       ├── utils/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── postman/
├── .gitignore
├── package.json
└── package-lock.json
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Tallal-dev-05/inventory-managment-system.git
```

Move into the project directory:

```bash
cd inventory-managment-system
```

### 2. Install dependencies

Install the root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory.

Use the existing `server/.env.example` file as a reference.

Example:

```env
MONGO_URI=your_mongodb_connection_string
PORT=your_port
JWT_SECRET=your_secret_key
```

> Never commit your `.env` file to GitHub. Sensitive environment variables should remain private.

### 4. Start the backend

From the `server` directory:

```bash
npm start
```

Or use the development command defined in your `package.json`.

### 5. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Vite will provide the local development URL in the terminal.

## API Testing

The project includes Postman configuration files that can be used to test the backend API.

You can import the available Postman files into Postman and test authentication, products, purchases, sales, and other API endpoints.

## Main Modules

### Authentication

Users can register and sign in. Protected routes prevent unauthorized access to restricted parts of the application.

### Products

The product module provides functionality for managing inventory products.

### Purchases

Purchase records can be managed through the purchasing functionality.

### Sales

Sales transactions can be recorded and managed through the sales functionality.

### Admin

Administrative functionality provides additional control over the application.

## Security

Sensitive configuration is stored in environment variables.

The project's `.gitignore` prevents files such as:

```text
node_modules/
dist/
server/.env
```

from being committed to the repository.

## Future Improvements

Possible future improvements include:

* Dashboard analytics and charts
* Low-stock notifications
* Advanced product search and filtering
* Inventory reports
* Role-based permissions
* Improved mobile responsiveness
* Deployment to a production environment
* Automated testing

## Author

**Tallal Bashir**

GitHub: [Tallal-dev-05](https://github.com/Tallal-dev-05)

## License

This project is currently available for learning and development purposes.
