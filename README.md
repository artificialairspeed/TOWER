# Deployment Notification Generator Portal

A React-based web application for creating deployment notification artifacts (HTML, PDF, PNG) from deployment metadata. Enables deployment coordinators to efficiently generate and manage notification artifacts for up to 5 simultaneous deployments.

## Features

- **Multi-Form Support**: Create and manage up to 5 deployment forms simultaneously
- **Real-time Validation**: Instant field validation with clear error messages
- **Multiple Output Formats**: Generate HTML (display), PDF (print), and PNG (image) artifacts
- **Sequential Delivery**: Smart 500ms intervals between artifact generation to prevent browser throttling
- **Collision Handling**: Automatic file name disambiguation for same-day deployments
- **Theme Support**: Light and Dark mode HTML templates
- **Accessibility**: WCAG 2.1 Level AA compliant with full keyboard navigation
- **Browser Compatible**: Tested on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Quick Links

- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Setup, architecture, testing, and known limitations
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture overview
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deployment instructions and hosting
- **[Documentation Index](./docs/DOCUMENTATION_INDEX.md)** - Complete documentation reference
- **[Design Document](/.kiro/specs/deployment-notification-generator/design.md)** - Architecture and component design
- **[Requirements](/.kiro/specs/deployment-notification-generator/requirements.md)** - Feature requirements

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI) v5
- **Testing**: Vitest + React Testing Library + Playwright
- **PDF Generation**: html2pdf.js
- **Image Generation**: html-to-image
- **Date Formatting**: Intl.DateTimeFormat API

## Getting Started

### Prerequisites

- Node.js 16+ and npm 7+

### Quick Start

```bash
# Clone and install
git clone <repository-url>
cd deployment-notification-generator
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in browser
```

### Build & Deploy

```bash
# Build for production
npm run build

# Deploy to AWS S3 (requires DEPLOY_BUCKET env var)
npm run deploy

# Preview production build locally
npm run preview
```

## Testing

```bash
# Run all unit and integration tests
npm test

# Run with interactive UI
npm run test:ui

# Generate coverage report
npm run coverage

# Run end-to-end tests (Playwright)
npm run test:e2e

# Run end-to-end tests (headless)
npm run test:e2e -- --run

# Debug end-to-end tests
npm run test:e2e:debug
```

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Tested |
| Firefox | 88+ | ✅ Tested |
| Safari | 14+ | ✅ Tested |
| Edge | 90+ | ✅ Tested |
| Internet Explorer | All | ❌ Not supported |



## Architecture

This project uses a **three-layer architecture**:

```
┌──────────────────────────────────────────────────┐
│   PRESENTATION LAYER                             │
│   React components, form state, user interactions│
├──────────────────────────────────────────────────┤
│   DOMAIN LAYER                                   │
│   Validation, formatting, template injection     │
├──────────────────────────────────────────────────┤
│   OUTPUT LAYER                                   │
│   Artifact generation, delivery orchestration    │
└──────────────────────────────────────────────────┘
```

**Key Components**:
- `FormManager` - Manages 1-5 deployment forms
- `DeploymentForm` - Single form with all sections
- `OutputGenerator` - Artifact generation and delivery
- Validation and formatting utilities in domain layer

See [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) for detailed architecture documentation.

## Directory Structure

```
src/
├── components/      # React components
├── data/            # Application catalog, form factory
├── hooks/           # Custom React hooks
├── types/           # TypeScript interfaces
├── utils/           # Validators, formatters, generators
└── App.tsx

docs/                # Documentation files

public/
└── templates/       # HTML templates (light, dark)

e2e/                 # Playwright E2E tests
```

## Documentation

### For Developers

- **[docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** - Comprehensive guide covering:
  - Project setup and build commands
  - Architecture and component structure
  - Testing approach and test commands
  - Known limitations and open items
  - Browser requirements and compatibility
  - Deployment instructions
  - Troubleshooting

- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical architecture overview
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment and hosting guide
- **[docs/DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)** - Complete documentation reference

### For Requirements

- **[Requirements](/.kiro/specs/deployment-notification-generator/requirements.md)** - Feature requirements
- **[Design Document](/.kiro/specs/deployment-notification-generator/design.md)** - Architecture design
- **[Tasks](/.kiro/specs/deployment-notification-generator/tasks.md)** - Implementation tasks

## Known Limitations

- **No Data Persistence**: All data exists only during browser session
- **Pop-ups Required**: HTML artifacts open in new tabs (requires pop-ups enabled)
- **Fixed Application Catalog**: 5 predefined applications (not configurable at runtime)
- **Keyboard-Only Date Pickers**: Date/time pickers only accept mouse/touch input
- **Template Customization**: HTML templates fixed (must rebuild to modify)

See [docs/DEVELOPER_GUIDE.md - Known Limitations](./docs/DEVELOPER_GUIDE.md#known-limitations-and-open-items) for details.

## Deployment

The application is a static SPA that can be deployed to any static hosting provider:

```bash
# Build
npm run build

# Deploy dist/ directory to your hosting
# Examples: AWS S3, Netlify, Vercel, GitHub Pages
```

**AWS S3 Deployment**:
```bash
DEPLOY_BUCKET="my-bucket-name" npm run deploy
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. See [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) for development setup
2. Follow TypeScript and React best practices
3. Ensure all tests pass: `npm test && npm run test:e2e`
4. Create descriptive commits referencing task numbers
5. Submit pull request for review

## Support

For questions or issues:

1. See [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)
2. Review component source code in `src/components/`
3. Check spec documentation in `.kiro/specs/`
4. Review test files for usage examples

## Version

- **React**: 19.2.7
- **TypeScript**: 7.0.2
- **Vite**: 8.1.5
- **Material UI**: 9.2.0

---

**Maintained By**: Development Team  
**Last Updated**: 2025
