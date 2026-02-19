---
layout: default
title: Home
---

# WALLY Ontology Editor

**Interactive Fish-Eye Graph Visualization for Large-Scale Ontologies**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-161.35.239.151-blue?style=for-the-badge)](http://161.35.239.151)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/gpad1234/Startup-One-Wally-Clean)

---

## 🚀 Overview

WALLY is a next-generation ontology editor featuring an innovative **fish-eye visualization** that scales to thousands of nodes. Built with Python Flask, React, and ReactFlow, it provides an intuitive interface for exploring and navigating complex semantic graphs.

### ✨ Key Features

- **🎯 Fish-Eye Visualization** - Distance-based scaling with center-focus navigation
- **🗺️ Interactive MiniMap** - Click, drag, and scroll for seamless exploration  
- **⚡ Real-Time Pagination** - BFS-based viewport loading for instant performance
- **🖱️ Click-to-Recenter** - Dynamic viewport updates on node selection
- **🎨 Beautiful Design** - Gradient nodes, smooth animations, intuitive controls
- **📊 Scalable Architecture** - Designed for 1000+ node ontologies
- **🔄 Bidirectional Traversal** - Navigate both parent→child and child→parent relationships

---

## 🎬 Quick Start

Get started with WALLY in seconds:

```bash
# Clone repository
git clone https://github.com/gpad1234/Startup-One-Wally-Clean.git
cd Startup-One-Wally-Clean

# Start backend API
python3 ontology_api.py

# In another terminal, start frontend
cd graph-ui
npm install
npm run dev
```

Visit **http://localhost:5173** to see the fish-eye graph in action!

[📖 Full Getting Started Guide →](getting-started)

---

## 📚 Documentation

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">

<div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; background: #f0f9ff;">
<h3>🎨 Features</h3>
<p>Explore the innovative fish-eye visualization and interactive features</p>
<a href="features.md">Learn More →</a>
</div>

<div style="border: 2px solid #10b981; border-radius: 8px; padding: 20px; background: #f0fdf4;">
<h3>💻 Development</h3>
<p>Development workflow, architecture, and contribution guidelines</p>
<a href="development.md">Learn More →</a>
</div>

<div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; background: #fffbeb;">
<h3>🚀 Deployment</h3>
<p>Complete guide for deploying to DigitalOcean or other platforms</p>
<a href="deployment.md">Learn More →</a>
</div>

<div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; background: #faf5ff;">
<h3>🏗️ Architecture</h3>
<p>System design, pagination algorithm, and scaling strategies</p>
<a href="architecture.md">Learn More →</a>
</div>

</div>

---

## 🎯 Live Demo

**Production:** [http://161.35.239.151](http://161.35.239.151)

Try the interactive fish-eye graph visualization:
1. Click any node to recenter the viewport
2. Adjust the radius slider to control depth
3. Use the MiniMap to pan and zoom
4. Explore the demo ontology hierarchy

---

## 🛠️ Technology Stack

### Backend
- **Python 3.12** - Core runtime
- **Flask** - REST API framework
- **rdflib 7.6.0** - RDF/OWL ontology handling
- **C Libraries** - High-performance data structures (libsimpledb.so)

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **ReactFlow** - Graph visualization library
- **Tailwind CSS** - Styling (via inline styles)

### Infrastructure
- **nginx** - Reverse proxy and static file serving
- **systemd** - Service management
- **DigitalOcean** - Cloud hosting (Ubuntu 24.04 LTS)

---

## 📖 Key Documentation

- **[ACTION_PLAN.md](../ACTION_PLAN.md)** - 4-week scaling roadmap
- **[DIGITALOCEAN_DEPLOY.md](../DIGITALOCEAN_DEPLOY.md)** - Complete deployment guide (923 lines)
- **[SESSION_2026_02_18.md](../SESSION_2026_02_18.md)** - Latest development session summary
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture documentation

---

## 🎨 Fish-Eye Visualization

The fish-eye effect creates a focus+context view where:

- **Center nodes (Distance 0):** Scale 1.8x, bright glow, bold labels
- **Near nodes (Distance 1):** Scale 1.3x, subtle glow
- **Mid nodes (Distance 2):** Scale 1.0x, normal appearance
- **Far nodes (Distance 3+):** Scale 0.7x-0.5x, faded for context

This allows users to focus on specific areas while maintaining awareness of the broader graph structure.

![Fish-Eye Demo](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Fish-Eye+Graph+Visualization)
*Interactive fish-eye graph with distance-based scaling*

---

## 📊 Performance

- **Viewport Loading:** ~100ms for 50-node viewport
- **Node Recentering:** Instant API fetch (<200ms)
- **Graph Rendering:** 60 FPS with ReactFlow optimization
- **Frontend Bundle:** 131KB gzipped
- **Memory Usage:** ~50MB backend, ~40MB frontend

Designed to scale to **1000+ nodes** with pagination and streaming.

---

## 🔗 API Endpoints

### Core Pagination APIs

```http
GET /api/ontology/graph/nodes?skip=0&limit=10
POST /api/ontology/graph/viewport
  Body: {"center_node": "owl:Thing", "radius": 2, "limit": 50}
GET /api/ontology/graph/neighbors/<node_id>
```

[📖 Full API Documentation →](api/)

---

## 🤝 Contributing

We welcome contributions! See our [Development Guide](development) for:

- Local development setup
- Code architecture
- Testing strategy
- Pull request process

---

## 📅 Project Timeline

- **Feb 17, 2026** - Initial fish-eye POC implemented
- **Feb 18, 2026** - Production deployment to DigitalOcean
- **Feb 19, 2026** - Interactive MiniMap navigation added
- **Coming Soon** - Search, filters, 1000+ node scaling tests

[📖 View Full Roadmap →](../ACTION_PLAN.md)

---

## 📬 Contact & Links

- **GitHub:** [gpad1234/Startup-One-Wally-Clean](https://github.com/gpad1234/Startup-One-Wally-Clean)
- **Live Demo:** [http://161.35.239.151](http://161.35.239.151)
- **Documentation:** [GitHub Pages](https://gpad1234.github.io/Startup-One-Wally-Clean/)

---

## 📄 License

See [LICENSE](../LICENSE) file for details.

---

<div style="text-align: center; padding: 40px 0; background: #f8fafc; margin-top: 40px; border-radius: 8px;">
<p style="font-size: 18px; margin-bottom: 15px;">Ready to explore ontologies like never before?</p>
<a href="getting-started.md" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">Get Started →</a>
</div>
