# Knowledge Assistant - React Frontend

A stunning, modern React UI with 3D animations and glassmorphism design for the Knowledge Assistant.

## Features

- **3D Animations**: React Three Fiber with animated spheres and torus knots
- **Particle Network**: Beautiful animated particle network background
- **Glassmorphism UI**: Modern frosted glass effect design
- **Smooth Animations**: Framer Motion for buttery-smooth transitions
- **Responsive Design**: Works on all screen sizes
- **Real-time Chat**: Connect to Groq-powered backend for fast responses
- **Source Citations**: View sources with confidence scores
- **Performance Metrics**: See response times and confidence levels

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Three Fiber (3D graphics)
- Framer Motion (animations)
- Axios (API calls)
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Make sure your backend is running:
   ```bash
   cd ../backend
   npx ts-node src/index-local.ts
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Features in Detail

### 3D Scene
- Animated distorted spheres in neon colors
- Rotating wireframe torus knot
- Auto-rotating camera
- Interactive controls

### Network Background
- 80 animated particles
- Dynamic connections based on distance
- Smooth particle movement
- Bounce physics

### Chat Interface
- Glassmorphism message bubbles
- Smooth animations on send/receive
- Sample questions for quick start
- Real-time typing indicator
- Source citations with progress bars
- Confidence and processing time metrics

### Animations
- Fade in/out transitions
- Scale and rotate effects
- Smooth scrolling
- Hover effects
- Loading spinners
- Gradient text effects

## Customization

### Colors

Edit `tailwind.config.js` to change the neon colors:

```js
colors: {
  'neon-blue': '#00D9FF',
  'neon-purple': '#A855F7',
  'neon-pink': '#FF006E',
}
```

### 3D Scene

Edit `src/components/Scene3D.tsx` to modify:
- Sphere positions and colors
- Animation speeds
- Light positions and colors
- Torus knot parameters

### Particles

Edit `src/components/NetworkBackground.tsx` to adjust:
- Particle count
- Connection distance
- Particle speed
- Colors and opacity

## Performance

The app is optimized for 60 FPS with:
- Hardware-accelerated 3D rendering
- Efficient canvas animations
- React.memo for component optimization
- Lazy loading where appropriate

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

WebGL support required for 3D features.

## License

MIT
