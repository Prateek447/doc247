Multi Vendor Ecommerce Application
this project is for selling medical equipment
others names of project : medoc , docshop, doc247, equip247

# Doc247 API Services

This is a microservices-based application built with NX monorepo, consisting of an API Gateway and an Auth Service.

## Project Structure

```
doc247/
├── apps/
│   ├── api-gateway/         # API Gateway Service
│   ├── api-gateway-e2e/     # E2E tests for API Gateway
│   ├── auth-service/        # Authentication Service
│   └── auth-service-e2e/    # E2E tests for Auth Service
└── packages/                # Shared packages and utilities
```

## Services

### 1. API Gateway Service
The API Gateway serves as the entry point for all client requests, providing features like rate limiting, CORS, and request proxying.

- **Base URL**: `http://localhost:8080`
- **Rate Limiting**: 
  - Authenticated users: 1000 requests per 15 minutes
  - Unauthenticated users: 100 requests per 15 minutes

#### Endpoints:

##### Health Check
```
GET /gateway-health
```
Response:
```json
{
    "message": "Welcome to api-gateway!"
}
```

### 2. Auth Service
The Authentication Service handles user authentication and related functionalities.

- **Base URL**: `http://localhost:6001`
- **Direct Access**: Available at `http://localhost:6001`
- **Via Gateway**: All endpoints are also accessible through the API Gateway at `http://localhost:8080`

#### Endpoints:

##### Root Endpoint
```
GET /
```
Response:
```json
{
    "message": "Hello API"
}
```

## Configuration

### CORS Configuration
Both services are configured to accept requests from:
- Origin: `http://localhost:3000`
- Allowed Headers: `Content-Type`, `Authorization`
- Credentials: Enabled

### API Gateway Proxy
The API Gateway proxies all unmatched requests to the Auth Service (`http://localhost:6001`).

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the Auth Service:
```bash
npx nx serve auth-service
```

3. Start the API Gateway:
```bash
npx nx serve api-gateway
```

## Development

### Building Services
```bash
# Build all services
npx nx run-many --target=build --all

# Build specific service
npx nx build auth-service
npx nx build api-gateway
```

### Running Tests
```bash
# Run all e2e tests
npx nx run-many --target=e2e --all

# Run specific service tests
npx nx e2e auth-service-e2e
npx nx e2e api-gateway-e2e
```

## Error Handling

The services include standardized error handling with the following error types:
- Not Found Error (404)
- Rate Limit Error (429)
- Internal Server Error (500)

All error responses follow this format:
```json
{
    "status": "error",
    "message": "Error description",
    "details": "Additional error details if available"
}
```
