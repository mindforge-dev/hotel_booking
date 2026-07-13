# Hotel Booking System Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [Project Structure](#project-structure)
8. [Setup & Installation](#setup--installation)
9. [Development Guide](#development-guide)
10. [Deployment](#deployment)
11. [Features](#features)

## Project Overview

The Hotel Booking System is a full-stack web application built with Next.js 15 that allows users to search, view, and book hotels. The system includes both a customer-facing interface and an admin dashboard for hotel management.

### Key Features
- Hotel search and filtering
- User authentication and authorization
- Hotel booking system
- Admin dashboard for hotel management
- Real-time notifications
- Responsive design with dark/light theme support
- Interactive maps integration
- Review and rating system

## Technology Stack

### Frontend
- **Next.js 15.1.7** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.3.3** - Type safety
- **Tailwind CSS 3.4.17** - Styling
- **Framer Motion 12.7.4** - Animations
- **Radix UI** - Accessible UI components
- **React Hook Form 7.54.2** - Form handling
- **Zod 3.24.2** - Schema validation
- **TanStack Query 5.81.5** - Data fetching and caching
- **React Leaflet 5.0.0** - Maps integration

### Backend
- **Next.js API Routes** - Server-side API
- **Prisma 5.10.2** - Database ORM
- **PostgreSQL** - Database
- **NextAuth.js 4.24.11** - Authentication
- **bcryptjs 3.0.2** - Password hashing

### Development & Deployment
- **Docker** - Containerization
- **ESLint** - Code linting
- **Vercel** - Deployment platform

## Architecture

The application follows a modern full-stack architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - Pages         │    │ - Authentication│    │ - Prisma ORM    │
│ - Components    │    │ - Hotel CRUD    │    │ - Migrations    │
│ - State Mgmt    │    │ - Booking API   │    │ - Seeding       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Route Groups
The application uses Next.js 13+ App Router with route groups:

- `(app)` - Public-facing application
- `(dashboard)` - Admin dashboard
- `api` - API endpoints

### Real-time WebSocket Architecture
The project supports real-time notifications (e.g. for hotel bookings and administrative alerts) through a dedicated AWS CDK WebSocket infrastructure connected to the Next.js client.

#### Infrastructure Diagram
![CDK WebSocket Infrastructure](infrastructure-composer-WebSocketNotificationStack-dev.yaml.png)

```
┌──────────────────┐        ┌─────────────────────┐        ┌───────────────────┐
│   Next.js App    │◄──────►│  API Gateway WS API  │◄──────►│  Lambda Handlers   │
│   (Frontend)     │  WSS   │  wss://.../dev       │  invoke │  connect/disconnect│
│                  │        │                      │        │  sendMessage       │
└──────────────────┘        └─────────────────────┘        └─────────┬─────────┘
                                                                      │
                                                                      ▼
                                                           ┌───────────────────┐
                                                           │  DynamoDB          │
                                                           │  WebSocketConn-    │
                                                           │  ections (TTL 24h)  │
                                                           │  PK: connectionId   │
                                                           │  GSI: userId        │
                                                           └───────────────────┘
```

#### Client-side Connection Handling (`WebSocketProvider`)
Located in [webSocketProvider.tsx](file:///home/thz/Desktop/projects/hotel_booking/providers/webSocketProvider.tsx), the client handles WebSocket sessions:
* **Lifecycle & Scope**: Initiated automatically upon user authentication (`status === "authenticated"`). Connections are cached in a React Ref to prevent duplicate connections on re-render, and cleaned up on unmount or logout.
* **Auto-Reconnection**: Automatically attempts reconnection up to 5 times (3-second delay) on unclean closures.
* **State Synchronization**: Upon receiving a notification (`action: "sendNotification"`), it directly updates the local React Query query cache (`notificationsQueryKey`) so badges update instantly without reloading the page. It also triggers a toast alert (throttled to a 3-second window).
* **Outgoing Messages**: Dispatches updates through backend service helpers (REST) rather than raw WS socket commands to act as a fail-safe, non-blocking pipeline.

Detailed setup and stack architecture instructions are located in the [CDK Infrastructure README](file:///home/thz/Desktop/projects/hotel_booking/packages/cdk-infra/README.md).

## Database Schema

### Core Models

#### User
```prisma
model User {
  id            String         @id @default(cuid())
  name          String?
  email         String?        @unique
  password      String?
  emailVerified DateTime?
  image         String?
  role          Role           @default(USER)
  accounts      Account[]
  bookings      Booking[]
  notifications Notification[]
  sessions      Session[]
}
```

#### Hotel
```prisma
model Hotel {
  id          String    @id @default(cuid())
  name        String
  description String
  image       String
  rating      Float
  featured    Boolean   @default(false)
  amenities   String[]
  cityId      String
  latitude    Float
  longitude   Float
  bookings    Booking[]
  city        City      @relation(fields: [cityId], references: [id])
  reviews     Review[]
  rooms       Room[]
}
```

#### Booking
```prisma
model Booking {
  id        String        @id @default(cuid())
  hotelId   String
  userId    String
  checkIn   DateTime
  checkOut  DateTime
  status    String
  hotel     Hotel         @relation(fields: [hotelId], references: [id])
  user      User          @relation(fields: [userId], references: [id])
  rooms     BookingRoom[]
}
```

#### Room
```prisma
model Room {
  id        String        @id @default(cuid())
  hotelId   String
  available Int
  total     Int
  roomType  RoomType
  amenities String[]
  image     String
  price     Float
  name      String
  bookings  BookingRoom[]
  hotel     Hotel         @relation(fields: [hotelId], references: [id])
}
```

### Enums
```prisma
enum RoomType {
  SINGLE
  DOUBLE
  TWIN
  SUITE
  FAMILY
}

enum Role {
  USER
  ADMIN
}
```

## API Endpoints

### Public Endpoints

#### Hotels
- `GET /api/hotels` - Get hotels with filtering
  - Query params: `search`, `city`, `rating`, `country`
- `POST /api/hotels` - Create new hotel (admin only)

#### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/[cityId]` - Get specific city
- `GET /api/locations/popularDestinations` - Get popular destinations

#### Authentication
- `POST /api/register` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Protected Endpoints

#### Bookings
- `GET /api/bookings` - Get user bookings (authenticated)
- `POST /api/bookings` - Create new booking (authenticated)
- `GET /api/bookings/[id]` - Get specific booking

#### Dashboard (Admin only)
- `GET /api/dashboard/hotels` - Get all hotels for admin
- `POST /api/dashboard/hotels` - Create hotel
- `DELETE /api/dashboard/hotels` - Delete hotel
- `GET /api/dashboard/hotels/[hotelId]` - Get specific hotel
- `GET /api/dashboard/hotels/[hotelId]/rooms` - Get hotel rooms

#### Notifications
- `GET /api/dashboard/notifications` - Get notifications
- `POST /api/dashboard/notifications` - Create notification
- `PUT /api/dashboard/notifications/[id]` - Update notification

## Authentication & Authorization

The application uses NextAuth.js for authentication with the following features:

### Authentication Flow
1. Users can register with email/password
2. Passwords are hashed using bcryptjs
3. Sessions are managed by NextAuth.js
4. JWT tokens are used for API authentication

### Authorization Levels
- **Public**: Hotel browsing, search
- **Authenticated**: Booking creation, profile management
- **Admin**: Dashboard access, hotel management

### Middleware Protection
```typescript
// middleware.ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
  ]
}
```

## Project Structure

```
hotel-booking/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Public application routes
│   │   ├── auth/               # Authentication pages
│   │   ├── hotels/             # Hotel listing and details
│   │   ├── search/             # Hotel search
│   │   ├── bookings/           # User bookings
│   │   └── layout.tsx          # Public layout
│   ├── (dashboard)/            # Admin dashboard routes
│   │   └── dashboard/          # Dashboard pages
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── hotels/            # Hotel API
│   │   ├── bookings/          # Booking API
│   │   └── dashboard/         # Admin API
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
├── components/                 # Reusable components
│   ├── ui/                    # Base UI components
│   ├── dashboard/             # Dashboard components
│   ├── hotel/                 # Hotel-related components
│   └── providers/             # Context providers
├── lib/                       # Utility libraries
│   ├── prisma.ts             # Database client
│   ├── authGuard.ts          # Authentication helper
│   └── utils.ts              # General utilities
├── types/                     # TypeScript type definitions
├── hooks/                     # Custom React hooks
├── prisma/                    # Database schema and migrations
├── docker/                    # Docker configurations
└── public/                    # Static assets
```

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Docker (optional)

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd hotel-booking
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Environment Setup**
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_booking"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

5. **Start development server**
```bash
npm run dev
```

### Docker Setup

1. **Using Docker Compose**
```bash
docker compose up
```

2. **Run migrations in Docker**
```bash
docker compose run --rm web pnpm prisma migrate deploy
```

## Development Guide

### Adding New Features

1. **Database Changes**
   - Update `prisma/schema.prisma`
   - Create migration: `npx prisma migrate dev`
   - Update types in `types/` directory

2. **API Endpoints**
   - Create route handlers in `app/api/`
   - Add authentication where needed
   - Implement proper error handling

3. **Frontend Components**
   - Create components in `components/`
   - Use TypeScript for type safety
   - Follow existing patterns for styling

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Implement proper error handling
- Add loading states for async operations

### Testing

The project currently doesn't include automated tests, but you should consider adding:
- Unit tests for utilities and components
- Integration tests for API endpoints
- E2E tests for critical user flows

## Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   - Import project to Vercel
   - Configure environment variables
   - Deploy automatically on push

2. **Environment Variables**
```env
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

### Docker Deployment

1. **Build production image**
```bash
docker build -t hotel-booking .
```

2. **Run with production compose**
```bash
docker-compose -f docker/prod/docker-compose.prod.yml up
```

## Features

### User Features
- **Hotel Search**: Search hotels by name, location, rating
- **Hotel Details**: View detailed hotel information, amenities, rooms
- **Booking System**: Book rooms with date selection
- **User Dashboard**: View booking history and status
- **Authentication**: Secure login/registration system
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Dark and light mode toggle

### Admin Features
- **Hotel Management**: Create, edit, delete hotels
- **Room Management**: Manage hotel rooms and availability
- **Booking Management**: View and manage all bookings
- **User Management**: View user accounts and activity
- **Dashboard Analytics**: View booking statistics and metrics
- **Notification System**: Send notifications to users

### Technical Features
- **Real-time Updates**: WebSocket integration for live updates
- **Image Optimization**: Next.js image optimization
- **SEO Optimization**: Meta tags and structured data
- **Performance**: Optimized loading and caching
- **Security**: Input validation, authentication, authorization
- **Accessibility**: ARIA labels and keyboard navigation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is private and proprietary.