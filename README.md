# 🍳 RecipEasy — A Social Recipe Finder App

**RecipEasy** is a full-stack, cross-platform application that simplifies recipe discovery, creation, and sharing.  
It combines community interaction, offline access, and powerful search capabilities into one intuitive platform.

---

## 📌 Project Overview

Manual recipe management through web search or physical records can be inefficient, fragmented, and impersonal. Users often struggle to find, organize, and share culinary ideas across different platforms.

**RecipEasy** solves this by integrating:
- **Recipe discovery**
- **Social networking**
- **Content creation & analytics**
- **Offline & online support**

The app runs seamlessly on **web browsers** and **Android devices** with a mobile-friendly and desktop-friendly design.

---

## ✨ Key Features

- **User Authentication & Profiles**
  - Sign up, log in, and upload profile pictures
  - Role-based access (User vs Admin)

- **Recipe Search & Management**
  - Search recipes by name, first letter, or ingredient (via [TheMealDB API](https://www.themealdb.com))
  - Save favorite recipes locally (offline caching)
  - Maintain search history

- **Content Creation & Interaction**
  - Post original recipes with images, videos, or YouTube links
  - Edit, delete, and view analytics for your posts
  - Like, share, and comment on recipes
  - Follow/unfollow other users

- **Chat Features**
  - Direct messaging between users
  - Offline chatbot for quick help
  - Online chatbot with attachment support

- **Personalized Feed**
  - Approved content from followed users

- **Admin Panel**
  - Approve or reject posts
  - View application-wide analytics
  - Monitor full feed and rejected content

- **Analytics & Statistics**
  - Charts for likes per recipe, posting frequency, and more

- **Offline Support**
  - LocalStorage & Firebase fallback for uninterrupted usage

---

## 👥 User Classes

- **Regular Users (Food Enthusiasts)**
  - Search, save, and share recipes
  - Create posts and interact socially
- **Admins**
  - Moderate posts and manage analytics
- **Guest Users**
  - (Optional future enhancement) View public recipes without login

---

## 💻 Operating Environment

- **Operating Systems**
  - Windows 7/8/10/11
  - Android 8.0 and above

- **Supported Browsers**
  - Chrome, Firefox, Edge

- **Development Stack**
  - **Frontend:** HTML, CSS, JavaScript
  - **Mobile:** Java (Android Studio)
  - **Desktop:** Electron (Windows, macOS, Linux)
  - **Backend/Storage:** Firebase, LocalStorage, MySQL (PC version)

---

## 🚀 Installation & Setup

### Web Version
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/recipEasy.git
   cd recipEasy
