# Authentication System - Quick Start Guide

## Overview
A complete JWT-based authentication system with managed SaaS backend, supporting user registration, login, logout, and token refresh.

## Quick Setup

### 1. Environment Variables
Create a `.env.local` file with:
```env
JWT_SECRET=your-32-plus-character-random-string
JWT_ALGORITHM=HS256
AUTH_ACCESS_TOKEN_EXPIRY=900
AUTH_REFRESH_TOKEN_EXPIRY=604800
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup
Create Supabase tables using the schema in `AUTH_IMPLEMENTATION.md`:
- `users` - User accounts
- `refresh_tokens` - Session management
- `user_preferences` - User settings

### 3. Build & Run
```bash
npm run build
npm run dev
```

## Usage Examples

### Login (Frontend)
```typescript
import { useAuth } from '@/app/providers/AuthProvider';

function LoginButton() {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'Password123!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

### Protected API Route
```typescript
import { withAuth } from '@/lib/auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (request: NextRequest, auth) => {
  const { user, token } = auth;
  return NextResponse.json({ user: user.email });
});
```

### Protected Page
```typescript
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Welcome to your dashboard!</div>
    </ProtectedRoute>
  );
}
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Authenticate user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/refresh` | Refresh token | No |
| POST | `/api/auth/logout` | Logout user | Yes |

## Authentication Hooks

### useAuth()
```typescript
const {
  user,              // Current user or null
  isAuthenticated,   // Boolean
  isLoading,        // Boolean
  accessToken,      // JWT string or null
  login,            // (email, password) => Promise<void>
  register,         // (data) => Promise<void>
  logout,           // () => Promise<void>
  refreshToken,     // () => Promise<void>
} = useAuth();
```

## Components

### LoginForm
```typescript
import { LoginForm } from '@/app/components/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}
```

### RegisterForm
```typescript
import { RegisterForm } from '@/app/components/RegisterForm';

export default function RegisterPage() {
  return <RegisterForm />;
}
```

### ProtectedRoute
```typescript
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin only content</div>
    </ProtectedRoute>
  );
}
```

## Security

✅ Passwords hashed with bcrypt (12 rounds)
✅ JWT tokens with configurable expiry
✅ HTTP-only cookies in production
✅ Refresh token revocation
✅ Password strength validation
✅ Token type validation
✅ Audience & issuer checks

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*...)

## Username Requirements

- 3-32 characters
- Alphanumeric and underscores only
- Must start with a letter

## Troubleshooting

### "Missing JWT_SECRET"
→ Add `JWT_SECRET` to environment variables (32+ characters)

### "Unauthorized (401)"
→ Token expired or invalid. Call `refreshToken()` to get new token.

### "Email already exists"
→ Email is registered. Try login instead.

### "Invalid password"
→ Password doesn't meet strength requirements. See above.

## Next Steps

1. ✅ Environment variables configured
2. ✅ Database tables created
3. ✅ Application built successfully
4. Test login/registration flows
5. Deploy to production
6. Monitor failed login attempts
7. Setup automated token cleanup (optional)

## Documentation

- **Full API Reference**: See `AUTH_IMPLEMENTATION.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Source Code**: `/lib/auth/` and `/app/providers/AuthProvider.tsx`

## Support

For issues or questions, refer to:
- JWT documentation: https://jwt.io
- Supabase docs: https://supabase.com/docs
- Bcrypt info: https://www.npmjs.com/package/bcrypt
