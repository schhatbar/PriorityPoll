# Priority Polling System

A dynamic polling platform that enables complex voting mechanisms with advanced user experience and comprehensive administrative tools.

## Features

- **Priority-Based Voting**: Drag-and-drop interface for ranking options by priority
- **Public Access**: Anyone can participate in polls by simply entering their name
- **Admin-Only Results**: Only administrators can view detailed poll results
- **One-Click Poll Sharing**: Share polls via link, email, or WhatsApp
- **Comprehensive Analytics**: View detailed statistics and visualizations of poll results
- **Gamification**: Points system that rewards active participants
- **User Leaderboard**: See who's most active in the polling community
- **User Profiles**: Track participation, achievements, and badges

## Technology Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, and Shadcn/UI components
- **Backend**: Express.js API with comprehensive data validation
- **Database**: PostgreSQL with Drizzle ORM for robust data persistence
- **Authentication**: Role-based access control for administrators
- **Deployment**: Docker support for easy deployment

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database
- Docker and Docker Compose (for containerized deployment)

### Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and fill in values)
4. Start the development server:
   ```
   npm run dev
   ```

### Docker Deployment

The easiest way to deploy the application is using Docker:

1. Make sure Docker and Docker Compose are installed
2. Run the automated build script:
   ```
   ./docker-build.sh
   ```
   
This script will:
- Check if Docker is running
- Ensure theme.json exists (creates it if missing)
- Build the Docker images
- Start the containers
- Display helpful commands for managing the deployment

Alternatively, you can run the Docker commands manually:

```bash
# Build the Docker images
docker-compose build

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at http://localhost:5000 and the PostgreSQL admin interface at http://localhost:5050.

For more detailed deployment instructions including cloud deployment options, see [DEPLOYMENT.md](DEPLOYMENT.md).

## User Guide

### For Poll Participants

1. Browse to the homepage to see all active polls
2. Click on a poll to participate
3. Enter your name when prompted
4. Drag and drop options to rank them by priority
5. Submit your vote
6. Check the leaderboard to see your position

### For Administrators

1. Log in with admin credentials (default: username: `admin`, password: `admin123`)
2. Create new polls from the admin dashboard
3. View poll results and analytics
4. Manage user accounts
5. Award special achievements and badges to users

## API Documentation

The application provides a RESTful API with the following endpoints:

### Public Endpoints

- `GET /api/polls` - List all active polls
- `GET /api/polls/:id` - Get details of a specific poll
- `POST /api/votes` - Submit a vote for a poll
- `GET /api/leaderboard` - View top participants
- `GET /api/user-points/:name` - Get user profile and points

### Admin Endpoints (Requires Authentication)

- `POST /api/polls` - Create a new poll
- `PATCH /api/polls/:id/status` - Activate or deactivate a poll
- `DELETE /api/polls/:id` - Delete a poll
- `GET /api/polls/:id/votes` - View all votes for a poll
- `GET /api/users` - List all users
- `POST /api/user-profile/:name/achievements` - Award an achievement
- `POST /api/user-profile/:name/badges` - Award a badge

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- `users` - Admin user accounts
- `polls` - Poll definitions including options and metadata
- `votes` - User votes with priority rankings
- `user_points` - Gamification data including points, achievements, and badges

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.