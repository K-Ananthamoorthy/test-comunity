// Initialize Firebase
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
firebase.initializeApp(firebaseConfig);

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        window.location.href = "/admin/log.html";
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Function to fetch user details and populate them
function fetchUserDetails() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log("Current user:", user);
          

            // Set username
            const userName = document.querySelector('.user-name');
            userName.innerText = user.displayName;

            // Set user email
            const userEmail = document.querySelector('.user-email');
            userEmail.innerText = user.email;
        } else {
            // No user is signed in.
            console.log('User not logged in');
        }
    });
}

// Function to fetch posts
function fetchPosts() {
    firebase.database().ref('posts').orderByChild('timestamp').on('value', (snapshot) => {
        const postsSection = document.getElementById('posts-section');
        postsSection.innerHTML = ''; // Clear previous posts
        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            const postId = childSnapshot.key;

            const postElement = document.createElement('div');
            postElement.classList.add('post');

            // Construct post content
            const postContent = `
                <div class="user-info">
                    <img src="${post.userImage}" class="user-image-small" alt="User Image">
                    <span class="user-name">${post.userName}</span>
                </div>
                <div class="post-timestamp">${formatTimestamp(post.timestamp)}</div>
                <div class="post-content">${post.text}</div>
                <div class="interaction-buttons">
                    <button onclick="editPost('${postId}', '${post.text}')">Edit</button>
                    <button onclick="deletePost('${postId}')">Delete</button>
                </div>
            `;

            // Set post content
            postElement.innerHTML = postContent;

            // Append post to posts section
            postsSection.appendChild(postElement);
        });
    });
}

// Function to edit post
function editPost(postId, postText) {
    const editedPostText = prompt("Enter the updated text:", postText);
    if (editedPostText !== null && editedPostText.trim() !== "") {
        firebase.database().ref(`posts/${postId}`).update({
            text: editedPostText.trim()
        }).then(() => {
            console.log('Post updated successfully');
            // Optionally, you can reload the posts after updating
            fetchPosts();
        }).catch((error) => {
            console.error('Error updating post:', error);
        });
    }
}

// Function to delete post
function deletePost(postId) {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (confirmDelete) {
        firebase.database().ref(`posts/${postId}`).remove()
            .then(() => {
                console.log('Post deleted successfully');
                // Optionally, you can reload the posts after deletion
                fetchPosts();
            })
            .catch((error) => {
                console.error('Error deleting post:', error);
            });
    }
}

// Function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Function to display the popup for editing post
function editPost(postId, postText) {
    const editedPostText = prompt("Enter the updated text:", postText);
    if (editedPostText !== null && editedPostText.trim() !== "") {
        firebase.database().ref(`posts/${postId}`).update({
            text: editedPostText.trim()
        }).then(() => {
            console.log('Post updated successfully');
            // Optionally, you can reload the posts after updating
            fetchPosts();
        }).catch((error) => {
            console.error('Error updating post:', error);
        });
    }
}

// Function to close the edit post popup
function closeEditPopup() {
    const editPostPopup = document.getElementById('edit-post-popup');
    editPostPopup.style.display = 'none';
}

// Function to save the edited post
function saveEditedPost() {
    // Implement as needed
}

// On page load
window.onload = function () {
    fetchUserDetails();
    fetchPosts();
};
