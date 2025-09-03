# כמה כסף? - Hebrew Wedding Gift Calculator

A stylish, interactive Hebrew web application that calculates wedding gift amounts using crowd-sourced data.

## Features

- **Smart Calculator**: Calculates gift amounts based on event type, relationship closeness, income tier, venue, location, and party size
- **Crowd-Sourced Data**: Real-time voting system that adjusts recommendations based on community feedback
- **Public Vote Feed**: Shows the latest 25 votes from all users in real-time
- **Live Notifications**: Popup notifications when new votes are cast
- **Public Statistics**: Displays total votes from the community
- **Hebrew RTL Support**: Fully optimized for Hebrew text and right-to-left layout
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express.js
- **Database**: Supabase PostgreSQL with real-time capabilities
- **Deployment**: Vercel with serverless functions
- **Styling**: Custom CSS with Hebrew RTL support and responsive design

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev:full
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Or connect to GitHub**:
   - Push to GitHub repository
   - Connect repository to Vercel
   - Automatic deployments on every push

### Manual Deployment

The application is configured for Vercel with:
- `vercel.json` configuration file
- Serverless functions for API endpoints
- Static file serving for frontend

## API Endpoints

- `GET /api/public-votes` - Get latest 25 public votes
- `GET /api/public-stats` - Get public statistics
- `POST /api/vote` - Submit a vote
- `POST /api/calculate` - Get crowd-adjusted calculation
- `GET /api/analytics` - Get detailed analytics

## How It Works

1. **Base Calculation**: Starts with a minimal baseline amount
2. **Modifiers Applied**: Adjusts based on event type, relationship, income, venue, location, and party size
3. **Crowd Adjustment**: Uses community votes to fine-tune the final amount with intelligent scaling:
   - 1-5 votes: ±5% max adjustment
   - 6-15 votes: ±15% max adjustment  
   - 16-30 votes: ±30% max adjustment
   - 31+ votes: ±50% max adjustment
4. **Real-Time Updates**: Continuously updates based on new votes stored in Supabase

## Recent Updates

- ✅ **Supabase Integration**: Persistent data storage with PostgreSQL database
- ✅ **Fixed Navigation**: Proper view switching between calculator and votes
- ✅ **Enhanced Styling**: Matching colors between voting interface and public votes
- ✅ **Improved UX**: Better visual feedback and hover effects
- ✅ **Production Ready**: Fully deployed on Vercel with environment variables
- ✅ **Intelligent Scaling**: Gradual adjustment system prevents wild swings from few votes

## Contributing

This is a public project that uses crowd-sourced data to improve gift recommendations. Every vote helps make the calculator more accurate for everyone!

## License

MIT License - Feel free to use and modify as needed.
