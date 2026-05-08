# Chef Alert - Professional Chef Platform

A full-stack platform connecting clients with professional chefs for personalized culinary experiences.

## Live Demo

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001  
- Admin Dashboard: http://localhost:5173/admin

## Features

### For Chefs
- Create professional profiles with portfolios
- Set availability and pricing
- Manage bookings and client communication
- Real-time chat with clients
- Receive reviews and ratings

### For Clients
- Browse verified professional chefs
- Filter by cuisine, ratings, and price
- Book chefs for events and special occasions
- Secure payment system
- Real-time chat with chefs
- Submit reviews and ratings

### For Administrators
- Dashboard with platform analytics
- Manage users, chefs, and bookings
- View revenue and performance metrics
- Moderate content and verify profiles

## Tech Stack

### Frontend
- React 18 - Modern UI library
- TypeScript - Type-safe development
- Vite - Fast build tool
- Tailwind CSS - Utility-first styling
- React Router DOM - Client-side routing
- Lucide React - Icon library
- Axios - HTTP client
- Socket.IO Client - Real-time communication

### Backend
- Node.js & Express - Server framework
- MongoDB & Mongoose - Database & ODM
- JWT - Authentication & authorization
- Socket.IO - Real-time WebSockets
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (v6 or higher) running locally or connection string
- Git for version control

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
echo "MONGODB_URI=mongodb://localhost:27017/chef_alert
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=5001" > .env

# Start MongoDB service (Windows)
# Make sure MongoDB is running on port 27017

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (root of project)
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

### Environment Variables

Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/chef_alert
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=5001
NODE_ENV=development
```

### Frontend Configuration

Update src/lib/api.ts if backend URL changes:

```typescript
const API_BASE = 'http://localhost:5001'; // Change if deployed
```

## Project Structure
```
chef-alert/
├── server/                    # Backend
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── ChefProfile.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   └── Message.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── chefs.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   ├── chat.js
│   │   └── admin.js
│   ├── server.js           # Main server file
│   └── package.json
│
├── src/                     # Frontend
│   ├── components/         # Reusable components
│   │   └── Navigation.tsx
│   ├── context/           # React context
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities
│   │   ├── api.ts
│   │   └── socket.js
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Profile.tsx
│   │   ├── BrowseChefs.tsx
│   │   ├── ChefDetail.tsx
│   │   ├── ChefProfile.tsx
│   │   ├── ClientBookings.tsx
│   │   ├── ChefBookings.tsx
│   │   ├── Chat.tsx
│   │   └── AdminDashboard.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Database Schema

### User
```javascript
{
  email: String,           // Unique
  password: String,        // Hashed
  full_name: String,
  phone_number: String,
  role: String,           // 'client', 'chef', 'admin'
  profile_picture_url: String,
  address: String,
  city: String,
  state: String,
  zip_code: String
}
```

### ChefProfile
```javascript
{
  user_id: ObjectId,      // Reference to User
  bio: String,
  experience_years: Number,
  price_per_hour: Number,
  rating: Number,
  total_reviews: Number,
  availability_start_time: String,
  availability_end_time: String,
  certifications: String,
  specializations: String
}
```

### Booking
```javascript
{
  client_id: ObjectId,    // Reference to User
  chef_id: ObjectId,      // Reference to User
  booking_date: Date,
  start_time: String,
  end_time: String,
  location: String,
  cuisine_type: String,
  number_of_dishes: Number,
  status: String,        // 'pending', 'confirmed', 'completed', 'cancelled'
  total_amount: Number,
  special_requests: String
}
```

## Authentication Flow

- Registration: Users sign up as client/chef/admin
- Login: JWT token issued and stored locally
- Protected Routes: Token required for API access
- Authorization: Role-based access control

## API Endpoints

### Authentication
- POST /api/auth/signup - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update user profile

### Chefs
- GET /api/chefs - Get all chefs (public)
- GET /api/chefs/:id - Get chef by ID
- GET /chef/profile - Get chef profile (authenticated)
- PUT /chef/profile - Update chef profile

### Bookings
- POST /api/bookings - Create booking
- GET /api/bookings/client/:id - Get client bookings
- GET /api/bookings/chef/:id - Get chef bookings
- PUT /api/bookings/:id/status - Update booking status

### Reviews
- POST /api/reviews - Create review
- GET /api/reviews/chef/:id - Get chef reviews
- GET /api/reviews/booking/:id - Get booking review

### Chat
- GET /api/chat/booking/:id - Get chat messages
- POST /api/chat/messages - Send message
- GET /api/chat/booking/:id/details - Get booking chat details

### Admin (Admin only)
- GET /admin/stats - Platform statistics
- GET /admin/users - All users
- GET /admin/bookings - All bookings
- DELETE /admin/users/:id - Delete user
- DELETE /admin/bookings/:id - Delete booking

## UI Components

### Navigation
Responsive navbar with:

- Role-based menu items
- User profile with role badge
- Mobile hamburger menu
- Animated hover effects

### Pages
- Home - Landing page with hero section
- Login/Signup - Authentication forms
- Browse Chefs - Filterable chef directory
- Chef Detail - Chef profile & booking form
- Profile - User profile management
- Bookings - Client/Chef booking management
- Chat - Real-time messaging
- Admin Dashboard - Platform management

## Deployment

### Backend Deployment (Render/Railway)
```bash
# Build command
npm install

# Start command
npm start
```

### Frontend Deployment (Vercel/Netlify)
- Build command: npm run build
- Output directory: dist
- Environment variables: Set VITE_API_URL

### Database Deployment
MongoDB Atlas for production database. Update MONGODB_URI in backend .env

## Testing Credentials

### Admin Account
- Email: admin@chefalert.com
- Password: admin123
- Access: Full admin dashboard

### Chef Account
- Email: chef@example.com
- Password: chef123
- Access: Chef profile & bookings

### Client Account
- Email: client@example.com
- Password: client123
- Access: Browse chefs & book services

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
# or
net start MongoDB  # Windows
```

#### Port Already in Use
```bash
# Change port in server/.env
PORT=5002
```

#### CORS Errors
Ensure frontend URLs are in server CORS config. Check server.js for allowed origins.

#### JWT Errors
Clear browser localStorage and restart both frontend and backend.

### Debug Tools
- Browser DevTools: Network tab for API calls
- Server Console: Detailed request/response logs
- MongoDB Compass: Database inspection
- Postman/Insomnia: API testing

## Future Enhancements

### Planned Features
- Payment integration (Stripe/Razorpay)
- Advanced chef search with geolocation
- Menu management system
- Event planning tools
- Mobile app (React Native)
- Analytics dashboard
- Email notifications
- Document verification for chefs

### Performance Optimizations
- Image optimization and CDN
- Database indexing
- API response caching
- Code splitting
- Lazy loading

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For any issues or questions, please contact:
- Email: moonorahu@gmail.com
- WhatsApp: +92 302 0130579
