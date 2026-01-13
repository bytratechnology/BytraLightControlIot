import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDIksxbLoBd9kBX-UXYE4tKvZFVtfiUUdQ",
  authDomain: "bytradevices.firebaseapp.com",
  databaseURL: "https://bytradevices-default-rtdb.firebaseio.com",
  projectId: "bytradevices",
  storageBucket: "bytradevices.firebasestorage.app",
  messagingSenderId: "768292153024",
  appId: "1:768292153024:web:4dc923ab1641301cbfef25"
}

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig)

// Khởi tạo Realtime Database
export const database = getDatabase(app)
