# Authentication API Endpoints Documentation

## Base URL
```
http://localhost:6001/api
```

## Endpoints Overview

### 1. User Registration
**POST** `/user-registration`

Initiates the user registration process by sending an OTP to the provided email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully. Please check your email to verify your account.",
  "status": "success"
}
```

---

### 2. User Verification
**POST** `/verify-user`

Completes user registration by verifying the OTP and creating the user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "1234",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "status": "success"
}
```

---

### 3. User Login
**POST** `/login-user`

Authenticates user and returns access and refresh tokens as cookies.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "status": "success"
}
```

**Cookies Set:**
- `accessToken`: JWT token valid for 15 minutes
- `refreshToken`: JWT token valid for 7 days

---

### 4. Token Refresh
**POST** `/refresh-token-user`

Refreshes the access token using the refresh token from cookies.

**Request:** No body required (uses refresh token from cookies)

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "status": "success"
}
```

**New Cookies Set:**
- `accessToken`: New JWT token valid for 15 minutes
- `refreshToken`: New JWT token valid for 7 days

---

### 5. Forgot Password
**POST** `/forgot-password-user`

Initiates password reset process by sending OTP to user's email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset OTP sent successfully. Please check your email.",
  "status": "success"
}
```

---

### 6. Verify Forgot Password OTP
**POST** `/verify-forgot-password-user`

Verifies the OTP for password reset and returns a reset token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully. You can now reset your password.",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "status": "success"
}
```

---

### 7. Reset Password
**POST** `/reset-password-user`

Resets user password using the reset token.

**Request Body:**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newsecurepassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully",
  "status": "success"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/tokens)
- `404`: Not Found (user not found)
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error

---

## Testing the Endpoints

### Using the Test Script
Run the provided test script to verify all endpoints:

```bash
node test-endpoints.js
```

### Using cURL Examples

#### 1. User Registration
```bash
curl -X POST http://localhost:6001/api/user-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "test123456"
  }'
```

#### 2. User Login
```bash
curl -X POST http://localhost:6001/api/login-user \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

#### 3. Token Refresh
```bash
curl -X POST http://localhost:6001/api/refresh-token-user \
  -b cookies.txt
```

#### 4. Forgot Password
```bash
curl -X POST http://localhost:6001/api/forgot-password-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## Environment Variables Required

Make sure these environment variables are set:

```env
# Database
DATABASE_URL="your_mongodb_connection_string"

# Redis
REDIS_DATABASE_URL="your_redis_connection_string"

# JWT Secrets
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SERVICE="gmail"
SMTP_USER="your_email@gmail.com"
SMTP_PASSWORD="your_app_password"
```

---

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Tokens**: Secure token-based authentication with short-lived access tokens
3. **Rate Limiting**: OTP requests are rate-limited to prevent abuse
4. **OTP Expiration**: OTPs expire after 5 minutes
5. **Secure Cookies**: HTTP-only, secure cookies for token storage
6. **Input Validation**: Comprehensive validation for all inputs
7. **Error Handling**: Proper error handling without exposing sensitive information

---

## Notes

- OTPs are sent via email and stored in Redis with 5-minute expiration
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Password reset tokens expire after 10 minutes
- All endpoints include comprehensive logging for debugging
- The API uses MongoDB as the database and Redis for caching/OTP storage 