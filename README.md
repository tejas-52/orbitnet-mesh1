# 🛰️ ORBITNET-MESH
Satellite-Assisted Communication & Data Relay System for Space Transportation

## 📌 Project Overview

ORBITNET-MESH is a software-driven communication and data relay system designed to improve the availability, reliability, and continuity of communication for space transportation missions.

Current space missions rely heavily on ground stations, which results in communication gaps during launch, re-entry, ocean coverage, and high-speed orbital or deep-space phases. These gaps can lead to loss of telemetry, reduced mission safety, and limited operational flexibility.

ORBITNET-MESH addresses this challenge by enabling intelligent satellite-assisted communication combined with a store-and-forward mechanism, ensuring that mission data is either transmitted in near real time or safely buffered and delivered once connectivity is restored.

## 🚀 Problem Statement

- Ground-station-dependent communication causes frequent blackouts in space transportation missions
- Critical telemetry may be lost during launch, re-entry, or non-visible ground coverage
- Increasing mission complexity (LEO, lunar, deep space) requires higher communication availability
- Limited relay options reduce launch flexibility and mission confidence

## 💡 Proposed Solution

ORBITNET-MESH introduces a smart communication layer between the space vehicle, authorized relay satellites, and the ground segment.

Key concepts:
- Intelligent selection of available communication links
- Satellite-assisted data relay instead of ground-only dependency
- Store-and-forward buffering during temporary connectivity loss
- Software-based architecture compatible with existing satellite infrastructure

This approach improves data continuity, mission awareness, and operational reliability without requiring new satellite deployments.

## ⭐ Key Capabilities

- Satellite-assisted communication for space transportation vehicles
- Adaptive link selection based on availability and mission phase
- Store-and-forward data buffering to prevent telemetry loss
- End-to-end mission data visibility for ground operators
- Software-based, scalable, and cost-effective design

## 🧪 MVP Scope

This repository demonstrates a software prototype and simulation, including:
- Communication link availability simulation
- Data buffering and forwarding logic
- Mission control dashboard for visualization
- Architecture and process flow aligned with real mission scenarios

**Note:** This is a simulation-based MVP intended to validate feasibility and system design. No real satellite access is used.

## 🚀 How to Run

### Prerequisites
- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **Git** (for cloning)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd orbitnet-mesh
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv .venv
   
   # Windows
   .venv\Scripts\activate
   
   # Linux/Mac
   source .venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   # In project root
   npm install
   ```

4. **Start the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   python main.py
   ```
   Backend will run on `http://localhost:8000`
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

5. **Access the Application**
   - Open your browser to `http://localhost:5173`
   - The mission control dashboard will load
   - Click "Start Mission" to begin the simulation

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `python main.py` - Start FastAPI server
- API documentation available at `http://localhost:8000/docs`

### System Modes
- **ORBITNET Mode**: Full satellite-assisted communication with zero data loss
- **Ground-Only Mode**: Traditional ground station communication (data loss during blackouts)

Switch between modes in the dashboard to compare performance!
