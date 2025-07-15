# Anonymous Video Chat App

## Overview

This is a minimal anonymous video chat application functionally identical to Omegle/Uhmegle. It enables one-on-one video and text chat between random users without requiring accounts or storing any user data. The application uses WebRTC for peer-to-peer video communication and WebSockets for signaling and matchmaking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks and context for local state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **WebSocket Communication**: Native WebSocket (ws) library for real-time signaling
- **Build System**: ESBuild for production bundling
- **Development**: TSX for TypeScript execution in development

### Real-time Communication
- **WebRTC**: Peer-to-peer video/audio streaming with STUN servers for NAT traversal
- **Signaling**: WebSocket-based signaling service for ICE candidate exchange and offer/answer negotiation
- **Matchmaking**: Simple queue-based pairing system for connecting random users

## Key Components

### Client-Side Components
- **VideoSection**: Manages local and remote video feeds with camera/microphone controls
- **ChatSection**: Real-time text messaging interface alongside video
- **PermissionModal**: Handles camera/microphone permission requests
- **LoadingModal**: Displays while searching for chat partners
- **WebRTC Hook**: Manages peer-to-peer connections and media streams
- **WebSocket Hook**: Handles real-time communication with the server

### Advanced Device Detection System
- **DeviceManager Hook**: Real-time detection of specific device models and capabilities
- **MobileLayout**: Optimized fullscreen video experience for phones with modal chat
- **TabletLayout**: Adaptive layout that switches between mobile and desktop modes based on orientation
- **DesktopLayout**: Traditional desktop experience with side-by-side video and chat

### Server-Side Services
- **PeerManager**: Tracks connected clients and manages the waiting queue for matchmaking
- **SignalingService**: Handles WebSocket message routing for WebRTC signaling
- **WebSocket Server**: Manages real-time connections on `/ws` path

### Database Schema
- **Users Table**: Basic user structure (currently using in-memory storage)
- **Drizzle ORM**: Configured for PostgreSQL with schema validation via Zod

## Data Flow

1. **Device Detection**: Advanced real-time analysis of device type, model, screen size, and capabilities
2. **Layout Adaptation**: Automatic UI transformation based on detected device specifications
3. **Connection Initiation**: User visits site and grants camera/microphone permissions
4. **Partner Matching**: Client sends `find-partner` request via WebSocket
5. **Signaling Process**: Server pairs users and facilitates WebRTC offer/answer exchange
6. **Peer Connection**: Direct WebRTC connection established between users
7. **Communication**: Video/audio streams and text messages flow between peers
8. **Disconnection**: Users can end chat with "Next" button to find new partners

## Device Detection Capabilities

### Supported Detection Features
- **Device Type**: Phone, tablet, desktop, laptop with 70-98% confidence rating
- **Brand Recognition**: Apple, Samsung, Google, OnePlus, and other major manufacturers
- **Model Identification**: Specific device models (iPhone 14, Galaxy S23, Pixel 7, etc.)
- **Operating System**: iOS, Android, Windows, macOS, Linux with version detection
- **Screen Analysis**: Resolution, pixel density, orientation changes in real-time
- **Touch Capabilities**: Precise touch vs mouse input detection

### Adaptive Layout System
- **Mobile (Phone)**: Fullscreen remote video (90% screen), floating controls, modal chat
- **Tablet Portrait**: Mobile-like experience with larger touch targets
- **Tablet Landscape**: Split layout with 65% main video, 15% local video, sidebar chat
- **Desktop/Laptop**: Traditional grid layout with side-by-side video and chat panel

## External Dependencies

### Production Dependencies
- **WebRTC**: Browser-native peer-to-peer communication
- **STUN Servers**: Google's public STUN servers for NAT traversal
- **Neon Database**: PostgreSQL hosting (configured but not actively used)
- **Radix UI**: Comprehensive UI component library
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the entire application
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static files served from the public directory

### Environment Configuration
- **Development**: Uses TSX with Vite dev server and HMR
- **Production**: Single Node.js process serving both API and static files
- **Database**: PostgreSQL via environment variable `DATABASE_URL`

### Replit-Specific Features
- **Cartographer**: Development-only plugin for Replit integration
- **Runtime Error Overlay**: Enhanced error reporting in development
- **Banner Script**: Replit development environment indicator

The application prioritizes simplicity and speed, focusing solely on anonymous video chat functionality without unnecessary features like user accounts, filters, or data persistence.