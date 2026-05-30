# Hand Puck

A small React app that lets a webcam-tracked hand move and pinch a puck.

## Run the Project

```bash
npm install
npm run dev
```

## Useful Commands

```bash
npm run lint
npm run build
```

## Project Structure

```text
src/
  App.jsx                     Main page layout
  components/                 Small React UI pieces
  hooks/useHandTracking.js    Starts/stops the camera and runs each video frame
  handTracking.js             MediaPipe setup, hand drawing, and puck movement
```

Start reading with `src/App.jsx`, then open `src/hooks/useHandTracking.js` to see how the webcam connects to the hand-tracking helpers.
