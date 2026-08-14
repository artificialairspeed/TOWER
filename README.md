# Deployment Notification Generator Portal

A React-based web application for creating deployment notification artifacts (HTML, PDF, PNG) from deployment metadata.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI v5 (to be installed)
- **Testing**: Vitest + React Testing Library
- **PDF Generation**: html2pdf.js (to be installed)
- **Image Generation**: html-to-image (to be installed)
- **Date Formatting**: Intl.DateTimeFormat API

## Project Structure

```
src/
├── data/          # Application catalog and constants
├── components/    # React components
├── utils/         # Utility functions (validators, formatters)
├── types/         # TypeScript type definitions
└── test/          # Test setup and utilities

public/
└── templates/     # HTML templates (light-mode, dark-mode)
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

This project follows a layered architecture:
1. **Domain Layer**: Data models, validation, formatting utilities
2. **Presentation Layer**: React components and form management
3. **Output Layer**: Artifact generation and delivery orchestration

See `.kiro/specs/deployment-notification-generator/` for detailed requirements and design documentation.
