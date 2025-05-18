# SZTEUniPress - Publication Review System

## Project Structure

```
szteunipress/
├── client/           # Angular frontend
└── server/           # Node.js backend
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client/szteunipress
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

The frontend application will be available at `http://localhost:4200`

## Populate database

1. Navigate to server directory:
```bash
cd server
```

2. Run the populating script
```bash
npm run seed
```

## Features

- Modern, responsive user interface built with Angular
- Publication submission system
- Peer review management
- Real-time progress tracking
- User authentication and authorization

## Development

The project uses:
- Angular 17 for the frontend
- Node.js with Express for the backend
- MongoDB for the database
- Bootstrap 5 for styling