# AICARES – AI-Controlled Adaptive Biventricular Assist System

An interactive 3D simulation demonstrating how an AI-controlled mechanical circulatory support system could reduce post-LVAD right heart failure.

> **Disclaimer:** This is an educational engineering prototype, NOT a medical device.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in Chrome or Edge.

### Build

```bash
npm run build
npm run preview
```

## Features

- **Interactive 3D Heart** — Rotate, zoom, and pan the simplified heart model
- **LVAD Visualization** — Spinning impeller with brushed titanium pump housing
- **AI-Controlled RV Assist Pump** — Adaptive states: OFF → Standby → Active → Emergency
- **Blood Flow Particles** — Animated red/blue particles following circulatory paths
- **Real-time AI Controller** — Rule-based algorithm monitoring and responding to RV failure
- **Live Dashboards** — Patient vitals, AI status, and cardiologist views
- **Recharts Graphs** — 60-second rolling history of all key parameters
- **Simulation Controls** — Sliders for RV failure severity, LVAD RPM, heart rate, pressures
- **Notification System** — Real-time alerts for AI actions and patient status changes
- **Patient Companion App** — Simplified view with plain-language status messages
- **Cardiologist Dashboard** — Detailed clinical view with intervention suggestions

## Technology Stack

- React + TypeScript + Vite
- React Three Fiber + Three.js + Drei
- Tailwind CSS
- Framer Motion
- Recharts
- Zustand

## Project Structure

```
src/
├── components/    # 3D scene components (Heart, LVAD, RV Pump, etc.)
├── charts/        # Recharts live graph components
├── hooks/         # Custom React hooks
├── store/         # Zustand state management
├── ui/            # Dashboard panels and UI components
├── App.tsx        # Main application layout
└── main.tsx       # Entry point
```
