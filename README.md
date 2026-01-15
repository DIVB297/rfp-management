# AI-Powered RFP Management System

A comprehensive RFP (Request for Proposal) Management System with Express.js backend, MongoDB database, Next.js frontend, AI-powered vendor analysis, and email synchronization.

## 🎯 Project Overview

This system provides a complete workflow for managing RFPs and vendor responses:

- **Submit RFPs** with company and project details
- **Email vendors** automatically with RFP details
- **Sync vendor responses** from email inbox (IMAP)
- **AI-powered analysis** of vendor proposals using OpenAI GPT-4
- **Sort and compare** vendors by AI score or date
- **Accept proposals** with automatic email notifications
- **Quick View modals** for fast review
- **Simple status management** (pending, closed, accepted)

## ✨ Key Features

### 🚀 IMAP Email Synchronization
- Automatically import vendor responses from email inbox
- Smart vendor-first matching algorithm
- One-click sync on RFPs page
- Response count badges
- Duplicate prevention

### 🤖 AI-Powered Vendor Analysis
- Automatic analysis using OpenAI GPT-4 Turbo
- Comprehensive scoring (0-100)
- Detailed recommendations
- Strengths and concerns breakdown
- Experience and approach evaluation
- Budget and timeline analysis

### 📧 Email Workflow
- Send RFP notifications to selected vendors
- Vendors reply to system email
- Automatic response import and parsing
- Acceptance email notifications
- Professional email templates

### 🎨 Modern UI/UX
- Clean, responsive design
- Sort by date or AI score
- Quick View modals for RFPs and responses
- Status badges with color coding
- Response count indicators
- Smooth animations

## 🛠 Technology Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **MongoDB** with **Mongoose 8.0.3** - Database and ODM
- **OpenAI 4.28.0** - GPT-4 Turbo for AI analysis
- **Nodemailer 6.9.7** - SMTP email sending
- **IMAP 0.8.19** - Email inbox synchronization
- **Mailparser 3.6.5** - Email content parsing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Modern responsive design** - Mobile-friendly UI


## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Email account** with SMTP/IMAP (Gmail recommended)
- **OpenAI API key** (for AI-powered analysis)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd rfp-management

# Install backend dependencies
cd rfp-backend
npm install

# Install frontend dependencies
cd ../rfp-frontend
npm install
```

### 2. Setup Environment Variables

**Backend (.env in rfp-backend/):**
```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/rfp-management
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rfp-management

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@example.com

# IMAP Configuration (Gmail)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-16-digit-app-password

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Vendors (comma-separated emails)
VENDOR_EMAILS=vendor1@example.com,vendor2@example.com,vendor3@example.com
```

**Frontend (.env.local in rfp-frontend/):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Setup Gmail (5 minutes)

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and generate password
   - Copy the 16-digit password (remove spaces)

3. **Enable IMAP:**
   - Go to Gmail Settings → Forwarding and POP/IMAP
   - Enable IMAP
   - Save changes

4. **Update .env:**
   - Use the 16-digit app password for both SMTP_PASS and IMAP_PASS
   - Do NOT use your regular Gmail password

### 4. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Or on macOS with Homebrew:
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`
5. Whitelist your IP address

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd rfp-backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd rfp-frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 6. Access the Application

Open your browser and navigate to: **http://localhost:3000**

## 📖 User Guide

### 1. Submit an RFP

1. Click **"Submit RFP"** on the home page
2. Fill in company details:
   - Company Name
   - Contact Person
   - Email
   - Phone (optional)
3. Fill in project details:
   - Project Title
   - Description
   - Budget
   - Deadline
4. Add requirements specification
5. Select vendors from dropdown (multi-select)
7. Click **"Submit RFP"**
8. Emails are automatically sent to selected vendors

### 2. View & Manage RFPs

1. Click **"View RFPs & Sync"** on the home page
2. See all RFPs with:
   - Status badges (pending/closed/accepted)
   - Response counts (📧 Responses, ✅ Accepted)
   - Quick View button for details
3. **Sync Vendor Emails** button (top right):
   - Click to import vendor responses
   - See sync statistics (processed, created)
4. Update RFP status using dropdown:
   - Pending → Closed → Accepted
5. Click RFP title to view detailed page

### 3. Review Vendor Responses

1. Click on an RFP title to view details
2. See all vendor responses with:
   - Vendor name and email
   - Proposed price and timeline
   - Experience level and team size
   - Approach description
   - AI analysis with score (0-100)
3. **Sort responses:**
   - By Date (default - most recent first)
   - By AI Score (highest score first)
4. **Quick View:**
   - Click "Quick View" for detailed modal
   - See complete proposal and AI analysis
   - Accept directly from modal
5. **Accept a proposal:**
   - Click "Accept Proposal" button
   - Confirmation dialog appears
   - Email automatically sent to vendor
   - RFP status updates to "accepted"
   - Vendor response status updates to "accepted"

### 4. Vendor Email Response Flow

**For Vendors:**
1. Receive RFP email notification
2. Reply to the email with proposal details
3. Include information like:
   - Proposed price
   - Timeline estimate
   - Experience and team details
   - Approach description

**System automatically:**
1. Detects vendor replies (when sync is clicked)
2. Parses email content
3. Matches to correct RFP
4. Analyzes proposal with AI
5. Displays on RFP detail page

## 🔌 API Endpoints

### RFP Routes (`/api/rfps`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rfps` | Create new RFP (with file upload) |
| GET | `/api/rfps` | Get all RFPs with response counts |
| GET | `/api/rfps/:id` | Get single RFP with vendor responses |
| PUT | `/api/rfps/:id/status` | Update RFP status (pending/closed/accepted) |

### Vendor Routes (`/api/vendors`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors` | Get all vendors |

### Vendor Response Routes (`/api/vendor-responses`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendor-responses` | Get all vendor responses |
| GET | `/api/vendor-responses/:id` | Get single vendor response |
| POST | `/api/vendor-responses/:id/accept` | Accept vendor proposal (sends email) |

### Email Routes (`/api/emails`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emails/sync` | Sync IMAP inbox for vendor responses |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## 🎨 UI Features

### Home Page
- 2 action cards: "Submit RFP" and "View RFPs & Sync"
- Clean, modern design
- Responsive layout

### RFPs List Page
- **Sync Button** (green, top right) - Import vendor responses
- **Response Count Badges:**
  - 📧 Responses: X (total responses)
  - ✅ Accepted: X (accepted responses)
- **Status Dropdown** - Update to pending/closed/accepted
- **Quick View Modal** - View RFP details without navigation
- **Status Color Coding:**
  - Yellow: Pending
  - Green: Accepted
  - Gray: Closed

### RFP Detail Page
- **Sorting Controls:**
  - Sort by Date (default)
  - Sort by AI Score
- **Vendor Response Cards** with:
  - Vendor contact information
  - Proposal details (price, timeline, experience, team size)
  - AI score badge (color-coded: red <50, yellow 50-74, green 75+)
  - Strengths and concerns (AI-generated)
  - Quick View button
  - Accept Proposal button
- **Quick View Modal** for vendor responses:
  - Complete proposal information
  - Full AI analysis with recommendations
  - Accept button in modal footer
- **Acceptance Flow:**
  - Confirmation dialog
  - Email sent to vendor
  - Status automatically updated

## 🔧 Development

### Backend Development
```bash
cd rfp-backend
npm run dev  # Uses nodemon for auto-reload on port 5000
```

### Frontend Development
```bash
cd rfp-frontend
npm run dev  # Hot reload enabled on port 3000
```

### Build for Production

**Backend:**
```bash
cd rfp-backend
npm start  # Production mode
```

**Frontend:**
```bash
cd rfp-frontend
npm run build  # Create optimized production build
npm start      # Start production server
```

## 🤖 AI Analysis Details

The AI analysis uses **OpenAI GPT-4 Turbo** to evaluate each vendor response:

### Analysis Criteria:
- Proposed price vs RFP budget
- Timeline alignment with deadline
- Vendor experience level
- Team size appropriateness
- Approach quality and detail
- Overall proposal completeness

### AI Output:
- **Score:** 0-100 numerical rating
- **Recommendation:** Accept/Consider/Reject with reasoning
- **Strengths:** List of positive aspects (2-4 points)
- **Concerns:** List of potential issues (2-4 points)

### Score Interpretation:
- **75-100:** Excellent (Green badge)
- **50-74:** Good (Yellow badge)
- **0-49:** Needs improvement (Red badge)

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** Cannot connect to MongoDB

**Solutions:**
```bash
# For local MongoDB:
# Check if MongoDB is running
mongod

# On macOS with Homebrew:
brew services list
brew services start mongodb-community

# On Ubuntu/Linux:
sudo systemctl status mongod
sudo systemctl start mongod

# For MongoDB Atlas:
# 1. Check connection string in .env
# 2. Whitelist your IP address in Atlas
# 3. Verify username/password
```
