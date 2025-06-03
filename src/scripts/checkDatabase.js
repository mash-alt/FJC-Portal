// Simple script to check database contents
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDA-qyEKaJqsLOj_-MvQOfrKW4qvyBEcS8",
  authDomain: "school-portal32.firebaseapp.com",
  projectId: "school-portal32",
  storageBucket: "school-portal32.firebasestorage.app",
  messagingSenderId: "686012493045",
  appId: "1:686012493045:web:c8bf7dede8d6b0cfb47a5c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDatabase() {
  try {
    console.log('Checking instructors collection...');
    const instructorsSnapshot = await getDocs(collection(db, 'instructors'));
    console.log(`Found ${instructorsSnapshot.size} instructors:`);
    instructorsSnapshot.forEach((doc) => {
      console.log('Instructor:', doc.id, doc.data());
    });

    console.log('\nChecking students collection...');
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    console.log(`Found ${studentsSnapshot.size} students:`);
    studentsSnapshot.forEach((doc) => {
      console.log('Student:', doc.id, doc.data());
    });

    console.log('\nChecking announcements collection...');
    const announcementsSnapshot = await getDocs(collection(db, 'announcements'));
    console.log(`Found ${announcementsSnapshot.size} announcements:`);
    announcementsSnapshot.forEach((doc) => {
      console.log('Announcement:', doc.id, doc.data());
    });
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();
