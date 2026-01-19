# Nexavvy NBP Backend API

Backend API for the Nexavvy Business Partner (NBP) Dashboard built with Node.js, Express, and MongoDB.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Separate routes for partners and admins
- 📊 **Lead Management** - Complete CRUD operations for leads
- 📈 **Statistics & Analytics** - Partner and admin dashboards
- 🛡️ **Security** - Helmet, CORS, input validation
- 🗄️ **MongoDB** - NoSQL database with Mongoose ODM

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Security:** helmet, cors
- **Logging:** morgan

## Getting Started

### Prerequisites

- Node.js 16+ installed
- MongoDB installed and running locally OR MongoDB Atlas account

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI if needed
   - Change JWT_SECRET in production

3. **Seed the database with demo data:**
   ```bash
   npm run seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Server will run on: **http://localhost:5000**

## API Endpoints

### Authentication
```
POST   /api/auth/login       - Login with email/password
POST   /api/auth/register    - Register new partner
POST   /api/auth/logout      - Logout (client-side)
```

### Partner Routes (Protected)
```
GET    /api/partner/leads    - Get my submitted leads
GET    /api/partner/stats    - Get my statistics
```

### Lead Routes (Protected)
```
POST   /api/leads            - Submit new lead (Partner only)
```

### Admin Routes (Protected - Admin Only)
```
GET    /api/admin/leads      - Get all leads with filters
GET    /api/admin/stats      - Get system statistics
GET    /api/admin/partners   - Get all partners
PATCH  /api/admin/leads/:id/status - Update lead status
```

### User Routes (Protected)
```
GET    /api/user/profile     - Get current user profile
PUT    /api/user/profile     - Update user profile
```

### Health Check
```
GET    /api/health           - API health status
```

## Demo Credentials

After running `npm run seed`, use these credentials:

**Partner Account:**
- Email: `partner@demo.com`
- Password: `partner123`

**Admin Account:**
- Email: `admin@demo.com`
- Password: `admin123`

## Request/Response Examples

### Login
**Request:**
```json
POST /api/auth/login
{
  "email": "partner@demo.com",
  "password": "partner123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Amit Patel",
    "email": "partner@demo.com",
    "role": "partner",
    "phone": "9876543210"
  }
}
```

### Create Lead
**Request:**
```json
POST /api/leads
Authorization: Bearer <token>
{
  "name": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "city": "Mumbai",
  "businessName": "Doe Enterprises",
  "businessType": "retail",
  "website": "https://doeenterprises.com",
  "productServices": "Electronics retail"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "partnerId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "John Doe",
    "mobile": "9876543210",
    "email": "john@example.com",
    "city": "Mumbai",
    "businessName": "Doe Enterprises",
    "businessType": "retail",
    "website": "https://doeenterprises.com",
    "productServices": "Electronics retail",
    "status": "pending",
    "activeClient": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: 'partner', 'admin'),
  phone: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Leads Collection
```javascript
{
  _id: ObjectId,
  partnerId: ObjectId (ref: User),
  name: String,
  mobile: String,
  email: String,
  city: String,
  businessName: String,
  businessType: String,
  website: String,
  productServices: String,
  status: String (enum: 'pending', 'contacted', 'converted', 'rejected'),
  activeClient: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Project Structure

```
nexavvy-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── config.js            # App configuration
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Lead.js              # Lead model
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── roleCheck.js         # Role-based access
│   │   └── errorHandler.js      # Error handling
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── partnerController.js # Partner logic
│   │   ├── adminController.js   # Admin logic
│   │   └── userController.js    # User logic
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── partner.js           # Partner routes
│   │   ├── admin.js             # Admin routes
│   │   ├── user.js              # User routes
│   │   └── leads.js             # Lead routes
│   ├── utils/
│   │   ├── generateToken.js     # JWT utility
│   │   └── seedData.js          # Seed script
│   └── server.js                # Main server
├── .env                         # Environment variables
├── .env.example                 # Env template
├── .gitignore                   # Git ignore
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with demo data

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Role-based access control
- ✅ Error handling

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexavvy-nbp
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## License

This project is proprietary and confidential.

## Support

For support, email support@nexavvy.com
