// Import required modules
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');


// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json()); // Middleware to parse JSON requests

// Initialize Firebase Admin SDK with credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault() // or use a service account key
});

// Initialize Dialogflow session client
const sessionClient = new SessionsClient();
const projectId = 'foodybuddy-ua9a';  // Replace with your Dialogflow project ID

app.post('/chat', async (req, res) => {
  const sessionId = uuidv4(); // Generate a unique session ID
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: req.body.message,
        languageCode: 'en',
      },
    },
  };

  try {
    const [response] = await sessionClient.detectIntent(request);
    const chatbotReply = response.queryResult.fulfillmentText;

    res.json({ reply: chatbotReply });
  } catch (error) {
    console.error('Dialogflow Error:', error);
    res.status(500).json({ error: 'Failed to get response from Dialogflow' });
  }
});



// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Your DB username
  password: 'root1101',  // Your DB password
  database: 'recipeasy',  // Your database name
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL database.');
});

// ✅ Create users table (run once or use MySQL GUI)
/*
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user'
);
*/

// Route to handle user signup
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' });
      return res.status(500).json({ message: 'Error registering user' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Route to handle user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Login failed' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = results[0];
    res.json({ message: 'Login successful', role: user.role });
  });
});

// Fetch all users from Firebase Authentication
async function listAllUsers(nextPageToken) {
  let allUsers = [];  // To store all users fetched from Firebase

  try {
    // Fetch users in batches of 1000 at a time
    const result = await admin.auth().listUsers(1000, nextPageToken);
    allUsers = allUsers.concat(result.users); // Append new users to the allUsers array

    // If there are more users, fetch the next page
    if (result.pageToken) {
      allUsers = await listAllUsers(result.pageToken); // Recursive call
    }

    return allUsers;
  } catch (error) {
    console.error("Error fetching users from Firebase:", error);
    throw new Error("Failed to fetch users from Firebase");
  }
}

// Endpoint to fetch users and send them to the frontend
app.get('/get-users', async (req, res) => {
  try {
    const users = await listAllUsers(); // Fetch all users
    const formattedUsers = users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "No Name",  // Fallback to "No Name" if not provided
    }));
    res.json(formattedUsers); // Send users data to the frontend
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start the server on port 3000
app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
