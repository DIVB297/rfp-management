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
- 5-day sync window

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

## 📁 Project Structure

```
rfp-management/
├── rfp-backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── models/
│   │   ├── RFP.js                   # RFP schema (status: pending/closed/accepted)
│   │   ├── Vendor.js                # Vendor schema
│   │   └── VendorResponse.js        # Vendor response schema
│   ├── routes/
│   │   ├── rfp.js                   # RFP CRUD + status update + response counts
│   │   ├── vendor.js                # Vendor management
│   │   ├── vendorResponse.js        # Vendor responses + acceptance endpoint
│   │   └── email.js                 # IMAP sync routes
│   ├── utils/
│   │   ├── emailService.js          # SMTP email sending + acceptance emails
│   │   ├── aiAnalysis.js            # OpenAI GPT-4 analysis
│   │   └── imapService.js           # IMAP email sync service
│   ├── uploads/                     # Uploaded RFP files
│   ├── .env                         # Environment variables (not in git)
│   ├── .env.example                 # Example environment file
│   ├── server.js                    # Main Express server
│   └── package.json
│
└── rfp-frontend/
    ├── src/
    │   └── app/
    │       ├── page.tsx             # Home page (2 cards: Submit RFP, View RFPs)
    │       ├── layout.tsx           # Root layout
    │       ├── globals.css          # Global styles
    │       ├── submit/
    │       │   └── page.tsx         # RFP submission form
    │       └── rfps/
    │           ├── page.tsx         # RFPs list + Sync button + Quick View
    │           └── [id]/
    │               └── page.tsx     # RFP details + vendor responses + sorting + acceptance
    ├── .env.local                   # Frontend API URL
    ├── next.config.ts               # Next.js configuration
    ├── tsconfig.json                # TypeScript configuration
    ├── tailwind.config.ts           # Tailwind CSS configuration
    └── package.json

Note: Deprecated folders removed:
- /emails page (email inbox functionality moved to /rfps page)
- /vendor-response page (not needed)
- /public SVG files (unused Next.js default assets)
```

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
6. Optionally attach files (max 5 files, 10MB each)
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
| POST | `/api/vendors` | Create new vendor |

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
| GET | `/api/emails/stats` | Get email inbox statistics |

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

## 📦 File Upload Configuration

- **Maximum files:** 5 per RFP
- **Maximum size:** 10MB per file
- **Allowed types:** PDF, DOC, DOCX, XLS, XLSX, TXT
- **Storage:** Local filesystem in `rfp-backend/uploads/`

## 📊 Status Workflow

```
┌─────────┐
│ Pending │ ──────┐
└─────────┘       │
                  ▼
              ┌──────────┐
              │  Closed  │
              └──────────┘
                  
┌─────────┐
│ Pending │ ──────┐
└─────────┘       │
                  ▼
              ┌──────────┐
              │ Accepted │ (after accepting a vendor)
              └──────────┘
```

**Status Meanings:**
- **Pending:** RFP submitted, waiting for responses
- **Closed:** RFP closed without acceptance
- **Accepted:** A vendor proposal has been accepted

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

### Email Not Sending/Syncing

**Problem:** Emails not being sent or IMAP sync failing

**Solutions:**
1. **Verify Gmail settings:**
   - 2-Step Verification is enabled
   - Using App Password (not regular password)
   - IMAP is enabled in Gmail settings

2. **Check .env configuration:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=16-digit-app-password  # No spaces!
   
   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   IMAP_USER=your-email@gmail.com
   IMAP_PASS=16-digit-app-password  # Same as SMTP_PASS
   ```

3. **Test email connection:**
   - Try sending a test email through Gmail web interface
   - Check "Less secure app access" is NOT needed (App Password handles this)
   - Check spam folder for emails

4. **IMAP specific:**
   - Wait 1-2 minutes for emails to arrive
   - Vendor must reply to the exact email address
   - Check backend console for sync errors

### CORS Errors

**Problem:** CORS policy blocking requests

**Solutions:**
1. Verify `FRONTEND_URL` in backend `.env`:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

2. Ensure both servers are running:
   - Backend on port 5000
   - Frontend on port 3000

3. Check browser console for specific CORS errors
4. Clear browser cache and reload

### Port Already in Use

**Problem:** Port 5000 or 3000 already in use

**Solutions:**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Or change port in .env:
# Backend: PORT=5001
# Frontend: (Next.js will auto-select next available port)
```

### AI Analysis Not Working

**Problem:** Vendor responses not getting AI analysis

**Solutions:**
1. **Check OpenAI API key:**
   ```env
   OPENAI_API_KEY=sk-...
   ```

2. **Verify API key is valid:**
   - Visit https://platform.openai.com/api-keys
   - Check key status and limits
   - Ensure billing is set up

3. **Check backend console for errors:**
   - Rate limit errors (upgrade plan or wait)
   - Invalid API key errors
   - Network errors

4. **Manual retry:**
   - Delete the vendor response
   - Re-sync emails to trigger analysis again

### File Upload Errors

**Problem:** Files not uploading

**Solutions:**
1. **Check file size:** Must be under 10MB
2. **Check file type:** Only PDF, DOC, DOCX, XLS, XLSX, TXT
3. **Check uploads folder:** `rfp-backend/uploads/` must exist and be writable
   ```bash
   mkdir -p rfp-backend/uploads
   chmod 755 rfp-backend/uploads
   ```

### Vendor Response Not Appearing

**Problem:** Synced email but no vendor response

**Solutions:**
1. **Check vendor email matching:**
   - Vendor must be in VENDOR_EMAILS list in .env
   - Email must be sent FROM vendor's email
   - Subject should contain RFP ID (optional but helps)

2. **Check backend console:**
   - Look for "No matching RFP found" errors
   - Check for email parsing errors

3. **Verify email content:**
   - Email should contain pricing info
   - Timeline information helps
   - Clear text content (not just HTML)

4. **Check sync window:**
   - Only syncs emails from last 5 days
   - Older emails are ignored

## 🔒 Security Notes

- **No Authentication:** System is open (as per project requirements)
- **File Validation:** Upload types and sizes are validated
- **CORS Configuration:** Restricted to specified frontend URL
- **Environment Variables:** Sensitive data stored in .env (not in git)
- **MongoDB Injection:** Protected via Mongoose ODM
- **Email Security:** Uses App Passwords (more secure than regular passwords)
- **Input Sanitization:** Email content is parsed and sanitized
- **File Storage:** Uploaded files stored locally with unique names

## 🎯 Email Workflow Details

### Vendor Email Matching Algorithm

The system uses a **vendor-first matching** approach:

1. **Email Received** → Check sender's email address
2. **Find Vendor** → Match against vendors in database
3. **Find RFP** → Look for recent RFPs (last 5 days) sent to that vendor
4. **Parse Content** → Extract proposal details using AI
5. **Analyze** → Score and provide recommendations
6. **Store** → Save vendor response with AI analysis

### Email Parsing

The system extracts:
- **Vendor Name:** From email sender name
- **Vendor Email:** From email sender address
- **Subject:** Email subject line
- **Proposed Price:** Detected from keywords ($, price, cost, budget)
- **Timeline:** Detected from keywords (weeks, months, days, timeline)
- **Experience:** Years of experience, if mentioned
- **Team Size:** Number of team members, if mentioned
- **Approach:** Full email body content

### Email Templates

**RFP Notification to Vendor:**
- Professional HTML template
- RFP details (title, budget, deadline)
- Requirements
- Contact information
- Instructions to reply

**Acceptance Email to Vendor:**
- Congratulations message
- Project details
- Proposal information accepted
- AI score achieved
- Next steps
- Contact information

## 📈 Future Enhancements

### Planned Features
- User authentication and authorization
- Multi-tenant support
- Real-time notifications (WebSockets)
- Advanced search and filtering
- Export to PDF/Excel
- Dashboard with analytics and charts
- Email template customization
- Vendor portal for direct submission
- Contract generation
- Budget tracking and alerts
- Calendar integration
- Mobile app (React Native)

### Technical Improvements
- Redis caching for better performance
- Queue system (Bull/BullMQ) for email processing
- Elasticsearch for advanced search
- S3 integration for file storage
- Automated testing (Jest, Cypress)
- Docker containerization
- CI/CD pipeline
- Monitoring and logging (Winston, Sentry)

## 📄 License

ISC License

Copyright (c) 2026

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check troubleshooting section above
- Review code comments for implementation details

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Next.js** team for the amazing framework
- **MongoDB** for the database
- **Node.js** community for excellent packages

---

**Built with ❤️ using Next.js, Express.js, MongoDB, and OpenAI**
