# FJC - Portal 🎓

A comprehensive student management system built with React, TypeScript, and Firebase. Portal Sabido provides separate interfaces for students and instructors, enabling efficient tracking of student information, payment status, announcements, and academic progress.

## ✨ Features

### 👨‍🎓 Student Interface
- **Personal Dashboard**: View balance, payment status, remarks, and academic standing
- **Payment Tracking**: Monitor payment history with Paid/Pending/Overpaid status
- **Announcements**: Receive important updates from instructors
- **Profile Management**: Update personal information and account settings
- **Mobile Responsive**: Seamless experience across all devices

### 👨‍🏫 Instructor Interface
- **Student Management**: Add, edit, and monitor student information
- **Balance Management**: Update student balances and payment status
- **Remarks System**: Add notes and feedback for individual students
- **Announcements**: Create and manage announcements for students
- **Statistics Dashboard**: Overview of student enrollment and payment status

### 🔐 Authentication & Security
- Secure user registration with email/password authentication
- Role-based access control (Student/Instructor)
- 4-digit instructor verification codes
- Firebase Authentication integration
- Session persistence with automatic logout

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0, TypeScript, Vite
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router DOM 7.6.1
- **Styling**: Custom CSS with responsive design
- **Database**: Cloud Firestore NoSQL database
- **Build Tool**: Vite with TypeScript support

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/portal-sabido.git
   cd portal-sabido
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password provider
   - Create a Firestore database
   - Copy your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Firebase configuration to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## 📖 Usage

### For Students
1. **Register**: Create an account with your email and personal information
2. **Dashboard**: View your current balance, payment status, and any instructor remarks
3. **Announcements**: Stay updated with important information from your instructors
4. **Profile**: Manage your account settings and personal information

### For Instructors
1. **Register**: Create an instructor account using a valid 4-digit instructor code
2. **Student Management**: Add new students and manage their information
3. **Balance Updates**: Modify student balances and payment status
4. **Announcements**: Communicate important updates to your students
5. **Overview**: Monitor student enrollment and payment statistics

## 🏗️ Project Structure

```
Portal-Sabido/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   └── HamburgerMenu.tsx
│   ├── pages/             # Main application pages
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── InstructorRegister.tsx
│   │   ├── Profile.tsx
│   │   ├── StudentsManagement.tsx
│   │   └── ForgotPassword.tsx
│   ├── scripts/           # Utility scripts
│   │   └── populateAnnouncement.ts
│   ├── styles/            # CSS stylesheets
│   │   ├── App.css
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   └── index.css
│   ├── types/             # TypeScript type definitions
│   │   └── Users.ts
│   ├── utils/             # Helper functions
│   │   └── auth.ts
│   ├── App.tsx            # Main application component
│   ├── firebaseConfig.ts  # Firebase configuration
│   └── main.tsx           # Application entry point
├── .env.example           # Environment variables template
├── package.json           # Project dependencies and scripts
└── README.md             # Project documentation
```

## 🗄️ Database Schema

### Students Collection
```typescript
interface Student {
  uid: string;           // Firebase Auth UID
  name: string;          // Full name
  email: string;         // Email address
  address: string;       // Home address
  balance: number;       // Current balance
  instructorCode: string; // Associated instructor code
  remarks?: string;      // Instructor notes
  createdAt: Date;       // Registration date
  updatedAt: Date;       // Last modified date
}
```

### Instructors Collection
```typescript
interface Instructor {
  uid: string;           // Firebase Auth UID
  name: string;          // Full name
  email: string;         // Email address
  instructorCode: string; // Unique 4-digit code
  createdAt: Date;       // Registration date
  updatedAt: Date;       // Last modified date
}
```

### Announcements Collection
```typescript
interface Announcement {
  id: string;            // Document ID
  title: string;         // Announcement title
  content: string;       // Announcement content
  instructorCode: string; // Associated instructor
  createdAt: Date;       // Creation date
  isActive: boolean;     // Visibility status
}
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint

# Database Management
npm run populate:announcements  # Add sample announcements
npm run clear:announcements    # Remove all announcements
```

## 🔧 Configuration

### Firebase Setup
1. **Authentication**: Enable Email/Password provider
2. **Firestore**: Create database with the following collections:
   - `students`
   - `instructors`
   - `announcements`
3. **Security Rules**: Configure Firestore rules for data protection

### Environment Variables
All Firebase configuration values should be stored in environment variables prefixed with `VITE_` for Vite compatibility.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add appropriate comments for complex logic
- Maintain responsive design principles
- Test on multiple devices and browsers

## 📱 Mobile Responsiveness

Portal Sabido is designed with a mobile-first approach:
- Responsive navigation with hamburger menu
- Optimized layouts for tablets and smartphones
- Touch-friendly interface elements
- Consistent experience across all screen sizes

## 🔒 Security Features

- Firebase Authentication for secure user management
- Role-based access control
- Input validation and sanitization
- Secure environment variable handling
- Protected routes based on authentication status

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/portal-sabido/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- React and Vite communities for excellent tooling
- Contributors and testers who helped improve the system

---

**Portal Sabido** - Empowering education through efficient student management. 🎓✨
  },
})
```
