# 🏫 School Management API

A REST API for managing schools with location-based proximity sorting. Built with Node.js, Express.js, and TiDB Cloud MySQL.

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **🌐 Live API** | [https://school-management-api-educaseindia.vercel.app](https://school-management-api-educaseindia.vercel.app) |
| **📋 Postman Collection** | [Import Testing Suite](https://www.postman.com/harshitsharma14/school-management/collection/jtq7nbp/school-management-api?action=share&creator=45199429) |
| **📊 API Health** | [Health Check](https://school-management-api-educaseindia.vercel.app/health) |

## 🚀 Features

- **🏫 Add Schools** - Store school data with validation
- **📍 Location Sorting** - Get schools sorted by distance from any location
- **🔍 Radius Search** - Find schools within specific kilometer radius
- **✅ Input Validation** - Comprehensive validation and duplicate prevention
- **🌏 Indian Data** - Pre-loaded with 20+ schools across major Indian cities

## 📋 API Endpoints

**Base URL:** `https://school-management-api-educaseindia.vercel.app`

| Method | Endpoint | Description | Example |
|--------|----------|-------------|---------|
| `GET` | `/health` | API health check | [Try it](https://school-management-api-educaseindia.vercel.app/health) |
| `POST` | `/api/addSchool` | Add a new school | See examples below |
| `GET` | `/api/listSchools` | Get schools sorted by distance | [Delhi Example](https://school-management-api-educaseindia.vercel.app/api/listSchools?latitude=28.6139&longitude=77.2090) |
| `GET` | `/api/schoolsNearby` | Find schools within radius | [50km Example](https://school-management-api-educaseindia.vercel.app/api/schoolsNearby?latitude=28.6139&longitude=77.2090&radius=50) |

## 🧪 Quick Testing

### Add a School
```bash
curl -X POST https://school-management-api-educaseindia.vercel.app/api/addSchool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test School",
    "address": "123 Education Street, Test City",
    "latitude": 28.6139,
    "longitude": 77.2090
  }'
```

### List Schools Near Delhi
```bash
curl "https://school-management-api-educaseindia.vercel.app/api/listSchools?latitude=28.6139&longitude=77.2090"
```

### Find Schools Within 25km
```bash
curl "https://school-management-api-educaseindia.vercel.app/api/schoolsNearby?latitude=19.0760&longitude=72.8777&radius=25"
```

## 📍 Indian Cities Coordinates

| City | Latitude | Longitude | Test Link |
|------|----------|-----------|-----------|
| Delhi | 28.6139 | 77.2090 | [Test](https://school-management-api-educaseindia.vercel.app/api/listSchools?latitude=28.6139&longitude=77.2090) |
| Mumbai | 19.0760 | 72.8777 | [Test](https://school-management-api-educaseindia.vercel.app/api/listSchools?latitude=19.0760&longitude=72.8777) |
| Bangalore | 12.9716 | 77.5946 | [Test](https://school-management-api-educaseindia.vercel.app/api/listSchools?latitude=12.9716&longitude=77.5946) |
| Chennai | 13.0827 | 80.2707 | [Test](https://school-management-api-educaseindia.vercel.app/api/listSchools?latitude=13.0827&longitude=80.2707) |
| Kolkata | 22.5726 | 88.3639 | [Test](https://school-management-api-educaseindia.vercel.app/api/listSchools?latitude=22.5726&longitude=88.3639) |
| Chandigarh | 30.7333 | 76.7794 | [Test](https://school-management-api-educaseindia.vercel.app/api/listSchools?latitude=30.7333&longitude=76.7794) |

## 📖 API Documentation

### Add School
**POST** `/api/addSchool`

```json
{
  "name": "School Name",
  "address": "Complete Address",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response:**
```json
{
  "success": true,
  "message": "School successfully added!",
  "data": {
    "id": 21,
    "name": "School Name",
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

### List Schools by Distance
**GET** `/api/listSchools?latitude={lat}&longitude={lon}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nearest School",
      "address": "School Address",
      "distance": 1.5,
      "distanceUnit": "km"
    }
  ],
  "userLocation": { "latitude": 28.6139, "longitude": 77.2090 },
  "totalSchools": 20
}
```

### Schools Within Radius
**GET** `/api/schoolsNearby?latitude={lat}&longitude={lon}&radius={km}`

Parameters:
- `latitude` (required): Your latitude
- `longitude` (required): Your longitude  
- `radius` (optional): Search radius in km (default: 50)

## 🛠️ Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** TiDB Cloud (MySQL)
- **Hosting:** Vercel
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Joi schema validation

## 🔧 Local Development

```bash
# Clone and install
git clone <your-repo-url>
cd school-management-api
npm install

# Setup environment
cp .env.example .env
# Add your database credentials

# Start development server
npm run dev
```

**Environment Variables:**
```env
DB_HOST=your_tidb_host
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=school_management
PORT=3000
NODE_ENV=development
```

## 📋 Testing

**Postman Collection:** [Import Here](https://www.postman.com/harshitsharma14/school-management/collection/jtq7nbp/school-management-api?action=share&creator=45199429)

The collection includes:
- ✅ Health checks
- ✅ Add school examples
- ✅ Location-based testing for major Indian cities
- ✅ Radius search scenarios
- ✅ Error handling tests

## 🛡️ Features

### Validation
- Coordinate validation (lat: -90 to 90, lon: -180 to 180)
- Required fields validation
- Duplicate prevention
- Input sanitization

### Security
- Rate limiting (100 requests/15min)
- CORS protection
- Security headers via Helmet
- Input validation

### Performance
- Distance calculation using Haversine formula
- Response time < 500ms
- Global CDN via Vercel
- Connection pooling

---

<div align="center">

**🏫 Built for better education management**

[Live API](https://school-management-api-educaseindia.vercel.app) • [Postman Collection](https://www.postman.com/harshitsharma14/school-management/collection/jtq7nbp/school-management-api?action=share&creator=45199429)

</div>
