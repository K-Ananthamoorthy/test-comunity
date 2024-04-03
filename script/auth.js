const firebaseConfig = {
    apiKey: "AIzaSyCN0VLc3wYAeKBk06g-HVtE4dDPcEZo6xk",
    authDomain: "aiml-smvitm.firebaseapp.com",
    projectId: "aiml-smvitm",
    storageBucket: "aiml-smvitm.appspot.com",
    messagingSenderId: "867145474581",
    databaseURL: "https://aiml-smvitm-default-rtdb.asia-southeast1.firebasedatabase.app",
    appId: "1:867145474581:web:a2e294081b458bdb69e41c",
    measurementId: "G-64CF103MLC"
  };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // Check if user is already logged in
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // Hide login container
                document.querySelector('.login-container').style.display = 'none';
                // Show loading spinner
                document.getElementById('loading-spinner').style.display = 'block';
                // Redirect to community.html after 2 seconds
                setTimeout(function() {
                    window.location.href = "/community/com.html";
                }, 2000);
            } else {
                // Show login container
                document.querySelector('.login-container').style.display = 'block';
            }
        });

        function googleSignIn() {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider);
        }