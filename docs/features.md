---
layout: default
title: Features
---

# 🎨 Features

WALLY Ontology Editor combines innovative visualization techniques with powerful graph navigation tools. Here's a comprehensive overview of all features.

---

## 🔍 Fish-Eye Graph Visualization

The signature feature of WALLY - an intelligent focus+context view that scales nodes based on their distance from the center of attention.

### How It Works

The fish-eye effect applies **distance-based scaling** to create a natural focus:

| Distance | Scale | Visual Effect |
|----------|-------|---------------|
| 0 (Center) | 1.8x | Bold labels, bright glow, 🎯 marker |
| 1 (Near) | 1.3x | Subtle glow, clear labels |
| 2 (Mid) | 1.0x | Normal size, full visibility |
| 3 (Far) | 0.7x | Reduced size, context awareness |
| 4+ (Edge) | 0.5x | Minimal, background context |

### Benefits

- **Focus without losing context** - See detail AND big picture
- **Reduces cognitive load** - Natural hierarchical perception
- **Scales to large graphs** - 1000+ nodes remain navigable
- **Beautiful aesthetics** - Gradients, glows, smooth transitions

---

## 🗺️ Interactive MiniMap

A powerful overview + navigation tool in the bottom-right corner.

### Capabilities

✅ **Click-to-Pan** - Click anywhere to move viewport  
✅ **Drag-to-Navigate** - Drag the viewport rectangle  
✅ **Scroll-to-Zoom** - Zoom in/out with mouse wheel  
✅ **Visual Feedback** - Red center node, blue context nodes  
✅ **Real-time Updates** - Syncs with main view instantly

### Usage Tips

1. Use MiniMap for **quick jumps** to distant graph areas
2. **Drag the viewport rectangle** for precise positioning
3. **Scroll on MiniMap** for alternative zoom control
4. Watch the **red dot** to track your current focus

---

## 🖱️ Click-to-Recenter

Transform any node into the new center of attention with a single click.

### How It Works

1. Click any node in the main view or MiniMap
2. API fetches new viewport centered on that node
3. Graph smoothly updates with new fish-eye effect
4. MiniMap updates to show new position

### Use Cases

- **Explore hierarchies** - Jump from parent to child classes
- **Follow relationships** - Navigate property connections
- **Compare contexts** - Switch between different focal points
- **Discovery mode** - Click-through graph organically

---

## 📊 Viewport-Based Pagination

Smart loading strategy that fetches only what you need to see.

### Algorithm: BFS Fish-Eye

```
1. Start from center node
2. Use BFS to explore neighbors
3. Track distance from center (0, 1, 2, ...)
4. Load nodes within radius limit
5. Apply bidirectional traversal (parent ↔ child)
6. Return nodes with distance metadata
```

### Performance

- **Fast initial load** - ~100ms for 50-node viewport
- **Minimal data transfer** - Only visible nodes fetched
- **Efficient memory** - No need to load entire ontology
- **Scalable** - Constant performance regardless of total graph size

### Configuration

- **Radius slider** (1-5 hops) - Control viewport depth
- **Limit parameter** - Max nodes per viewport (default: 50)
- **Center node** - Current focus point

---

## 🎛️ Interactive Controls

### Radius Slider

Adjust the depth of the fish-eye viewport:

- **Radius 1** - Only direct neighbors (minimal context)
- **Radius 2** - Two hops (balanced view) ⭐ Default
- **Radius 3** - Three hops (broad context)
- **Radius 4-5** - Extended view (maximum awareness)

### Viewport Status

Real-time feedback on current view:

- 📍 **Node count** - Number of visible nodes
- 🔗 **Edge count** - Number of visible connections
- 🎯 **Center** - Current focal node

---

## 🎨 Visual Design System

### Node Styling by Type

**OWL Classes** 🔵
- Gradient: Blue (#3b82f6 → #1d4ed8)  
- Represents: Concepts and categories

**OWL Properties** 🟢
- Gradient: Green (#10b981 → #047857)  
- Represents: Relationships and attributes

**OWL Individuals** 🟡
- Gradient: Amber (#f59e0b → #d97706)  
- Represents: Instances and data

### Glow Effects

- **Center node:** Large glow (30px radius, double layer)
- **Distance 1:** Medium glow (15px radius, single layer)
- **Distance 2+:** No glow (reduces visual clutter)

### Animations

- **Hover:** Subtle scale increase
- **Click:** Pulse effect
- **Loading:** Smooth fade-in
- **Recentering:** Smooth position transitions

---

## 🔗 Edge Rendering

### Connection Types

- **Smooth step edges** - Clean, professional appearance
- **Animated edges** - Optional (disabled by default for performance)
- **Arrow markers** - Directional flow indicators
- **Opacity control** - 60% to reduce visual noise

### Edge Intelligence

- **Bidirectional support** - Handles A→B and B→A
- **Connection handles** - Top (target) and bottom (source)
- **Hidden handles** - Clean node appearance (opacity 0)

---

## 📱 Responsive Layout

### Header Section

- **Title & branding** - "🔍 Fish-Eye Graph View"
- **Status badges** - Node count, edge count, center node
- **Radius control** - Slider with live value display
- **Usage hint** - "💡 Click nodes to recenter | Click/drag MiniMap to navigate"

### Graph Container

- **Full viewport** - Maximizes available space
- **React Flow canvas** - Professional graph rendering
- **Background grid** - Subtle spatial reference
- **Zoom controls** - +/- buttons, fit view, lock/unlock

---

## ⚡ Performance Features

### Optimization Techniques

1. **Memoized node types** - Prevents unnecessary re-renders
2. **Key-based re-mounting** - Forces clean updates on center change
3. **Lazy edge rendering** - Only visible connections drawn
4. **CSS animations** - GPU-accelerated transforms
5. **Fit view caching** - Optimized viewport calculations

### Loading States

- **Spinner animation** - Rotating CSS loader
- **Loading overlay** - Non-blocking UI feedback
- **Error handling** - Clear error messages with retry options

---

## 🛠️ Developer Features

### Debug Console

Extensive logging for development:

```javascript
console.log('🔍 Loading viewport:', { center, radius });
console.log('📦 API Response:', result);
console.log('✅ Viewport data:', { nodes, edges, levels });
console.log('🎨 Created React Flow nodes:', flowNodes.length);
console.log('Sample positions:', flowNodes.slice(0, 3));
```

### Data Structures

**Node Format:**
```javascript
{
  id: "demo:Person",
  label: "Person",
  type: "owl:Class",
  distance_from_center: 1,
  data: { ... },
  metadata: { neighbor_count: 3 }
}
```

**Edge Format:**
```javascript
{
  id: "demo:Person-owl:Thing",
  source: "demo:Person",
  target: "owl:Thing",
  type: "connected"
}
```

---

## 🚀 Coming Soon

Features planned for future releases:

### Week 1 Enhancements
- 🔍 **Search bar** - Find nodes by name or type
- 🎯 **Filters** - Show/hide by node type
- 📊 **Enhanced stats** - Detailed viewport analytics

### Week 2 Polish
- 🎬 **Smooth animations** - Transitions between recenters
- 🖐️ **Hover tooltips** - Full node details on hover
- 🌙 **Dark mode** - Alternative color scheme

### Week 3-4 Scaling
- 💾 **Virtual scrolling** - Handle 1000+ node lists
- 🌊 **Streaming viewport** - Progressive node loading
- ⚡ **Caching layer** - Redis for frequently accessed views
- 📈 **Performance dashboard** - Real-time metrics

---

## 📖 Feature Guides

Detailed documentation for each feature:

- [Getting Started →](getting-started.md)
- [Development Guide →](development.md)
- [Architecture Overview →](architecture.md)
- [API Reference →](api/)

---

## 🎯 Feature Matrix

| Feature | Status | Version | Notes |
|---------|--------|---------|-------|
| Fish-Eye Visualization | ✅ Live | 1.0 | Core feature |
| Click-to-Recenter | ✅ Live | 1.0 | Main interaction |
| Interactive MiniMap | ✅ Live | 1.1 | Added Feb 19 |
| Radius Control | ✅ Live | 1.0 | 1-5 hops |
| BFS Pagination | ✅ Live | 1.0 | Backend algorithm |
| Bidirectional Traversal | ✅ Live | 1.0 | Full graph navigation |
| Search Bar | 🚧 Planned | 1.2 | Week 1 |
| Node Filters | 🚧 Planned | 1.2 | Week 1 |
| Dark Mode | 🚧 Planned | 1.3 | Week 2 |
| 1000+ Node Support | 🚧 Planned | 2.0 | Week 3-4 |

---

[← Back to Home](index.md) | [Getting Started →](getting-started.md)
