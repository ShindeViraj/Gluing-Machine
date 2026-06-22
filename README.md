# Gluing Machine Reporting Software

A robust dashboard application built with Next.js, Prisma, and Tailwind CSS to track and analyze Gluing Machine logs.

## Quick Start (1-Click Run)

If you are on Windows, simply double-click the **`run.bat`** file in the root directory.

This script will automatically:
1. Install dependencies (if they are missing).
2. Sync the database schema to your local MySQL server.
3. Start the Next.js development server.

## Features

- **Dashboard**: Real-time visualization of machine prints, operator statistics, and Auto vs. Manual mode split.
- **Log Viewer**: View the latest 100 log entries directly from the MySQL database.
- **Excel Export**: Download an exact match of the `Machine_Log.xlsx` template with current database records.

## Configuration

Before running, ensure your `.env` file contains the correct `DATABASE_URL` pointing to your local MySQL instance.

Example `.env`:
```
DATABASE_URL="mysql://root:Shinde@123@localhost:3306/gluing_machine"
```

## Manual Setup (If not using run.bat)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Push Prisma Schema to MySQL
npx prisma db push

# 3. Start Development Server
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) in your browser.
