// auth.js (Firebase Auth + Firestore only, no Storage)

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  const auth = firebase.auth();
  const db = firebase.firestore();

  console.log("auth.js loaded ✅");

  // ✅ Login Handler
  if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // ✅ Use localStorage instead of Firestore
      const localUser = localStorage.getItem(`user_${user.uid}`);
      if (!localUser) {
        alert("⚠️ Local user record not found. Please sign up again.");
        return;
      }

      const userData = JSON.parse(localUser);
      if (userData.role === "admin") {
        alert("✅ Admin login successful!");
        window.location.href = "admin-panel.html";
      } else {
        alert("✅ Login successful!");
        window.location.href = "dashboard.html";
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Login failed: " + err.message);
    }
  });
}


  // ✅ Signup Handler (No image upload)
  // ✅ Signup Handler (Reliable version with working redirect)
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📤 Signup form submitted");

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const role = document.getElementById("signup-role").value;
    const loader = document.getElementById("loading-message");

    if (loader) {
      loader.style.display = "block";
      loader.innerText = "Creating your account...";
    }

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // ✅ Store user info locally instead of Firestore
      const userData = {
        uid: user.uid,
        name,
        email,
        role,
        photoUrl: "default.png",
        joined: new Date().toISOString()
      };
      localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));

      if (loader) {
        loader.innerText = "✅ Signup successful! Redirecting...";
      }

      setTimeout(() => {
        window.location.href = role === "admin" ? "admin-panel.html" : "dashboard.html";
      }, 1500);

    } catch (err) {
      console.error("Signup error:", err);
      alert("❌ Signup failed: " + err.message);
      if (loader) {
        loader.innerText = "❌ Error occurred. Try again.";
      }
    }
  });
}


});
