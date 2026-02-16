# ERMN - Emergency Response & Medical Resource Network

A comprehensive platform connecting citizens, ambulances, hospitals, and blood banks for faster emergency response and better resource visibility.

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
│  (TypeScript)   │
└────────┬────────┘
         │ HTTP/REST + WebSocket
         │
┌────────▼─────────────────────────┐
│     Spring Boot Application      │
│  ┌─────────────────────────────┐ │
│  │   API Gateway Layer         │ │
│  │   (Security, Rate Limiting) │ │
│  └───────────┬─────────────────┘ │
│              │                    │
│  ┌───────────▼─────────────────┐ │
│  │   Controller Layer          │ │
│  │   (REST + WebSocket)        │ │
│  └───────────┬─────────────────┘ │
│              │                    │
│  ┌───────────▼─────────────────┐ │
│  │   Service Layer             │ │
│  │   (Business Logic)          │ │
│  └───────────┬─────────────────┘ │
│              │                    │
│  ┌───────────▼─────────────────┐ │
│  │   Repository Layer          │ │
│  │   (JPA/Hibernate)           │ │
│  └───────────┬─────────────────┘ │
└──────────────┼───────────────────┘
               │
      ┌────────▼────────┐
      │   MySQL Database│
      └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL 8.0+
- **Security**: Spring Security + JWT
- **Real-time**: WebSocket (STOMP)
- **Build Tool**: Maven
- **Migration**: Flyway

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **WebSocket**: SockJS + STOMP.js
- **Maps**: Leaflet
- **Charts**: Recharts

## 📋 Prerequisites

- Java 17 or higher
- Node.js 18+ and npm/yarn
- MySQL 8.0+
- Maven 3.8+

## 🚀 Setup Instructions

### 1. Database Setup (what you need to do for DB creation)

**You only need to create the database once.** Tables are created automatically by Flyway when the backend starts.

1. **Install and start MySQL 8.0+** (e.g. locally or via Docker).

2. **Create the database** (no tables yet):
   ```bash
   mysql -u root -p
   CREATE DATABASE ermn_db;
   exit;
   ```

3. **Set credentials** in `backend/src/main/resources/application.properties`:
   - `spring.datasource.url=jdbc:mysql://localhost:3306/ermn_db`
   - `spring.datasource.username=root`
   - `spring.datasource.password=<your_password>`

4. **Start the backend** (`mvn spring-boot:run`). On first run, Flyway will:
   - Apply all migrations in `backend/src/main/resources/db/migration/` (V1__... through V8__...)
   - Create tables: `users`, `ambulances`, `bookings`, `hospitals`, `bed_inventory`, `blood_banks`, `blood_inventory`, `notifications`

**Summary:** Create `ermn_db` → point the app to it → run the app. No manual table creation or SQL scripts needed.

### 2. Backend Setup

```bash
cd backend

# Update application.properties with your MySQL credentials
# Edit: src/main/resources/application.properties
# Update: spring.datasource.username and spring.datasource.password

# Build and run
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔐 Default Configuration

### Backend Configuration

Update `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/ermn_db
spring.datasource.username=root
spring.datasource.password=your_password

# JWT Secret (change in production!)
jwt.secret=your-256-bit-secret-key-change-in-production-minimum-32-characters
```

### Environment Variables

Copy the example and edit if needed:

```bash
cp frontend/.env.example frontend/.env
```

Default `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "CITIZEN"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "tokenType": "Bearer",
  "user": { ... }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "pickupLatitude": 12.9716,
  "pickupLongitude": 77.5946,
  "destinationLatitude": 12.9352,
  "destinationLongitude": 77.6245
}
```

#### Get Booking
```http
GET /api/bookings/{id}
Authorization: Bearer {accessToken}
```

#### Cancel Booking
```http
PUT /api/bookings/{id}/cancel
Authorization: Bearer {accessToken}
```

#### Update Booking Status
```http
PUT /api/bookings/{id}/status?status=EN_ROUTE
Authorization: Bearer {accessToken}
```

### Ambulance Endpoints

#### Get My Ambulance (Driver)
```http
GET /api/ambulances/my-ambulance
Authorization: Bearer {accessToken}
```

#### Toggle Availability
```http
PUT /api/ambulances/{id}/availability
Authorization: Bearer {accessToken}
```

#### Update Location
```http
PUT /api/ambulances/{id}/location
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

### Hospital Endpoints

#### Get All Hospitals
```http
GET /api/hospitals?latitude=12.9716&longitude=77.5946
Authorization: Bearer {accessToken}
```

#### Get Hospital Details
```http
GET /api/hospitals/{id}?latitude=12.9716&longitude=77.5946
Authorization: Bearer {accessToken}
```

#### Update Bed Inventory
```http
PUT /api/hospitals/{id}/beds
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "bedType": "ICU",
  "totalCapacity": 50,
  "availableCount": 30
}
```

### Blood Bank Endpoints

#### Search Blood Banks
```http
GET /api/blood-banks/search?bloodGroup=A_POSITIVE&latitude=12.9716&longitude=77.5946
Authorization: Bearer {accessToken}
```

#### Update Blood Inventory
```http
PUT /api/blood-banks/{id}/inventory
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "bloodGroup": "A_POSITIVE",
  "quantityUnits": 100,
  "minimumThreshold": 20
}
```

#### Get Emergency Shortages
```http
GET /api/blood-banks/shortage
Authorization: Bearer {accessToken}
```

### Admin Endpoints

#### Get Dashboard Metrics
```http
GET /api/admin/dashboard
Authorization: Bearer {accessToken}
```

#### Get Pending Ambulances
```http
GET /api/admin/ambulances/pending
Authorization: Bearer {accessToken}
```

#### Approve Ambulance
```http
PUT /api/admin/ambulances/{id}/approve
Authorization: Bearer {accessToken}
```

#### Get All Users
```http
GET /api/admin/users?page=0&size=10
Authorization: Bearer {accessToken}
```

#### Update User Status
```http
PUT /api/admin/users/{id}/status?isActive=true
Authorization: Bearer {accessToken}
```

### Notification Endpoints

#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer {accessToken}
```

#### Mark as Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {accessToken}
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {accessToken}
```

## 🔌 WebSocket API

### Connect
```javascript
ws://localhost:8080/ws/tracking
```

### Subscribe to Tracking Updates
```javascript
/topic/tracking/{bookingId}
```

### Send Location Update
```javascript
/app/tracking/update
{
  "bookingId": 123,
  "latitude": 12.9716,
  "longitude": 77.5946,
  "timestamp": "2026-02-13T23:30:00Z"
}
```

## 👥 User Roles

1. **CITIZEN**: Request ambulances, search hospitals/blood banks
2. **AMBULANCE_DRIVER**: Manage availability, accept bookings, update location
3. **HOSPITAL_ADMIN**: Manage hospital bed inventory
4. **BLOOD_BANK_ADMIN**: Manage blood inventory
5. **SUPER_ADMIN**: System monitoring, user management, ambulance approvals

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts with roles
- `ambulances` - Ambulance vehicles and drivers
- `bookings` - Ambulance booking requests
- `hospitals` - Hospital information
- `bed_inventory` - Hospital bed availability
- `blood_banks` - Blood bank information
- `blood_inventory` - Blood stock levels
- `notifications` - User notifications

See `backend/src/main/resources/db/migration/` for complete schema.

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🐳 Docker Deployment

With Docker Compose, **you do not need to create the database manually**. The `mysql` service creates `ermn_db` on startup. The backend runs Flyway on first start and creates all tables.

From the project root:

```bash
docker-compose up --build
```

- Backend: http://localhost:8080  
- Frontend: http://localhost:3000  

### Backend Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ermn_db
    ports:
      - "3306:3306"
  
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ermn_db
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

## 🔒 Security Features

1. **JWT Authentication**: Stateless token-based auth
2. **Password Encryption**: BCrypt hashing
3. **Role-Based Access Control**: Spring Security
4. **CORS Configuration**: Restricted origins
5. **Input Validation**: Bean Validation annotations
6. **SQL Injection Prevention**: JPA parameterized queries

## 📊 Key Features

### For Citizens
- Request ambulance with one click
- Real-time ambulance tracking
- Search nearby hospitals with bed availability
- Search blood banks by blood group and location

### For Ambulance Drivers
- Toggle availability status
- Accept/reject booking requests
- Update GPS location in real-time
- Manage booking status lifecycle

### For Hospital Admins
- Update bed inventory (ICU, General, Emergency)
- View incoming emergency cases
- Monitor bed occupancy

### For Blood Bank Admins
- Update blood inventory
- Automatic emergency shortage alerts
- Search and filter blood availability

### For Super Admins
- System-wide dashboard with metrics
- Approve ambulance registrations
- User management
- Monitor response times and resource utilization

## 🚨 Nearest Ambulance Algorithm

The system uses the Haversine formula to calculate distances and assigns the nearest available ambulance:

1. Query all available and approved ambulances with GPS coordinates
2. Calculate distance from pickup location using Haversine formula
3. Sort by distance (ascending)
4. Use optimistic locking to prevent double-booking
5. Assign nearest ambulance atomically

## 🔄 Booking Status Lifecycle

```
REQUESTED → ASSIGNED → EN_ROUTE → ARRIVED → COMPLETED
                ↓
           CANCELLED
```

## 📈 Performance Considerations

- Database indexes on frequently queried fields
- Optimistic locking for concurrency control
- Connection pooling for database
- Efficient distance calculations
- WebSocket for real-time updates

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in `application.properties`
- Ensure port 8080 is available

### Frontend can't connect to backend
- Verify backend is running on port 8080
- Check CORS configuration
- Verify API base URL in frontend config

### WebSocket connection fails
- Ensure WebSocket endpoint is accessible
- Check firewall settings
- Verify STOMP configuration

## 📝 License

This project is part of an internship project.

## 👨‍💻 Development

### Code Structure
- Backend follows Spring Boot best practices
- Frontend uses React functional components with hooks
- TypeScript for type safety
- Material-UI for consistent UI components

### Contributing
1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request

## 📞 Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ for emergency response management
