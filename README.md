# Pulih Alami

A mobile-first application designed to help users manage panic attacks with breathing, grounding, affirmations, and cold therapy tools.

## Environment Setup

This project uses environment variables to keep sensitive information secure. Follow these steps to set up your local environment:

1. Create a `.env` file in the root directory of the project
2. Copy the contents of `.env.example` to your `.env` file
3. Replace the placeholder values with your actual Firebase configuration

```
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
...etc
```

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install
# or
yarn install
```

### Running the app locally
```bash
# Start development server
npm run dev
# or
yarn dev
```

### Building for production
```bash
# Build the app
npm run build
# or
yarn build
```

## Firebase Setup

This application requires Firebase for authentication and data storage. To set up:

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password provider)
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings
5. Add the configuration to your `.env` file

## Features

- User authentication (login/signup)
- Dashboard with quick access to various coping techniques
- Breathing exercise (4-7-8 technique)
- Grounding exercises (5-4-3-2-1 technique)
- Positive affirmations
- Cold therapy
- Panic journal for tracking episodes
- Admin panel for user management

## Security Note

Never commit your `.env` file to version control. It's included in `.gitignore` to prevent accidental commits.
