# Documentation Index

A comprehensive guide to all documentation for the Deployment Notification Generator Portal. Start here to find the right documentation for your role.

---

## For New Developers

If you're new to this project, start here:

1. **[README.md](./README.md)** - Project overview and quick start
   - Features and technology stack
   - Prerequisites and getting started
   - Quick links to key documentation

2. **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Comprehensive developer guide
   - Project setup and build commands
   - Architecture overview (three-layer architecture)
   - Testing approach and commands
   - Known limitations and browser requirements
   - Troubleshooting guide

3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
   - High-level architecture diagrams
   - Component hierarchy and tree
   - Data flow and state management
   - Domain models and interfaces
   - Design patterns used

---

## For Specific Roles

### Frontend Developer

Essential reading:
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Setup and architecture
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Component structure
- Component READMEs in `src/components/*.README.md` - Individual component docs
- [DESIGNER_DOCUMENT](/.kiro/specs/deployment-notification-generator/design.md) - Design decisions

Common tasks:
```bash
npm run dev              # Start development server
npm test -- --watch     # Run tests in watch mode
npm run test:e2e        # Run E2E tests interactively
```

### QA / Testing Engineer

Essential reading:
- [DEVELOPER_GUIDE.md - Testing Section](./DEVELOPER_GUIDE.md#testing-approach-and-commands)
- [E2E_TEST_DOCUMENTATION.md](./E2E_TEST_DOCUMENTATION.md) - E2E testing guide
- [BROWSER_COMPATIBILITY_TESTING_README.md](./BROWSER_COMPATIBILITY_TESTING_README.md) - Cross-browser testing
- [ACCESSIBILITY_TESTING_GUIDE.md](./ACCESSIBILITY_TESTING_GUIDE.md) - Accessibility testing

Test commands:
```bash
npm test                # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:e2e -- --run  # Headless mode
npm run coverage        # Generate coverage report
```

### DevOps / Release Engineer

Essential reading:
- [DEVELOPER_GUIDE.md - Deployment Section](./DEVELOPER_GUIDE.md#deployment)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions

Deployment commands:
```bash
npm run build           # Build for production
DEPLOY_BUCKET="bucket-name" npm run deploy  # Deploy to AWS S3
```

### Product Manager

Essential reading:
- [README.md](./README.md) - Features overview
- [REQUIREMENTS](/.kiro/specs/deployment-notification-generator/requirements.md) - Feature requirements
- [KNOWN LIMITATIONS](./DEVELOPER_GUIDE.md#known-limitations-and-open-items) - Current constraints
- [BROWSER_COMPATIBILITY_REPORT.md](./BROWSER_COMPATIBILITY_REPORT.md) - Supported browsers

### Accessibility Auditor

Essential reading:
- [ACCESSIBILITY_TESTING_GUIDE.md](./ACCESSIBILITY_TESTING_GUIDE.md) - Testing procedures
- [WCAG_21_COMPLIANCE_CHECKLIST.md](./WCAG_21_COMPLIANCE_CHECKLIST.md) - WCAG 2.1 AA compliance
- [ACCESSIBILITY_FEATURES_SUMMARY.md](./ACCESSIBILITY_FEATURES_SUMMARY.md) - Implemented features
- [ACCESSIBILITY_QUICK_REFERENCE.md](./ACCESSIBILITY_QUICK_REFERENCE.md) - Quick reference

### Performance Engineer

Essential reading:
- [DEVELOPER_GUIDE.md - Performance Section](./DEVELOPER_GUIDE.md#performance-characteristics)
- [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) - Optimization strategies
- [PERFORMANCE_SUMMARY.md](./PERFORMANCE_SUMMARY.md) - Performance metrics

---

## Documentation by Topic

### Architecture & Design

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | High-level and detailed architecture |
| [Design Document](/.kiro/specs/deployment-notification-generator/design.md) | Component design and data models |
| [Component READMEs](./src/components/) | Individual component documentation |

### Setup & Getting Started

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview and quick start |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Complete setup and development guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment instructions |

### Testing

| Document | Purpose |
|----------|---------|
| [DEVELOPER_GUIDE.md - Testing](./DEVELOPER_GUIDE.md#testing-approach-and-commands) | Testing overview |
| [E2E_TEST_DOCUMENTATION.md](./E2E_TEST_DOCUMENTATION.md) | End-to-end testing |
| [BROWSER_COMPATIBILITY_TESTING_README.md](./BROWSER_COMPATIBILITY_TESTING_README.md) | Cross-browser testing |
| [BROWSER_COMPATIBILITY_REPORT.md](./BROWSER_COMPATIBILITY_REPORT.md) | Browser test results |

### Quality & Standards

| Document | Purpose |
|----------|---------|
| [ACCESSIBILITY_TESTING_GUIDE.md](./ACCESSIBILITY_TESTING_GUIDE.md) | WCAG 2.1 testing procedures |
| [WCAG_21_COMPLIANCE_CHECKLIST.md](./WCAG_21_COMPLIANCE_CHECKLIST.md) | WCAG 2.1 AA compliance checklist |
| [ACCESSIBILITY_FEATURES_SUMMARY.md](./ACCESSIBILITY_FEATURES_SUMMARY.md) | Accessibility features implemented |
| [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) | Performance optimization guide |
| [PERFORMANCE_SUMMARY.md](./PERFORMANCE_SUMMARY.md) | Performance metrics and benchmarks |

### Requirements & Specifications

| Document | Purpose |
|----------|---------|
| [Requirements](/.kiro/specs/deployment-notification-generator/requirements.md) | Feature requirements |
| [Design Document](/.kiro/specs/deployment-notification-generator/design.md) | Architecture and design decisions |
| [Tasks](/.kiro/specs/deployment-notification-generator/tasks.md) | Implementation tasks and checklist |
| [REQUIREMENTS_TRACEABILITY_MATRIX.md](./REQUIREMENTS_TRACEABILITY_MATRIX.md) | Requirements traceability |

### Troubleshooting

| Document | Purpose |
|----------|---------|
| [DEVELOPER_GUIDE.md - Troubleshooting](./DEVELOPER_GUIDE.md#troubleshooting) | Common issues and solutions |
| [DEVELOPER_GUIDE.md - Known Issues](./DEVELOPER_GUIDE.md#known-issues) | Known limitations and workarounds |

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev                         # Start dev server
npm install                        # Install dependencies
npm run build                      # Build for production
npm run preview                    # Preview production build

# Testing
npm test                           # Run unit tests
npm test -- --watch               # Watch mode
npm run test:ui                    # Interactive UI
npm run coverage                   # Coverage report
npm run test:e2e                   # E2E tests (interactive)
npm run test:e2e -- --run          # E2E tests (headless)
npm run test:e2e:debug             # E2E debug mode

# Deployment
npm run build                      # Build
DEPLOY_BUCKET="bucket" npm run deploy  # Deploy to S3
```

### Browser Support Matrix

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full | Fully tested |
| Firefox | 88+ | ✅ Full | Fully tested |
| Safari | 14+ | ✅ Full | Fully tested |
| Edge | 90+ | ✅ Full | Chromium-based |
| Internet Explorer | All | ❌ None | Not supported |

### Technology Stack

- **React** 19.2.7
- **TypeScript** 7.0.2
- **Vite** 8.1.5
- **Material UI** 9.2.0
- **Testing**: Vitest 4.1.10, Playwright 1.62.0, Cypress 15.19.0

---

## Project Structure Quick Reference

```
deployment-notification-generator/
├── README.md                    # Project overview
├── DEVELOPER_GUIDE.md           # Development guide (THIS FILE'S FOCUS)
├── ARCHITECTURE.md              # Architecture details
├── DEPLOYMENT.md                # Deployment guide
├── package.json                 # Dependencies
├── vite.config.ts              # Vite configuration
├── playwright.config.ts        # Playwright configuration
├── cypress.config.cjs           # Cypress configuration
├── tsconfig.json               # TypeScript configuration
│
├── src/
│   ├── components/             # React components
│   ├── data/                   # Application catalog, form factory
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript interfaces
│   ├── utils/                  # Validation, formatting, generation
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
│
├── public/
│   └── templates/              # HTML templates (light, dark)
│
├── e2e/                        # Playwright E2E tests
├── cypress/                    # Cypress E2E tests
│
├── dist/                       # Production build (generated)
├── coverage/                   # Test coverage (generated)
└── .kiro/
    └── specs/
        └── deployment-notification-generator/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

---

## Known Limitations

Quick reference to major limitations. See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#known-limitations-and-open-items) for details:

1. **No Data Persistence** - Data exists only during browser session
2. **Pop-ups Required** - HTML artifacts open in new tabs
3. **Fixed Application Catalog** - 5 predefined applications
4. **Keyboard-Only Date Pickers** - Mouse/touch only, no keyboard input
5. **Template Customization** - HTML templates fixed
6. **File Naming Constraints** - May exceed limits with long names
7. **Browser Pop-up Requirements** - Requires pop-ups enabled
8. **Application Catalog Size** - Hardcoded, not configurable

---

## How to Contribute

1. Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for setup
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for component structure
3. Read component README in `src/components/*.README.md`
4. Follow TypeScript and React best practices
5. Ensure tests pass: `npm test && npm run test:e2e`
6. Create PR with clear description

---

## Getting Help

### I want to...

- **Set up the project**: Read [DEVELOPER_GUIDE.md - Quick Start](./DEVELOPER_GUIDE.md#quick-start)
- **Understand the architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Modify a component**: Read its README in `src/components/*.README.md`
- **Write a test**: Read [DEVELOPER_GUIDE.md - Testing](./DEVELOPER_GUIDE.md#testing-approach-and-commands)
- **Deploy the app**: Read [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Check accessibility**: Read [ACCESSIBILITY_TESTING_GUIDE.md](./ACCESSIBILITY_TESTING_GUIDE.md)
- **Test cross-browser**: Read [BROWSER_COMPATIBILITY_TESTING_README.md](./BROWSER_COMPATIBILITY_TESTING_README.md)
- **Optimize performance**: Read [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md)

---

## Recent Documentation Updates

This is Task 22.4 - Create README and developer documentation. The following documents were created/updated:

1. ✅ **DEVELOPER_GUIDE.md** (NEW) - Comprehensive developer documentation
2. ✅ **README.md** (UPDATED) - Enhanced project overview
3. ✅ **ARCHITECTURE.md** (NEW) - Detailed architecture documentation
4. ✅ **DOCUMENTATION_INDEX.md** (NEW) - This index

---

## Support

For questions:
1. Check the relevant documentation above
2. Review component READMEs in `src/components/`
3. Check spec documentation in `.kiro/specs/`
4. Review test files for usage examples
5. Search for similar issues in git history

---

**Last Updated**: 2025  
**Maintained By**: Development Team  
**Version**: 1.0.0
