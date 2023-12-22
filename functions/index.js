const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();

const app = express();

// Endpoint untuk registrasi
app.post('/register', async (req, res) => {
  const { email, password, username, gender, contact, birthdate } = req.body;

  // Validasi alamat email
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Cek apakah email sudah terdaftar
    const emailExists = await isEmailRegistered(email);

    if (emailExists) {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      // Konversi string birthdate menjadi objek tanggal
      const birthdateObject = new Date(birthdate);

      // Jika email belum terdaftar, buat pengguna baru
      const cred = await auth.createUser({
        email,
        password,
      });

      // Validasi tipe data username
  if (typeof username !== 'string') {
    return res.status(400).json({ error: 'Username must be a string' });
  }

      const userRef = db.collection('users').doc(cred.uid);

      await userRef.set({
        uid: cred.uid,
        email,
        username,
        gender,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        contact,
        birthdate: birthdateObject,
        geopoint: null,
        isMale: gender === 'male',
        name: username,
      });

      res.status(201).json({ message: 'User registered successfully' });
    }
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Fungsi untuk validasi alamat email
function isValidEmail(email) {
  // Gunakan ekspresi reguler atau pustaka validasi alamat email
  // Berikut adalah contoh ekspresi reguler sederhana
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fungsi untuk memeriksa apakah email sudah terdaftar
async function isEmailRegistered(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return !!userRecord;
  } catch (error) {
    // Jika user tidak ditemukan, kembalikan false
    if (error.code === 'auth/user-not-found') {
      return false;
    }

    // Jika ada error lain, lemparkan kembali error
    throw error;
  }
}

// Endpoint untuk login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Melakukan login dengan email dan password
    await auth.signInWithEmailAndPassword(email, password);

    // Jika berhasil, kirim respons berhasil
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    // Handle error
    console.error("Login error:", error.message);

    // Memberikan respons yang sesuai berdasarkan kode kesalahan
    if (error.code === 'auth/user-not-found') {
      res.status(401).json({ error: 'Email not registered' });
    } else if (error.code === 'auth/wrong-password') {
      res.status(401).json({ error: 'Invalid password' });
    } else {
      res.status(500).json({ error: 'Internal server error during login' });
    }
  }
});



// Endpoint untuk mendapatkan data pengguna
app.get('/user/:uid', async (req, res) => {
  const uid = req.params.uid;

  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();

      // Konversi timestamp birthdate dan createdAt ke format string
      if (userData.birthdate instanceof admin.firestore.Timestamp) {
        userData.birthdate = userData.birthdate.toDate().toLocaleDateString();
      }

      if (userData.createdAt instanceof admin.firestore.Timestamp) {
        userData.createdAt = userData.createdAt.toDate().toLocaleDateString();
      }

      res.status(200).json(userData);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({ error: 'Internal server error during user retrieval' });
  }
});

// Endpoint untuk mendapatkan data kafe berdasarkan cafe_id
app.get('/cafe/:cafe_id', async (req, res) => {
  const cafeId = req.params.cafe_id;

  try {
    // Assuming your cafe data structure has a field named 'cafe_id'
    const cafeRef = db.collection('cafes').where('cafe_id', '==', cafeId);
    const cafeSnapshot = await cafeRef.get();

    if (!cafeSnapshot.empty) {
      const cafeData = cafeSnapshot.docs[0].data();
      res.status(200).json(cafeData);
    } else {
      res.status(404).json({ error: 'Cafe not found' });
    }
  } catch (error) {
    console.error("Get cafe error:", error.message);
    res.status(500).json({ error: 'Internal server error during cafe retrieval' });
  }
});

// Endpoint untuk mendapatkan semua data kafe
app.get('/cafes', async (req, res) => {
  try {
    const cafesRef = db.collection('cafes');
    const cafesSnapshot = await cafesRef.get();

    if (!cafesSnapshot.empty) {
      const cafesData = [];

      cafesSnapshot.forEach((doc) => {
        cafesData.push(doc.data());
      });

      res.status(200).json(cafesData);
    } else {
      res.status(404).json({ error: 'No cafes found' });
    }
  } catch (error) {
    console.error("Get cafes error:", error.message);
    res.status(500).json({ error: 'Internal server error during cafes retrieval' });
  }
});

// Endpoint untuk mendapatkan semua data pengguna
app.get('/users', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();

    if (!usersSnapshot.empty) {
      const usersData = [];

      usersSnapshot.forEach((doc) => {
        usersData.push(doc.data());
      });

      res.status(200).json(usersData);
    } else {
      res.status  (404).json({ error: 'No users found' });
    }
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ error: 'Internal server error during users retrieval' });
  }
});



// Deploy fungsi ke Firebase Cloud Functions
exports.api = functions.https.onRequest(app);
