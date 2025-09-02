# Tractivity - Volunteer Management Platform

Volunteer management and event coordination platform built with TypeScript and Node.js.

## 🌟 Features

- 📅 User can operate the app from both Administrator, Organizer, and Volunteer profiles
- 🔐 Secure Authentication & Authorization
- 🏢 Administrator can manage organizations and missions
- 🎯 Administrator can assign organizers to missions
- 📅 Organizer can manage all mission aspects, including event creation and volunteer management
- 📝 Organizer can create events and invite volunteers with specific roles
- 👥 Volunteers receive invitations (accept/reject) and can start working on events after acceptance
- 📊 Report generation for volunteer work, mission performance, and organization impact
- ⏱️ Volunteer Hours and Mileage Tracking
- 📋 Donation Features

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB

### Installation

### 1. Clone the Repository

```bash
git clone https://github.com/fahadhossain24/Joinup-tracActivity-server.git
cd Joinup-tracActivity-server

```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Install Depencencies
```bash
yarn install
# or
npm install
```

### 4. Run in Development
```bash
yarn dev
# or
npm run dev
```

### 5. Run in Production
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 🧰 Technologies what used
- Backend — NodeJS, ExpressJS
- Language - TypeScript
- Database - MongoDB with Mongoose ODM
- Authentication - JWT 
- Logging - Winston + Daily Rotate File & morgan
- File Handling - Express-fileupload 
- Validation - Zod
- Security - Helmet, CORS, Rate limiting
- Performance - compression middleware
- Development - Prettier & ESLint
- Containerization - Docker
- Deployment - CICD with Github Actions, AWS-Lamda, AWS-S3

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## 📢 Support
For support, email fahadhossain0503@gmail.com

<!-- Security scan triggered at 2025-09-02 04:22:56 -->