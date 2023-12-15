// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, setDoc, serverTimestamp, doc, getDoc, GeoPoint  } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNN55S5m60eWJF8Jvl-Yz2OO1tcG_Q_eo",
    authDomain: "paletepicksfb.firebaseapp.com",
    projectId: "paletepicksfb",
    storageBucket: "paletepicksfb.appspot.com",
    messagingSenderId: "936760282869",
    appId: "1:936760282869:web:d5d03096e4c07c94113fbc",
    measurementId: "G-RNT64KG3WY"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

//listen for auth state change
auth.onAuthStateChanged(user =>{
  if(user){
    console.log(user);
  }else{
    console.log("User logged out.")
  }
})

// Registration
const registerForm = document.querySelector('#registerForm');
registerForm.addEventListener('submit', async (e) => {

  // Get user input
  const email = registerForm['reg-email'].value;
  const password = registerForm['reg-password'].value;
  const username = registerForm['reg-username'].value;
  const gender = registerForm['reg-gender'].value;
  const userContact = registerForm['reg-contact'].value
  const userBirthdate = new Date(registerForm['reg-birthdate'].value);
  e.preventDefault();
  try {
    // Create user in firebase auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    //set uid as document id in Firestore
    const userRef = doc(db, "users", cred.user.uid)

    // Save user data to Firestore
    await setDoc(userRef, {
      uid: cred.user.uid,
      email,
      username,
      gender,
      createdAt: serverTimestamp(),
      contact: userContact,
      birthdate: userBirthdate,
      geopoint: null,
      isMale: gender === "male", // Atur isMale berdasarkan nilai gender
      name: username,
    });

  } catch (error) {
    console.error(error.message);
  }
});


    //logout
    const logout = document.querySelector('#logoutLink');
    logout.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    })

    //login
      const loginForm = document.querySelector('#loginForm');
      loginForm.addEventListener('submit', async (e) => {
          e.preventDefault(); 

          //get user info
          const email = loginForm['login-email'].value;
          const password = loginForm['login-password'].value;
          await signInWithEmailAndPassword(auth, email, password);
          //default long lat
          let latitude = 0
          let longitude = 0
          if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                if (result.state === 'granted') {
                    // Izin diberikan, Anda dapat menggunakan geolokasi
                    navigator.geolocation.getCurrentPosition((position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        console.log("Location:", latitude, longitude);
                    });
                } else {
                    // Izin tidak diberikan
                    console.log("Location:", latitude, longitude);
                }
            }).catch((error) => {
                console.error("Error checking geolocation permission:", error);
            });
        } else {
            // Browser tidak mendukung navigator.permissions
            console.log("Geolocation not supported");
        }
        
          // get user data test

        auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userRef);
    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
    
                        // Display user data in the popup
                        console.log(userData.email);
                        console.log(userData.name);
                        console.log(userData.birthdate ? new Date(userData.birthdate.seconds * 1000).toLocaleDateString() : "");
                        console.log(userData.contact);
                        console.log(userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleString() : "");
                        if (userData.isMale){
                          console.log("Gender: Male")
                        }else{
                          console.log("Gender: Female")
                        }
                    } else {
                        console.log("User document not found");
                    }
                } catch (error) {
                    console.error("Error getting user document: ", error);
                }
            } else {
                console.log("User logged out.")
            }
        });
    });
    
    