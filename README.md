<div align="center">

# 🔍 TruePixel

### AI-Powered Image Authenticity Detector

*Instantly determine whether an image was created by AI or captured by a human*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## ✨ Overview

**TruePixel** is a full-stack web application that uses a configurable **vision model pipeline** to classify images as either *real* (human-captured) or *AI-generated*. Upload any image and get a verdict with confidence scores in seconds.

The app is split into two parts:

| Layer | Stack |
|---|---|
| **Frontend** | React 19 · Vite · TailwindCSS v4 · Axios |
| **Backend** | Node.js · ONNX Runtime · Sharp |

---

## 🚀 Features

- 🖼️ **Drag-and-drop** image upload with live preview
- ⚡ **Real-time inference** via the local ONNX model server
- 📊 **Confidence scores** with animated probability bars
- ✅ / ⚠️ **Clear verdicts** — *Real* or *AI-Generated*
- 🔒 **Client-side file validation** — type & size checks before upload
- 💡 **Powered by multiple vision models** — configurable inference at 512×512 resolution
- 🎨 **Custom typography** — Bruno Ace + Tektur from Google Fonts
- 🌐 **Vite proxy** — zero CORS friction in development

---

## 🏗️ Architecture

```
┌─────────────────────────────┐       ┌──────────────────────────────┐
│        Browser              │       │      Node.js Server          │
│  React + Vite (port 5173)   │       │  ONNX Runtime (port 3000)    │
│                             │       │                              │
│  ┌───────────────────────┐  │       │  ┌────────────────────────┐  │
│  │   ImageDetector.jsx   │──┼──────▶│  │  POST /predict         │  │
│  │   (drag-drop + UI)    │  │       │  │  GET  /health          │  │
│  └───────────────────────┘  │       │  └────────────────────────┘  │
│          │                  │       │           │                  │
│  Vite Proxy (/api → :3000)  │       │  ┌────────────────────────┐  │
└──────────────────────────── ┘       │  │  fake_detector.onnx    │  │
                                      │  │  (Model Pipeline)      │  │
                                      │  └────────────────────────┘  │
                                      └──────────────────────────────┘
```

---

## 📁 Project Structure

```
TruePixel/
├── ui/                          ← React frontend (this repo)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── ImageDetector.jsx   ← Core upload + result UI
│   │   ├── App.jsx                 ← Shell layout & nav
│   │   ├── api.js                  ← Axios instance
│   │   ├── main.jsx                ← React entry point
│   │   └── index.css               ← Tailwind + Google Fonts
│   ├── .env.example
│   ├── vite.config.js              ← Tailwind plugin + dev proxy
│   └── package.json
│
└── server/                      ← Node.js inference server
    ├── models/
    │   └── fake_detector.onnx
    ├── server.js
    └── package.json
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18+
- The ONNX inference server running locally (see below)

---

### 1 · Clone the repo

```bash
git clone https://github.com/chaudhary64/TruePixel.git
cd TruePixel
```

---

### 2 · Start the inference server

```bash
cd server
npm install
npm start
# Server starts at http://localhost:3000
```

---

### 3 · Start the frontend

```bash
cd ui
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

> `.env` is pre-configured to proxy through Vite — no changes needed for local dev.

```bash
npm run dev
# App opens at http://localhost:5173
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL for API calls. Uses Vite proxy in dev. Set to your backend URL in production. |

> **Note:** All Vite env vars must be prefixed with `VITE_` to be exposed to the client.

---

## 📡 API Reference

The frontend communicates with the Node.js server via these endpoints:

### `GET /health`
Verifies the server and model are loaded.

```bash
curl http://localhost:3000/health
```

---

### `POST /predict`
Classifies an image as real or AI-generated.

**Request** — `multipart/form-data`:

```bash
curl -X POST http://localhost:3000/predict \
  -F "image=@path/to/image.jpg"
```

**Response**:

```json
{
  "predictedClassId": "1",
  "predictedClass": "AI-Generated (Fake)",
  "confidence": 0.9821,
  "probabilities": [
    { "classId": "0", "label": "Real",               "probability": 0.0179 },
    { "classId": "1", "label": "AI-Generated (Fake)", "probability": 0.9821 }
  ],
  "model": {
    "name": "active-vision-model",
    "imageSize": 512
  }
}
```

| Field | Type | Description |
|---|---|---|
| `predictedClassId` | `"0"` \| `"1"` | `"0"` = Real, `"1"` = AI-Generated |
| `confidence` | `number` | 0–1 float of the predicted class score |
| `probabilities` | `array` | Per-class probabilities |

> **Limits:** Max upload size is 10 MB. Images are resized to 512×512 internally.

---

## 🧠 Model Details

| Property | Value |
|---|---|
| Model strategy | Configurable / swappable models |
| Fine-tuning | Depends on selected model |
| Input resolution | 512 × 512 |
| Runtime | ONNX Runtime (Node.js) |
| Classes | `Real` · `AI-Generated (Fake)` |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variable:
   ```
   VITE_API_BASE_URL = https://your-backend-url.com
   ```
4. Vercel auto-detects Vite — build command `npm run build`, output `dist`

### Backend → Railway / Render

Deploy the `server/` directory as a Node.js service. No special config needed — just `npm start`.

Make sure your backend sends the CORS header for your Vercel domain:

```
Access-Control-Allow-Origin: https://your-app.vercel.app
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built with ❤️ using **Vision Models · React · Vite · ONNX Runtime**

</div>
