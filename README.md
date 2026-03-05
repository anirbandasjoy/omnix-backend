<p align="center">
  <a href="https://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">Omnix Backend</h1>
<p align="center">
  <i>A scalable, enterprise-grade authentication backend built with NestJS, featuring comprehensive audit logging, role-based access control, and multi-device session management.</i>
</p>

<p align="center">
  <a href="https://github.com/nestjs/nest" target="blank"><img src="https://img.shields.io/badge/NestJS-10.0-e0284d?logo=nestjs" alt="NestJS Version"/></a>
  <a href="https://nodejs.org" target="blank"><img src="https://img.shields.io/badge/Node.js-18%2B-brightgreen?logo=node.js" alt="Node Version"/></a>
  <a href="https://www.typescriptlang.org/" target="blank"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript Version"/></a>
  <a href="https://www.postgresql.org/" target="blank"><img src="https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql" alt="PostgreSQL Version"/></a>
  <a href="https://drizzle.team/" target="blank"><img src="https://img.shields.io/badge/Drizzle-ORM-orange?logo=drizzle" alt="Drizzle ORM"/></a>
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [Audit Logging](#-audit-logging)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with access and refresh tokens
- **Multi-provider Identity System** (email, phone, OAuth providers)
- **Role-Based Access Control (RBAC)** with flexible permissions
- **Device Management** with fingerprinting and trusted devices
- **Session Management** with real-time tracking
- **Secure Password Handling** with bcrypt and strength validation

### 📊 Audit & Activity Logging
- **Comprehensive Audit Trail** for all authentication events
- **Categorised Logs** (authentication, authorization, security, API, data changes)
- **Severity Levels** (emergency, alert, critical, error, warning, notice, info, debug)
- **Search & Filter** capabilities across all logs
- **Compliance Support** with log export (JSON/CSV)
- **Retention Policies** with automatic cleanup

### 👤 User Management
- **User Profiles** with customizable fields
- **Email Verification** workflow
- **Password Reset** functionality
- **Account Status Management** (active, disabled, deleted)
- **Multi-device Support** with session tracking

### 🛡️ Security
- **SQL Injection Prevention** with parameterized queries (Drizzle ORM)
- **XSS Protection** with input sanitization
- **CSRF Protection** with token validation
- **Rate Limiting** for API endpoints
- **IP Address & User Agent Tracking**
- **Secure Token Storage** with hashing

### ⚡ Performance
- **Optimized Database Queries** with composite indexes
- **Connection Pooling** for PostgreSQL
- **Caching Layer** for frequently accessed data
- **Transaction Support** for data consistency
- **Asynchronous Operations** for non-blocking I/O

---

## 🛠️ Tech Stack

### Core Framework
- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Node.js](https://nodejs.org/)** - JavaScript runtime

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Drizzle ORM](https://drizzle.team/)** - Type-safe SQL toolkit
- **[Drizzle Migrations](https://drizzle.team/kit-docs/)** - Database migrations

### Authentication
- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[Passport.js](http://www.passportjs.org/)** - Authentication middleware
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing

### Validation & Serialization
- **[class-validator](https://github.com/typestack/class-validator)** - Input validation
- **[class-transformer](https://github.com/typestack/class-transformer)** - Object transformation
- **[Zod](https://zod.dev/)** - Schema validation
- **[nestjs-zod](https://github.com/Roman-Hotsiy/nestjs-zod)** - NestJS + Zod integration

### Utilities
- **[nanoid](https://github.com/ai/nanoid)** - Unique ID generation
- **[nodemailer](https://nodemailer.com/)** - Email service

### Development
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[Jest](https://jestjs.io/)** - Testing framework
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│                  (Controllers & DTOs)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                         │
│                    (Business Logic)                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Repository Layer                       │
│                     (Data Access)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│                   (PostgreSQL + Drizzle)                    │
└─────────────────────────────────────────────────────────────┘
```

### Domain-Driven Design

The project follows Domain-Driven Design (DDD) principles with clear domain boundaries:

- **Auth Domain** - Authentication, sessions, tokens, devices
- **User Domain** - User profiles, identities, roles, permissions
- **Audit Domain** - Audit logs, compliance reporting
- **Activity Domain** - User activity tracking

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher
- **PostgreSQL** 15.x or higher
- **Git**

### Check versions

```bash
node --version   # Should be 18.x or higher
pnpm --version   # Should be 8.x or higher
psql --version   # Should be 15.x or higher
```

---

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/omnix-backend.git
cd omnix-backend
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Environment Variables](#-environment-variables))

5. **Run database migrations**

```bash
pnpm run db:generate
pnpm run db:migrate
pnpm run db:push
```

6. **Start the development server**

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

### Database Configuration

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=omnix_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### JWT Configuration

```env
# JWT Access Token
JWT_ACCESS_SECRET=your_access_secret_key_minimum_32_characters
JWT_ACCESS_EXPIRATION=15m

# JWT Refresh Token
JWT_REFRESH_SECRET=your_refresh_secret_key_minimum_32_characters
JWT_REFRESH_EXPIRATION=7d
```

### Email Configuration

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_NAME=Omnix
SMTP_FROM_EMAIL=noreply@omnix.com
```

### Application Configuration

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

### Redis Configuration (Optional)

```env
# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## 🗄️ Database Setup

### Initialize Database

```bash
# Generate migrations
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Push schema (for development)
pnpm run db:push
```

### Seed Database (Optional)

```bash
pnpm run db:seed
```

### Database Schema Overview

The database includes the following main tables:

- **users** - User accounts
- **identities** - Authentication identities (email, phone, OAuth)
- **profiles** - User profile information
- **roles** - User roles
- **permissions** - System permissions
- **user_roles** - User-role assignments
- **role_permissions** - Role-permission mappings
- **devices** - User devices
- **sessions** - Active sessions
- **auth_refresh_tokens** - Refresh tokens
- **audit_logs** - Comprehensive audit trail
- **user_activities** - User activity tracking

---

## 🏃 Running the Application

### Development Mode

```bash
pnpm run start:dev
```

### Production Mode

```bash
# Build the application
pnpm run build

# Start production server
pnpm run start:prod
```

### Watch Mode

```bash
pnpm run start:watch
```

### Debug Mode

```bash
pnpm run start:debug
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "displayName": "John Doe",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "logoutAllDevices": false
}
```

### Audit Endpoints

#### Get User Audit Logs

```http
GET /audit/logs/user/:userId
Authorization: Bearer your_access_token
Query Parameters:
  - startDate: string (ISO 8601)
  - endDate: string (ISO 8601)
  - limit: number (default: 20)
  - offset: number (default: 0)
```

#### Get Security Events

```http
GET /audit/logs/security
Authorization: Bearer your_access_token
Query Parameters:
  - startDate: string (ISO 8601)
  - endDate: string (ISO 8601)
  - limit: number (default: 20)
```

#### Export Audit Logs

```http
GET /audit/logs/export
Authorization: Bearer your_access_token
Query Parameters:
  - startDate: string (ISO 8601)
  - endDate: string (ISO 8601)
  - format: "json" | "csv"
```

### Interactive API Documentation

When running in development mode, visit:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **API JSON**: `http://localhost:3000/api/docs-json`

---

## 🗂️ Database Schema

### Key Tables

#### Users

```sql
- id (UUID, Primary Key)
- status (Boolean)
- email_verified (Boolean)
- phone_verified (Boolean)
- is_deleted (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Identities

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- provider (String) - email, phone, google, facebook, etc.
- provider_id (String) - Email, phone number, OAuth ID
- password (String, Hashed)
- is_verified (Boolean)
- is_primary (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Audit Logs

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key, Nullable)
- category (Enum) - authentication, authorization, security, api, etc.
- severity (Enum) - emergency, alert, critical, error, warning, notice, info, debug
- action (String)
- entity_type (String, Nullable)
- entity_id (UUID, Nullable)
- description (Text, Nullable)
- metadata (JSONB, Nullable)
- ip_address (String, Nullable)
- user_agent (String, Nullable)
- location (JSONB, Nullable)
- http_method (String, Nullable)
- status_code (Integer, Nullable)
- duration (Integer, Nullable) - Request duration in ms
- error_message (Text, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Sessions

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- device_id (UUID, Foreign Key)
- token (String, Hashed)
- ip_address (String, Nullable)
- user_agent (String, Nullable)
- location (JSONB, Nullable)
- is_active (Boolean)
- expires_at (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Devices

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- device_type (String)
- device_name (String)
- os (String, Nullable)
- browser (String, Nullable)
- fingerprint (String)
- is_trusted (Boolean)
- last_seen (Timestamp, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Indexes

The database includes optimized composite indexes for:

- User lookups by email/phone
- Session management by user and device
- Audit log queries by user, category, severity, date range
- Activity tracking by user and type
- Token validation by hash and expiration

---

## 📁 Project Structure

```
omnix-backend/
├── src/
│   ├── core/                    # Core utilities and configurations
│   │   ├── build
│   │   ├── config
│   │   ├── database
│   │   ├── enums
│   │   ├── interceptors
│   │   └── utils
│   │
│   ├── database/                # Database schema and migrations
│   │   └── schemas/
│   │       ├── audit/
│   │       ├── auth/
│   │       ├── user/
│   │       └── enums/
│   │
│   ├── domains/                 # Domain modules (DDD)
│   │   ├── audit/              # Audit logging domain
│   │   │   ├── dto/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   └── audit.module.ts
│   │   │
│   │   ├── auth/               # Authentication domain
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── strategies/
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── user/               # User management domain
│   │   │   ├── dto/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   └── user.module.ts
│   │   │
│   │   └── activity/           # Activity tracking domain
│   │       ├── repositories/
│   │       ├── services/
│   │       └── activity.module.ts
│   │
│   ├── infrastructure/          # External services
│   │   └── email/
│   │
│   ├── presentation/            # API layer
│   │   └── http/
│   │       └── v1/
│   │
│   ├── app.module.ts
│   ├── main.ts
│   └── ...
│
├── test/                        # Test files
├── .env.example                 # Environment variables template
├── drizzle.config.ts           # Drizzle ORM configuration
├── nest-cli.json               # NestJS CLI configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

---

## 🔒 Security Features

### Password Security

- **Minimum 8 characters** with validation
- **Complexity requirements** (uppercase, lowercase, numbers, special chars)
- **bcrypt hashing** with salt rounds
- **Strength meter** with user feedback

### Token Security

- **Short-lived access tokens** (15 minutes default)
- **Long-lived refresh tokens** (7 days default)
- **Token hashing** before database storage
- **Automatic token rotation** on refresh

### Session Security

- **Device fingerprinting** for session tracking
- **IP address logging** for anomaly detection
- **User agent tracking** for device identification
- **Geolocation tracking** (optional)
- **Automatic session cleanup** on expiration

### API Security

- **Rate limiting** on all endpoints
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Input validation** on all endpoints
- **SQL injection prevention** with parameterized queries

---

## 📊 Audit Logging

### Log Categories

- **Authentication** - Login, logout, registration, password changes
- **Authorization** - Permission changes, role modifications
- **Session** - Session creation, revocation, expiration
- **Security** - Failed attempts, suspicious activity
- **API** - API calls with status codes and duration
- **User** - Profile changes, data modifications
- **Data** - CRUD operations on entities
- **System** - System-level events

### Audit Features

```typescript
// Log authentication events
await auditService.logAuthEvent({
  userId: user.id,
  action: 'user_logged_in',
  description: 'User logged in successfully',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

// Log security events
await auditService.logSecurityEvent({
  userId: user.id,
  action: 'brute_force_detected',
  severity: 'alert',
  description: 'Multiple failed login attempts',
  metadata: { attempts: 5, timeWindow: '5 minutes' },
});

// Log API calls
await auditService.logApiCall({
  userId: user.id,
  httpMethod: 'POST',
  action: 'create_post',
  statusCode: 201,
  duration: 150,
});

// Log data changes
await auditService.logDataChange({
  userId: user.id,
  action: 'update',
  entityType: 'profile',
  entityId: profileId,
  changes: { firstName: 'Old → New' },
});

// Log errors
await auditService.logError({
  userId: user.id,
  errorMessage: 'Database connection failed',
  stackTrace: error.stack,
});
```

### Query Audit Logs

```typescript
// Get user audit logs
const logs = await auditService.getUserAuditLogs(userId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  limit: 50,
});

// Get security events
const securityEvents = await auditService.getSecurityEvents({
  startDate: date30DaysAgo,
  limit: 100,
});

// Search logs
const results = await auditService.searchLogs({
  searchTerm: 'login',
  category: 'authentication',
  startDate: date7DaysAgo,
});

// Export for compliance
const csv = await auditService.export({
  category: 'authentication',
  startDate: date30DaysAgo,
  format: 'csv',
});
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
pnpm run test

# Run with coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

### E2E Tests

```bash
# Run E2E tests
pnpm run test:e2e

# Run E2E with coverage
pnpm run test:e2e:cov
```

### Test Coverage

Current coverage goals:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t omnix-backend .

# Run container
docker run -p 3000:3000 --env-file .env omnix-backend
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment-Specific Builds

```bash
# Production build
NODE_ENV=production pnpm run build

# Start production server
NODE_ENV=production pnpm run start:prod
```

### PM2 Process Manager

```bash
# Install PM2
pnpm add -g pm2

# Start application
pm2 start dist/main.js --name omnix-backend

# View logs
pm2 logs omnix-backend

# Monitor
pm2 monit
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features
- Update documentation as needed

### Commit Messages

Follow conventional commits:

```
feat: add user registration endpoint
fix: resolve token expiration bug
docs: update README with new features
refactor: simplify audit service logic
test: add integration tests for auth flow
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Support

For support, email support@omnix.com or join our Slack channel.

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The framework used
- [Drizzle ORM](https://drizzle.team/) - Type-safe SQL
- [TypeScript](https://www.typescriptlang.org/) - Language
- All contributors to this project

---

<p align="center">
  <b>Built with ❤️ by the Omnix Team</b>
</p>
