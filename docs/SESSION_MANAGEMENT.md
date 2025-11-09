# Session Management & Persistent Login

## 🎯 Overview

Users stay logged in for **24 hours** (or longer based on Supabase settings) without needing to re-enter credentials. Sessions persist across:
- ✅ Browser tabs
- ✅ Browser windows
- ✅ Browser restarts
- ✅ Page refreshes

---

## 🔒 How It Works

### **1. Supabase Auth Configuration**

```typescript
// frontend/src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,              // ✅ Enable persistent sessions
    storageKey: 'howmuchshouldiprice-auth', // Custom storage key
    storage: window.localStorage,      // ✅ Use localStorage (persists)
    autoRefreshToken: true,            // ✅ Auto-refresh expired tokens
    detectSessionInUrl: true,          // ✅ Handle OAuth redirects
  },
});
```

### **2. Session Storage**

**Location:** Browser's `localStorage`

**Key:** `howmuchshouldiprice-auth`

**Data Stored:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.MRjVpvKvhKzF...",
  "expires_at": 1699564800,
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "abc-123",
    "email": "user@example.com",
    ...
  }
}
```

### **3. Token Refresh**

**Access Token Lifetime:** 1 hour (default)
**Refresh Token Lifetime:** 24 hours (configurable in Supabase)

**Auto-Refresh Flow:**
```
User logs in
  ↓
Access token expires after 1 hour
  ↓
Supabase automatically uses refresh token
  ↓
New access token issued
  ↓
User stays logged in (up to 24 hours)
```

---

## 🎨 UI Changes Based on Auth State

### **Header Button (Desktop & Mobile)**

**Logged Out:**
```tsx
<button>Get Started</button>  // → Navigates to /signup
```

**Logged In:**
```tsx
<button>Dashboard</button>  // → Navigates to /dashboard
```

### **Implementation:**
```tsx
// frontend/src/components/Header.tsx
const { user } = useAuth();

<button onClick={handleGetStarted}>
  {user ? 'Dashboard' : 'Get Started'}
</button>
```

---

## 🔄 Session Lifecycle

### **Login:**
```
1. User enters email/password
2. Supabase Auth validates credentials
3. Access token + refresh token issued
4. Tokens stored in localStorage
5. User object set in AuthContext
6. User redirected to dashboard
```

### **Page Refresh:**
```
1. App loads
2. AuthContext checks localStorage
3. Finds existing session
4. Validates token with Supabase
5. User object restored
6. No login required! ✅
```

### **Token Expiry:**
```
1. Access token expires (after 1 hour)
2. Supabase detects expired token
3. Uses refresh token to get new access token
4. New access token stored
5. User stays logged in ✅
```

### **Session Expiry:**
```
1. Refresh token expires (after 24 hours)
2. Supabase can't refresh session
3. User logged out automatically
4. Redirected to login page
```

### **Manual Logout:**
```
1. User clicks "Logout"
2. signOut() called
3. Tokens cleared from localStorage
4. User object cleared from AuthContext
5. Redirected to home page
```

---

## ⚙️ Supabase Dashboard Configuration

### **Session Duration Settings:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Settings**
4. Configure:

**JWT Expiry:**
```
Access Token (JWT) expiry: 3600 seconds (1 hour)
```

**Refresh Token:**
```
Refresh Token Rotation: Enabled ✅
Refresh Token Reuse Interval: 10 seconds
```

**Session Settings:**
```
Session timeout: 86400 seconds (24 hours)
```

### **Recommended Settings:**

| Setting | Value | Purpose |
|---------|-------|---------|
| **JWT Expiry** | 3600s (1 hour) | Short-lived access tokens (security) |
| **Refresh Token Rotation** | Enabled | Enhanced security |
| **Session Timeout** | 86400s (24 hours) | User stays logged in for 1 day |
| **Auto Refresh** | Enabled | Seamless token renewal |

---

## 🧪 Testing

### **Test Persistent Session:**

1. **Login:**
   ```
   Go to: https://www.howmuchshouldiprice.com/signin
   Login with credentials
   ```

2. **Verify Dashboard:**
   ```
   Should redirect to /dashboard ✅
   Header should show "Dashboard" button ✅
   ```

3. **Close Browser:**
   ```
   Close all browser windows
   Wait 1 minute
   ```

4. **Reopen Browser:**
   ```
   Go to: https://www.howmuchshouldiprice.com
   Header should show "Dashboard" button ✅
   Click "Dashboard" → Should go directly to dashboard ✅
   No login required! ✅
   ```

5. **Wait 24+ Hours:**
   ```
   Session expires
   User automatically logged out
   Header shows "Get Started" again
   ```

---

## 🔍 Debugging

### **Check Session in Browser:**

**Open DevTools Console:**
```javascript
// Check if session exists
const session = localStorage.getItem('howmuchshouldiprice-auth');
console.log(JSON.parse(session));

// Check expiry
const data = JSON.parse(session);
const expiresAt = new Date(data.expires_at * 1000);
console.log('Session expires at:', expiresAt);
```

### **Check Session in Code:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
console.log('User:', session?.user);
console.log('Expires at:', new Date(session?.expires_at * 1000));
```

---

## 🚨 Troubleshooting

### **Issue: User logged out after refresh**

**Possible Causes:**
1. `persistSession: false` (should be `true`)
2. localStorage blocked by browser
3. Incognito/private mode
4. Browser clearing storage

**Solution:**
- Verify `persistSession: true` in supabase.ts ✅
- Check browser allows localStorage
- Don't use incognito mode for testing

### **Issue: Session expires too quickly**

**Solution:**
- Check Supabase Dashboard → Auth → Settings
- Increase "Session timeout" to 86400 seconds (24 hours)
- Enable "Refresh Token Rotation"

### **Issue: Header still shows "Get Started" when logged in**

**Solution:**
- Hard refresh browser (`Ctrl + Shift + R`)
- Check AuthContext is loading user
- Verify `useAuth()` hook is working

---

## 🎯 User Experience

### **First Visit:**
```
User → Homepage
Header: [Get Started] ← Not logged in
```

### **After Signup:**
```
User → Signs up
Header: [Dashboard] ← Logged in!
```

### **Return Visit (within 24 hours):**
```
User → Opens site
Header: [Dashboard] ← Still logged in!
Click Dashboard → Direct access ✅
```

### **After 24 Hours:**
```
User → Opens site
Header: [Get Started] ← Session expired
Must login again
```

---

## 📊 Session Flow Diagram

```
┌─────────────────────────────────────────────┐
│ User logs in                                │
│ ↓                                           │
│ Tokens stored in localStorage               │
│ ↓                                           │
│ User closes browser                         │
│ ↓                                           │
│ User returns (within 24 hours)              │
│ ↓                                           │
│ App checks localStorage                     │
│ ↓                                           │
│ Session found ✅                            │
│ ↓                                           │
│ Validate with Supabase                      │
│ ↓                                           │
│ Token still valid ✅                        │
│ ↓                                           │
│ User automatically logged in                │
│ ↓                                           │
│ Header shows "Dashboard"                    │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

### **Token Security:**
- ✅ Access tokens expire after 1 hour
- ✅ Refresh tokens expire after 24 hours
- ✅ Tokens stored in localStorage (XSS protected)
- ✅ HTTPS only in production
- ✅ Auto-refresh prevents token theft

### **Best Practices:**
1. **Short access token lifetime** (1 hour) - limits damage if stolen
2. **Refresh token rotation** - prevents replay attacks
3. **HTTPS enforcement** - prevents man-in-the-middle
4. **Auto-logout on expiry** - forces re-authentication

---

## 📝 Configuration Summary

### **Frontend (Already Configured):**
```typescript
// frontend/src/lib/supabase.ts
{
  auth: {
    persistSession: true,              // ✅
    storageKey: 'howmuchshouldiprice-auth', // ✅
    storage: window.localStorage,      // ✅
    autoRefreshToken: true,            // ✅
    detectSessionInUrl: true,          // ✅
  }
}
```

### **Supabase Dashboard:**
```
JWT Expiry: 3600s (1 hour)
Session Timeout: 86400s (24 hours)
Refresh Token Rotation: Enabled
```

---

## ✅ Result

- ✅ Users stay logged in for 24 hours
- ✅ No need to login on every visit
- ✅ Sessions persist across browser restarts
- ✅ Tokens auto-refresh seamlessly
- ✅ Header shows "Dashboard" when logged in
- ✅ Secure and production-ready

---

**Last Updated:** November 8, 2025

