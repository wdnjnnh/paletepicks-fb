// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDocs  } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
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

//register
    const registerForm = document.querySelector('#registerForm');
    registerForm.addEventListener('submit', async (e) => {
    
        //get user info
        const email = registerForm['reg-email'].value;
        const password = registerForm['reg-password'].value;
        const userBirthdate = new Date(registerForm['reg-birthdate'].value);
        e.preventDefault(); 
        try {
            // Create user in Firebase Authentication
            const cred = await createUserWithEmailAndPassword(auth, email, password);
        
            // Save additional user data to Firestore
            await addDoc(collection(db, "users"), {
              uid: cred.user.uid,
              email,
              createdAt: serverTimestamp(),
              contact: "", 
              birthdate: userBirthdate,
              geopoint: null,
              isMale: true,
              name: ""
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
          
          });
    
    //TODO get user data
/*const userDataLink = document.querySelector('#userLink');
userDataLink.addEventListener('click', async (e) => {
  e.preventDefault();

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const userID = user.uid;

      try {
        const userRef = doc(db, "users", userID);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Display user data on the page
          document.getElementById("userEmail").textContent = userData.email;
          document.getElementById("userName").textContent = userData.name;
          document.getElementById("userBirthdate").textContent = userData.birthdate ? new Date(userData.birthdate.seconds * 1000).toLocaleDateString() : "";
          document.getElementById("userContact").textContent = userData.contact;
          document.getElementById("userCreatedAt").textContent = userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleString() : "";
          document.getElementById("userIsMale").textContent = userData.isMale ? "Yes" : "No";
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
});*/