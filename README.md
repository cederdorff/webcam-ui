# Hand Puck

Hand Puck is a small React project where you use your webcam to track your hand.
Your index finger moves a puck on the screen, and pinching your thumb and index
finger changes the puck state.

You can use this project as a starting point for building your own webcam hand
gesture experiments.

## What You Will Use

- `react-webcam` to show the webcam in React.
- `@mediapipe/tasks-vision` to find hand landmarks in each video frame.
- React state to update the information panel.
- CSS variables to move and scale the puck.

## Before You Start

You need:

- Node.js installed.
- A browser with webcam support, for example Chrome, Edge, or Firefox.
- Permission to use the webcam.

Webcam access works on `localhost`. Do not open the HTML file directly by
double-clicking it, because the browser will usually block camera access.

## Install and Run the Project

Open a terminal in the project folder.

```bash
npm install
npm run dev
```

The terminal will show a local address, usually:

```text
http://localhost:5173/
```

Open that address in your browser.

Then:

1. Click `Start camera`.
2. Allow webcam permission when the browser asks.
3. Hold one hand in front of the camera.
4. Move your index finger to move the puck.
5. Touch your index finger and thumb together to trigger pinch mode.

## Useful Commands

Run the development server:

```bash
npm run dev
```

Check the code for common problems:

```bash
npm run lint
```

Build the final production version:

```bash
npm run build
```

## Important Files

```text
src/
  App.jsx            Main React file. Start reading here.
  gestures.js        Your main playground for creating hand gestures.
  handTracking.js    MediaPipe setup, hand drawing, and puck movement.
  App.css            Styling for the page, webcam, and puck.
  main.jsx           Starts the React app.
```

A good reading order is:

1. `src/App.jsx`
2. `src/gestures.js`
3. `src/handTracking.js`
4. `src/App.css`

## How the App Works

The app has three main steps.

### 1. Start the Camera

In `src/App.jsx`, the `startCamera` function loads the MediaPipe hand-tracking
model.

When the model is ready, React shows the webcam.

### 2. Read Each Webcam Frame

When the camera is ready, `runFrameLoop` starts.

This function runs again and again with `requestAnimationFrame`.

Each time it runs, it:

1. Gets the current webcam video.
2. Sends the video frame to MediaPipe.
3. Checks whether a hand was found.
4. Draws the hand landmarks on the canvas.
5. Moves the puck based on your index finger.

### 3. Use Hand Landmarks

MediaPipe gives you a list of hand points called landmarks.

Useful landmark numbers:

```text
0   wrist
4   thumb tip
8   index finger tip
12  middle finger tip
16  ring finger tip
20  pinky tip
```

Each landmark has an `x` and `y` value between `0` and `1`.

For example:

```js
const indexTip = landmarks[8]
const thumbTip = landmarks[4]
```

## Use This as a Base for Gesture Projects

Most experiments can start in `src/gestures.js`.

This file has two important functions:

```js
getHandGesture(landmarks)
movePuckWithGesture(gesture, puck)
```

`getHandGesture` reads the hand landmarks and decides which gesture is active.

`movePuckWithGesture` uses that gesture to move the puck on the screen.

Right now, `getHandGesture` detects:

- pinch,
- open hand,
- pointing up,
- normal tracking.

You can create new gestures by comparing landmark positions or distances.

The information panel also shows the current gesture, so you can quickly see if
your new gesture works.

## How to Add Your Own Gesture

Open `src/gestures.js`.

Inside `getHandGesture`, calculate a new boolean value:

```js
const isPointingLeft = indexTip.x < wrist.x
```

Then update `getGestureName`:

```js
if (isPointingLeft) {
  return 'Pointing left'
}
```

If you need more points from the hand, add them to the `LANDMARK` object at the
top of the file.

For example:

```js
const LANDMARK = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
}
```

Using names like `INDEX_TIP` is easier to read than using numbers everywhere.

## Gesture Ideas

### Pinch

Compare the thumb tip and index finger tip.

```js
const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y)
const isPinching = distance < 0.06
```

### Pointing Up

Compare the index fingertip with the wrist.

```js
const isPointingUp = indexTip.y < wrist.y
```

Remember: smaller `y` means higher on the screen.

### Open Hand

Check whether several fingertips are higher than their base joints.

```js
const indexIsOpen = landmarks[8].y < landmarks[5].y
const middleIsOpen = landmarks[12].y < landmarks[9].y
const ringIsOpen = landmarks[16].y < landmarks[13].y
const pinkyIsOpen = landmarks[20].y < landmarks[17].y
```

### Swipe

Store the previous index finger position, then compare it with the new one.

```js
const movedRight = currentIndexX - previousIndexX > 0.1
```

This is a good next challenge because it introduces memory over time.

## Project Ideas

1. Change the puck color when you pinch.
2. Make a sound when a pinch starts.
3. Count how many times you pinch.
4. Move a different object with your middle finger instead of your index finger.
5. Create a gesture that pauses the puck.
6. Create a gesture-controlled drawing app.
7. Create a simple game where your hand collects objects.

## Troubleshooting

If the camera does not start:

- Make sure you opened the app from `localhost`, not by double-clicking
  `index.html`.
- Make sure the browser has permission to use the camera.
- Close other apps that may already be using the webcam.
- Try refreshing the page.
- Try another browser.

If hand tracking feels slow:

- Use a well-lit room.
- Keep one hand clearly visible.
- Avoid busy backgrounds.
- Move your hand a little slower.

If the app says `Camera blocked`:

- Open the browser site settings.
- Allow camera access for `localhost`.
- Refresh the page.
