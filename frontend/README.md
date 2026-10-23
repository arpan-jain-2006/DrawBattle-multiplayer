# 🎨 DrawBattle — Frontend Client

The frontend client for **DrawBattle**, a real-time multiplayer drawing and guessing game built with **React 19, TypeScript, HTML5 Canvas, and Socket.IO Client**.

---

## 🔗 Live Link

- **🎮 Live Application (Vercel)**: [https://draw-battle-multiplayer.vercel.app](https://draw-battle-multiplayer.vercel.app)
- **📦 Main Repository**: [https://github.com/arpan-jain-2006/DrawBattle-multiplayer](https://github.com/arpan-jain-2006/DrawBattle-multiplayer)

---

## 🌟 Key Frontend Features

- **HTML5 Vector Canvas**: Normalized coordinates $(0.0 \to 1.0)$ with quadratic bezier smoothing and dynamic brush scaling.
- **22-Color Palette & Tooling**: Pen, eraser, 4 brush thicknesses, instant undo stack, and clear buffer.
- **100% Mobile & Desktop Responsive**:
  - Balanced 3-column game arena on laptops/desktops.
  - Sticky top-locked canvas on mobile with dedicated tabs switcher (`[💬 Chat & Guess]` and `[👥 Players]`).
  - Native touch-drawing with pull-to-refresh prevention (`touchAction: 'none'`).
- **Real-Time Sound Synthesizer**: Web Audio API audio cues for clicks, correct guesses, timer countdowns, and podium fanfares.
- **Confetti Celebration & Podium**: Interactive 3-step podium with particle cannons.
- **Customizable SVG Avatars**: Interactive avatar builder with multiple faces, colors, and accessories.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variable
Create a `.env` file in the `frontend` directory:
```env
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
Build output is saved to the `dist/` directory.

---

## 📄 License
MIT License.
