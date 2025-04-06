# MERN E-Commerce Website

This is a full-stack e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js).

## Features
- User Authentication
- Product Management
- Cart System
- Admin Dashboard

## 🧠 MongoDB Setup

This project uses MongoDB for the database.

### Option 1: Use MongoDB Atlas (Recommended)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new **Cluster**
3. In **Database Access**, add a user with a password
4. In **Network Access**, allow access from your IP address (or `0.0.0.0/0` for all IPs)
5. Click **Connect** → **Connect your application** → Copy the connection string:

## 🚀 How to Run the Project Locally

This project has three main folders: `frontend`, `backend`, and `admin`. Follow the steps below to run each part.

---

### 🧩 1. Frontend

Path: `mern-ecommerce/e-commerce/front-end`

**Steps:**

```bash
cd e-commerce/front-end
npm install
npm start
```
🧠 2. Backend
Path: mern-ecommerce/e-commerce/backend

Steps:

```bash
cd e-commerce/backend
npm install
node ./index.js
```
🔐 3. Admin Panel
Path: mern-ecommerce/e-commerce/admin

Steps:

```bash
cd e-commerce/admin
npm install
npm run dev
```


✅ Notes
Make sure MongoDB is running locally or you're using a MongoDB Atlas connection.
