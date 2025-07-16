# Troubleshooting Guide

## Firebase Authentication Issues

### Problem: API Key Not Valid Error
**Error**: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

**Solution**: 
1. **For Demo Mode**: The app automatically runs in demo mode when using `demo-api-key`
2. **For Production**: Follow these steps to set up real Firebase:

```bash
# Run the quick setup
node quick-start.js

# Follow the Firebase setup guide
cat firebase-setup-guide.md
```

### Problem: Google Sign-In Not Working
**Symptoms**: 
- Sign-in popup doesn't appear
- Authentication fails silently

**Solutions**:
1. **Demo Mode**: The app will simulate Google sign-in
2. **Production**: 
   - Enable Google authentication in Firebase Console
   - Add your domain to authorized domains
   - Update `.env.local` with real Firebase credentials

## Environment Configuration

### Problem: Missing Environment Variables
**Error**: Missing required environment variables

**Solution**:
```bash
# Create .env.local file
cp .env.example .env.local

# Or run quick setup
node quick-start.js
```

### Problem: Judge0 API Not Working
**Error**: Code execution fails or times out

**Solutions**:
1. **Demo Mode**: Code execution will show mock output
2. **Production**: 
   - Verify Judge0 API URL and token in `.env.local`
   - Test API connectivity: `curl -X GET http://10.3.5.139:2358/about`

## Development Server Issues

### Problem: Server Won't Start
**Error**: Various build or runtime errors

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Restart development server
npm run dev
```

### Problem: Module Not Found Errors
**Error**: Cannot find module errors

**Solutions**:
```bash
# Install missing dependencies
npm install

# For specific Firebase modules
npm install firebase firebase-admin
```

## Database Issues

### Problem: Firestore Permission Denied
**Error**: Missing or insufficient permissions

**Solutions**:
1. **Demo Mode**: Uses local demo data, no Firestore needed
2. **Production**: 
   - Update Firestore security rules
   - Verify service account permissions
   - Check Firebase project configuration

### Problem: Data Not Loading
**Symptoms**: Empty dashboards, no challenges

**Solutions**:
1. **Demo Mode**: Should show demo data automatically
2. **Production**: 
   - Check browser console for errors
   - Verify API endpoints are responding
   - Test database connectivity

## Authentication Problems

### Problem: Admin Login Fails
**Error**: Invalid credentials or authentication errors

**Solutions**:
1. **Demo Credentials**: `admin` / `oasis2045`
2. **Custom Credentials**: Update `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`
3. **JWT Issues**: Update `JWT_SECRET` in `.env.local`

### Problem: Team Authentication Issues
**Symptoms**: Can't register or login teams

**Solutions**:
1. **Demo Mode**: Use "Continue with Google" button (simulated)
2. **Production**: 
   - Verify Firebase configuration
   - Check Google OAuth setup
   - Test authentication flow

## API Issues

### Problem: API Endpoints Not Responding
**Error**: 404 or 500 errors on API calls

**Solutions**:
1. **Check Route Files**: Verify API route files exist in `app/api/`
2. **Server Logs**: Check console for error messages
3. **Demo Mode**: API calls are redirected to demo endpoints

### Problem: CORS Issues
**Error**: Cross-origin request blocked

**Solutions**:
1. **Development**: Usually not an issue with Next.js
2. **Production**: Configure proper CORS headers
3. **API Routes**: Ensure proper response formatting

## Common Setup Issues

### Problem: Port Already in Use
**Error**: Port 3000 is already in use

**Solutions**:
```bash
# Use different port
npm run dev -- --port 3001

# Or kill existing process
kill -9 $(lsof -t -i:3000)
```

### Problem: TypeScript Errors
**Error**: Various TypeScript compilation errors

**Solutions**:
```bash
# Clear TypeScript cache
rm -rf .next/cache

# Regenerate types
npx tsc --noEmit

# Fix common issues
npm run lint
```

## Demo Mode Features

### What Works in Demo Mode:
- ✅ Team authentication (simulated)
- ✅ Challenge viewing and navigation
- ✅ Code editor and Judge0 integration
- ✅ Flag submission (use flag "6" for first challenge)
- ✅ Leaderboard with demo teams
- ✅ Admin dashboard with demo statistics
- ✅ Challenge management interface

### What Requires Real Firebase:
- ❌ Persistent user sessions
- ❌ Real-time data updates
- ❌ Cross-session data persistence
- ❌ Production-grade security

## Getting Help

### Debug Steps:
1. **Check Console**: Open browser developer tools
2. **Check Logs**: Look at terminal output
3. **Test API**: Use browser network tab
4. **Verify Config**: Check `.env.local` file

### Quick Fixes:
```bash
# Complete reset
rm -rf node_modules .next package-lock.json
npm install
npm run dev

# Demo mode setup
node quick-start.js
```

### Still Having Issues?

1. **Follow Setup Guide**: `firebase-setup-guide.md`
2. **Check Environment**: Verify all environment variables
3. **Test Demo Mode**: Ensure demo features work first
4. **Gradual Setup**: Move from demo to production incrementally

Remember: The app is designed to work in demo mode out of the box. Start there, then gradually move to production Firebase setup when ready!