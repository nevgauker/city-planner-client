# Client Documentation

Documentation for the React client component.

## 📚 Table of Contents

### Getting Started
- [Setup & Development](./SETUP.md) - Client setup and development guide
- [Build & Deployment](./BUILD.md) - Building for production

### Development
- [Component Structure](./COMPONENTS.md) - Component architecture and patterns
- [State Management](./STATE.md) - State management approach
- [API Integration](./API.md) - Integration with backend API

### Testing & Quality
- [Testing Guide](./TESTING.md) - Test structure and running tests
- [Type Safety](./TYPESCRIPT.md) - TypeScript configuration

### Deployment & DevOps
- [Vite Configuration](./VITE.md) - Vite build configuration
- [Environment Variables](./ENV.md) - Environment setup

---

## 🚀 Quick Start

```bash
cd client

# Install and develop
npm install
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript checking |

---

## 📁 Project Structure

```
client/
├── docs/                       ← You are here
│   ├── README.md              (this file)
│   ├── SETUP.md
│   ├── BUILD.md
│   ├── COMPONENTS.md
│   ├── API.md
│   └── ENV.md
├── src/
│   ├── components/            (React components)
│   ├── pages/                 (Page components)
│   ├── services/              (API integration)
│   ├── hooks/                 (Custom hooks)
│   ├── utils/                 (Utility functions)
│   ├── App.tsx
│   └── main.tsx
├── public/                    (Static assets)
├── index.html                 (Entry point)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .eslintrc.json
```

---

## 🎨 Features

- React 18+ for UI
- Vite for fast development
- TypeScript for type safety
- Tailwind CSS for styling
- Three.js for 3D globe visualization

---

## 🔄 Development Workflow

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:5173

3. **Make changes** - Hot reload enabled

4. **Run linting:**
   ```bash
   npm run lint
   ```

5. **Type checking:**
   ```bash
   npm run type-check
   ```

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Output in dist/ folder
# Preview before deploying
npm run preview
```

---

## 🆘 Troubleshooting

### Dev server won't start
- Port 5173 might be in use
- Change in `vite.config.ts`
- Or kill process: `lsof -ti :5173 | xargs kill -9`

### Build errors
- Clear cache: `rm -rf node_modules dist && npm install`
- Check TypeScript: `npm run type-check`

### API connection issues
- Verify server is running (port 5000)
- Check `.env.local` has correct `VITE_API_URL`
- See [API Integration](./API.md)

---

## 📋 Configuration Files

### vite.config.ts
- Vite build configuration
- Dev server settings
- Build output options

### tsconfig.json
- TypeScript compiler options
- Strict mode enabled
- JSX configuration

### .eslintrc.json
- ESLint configuration
- Code quality rules

---

## 🎯 Best Practices

1. **Components:** Use functional components with hooks
2. **State:** Use React Context or state management library
3. **Types:** Always define TypeScript types
4. **Styling:** Use Tailwind CSS utility classes
5. **API:** Use API service layer for backend calls

---

## 📞 Support

1. **Setup issues?** → [Setup Guide](./SETUP.md)
2. **API problems?** → [API Integration](./API.md)
3. **Build issues?** → [Build Guide](./BUILD.md)
4. **Type errors?** → [TypeScript Guide](./TYPESCRIPT.md)

---

## 🔗 Related Documentation

- **Server:** [../server/docs/](../server/docs/)
- **Project:** [../docs/](../docs/)
- **Root README:** [../README.md](../README.md)

---

**Last Updated:** 2026-06-18  
**Tech Stack:** React 18+, Vite, TypeScript, Tailwind CSS
