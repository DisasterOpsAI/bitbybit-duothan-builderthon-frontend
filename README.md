# OASIS Protocol - Buildathon Platform

A comprehensive challenge platform inspired by Ready Player One, featuring algorithmic challenges, code execution, and buildathon submissions.

## 🚀 Features

### Core Functionality
- **Team Authentication**: Google OAuth integration with unique team registration
- **Admin Dashboard**: Real-time statistics, challenge management, team oversight
- **Challenge Portal**: Algorithmic problems with live code execution
- **Judge0 Integration**: Multi-language code execution and validation
- **Flag System**: Progressive challenge unlocking mechanism
- **Buildathon Submission**: GitHub repository submission system
- **Real-time Leaderboard**: Dynamic team ranking and progress tracking

### Technical Features
- **Firebase Backend**: Firestore database with admin SDK
- **Next.js 14**: App router with server-side rendering
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Modern, responsive UI design
- **Real-time Updates**: Live statistics and leaderboard updates

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Firebase project with Firestore enabled
- Judge0 API access

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bitbybit-duothan-builderthon-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bitbybit-duothan-builderthon.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=bitbybit-duothan-builderthon
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bitbybit-duothan-builderthon.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Judge0 API Configuration
   JUDGE0_API_URL=http://10.3.5.139:2358/
   JUDGE0_API_TOKEN=ZHVvdGhhbjUuMA==

   # Admin Configuration
   ADMIN_EMAIL=admin@oasis.com
   ADMIN_PASSWORD=oasis2045
   JWT_SECRET=your-super-secret-jwt-key-for-admin-auth

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore database
   - Configure authentication providers (Google)
   - Add the service account key (already included in code)

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📱 Usage

### For Teams
1. **Registration**: Visit `/auth/team-signup` to create a new team
2. **Authentication**: Use Google OAuth to authenticate
3. **Dashboard**: Access team dashboard at `/dashboard`
4. **Challenges**: Complete algorithmic challenges and submit buildathon solutions
5. **Leaderboard**: View team rankings at `/leaderboard`

### For Admins
1. **Login**: Access admin panel at `/auth/admin-login`
2. **Credentials**: Use `admin` / `oasis2045` (configurable via environment)
3. **Dashboard**: Monitor platform statistics at `/admin/dashboard`
4. **Challenge Management**: Create and manage challenges at `/admin/challenges`
5. **Team Management**: View team data and submissions

## 🗄️ Database Schema

### Collections

#### `teams`
- `id`: Document ID
- `name`: Team name (unique)
- `email`: Team email
- `authProvider`: Authentication provider
- `authId`: External auth ID
- `totalPoints`: Accumulated points
- `completedChallenges`: Array of completed challenge IDs
- `createdAt`, `updatedAt`: Timestamps

#### `challenges`
- `id`: Document ID
- `title`: Challenge title
- `description`: Challenge description
- `points`: Points awarded
- `isActive`: Whether challenge is active
- `algorithmicProblem`: Algorithmic problem details
- `buildathonProblem`: Buildathon project details
- `flag`: Correct flag for validation
- `createdAt`, `updatedAt`: Timestamps

#### `submissions`
- `id`: Document ID
- `teamId`: Reference to team
- `challengeId`: Reference to challenge
- `type`: 'algorithmic' or 'buildathon'
- `content`: Submission content
- `status`: Submission status
- `submittedAt`: Submission timestamp

#### `team_progress`
- `teamId`: Reference to team
- `challengeId`: Reference to challenge
- `algorithmicCompleted`: Boolean
- `buildathonCompleted`: Boolean
- `attempts`: Number of attempts
- `startedAt`, `completedAt`: Timestamps

## 🔧 API Endpoints

### Team Endpoints
- `GET /api/challenges/team` - Get team challenges
- `GET /api/challenges/[id]` - Get specific challenge
- `POST /api/challenges/[id]/submit-flag` - Submit flag
- `POST /api/challenges/[id]/submit-buildathon` - Submit buildathon
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/teams/stats` - Get team statistics

### Admin Endpoints
- `POST /api/auth/admin` - Admin authentication
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/challenges` - Challenge management
- `POST /api/admin/challenges` - Create challenge

### Utility Endpoints
- `POST /api/judge0/execute` - Execute code
- `POST /api/teams/register` - Register team
- `POST /api/teams/verify` - Verify team login

## 🧪 Testing

Run the basic functionality tests:
```bash
node test-setup.js
```

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`

## 🔒 Security Features

- **JWT Authentication**: Secure admin session management
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Built-in protection against abuse
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## 📝 Customization

### Adding New Challenge Types
1. Extend the `Challenge` interface in `lib/database-schema.ts`
2. Update challenge creation form in `app/admin/challenges/create/page.tsx`
3. Modify challenge rendering in `app/challenges/[id]/page.tsx`

### Adding New Languages
1. Update `LANGUAGES` array in challenge page
2. Add corresponding Judge0 language IDs
3. Update syntax highlighting if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and support:
- Check the GitHub Issues page
- Review the troubleshooting section
- Contact the development team

## 🏆 Credits

Built for the Buildathon challenge, inspired by the OASIS universe from Ready Player One.