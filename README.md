# NestJS DDD Project with Dual Database Architecture

A sophisticated Domain-Driven Design (DDD) implementation using NestJS framework, featuring a dual database architecture with PostgreSQL and MongoDB. This project demonstrates enterprise-level architecture patterns with a focus on scalability and maintainability.

## 🏗️ Architecture Overview

This project implements a clean architecture following DDD principles, structured into distinct layers:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External concerns (databases, third-party services)
- **Presentation Layer**: API endpoints and controllers

### 🌟 Key Features

- Dual database implementation (PostgreSQL + MongoDB)
- Advanced caching strategy with Redis
- Event-driven architecture using RabbitMQ
- Comprehensive error handling
- Performance monitoring
- Type-safe development with TypeScript
- JWT-based authentication
- Automated testing setup

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- MongoDB
- Redis
- RabbitMQ
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the application: `npm run start`

### Environment Setup

Create a `.env` file in the root directory:

```env
PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/your_database

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=main_queue

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=no-reply@example.com

```

## Installation

```bash
$ npm install
```

## Running the Application

```bash
# development mode
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 🏛️ Project Structure

```
src/
├── application/ # Application services and DTOs
├── domain/ # Core business logic
│ ├── entities/ # Domain entities
│ ├── repositories/ # Repository interfaces
│ ├── services/ # Domain services
│ └── schemas/ # Database schemas
├── infrastructure/ # External concerns
│ ├── database/ # Database configurations
│ ├── repositories/ # Repository implementations
│ ├── interceptors/ # HTTP interceptors
│ ├── exceptions/ # Exception filters
│ └── services/ # Infrastructure services
└── presentation/ # Controllers and routes
```

## Key Design Decisions

1. **Dual Database Strategy**
   - PostgreSQL: Primary database for structured data
   - MongoDB: Used for flexible schema requirements

2. **Repository Pattern**
   - Abstracted database operations
   - Interchangeable database implementations
   - Clean separation between domain and data access

3. **Provider Organization**
   - Separated into repository, service, and core providers
   - Clear dependency injection setup
   - Modular and maintainable structure


## 🔒 Security

- JWT-based authentication
- Password hashing using bcrypt
- Helmet integration for HTTP security
- Environment variable protection

## 🔍 Performance Monitoring

The application includes built-in performance monitoring:
- Request duration tracking
- Route performance metrics
- Custom performance interceptors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
