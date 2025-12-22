# 🐝 Buzz Chat

A real-time chat application with a microservices backend and modern React frontend.

## Tech Stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS, TanStack Query, Socket.IO

**Backend:** NestJS, MongoDB, Redis, RabbitMQ, Kafka, Socket.IO, Cloudinary

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+

## 🏛 Architecture Overview

![BuzzChat Architecture](architecture.png)

### Backend

```bash
cd backend
cp .env.example .env
./docker-start.sh start
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Features

- 💬 Real-time messaging with WebSocket
- 👥 Group chats and direct messages
- 📎 File attachments with chunked upload
- 😊 Emoji picker
- 🖼️ Profile picture updates
- ⚙️ Group settings (rename, update image)
- 🔐 JWT authentication

## Project Structure

```
buzz-chat/
├── backend/           # NestJS microservices
│   ├── apps/
│   │   ├── api/       # API Gateway (port 5000)
│   │   ├── auth/      # Auth Service
│   │   ├── chat/      # Chat Service (WebSocket)
│   │   ├── group/     # Group Service
│   │   └── message/   # Message Service
│   └── docker-compose.yml
│
└── frontend/          # React + Vite
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   └── constants/
    └── package.json
```

## Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=mongodb://admin:password123@mongodb:27017/scalable-chat?authSource=admin
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login |
| GET | /users | List users |
| GET | /groups | List user's groups |
| POST | /groups | Create group |
| PATCH | /groups/:id | Update group |
| POST | /groups/:id/messages | Fetch messages |
| POST | /assets/upload-chunk | Upload file chunk |
| POST | /assets/complete-upload | Finalize upload |

## WebSocket Events

**Send:** `chat.message.send` - Send a message

**Receive:** `chat.message.incoming` - New message received

## Commands

```bash
# Backend
./docker-start.sh start   # Start all services
./docker-start.sh stop    # Stop services
./docker-start.sh logs    # View logs

# Frontend
npm run dev               # Development
npm run build             # Production build
```
