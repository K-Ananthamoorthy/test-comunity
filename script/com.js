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
        window.location.href = "/index.html";
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
            
            // Set user image
            const userImage = document.querySelector('.user-image');
            userImage.src = user.photoURL;

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

// Function to post
function post() {
    const user = firebase.auth().currentUser;
    const postInput = document.getElementById('postInput');
    const postData = postInput.value.trim();
    if (postData !== '' && user) {
        firebase.database().ref('posts').push({
            userId: user.uid,
            userName: user.displayName,
            userImage: user.photoURL,
            text: postData,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            likes: {}, // Initialize likes as object to store user likes
            shares: 0, // Initial shares count
            comments: {} // Initial empty comments
        }).then(() => {
            postInput.value = '';
        }).catch((error) => {
            console.error('Error posting:', error);
        });
    }
}

// Function to edit post
function editPost(postId) {
    const user = firebase.auth().currentUser;
    const postRef = firebase.database().ref(`posts/${postId}`);
    
    // Get the post content to edit
    postRef.once('value', (snapshot) => {
        const post = snapshot.val();
        
        if (user && post.userId === user.uid) {
            const newText = prompt("Enter the updated text:", post.text);
            if (newText !== null && newText.trim() !== "") {
                postRef.update({
                    text: newText.trim()
                }).then(() => {
                    console.log('Post updated successfully');
                    // Optionally, you can reload the posts after updating
                    fetchPosts();
                }).catch((error) => {
                    console.error('Error updating post:', error);
                });
            }
        } else {
            console.log('User not logged in or not authorized to edit this post');
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
            const user = firebase.auth().currentUser;
            const isCurrentUserPost = user && post.userId === user.uid;

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
                    <button id="likeButton-${postId}" onclick="toggleLike('${postId}')" class="like-button"><i class="fas fa-thumbs-up"></i> (<span id="likeCount-${postId}">${Object.keys(post.likes || {}).length}</span>)</button>
                    <button onclick="sharePost('${postId}')"><i class="fas fa-share"></i></button>
                    <button onclick="toggleComments('${postId}')"><i class="fas fa-comments"></i></button>
                    ${isCurrentUserPost ? `<button onclick="editPost('${postId}')"><i class="fas fa-edit"></i></button>` : ''}
                    ${isCurrentUserPost ? `<button onclick="deletePost('${postId}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                <div id="comments-${postId}" style="display: none;">
                    <input type="text" id="commentInput-${postId}" class="form-control" placeholder="Write a comment...">
                    <button onclick="postComment('${postId}')" class="btn btn-primary">Post Comment</button>
                    <div id="comments-list-${postId}"></div>
                </div>
            `;

            // Set post content
            postElement.innerHTML = postContent;

            // Append post to posts section
            postsSection.insertBefore(postElement, postsSection.firstChild);

            // Fetch comments for the post
            fetchComments(postId);
        });
    });
}

// Function to delete post
function deletePost(postId) {
    const user = firebase.auth().currentUser;
    if (user) {
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
    } else {
        console.log('User not logged in');
    }
}

// Function to fetch comments for a post
function fetchComments(postId) {
    firebase.database().ref(`posts/${postId}/comments`).on('value', (snapshot) => {
        const commentsList = document.getElementById(`comments-list-${postId}`);
        commentsList.innerHTML = ''; // Clear previous comments
        snapshot.forEach((childSnapshot) => {
            const comment = childSnapshot.val();
            const commentId = childSnapshot.key;
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');

            // Check if the current user is the owner of the comment
            const user = firebase.auth().currentUser;
            const isCurrentUserComment = user && comment.userId === user.uid;

            // Construct comment content
            const commentContent = `
                <div class="comment-content">
                    <span class="user-name">${comment.userName}</span>: ${comment.commentText}
                </div>
                <div class="comment-buttons">
                    <button onclick="likeComment('${postId}', '${commentId}')"><i class="fas fa-thumbs-up"></i> (<span id="commentLikeCount-${postId}-${commentId}">${Object.keys(comment.likes || {}).length}</span>)</button>
                    ${isCurrentUserComment ? `<button onclick="deleteComment('${postId}', '${commentId}')"><i class="fas fa-trash"></i></button>` : ''}
                    <!-- Render delete button only if the current user is the owner of the comment -->
                </div>
            `;

            // Set comment content
            commentElement.innerHTML = commentContent;

            // Append comment to comments list
            commentsList.appendChild(commentElement);
        });
    });
}

// Function to post comment
function postComment(postId) {
    const user = firebase.auth().currentUser;
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const commentText = commentInput.value.trim();
    if (commentText !== '' && user) {
        firebase.database().ref(`posts/${postId}/comments`).push({
            userId: user.uid,
            userName: user.displayName,
            commentText: commentText,
            likes: {} // Initialize likes as object to store user likes
        }).then(() => {
            commentInput.value = '';
        }).catch((error) => {
            console.error('Error posting comment:', error);
        });
    }
}

// Function to toggle like on post
function toggleLike(postId) {
    const user = firebase.auth().currentUser;
    if (user) {
        const likeButton = document.getElementById(`likeButton-${postId}`);
        const likeCount = document.getElementById(`likeCount-${postId}`);
        const postRef = firebase.database().ref(`posts/${postId}/likes/${user.uid}`);
        postRef.transaction((like) => {
            if (like) {
                likeButton.classList.remove('liked-button');
                return null; // Remove like
            } else {
                likeButton.classList.add('liked-button');
                return true; // Add like
            }
        }).then(() => {
            postRef.once('value', (snapshot) => {
                likeCount.textContent = snapshot.numChildren();
            });
        });
    } else {
        console.log('User not logged in');
    }
}

// Function to like a comment
function likeComment(postId, commentId) {
    const user = firebase.auth().currentUser;
    if (user) {
        const commentLikeCount = document.getElementById(`commentLikeCount-${postId}-${commentId}`);
        const commentRef = firebase.database().ref(`posts/${postId}/comments/${commentId}/likes/${user.uid}`);
        commentRef.transaction((like) => {
            if (like) {
                return null; // Remove like
            } else {
                return true; // Add like
            }
        }).then(() => {
            commentRef.once('value', (snapshot) => {
                commentLikeCount.textContent = snapshot.numChildren();
            });
        });
    } else {
        console.log('User not logged in');
    }
}

// Function to delete comment
function deleteComment(postId, commentId) {
    const user = firebase.auth().currentUser;
    if (user) {
        const confirmDelete = confirm("Are you sure you want to delete this comment?");
        if (confirmDelete) {
            firebase.database().ref(`posts/${postId}/comments/${commentId}`).remove()
                .catch((error) => {
                    console.error('Error deleting comment:', error);
                });
        }
    } else {
        console.log('User not logged in');
    }
}

// Function to toggle comments section
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
    } else {
        commentsSection.style.display = 'none';
    }
}

// Function to share a post
function sharePost(postId) {
    const postUrl = window.location.href + `?postId=${postId}`;
    navigator.clipboard.writeText(postUrl)
    .then(() => {
        alert('Post URL copied to clipboard!');
    })
    .catch((error) => {
        console.error('Error copying URL:', error);
    });
}

// Function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}




// On page load
window.onload = function () {
    fetchUserDetails();
    fetchPosts();
   
};




