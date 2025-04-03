# Persimu - Persona Simulation System

## Overview

Persimu is an advanced platform for AI-based persona simulation. The system enables creation and management of virtual personas, running interaction simulations, and deep analysis of results.

### System Goals

- Simulate interactions with virtual personas
- Analyze persona behavior and responses
- Demonstrate various scenarios in customer service, market research, etc.
- Collect insights and analyze simulation data

### Main Components

1. **Persona Manager** (`persona-manager.js`)
   - Create and manage personas
   - Define personality traits
   - Manage persona memory

2. **Simulation Manager** (`simulation-manager.js`)
   - Run simulations
   - Manage scenarios
   - Track progress

3. **Result Analyzer** (`simulation-analytics.js`)
   - Analyze emotions
   - Identify key topics
   - Measure response times

4. **User Interface** (`demo.html`, `environment-editor.html`)
   - Edit personas
   - Manage simulations
   - Display results

## Installation

### System Requirements

- Modern browser with ES6 support
- Node.js (version 14 or higher)
- npm or yarn

### Installation Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with appropriate settings
   ```

3. Start local server:
   ```bash
   npm run dev
   ```

### Environment Setup

- Configure API keys
- Set file paths
- Configure global parameters

## Usage

### Managing Personas

1. Create new persona:
   - Define personality traits
   - Set up memory
   - Configure behavior

2. Edit existing personas:
   - Update traits
   - Manage memory
   - Adjust behavior

### Managing Simulations

1. Create new scenario:
   - Define participating personas
   - Set scenario steps
   - Define completion conditions

2. Run simulation:
   - Select scenario
   - Start simulation
   - Monitor progress

### Analyzing Results

1. View results:
   - Analyze emotions
   - Identify topics
   - Measure performance

2. Export data:
   - Export to CSV
   - Export to JSON
   - Generate reports

## Additional Documentation

- [Deployment Plan](deployment.md)
- [System Architecture](architecture.md)
- [API Guide](api.md)
- [Development Guide](development.md) 