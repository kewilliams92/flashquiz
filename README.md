
# 🧠 FlashQuiz

**FlashQuiz** is an AI-powered flashcard generation application designed to help users study more efficiently. It automates the creation of flashcards by leveraging both the **Wikipedia Python Library** and **OpenAI API**, reducing the friction of figuring out what to study first.

---

## 🚀 Overview

FlashQuiz addresses a common challenge for learners: **getting started**. Instead of manually curating initial flashcards, users simply provide a topic, and the app automatically:

* Fetches relevant information using the **Wikipedia Python library**
* Processes and summarizes key points via **OpenAI’s API**
* Generates **five intelligent starter flashcards** for each topic

If a Wikipedia page doesn’t exist or can’t be accessed, the app falls back to topic-based generation using OpenAI, ensuring a smooth experience in all cases.

---

## ⚙️ Features

* 🤖 **AI-Powered Flashcard Generation:** Custom prompt engineering generates high-quality flashcards from raw topic input.
* 🔗 **Wikipedia Integration:** Automatically extracts data from Wikipedia to ensure factual content.
* 💻 **Full-Stack Architecture:**

  * **Frontend:** React + TailwindCSS + Framer Motion
  * **Backend:** Django REST Framework + PostgreSQL
* 🔐 **Authentication via Clerk:**
  Clerk manages user authentication, offering **email login** and **social sign-in** (Google, GitHub, etc.) out of the box.
* 📊 **Scalable Data Models:** Decks, Flashcards, and Feedback tables are relationally linked to enable personalized study sessions.
* ⚡ **Responsive Feedback System:** Real-time loading indicators during API requests keep users informed about progress.

---

## 🧩 Tech Stack

| Layer                | Technology                                         |
| -------------------- | -------------------------------------------------- |
| **Frontend**         | React, TailwindCSS, Framer Motion                  |
| **Backend**          | Django REST Framework                              |
| **Database**         | PostgreSQL                                         |
| **APIs**             | Wikipedia Python Library, OpenAI API               |
| **Auth**             | Clerk                                              |
| **Deployment Ready** | Supports .env configuration for secure credentials |

---

## 🗂️ Project Structure

```
flashquiz/
├── backend/
│   ├── manage.py
│   ├── flashquiz_api/
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── ...
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/flashquiz.git
cd flashquiz
```

### 2. Create the Database

```bash
createdb flashquiz_db
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Backend `.env`

```
OPENAI_API_KEY=
CLERK_SECRET_KEY=
CLERK_ISSUER=
CLERK_JWKS_URL=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

#### Configure Frontend `.env`

```
VITE_CLERK_PUBLISHABLE_KEY=
```

### 5. Run the Application

In separate terminals:

```bash
# Backend
python manage.py runserver

# Frontend
npm run dev
```

---

## 🔑 Authentication with Clerk

Clerk provides a robust and secure authentication system that integrates seamlessly into both frontend and backend:

* **Frontend:** Uses `VITE_CLERK_PUBLISHABLE_KEY` to enable login/signup UIs.
* **Backend:** Uses `CLERK_SECRET_KEY`, `CLERK_ISSUER`, and `CLERK_JWKS_URL` to validate and authorize user tokens.

Clerk handles session management, token rotation, and user metadata, allowing you to focus on the app logic rather than authentication boilerplate.

Learn more at [https://clerk.com/docs](https://clerk.com/docs)

---

## 🧠 Future Enhancements

* User feedback–driven flashcard refinement
* Spaced repetition system (SRS) integration
* Support for multiple study modes and export options
* AI-based flashcard difficulty estimation

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).

---
