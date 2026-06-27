# City Planner - Client ⚛️

React 18 frontend for City Planner featuring an interactive 3D globe, smart search, and trip planning interface.

**Status:** ✅ Production Ready with 46 Unit Tests & Automated CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x
- npm 9+
- API keys: Google Maps

### Installation

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your API keys
npm run dev
```

Client runs on `http://localhost:5173`

## 📋 Environment Variables

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

## 📁 Project Structure

```
client/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── ui/          # UI building blocks
│   │   ├── stages/      # Page stage components
│   │   ├── auth/        # Authentication components
│   │   ├── map/         # Map-related components
│   │   └── 3d/          # 3D globe components
│   ├── contexts/        # React Context providers
│   ├── lib/             # Utilities and API functions
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Entry point
├── .github/workflows/
│   └── client-ci.yml    # GitHub Actions CI/CD
├── package.json
├── vite.config.ts
├── vitest.config.ts     # Testing configuration
├── tailwind.config.js
└── tsconfig.json
```

## 🛠️ Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run test             # Run unit tests (watch mode)
npm run test:coverage    # Run tests with coverage report
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Three.js** - 3D globe rendering
- **React Router** - Navigation (if applicable)

## 📱 Component Architecture

### Core Components
- **Globe** - Interactive 3D Earth with Three.js
- **SearchBar** - City search with autocomplete
- **TripPlanner** - Trip configuration interface
- **ItineraryView** - Display generated itineraries
- **WeatherWidget** - Show weather forecast

### UI Components
Located in `src/components/ui/`:
- Buttons, inputs, modals, cards, etc.
- Keep components focused and single-responsibility
- Use Tailwind CSS for styling

### Custom Hooks
- Encapsulate complex logic
- Keep components clean and readable
- Examples: `useApi`, `useWindowSize`, etc.

## 🎯 Development Guidelines

### Styling
- **Use Tailwind CSS** - Utility-first approach
- **Avoid CSS-in-JS** - Keep styles in HTML
- **Responsive** - Mobile-first design
- **Dark mode** - Consider theme switching

### State Management
- **React Hooks** - useState, useContext for simple state
- **Custom Hooks** - For shared logic
- **No Redux** - Keep it simple initially
- **Context API** - For global state if needed

### API Integration
- **Centralized** - All API calls in `services/`
- **Error Handling** - User-friendly messages
- **Loading States** - Show feedback to users
- **Type Safety** - Full TypeScript typing

### Performance
- **Lazy Loading** - Split code with React.lazy
- **Memoization** - Use React.memo for expensive components
- **Debouncing** - On search and resize events
- **Image Optimization** - Compressed and optimized assets
- **3D Optimization** - Use Three.js best practices for globe

### Error Handling
The app gracefully handles:
- API failures with toast notifications
- Network timeouts with retry options
- Invalid coordinates with helpful messages
- Missing weather data with fallbacks
- Rate limits with user-friendly warnings

## 🚀 Building for Production

```bash
npm run build
```

Creates an optimized production build in `dist/`.

### Preview Production Build
```bash
npm run preview
```

## 🧪 Testing

Full testing setup with Vitest and automated CI/CD:

### Test Scripts
```bash
npm run test              # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
```

### Current Coverage
- **Utilities** (`lib/utils.ts`): 94.15% ✅
- **API Functions** (`lib/api.ts`): 40.71%
- **Components**: 46 unit tests
- **Overall**: Automated testing on every push via GitHub Actions

### Test Structure
- Unit tests located alongside source files (`.test.ts`, `.test.tsx`)
- Uses Vitest with jsdom environment
- @testing-library/react for component testing
- Full type safety with TypeScript

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### GitHub Actions CI/CD
- **Workflow:** `.github/workflows/client-ci.yml`
- **Triggers:** Every push/PR to `main` or `develop`
- **Runs:**
  - Tests on Node 18.x & 20.x
  - Type checking
  - Coverage reporting
  - ESLint validation
  - Production build

## 🎪 Interactive Globe

The 3D globe uses Three.js and includes:
- Real-time city markers
- Smooth rotation and zoom
- Mouse controls (click and drag)
- Responsive to window resize
- Optimized for performance

### Configuration
Located in `src/components/Globe.tsx`
- Adjust sphere resolution for performance
- Customize lighting and materials
- Modify marker styles and interactions

## 🔍 Search Functionality

The search component features:
- Autocomplete powered by GeoDB API
- Real-time suggestions as you type
- Detailed city information
- Click to select and navigate

## 📅 Trip Planner

Users can:
1. Select a destination city
2. Choose start and end dates
3. Select travel styles (Culture, Food, Adventure, etc.)
4. Choose travel pace (Relaxed, Balanced, Fast)
5. Generate AI-powered itinerary

## 🌍 Responsive Design

- **Mobile** - Touch-friendly interface
- **Tablet** - Optimized layouts
- **Desktop** - Full features
- **Breakpoints** - Tailwind responsive utilities

## 📚 Additional Resources

- [Project Architecture](../docs/PROJECT_SUMMARY.md)
- [Setup Guide](../docs/SETUP.md)
- [Troubleshooting](../docs/TROUBLESHOOTING.md)
- [Server README](../server/README.md)

## 🆘 Common Issues

**Port 5173 already in use:**
```bash
# Vite will automatically use next available port
npm run dev
```

**White screen on load:**
- Check browser console for errors
- Verify `VITE_API_URL` in `.env.local`
- Ensure server is running

**Globe not rendering:**
- Check WebGL support in browser
- Verify Three.js is loaded
- Check browser console for errors

**Search not working:**
- Verify `VITE_API_URL` points to running server
- Check network tab in browser DevTools
- Ensure API keys are configured

---

## 📊 Test Coverage

| Category | Coverage | Files |
|----------|----------|-------|
| Utilities | 94.15% | `lib/utils.ts` |
| API | 40.71% | `lib/api.ts` |
| Components | 100% | `BackButton.tsx` |
| Unit Tests | 46 passing | Full suite |

## 🔗 Related Documentation

- [Server README](../server/README.md)
- [Project Architecture](../docs/PROJECT_SUMMARY.md)
- [Setup Guide](../docs/SETUP.md)
- [Troubleshooting](../docs/TROUBLESHOOTING.md)

---

**Last Updated:** 2026-06-27  
**Node Versions:** 18.x, 20.x  
**Status:** ✅ Production Ready  
**Test Coverage:** 46 unit tests with GitHub Actions automation
