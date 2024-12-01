// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGhrpV-0CNFj2g6T6oAH1B_DGfR5c1csw",
  authDomain: "phoenixtournamentbracket-4adaf.firebaseapp.com",
  projectId: "phoenixtournamentbracket-4adaf",
  storageBucket: "phoenixtournamentbracket-4adaf.firebasestorage.app",
  messagingSenderId: "511635020978",
  appId: "1:511635020978:web:53b196b58f163bcc50bdab"
};

// init firebase
initializeApp(firebaseConfig)

// init firestore service
const db = getFirestore()
export default db