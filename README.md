# AlUla Journey Navigator

## Features

### Real-time Synchronization
- Instant updates between tour guide and tourist interfaces
- WebSocket-based communication for seamless data flow
- Automatic synchronization of:
  - Itinerary changes
  - Guide notes
  - Package status
  - Location updates

### Photo Capture System
- Dual capture options:
  - Take new photos using device camera
  - Upload existing photos from gallery
- User-friendly interface for both mobile and desktop
- Immediate feedback on upload/capture success

### User Experience
- Clear notifications for all actions
- Intuitive interface for both tourists and guides
- Real-time status updates
- Responsive design for all device types

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alula-journey-navigator
```

2. Install dependencies for the main application:
```bash
npm install
```

3. Install dependencies for the WebSocket server:
```bash
cd server
npm install
```

4. Create a `.env.local` file in the root directory with the following content:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
```

### Running the Application

1. Start the WebSocket server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the main application:
```bash
npm run dev
```

3. Access the application at `http://localhost:3000`

## Architecture

### Frontend
- Next.js for the main application
- React for UI components
- Socket.io-client for real-time communication
- Tailwind CSS for styling

### Backend
- Express.js server
- Socket.io for WebSocket implementation
- Real-time event handling system

### Real-time Features
- Bidirectional communication between guides and tourists
- Instant notifications for updates
- Automatic reconnection handling
- Event-based state management

## Usage

### Tourist Interface
1. Login or register as a tourist
2. View itinerary and locations
3. Capture or upload photos
4. Receive real-time updates from guide
5. View guide location and notes

### Guide Interface
1. Login as a guide
2. Manage tourist packages
3. Update itineraries in real-time
4. Share location updates
5. Add notes and instructions

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
