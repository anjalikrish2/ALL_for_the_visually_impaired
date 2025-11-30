# Accessible Learning Platform for Visually Impaired Learners  
An audio-driven, keyboard-navigated, highly interactive learning tool built for visually impaired children.  
This platform uses **text-to-speech**, **keyboard/joystick navigation**, and a **backend-to-frontend API pipeline** to deliver accessible MCQ learning experiences powered by real educational content from the **LearnerAI API**.

This repository contains:

- 🎧 Full Web Speech API integration  
- 🌐 Backend API proxy (Node + Express)  
- ⌨ Keyboard and joystick navigation  
- 🧠 Intelligent MCQ rendering  
- 🪄 Auto-advance logic  
- 🔊 Adjustable voice speed + selectable voices  
- 🐞 Debug and audio-test features  

---

## ✨ Key Features

### 🎙 1. Advanced Voice Engine (Web Speech API)
- Auto-selects the **best en-IN voice**
- Allows choosing any available voice on the device
- Adjustable speaking speed (0.5x → 2.0x)
- “Test Voice” button to preview the selected voice
- Speech priorities (important messages interrupt ongoing speech)

### ⌨ 2. Fully Accessible Navigation
Supports **keyboard, joystick, or assistive devices**:

| Key | Action |
|-----|--------|
| ↑ / W | Move up options |
| ↓ / S | Move down options |
| Enter | Submit answer |
| Space | Repeat selected option |
| R | Repeat question |
| 1–5 | Direct option selection |
| N | Next question (after answering) |
| H | Help instructions |

No mouse required — 100% accessible.

### 🧠 3. MCQ Rendering Engine
- Cleans noisy API text
- Filters invalid options (e.g., “Option A”, empty values)
- Auto-generates context-based fallback options
- Ensures the correct answer always appears in options  
- Highlights correct/incorrect answers visually and through speech  
- Includes confidence-based next-question auto-advance (3s)

### 🌐 4. Backend Integration (LearnerAI API)
The frontend fetches learning content via:


Backend responsibilities:
- Authenticates via **Bearer token**
- Validates API response
- Returns simplified JSON to frontend
- Excludes image-based questions and invalid content

### 🔊 5. Audio Support
If API returns an audio URL:
- UI reveals an “audio available” section
- User can trigger audio playback
- Voice announces availability automatically

### 🐞 6. Debug & Developer Tools
- Debug toggle reveals full JSON from API  
- Includes:
  - `/api/test-auth`
  - `/api/content-tags`
  - `/api/all-questions`
- Auto-speech error reporting  
- Full error catcher with user-friendly voice messages  

---

## 📁 Repository Structure


---

## 🚀 How the System Works

### 1️⃣ Backend fetches content from LearnerAI
- via secure Bearer token  
- filtered for accessibility  
- parsed into standardized format  

### 2️⃣ Frontend loads question and speaks it aloud
- Speech has dynamic voice  
- Supports repeat and fast navigation  

### 3️⃣ User selects answer
- Uses keyboard or joystick  
- Audio announces selection  

### 4️⃣ Submission
- Option highlighted with correct/incorrect colors  
- Spoken feedback  
- Next-question button shows  
- Auto-advance after 3 seconds  

---

## 🛠 Setup Instructions

### Backend

---

## 🎤 Voice Selection & Speed Control

Your UI includes:

- Voice dropdown  
- Voice speed label  
- Slower / Faster buttons  
- Test voice button  

All stored in `localStorage` as preferences.

---

## 🔧 API Endpoints

| Route | Purpose |
|--------|---------|
| `/api/content` | Main MCQ content API |
| `/api/test-auth` | Tests API authorization |
| `/api/content-tags` | Returns all topic tags |
| `/api/all-questions` | Returns all generated questions |

---

## 🌟 Why This Project Matters

This project enables:

- **Independent learning for visually impaired children**  
- **Accessible English + Math practice**  
- **Hands-free question solving**  
- **Audio-first content navigation**  
- **No visual dependency**  
- **No mouse required**  

This system helps transform accessibility in education using modern web technologies.

---

## 🧩 Future Enhancements

- Speech-to-text answering  
- User progress tracking  
- Personalized learning paths  
- Multi-language support  
- Haptic feedback support  
- Voice-only mode (no UI display)  

---

## 👩‍💻 Author
Designed and developed by **Anjali**,  
with a focus on accessibility, inclusivity, and real-world impact.

