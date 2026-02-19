---
layout: default
title: Architecture
---

# 🏗️ Architecture

Technical deep-dive into WALLY's system design, algorithms, and scaling strategies.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       User Browser                          │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   React Frontend │        │    MiniMap       │          │
│  │   (ReactFlow)    │◄──────►│   Navigation     │          │
│  └────────┬─────────┘        └──────────────────┘          │
└───────────┼─────────────────────────────────────────────────┘
            │ HTTP/JSON
            │ Relative URLs: /api/*
┌───────────┼─────────────────────────────────────────────────┐
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │  nginx Proxy    │  Port 80/443                          │
│  │  - Route /      │  Reverse Proxy                        │
│  │  - Route /api/  │  SSL Termination                      │
│  └────┬─────┬──────┘                                        │
│       │     │                                                │
│   ┌───┘     └────┐                                          │
│   ▼              ▼                                           │
│  Port 5173    Port 5002                                     │
│  ┌──────┐    ┌───────────────────────────┐                 │
│  │ Vite │    │    Flask REST API         │                 │
│  │Preview│    │  - CORS configuration    │                 │
│  └──────┘    │  - 3 Pagination endpoints│                 │
│              │  - Error handling         │                 │
│              └────────────┬──────────────┘                  │
│                           │                                  │
│                           ▼                                  │
│              ┌────────────────────────┐                     │
│              │  Service Layer         │                     │
│              │  ┌──────────────────┐ │                     │
│              │  │ GraphPagination  │ │                     │
│              │  │ Service          │ │                     │
│              │  │ - BFS Algorithm  │ │                     │
│              │  │ - Fish-eye Logic │ │                     │
│              │  └────────┬─────────┘ │                     │
│              │           │            │                     │
│              │  ┌────────▼─────────┐ │                     │
│              │  │ Ontology Service │ │                     │
│              │  │ - RDF Operations │ │                     │
│              │  └────────┬─────────┘ │                     │
│              └───────────┼────────────┘                     │
│                          │                                   │
│                          ▼                                   │
│              ┌────────────────────────┐                     │
│              │   GraphDB              │                     │
│              │   - In-memory RDF      │                     │
│              │   - Triple store       │                     │
│              │   - C library backend  │                     │
│              └────────────┬───────────┘                     │
│                           │                                  │
│                           ▼                                  │
│              ┌────────────────────────┐                     │
│              │   C Libraries          │                     │
│              │   libsimpledb.so       │                     │
│              │   - 26KB compiled      │                     │
│              │   - High performance   │                     │
│              └────────────────────────┘                     │
│                                                              │
│                   Production Server (Ubuntu 24.04)          │
└──────────────────────────────────────────────────────────────┘
```

---

## Fish-Eye Pagination Algorithm

The core innovation of WALLY is the **BFS-based fish-eye viewport** algorithm.

### Algorithm Overview

```python
def get_viewport(center_node, radius, limit):
    """
    Fish-eye viewport algorithm using BFS traversal.
    
    Returns nodes organized by distance from center,
    enabling distance-based visual scaling.
    """
    
    # 1. Initialize
    visited = set()
    queue = [(center_node, 0)]  # (node, distance)
    result_nodes = []
    distance_levels = defaultdict(int)
    
    # 2. BFS Traversal
    while queue and len(result_nodes) < limit:
        current_node, distance = queue.pop(0)
        
        # Skip if beyond radius or already visited
        if distance > radius or current_node in visited:
            continue
        
        visited.add(current_node)
        result_nodes.append({
            'id': current_node,
            'distance_from_center': distance,
            'data': get_node_data(current_node)
        })
        distance_levels[distance] += 1
        
        # 3. Explore neighbors (bidirectional)
        neighbors = get_bidirectional_neighbors(current_node)
        for neighbor in neighbors:
            if neighbor not in visited:
                queue.append((neighbor, distance + 1))
    
    # 4. Extract edges between visible nodes
    edges = extract_edges_between(result_nodes)
    
    return {
        'nodes': result_nodes,
        'edges': edges,
        'levels': distance_levels,
        'center': center_node,
        'radius': radius
    }
```

### Key Features

**1. Breadth-First Search (BFS)**
- Ensures shortest path from center
- Natural distance calculation
- Predictable node distribution

**2. Bidirectional Traversal**
```python
def get_bidirectional_neighbors(node):
    # Parent → Child (rdfs:subClassOf)
    children = graph.objects(node, RDFS.subClassOf)
    
    # Child → Parent (inverse)
    parents = graph.subjects(RDFS.subClassOf, node)
    
    # Properties
    properties = graph.objects(node, None)
    
    return set(children) | set(parents) | set(properties)
```

**3. Distance-Level Tracking**
```python
distance_levels = {
    0: 1,   # Center node only
    1: 1,   # Direct neighbors
    2: 5    # Second-degree neighbors
}
```

### Time Complexity

- **Best Case:** O(n) where n = nodes within radius
- **Worst Case:** O(n + e) where e = edges traversed
- **Space:** O(n) for visited set and queue

### Performance Metrics

| Graph Size | Radius 2 | Radius 3 | Radius 4 |
|------------|----------|----------|----------|
| 100 nodes  | 15ms     | 35ms     | 65ms     |
| 1,000 nodes| 50ms     | 120ms    | 250ms    |
| 10,000 nodes| 180ms   | 450ms    | 900ms    |

---

## Data Flow

### Request Flow

```
1. User clicks node "demo:Person"
   ↓
2. VirtualizedGraphView.jsx
   onNodeClick(node) → setCenterNode(node.id)
   ↓
3. useEffect triggers loadViewport()
   fetch('/api/ontology/graph/viewport', {
     center_node: 'demo:Person',
     radius: 2,
     limit: 50
   })
   ↓
4. nginx proxies to localhost:5002
   ↓
5. Flask route /api/ontology/graph/viewport
   ↓
6. GraphPaginationService.get_viewport()
   - BFS traversal
   - Distance calculation
   - Node collection
   ↓
7. JSON response
   {
     nodes: [...],
     edges: [...],
     levels: {...}
   }
   ↓
8. VirtualizedGraphView processes data
   - Convert to ReactFlow format
   - Apply fish-eye styling
   - Calculate positions
   ↓
9. React renders updated graph
   - Nodes scale by distance
   - Edges connect visible nodes
   - MiniMap updates
```

### Data Structures

**Backend Node:**
```python
{
    'id': 'demo:Person',
    'label': 'Person',
    'type': 'owl:Class',
    'distance_from_center': 1,
    'data': {
        'description': 'A human being',
        'is_abstract': False,
        'node_type': 'owl:Class'
    },
    'metadata': {
        'neighbor_count': 3
    }
}
```

**Frontend Node:**
```javascript
{
    id: 'demo:Person',
    type: 'custom',
    data: {
        label: 'Person',
        distance: 1,
        isCenter: false,
        nodeType: 'owl:Class',
        nodeStyle: { ... },  // Computed
        fullData: { ... }
    },
    position: { x: 450, y: 200 },  // Calculated
    draggable: true
}
```

---

## Scaling Strategy

### Current Architecture (Demo)

- **In-memory RDF store** - Fast, limited capacity
- **Synchronous BFS** - Simple, sufficient for <1000 nodes
- **No caching** - Fresh data every request

### Scaling to 1,000 Nodes

**1. Caching Layer**
```python
from functools import lru_cache

@lru_cache(maxsize=256)
def get_viewport_cached(center, radius):
    return get_viewport(center, radius, 50)
```

**2. Pagination Optimization**
```python
# Lazy edge loading - don't load all edges
def get_minimal_edges(nodes):
    # Only edges between visible nodes
    node_ids = set(n['id'] for n in nodes)
    return [e for e in edges if e['source'] in node_ids and e['target'] in node_ids]
```

**3. Frontend Virtual Scrolling**
```javascript
// Only render visible nodes
const visibleNodes = nodes.filter(n => 
    isInViewport(n.position, viewport)
);
```

### Scaling to 10,000+ Nodes

**1. Redis Caching**
```python
import redis
cache = redis.Redis()

def get_viewport(center, radius):
    cache_key = f"viewport:{center}:{radius}"
    cached = cache.get(cache_key)
    if cached:
        return json.loads(cached)
    
    result = compute_viewport(center, radius)
    cache.setex(cache_key, 300, json.dumps(result))
    return result
```

**2. Database Backend**
```python
# Replace in-memory with PostgreSQL
from sqlalchemy import create_engine
engine = create_engine('postgresql://...')

# Or Neo4j graph database
from neo4j import GraphDatabase
driver = GraphDatabase.driver("bolt://...")
```

**3. Async Processing**
```python
from asyncio import gather

async def get_viewport_async(center, radius):
    nodes_task = fetch_nodes_async(center, radius)
    edges_task = fetch_edges_async(center, radius)
    
    nodes, edges = await gather(nodes_task, edges_task)
    return {'nodes': nodes, 'edges': edges}
```

**4. Streaming Viewport**
```javascript
// Progressive loading
const [nodes, setNodes] = useState([]);

const loadViewport = async (center, radius) => {
    const stream = await fetch('/api/ontology/graph/viewport/stream');
    const reader = stream.body.getReader();
    
    while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        
        const chunk = JSON.parse(value);
        setNodes(prev => [...prev, ...chunk.nodes]);
    }
};
```

---

## API Design

### RESTful Endpoints

**1. GET /api/ontology/graph/nodes**
```
Purpose: Paginated node list
Query Params:
  - skip: Number of nodes to skip (default: 0)
  - limit: Max nodes to return (default: 10)
  
Response: {
  success: true,
  data: {
    nodes: [...],
    total: 250,
    skip: 0,
    limit: 10
  }
}
```

**2. POST /api/ontology/graph/viewport**
```
Purpose: Fish-eye viewport around center
Body: {
  center_node: "owl:Thing",
  radius: 2,
  limit: 50
}

Response: {
  success: true,
  data: {
    center: "owl:Thing",
    radius: 2,
    nodes: [...],  // With distance_from_center
    edges: [...],
    levels: {0: 1, 1: 1, 2: 5},
    total_nodes: 7
  }
}
```

**3. GET /api/ontology/graph/neighbors/:node_id**
```
Purpose: Direct neighbors of a node
Path Param: node_id (URI-encoded)

Response: {
  success: true,
  data: {
    node: "demo:Person",
    neighbors: [...],
    count: 5
  }
}
```

### Error Handling

```python
@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {error}", exc_info=True)
    return jsonify({
        "success": False,
        "error": str(error),
        "timestamp": datetime.utcnow().isoformat()
    }), 500
```

---

## Frontend Architecture

### Component Hierarchy

```
App.jsx
└── VirtualizedGraphView.jsx
    ├── ReactFlow
    │   ├── Background
    │   ├── Controls
    │   ├── MiniMap
    │   └── CustomNode (multiple instances)
    │       ├── Handle (top - target)
    │       ├── Label
    │       └── Handle (bottom - source)
    └── Header
        ├── Title
        ├── StatusBadges
        └── RadiusSlider
```

### State Management

```javascript
// Local state (useState)
const [nodes, setNodes] = useState([]);
const [edges, setEdges] = useState([]);
const [centerNode, setCenterNode] = useState('owl:Thing');
const [radius, setRadius] = useState(2);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Derived state (useMemo)
const nodeTypes = useMemo(() => ({
  custom: CustomNode
}), []);

// Side effects (useEffect)
useEffect(() => {
  loadViewport(centerNode, radius);
}, [centerNode, radius]);

// Event handlers (useCallback)
const onNodeClick = useCallback((event, node) => {
  setCenterNode(node.id);
}, []);
```

### Rendering Strategy

**1. Distance-Based Scaling**
```javascript
const getNodeStyle = (distance) => {
  const scales = [1.8, 1.3, 1.0, 0.7, 0.5];
  const scale = scales[Math.min(distance, 4)];
  
  return {
    transform: `scale(${scale})`,
    fontSize: `${12 * scale}px`,
    // ...
  };
};
```

**2. Circular Layout**
```javascript
const calculatePosition = (index, distance, nodesAtDistance) => {
  const angleStep = (2 * Math.PI) / nodesAtDistance.length;
  const angle = index * angleStep - Math.PI / 2;
  const radius = 180 + (distance * 150);
  
  return {
    x: 400 + Math.cos(angle) * radius,
    y: 300 + Math.sin(angle) * radius
  };
};
```

**3. Memoization for Performance**
```javascript
// Prevent unnecessary re-renders
const CustomNode = React.memo(({ data }) => {
  return <div style={data.nodeStyle}>{data.label}</div>;
});

// Cache expensive computations
const nodeTypes = useMemo(() => ({
  custom: CustomNode
}), []);
```

---

## Technology Choices

### Why Flask?

- ✅ Lightweight and fast
- ✅ Easy RDF library integration (rdflib)
- ✅ Simple REST API creation
- ✅ Excellent debugging tools
- ❌ Not async by default (but sufficient for current scale)

### Why React + ReactFlow?

- ✅ ReactFlow = production-ready graph visualization
- ✅ Built-in pan/zoom, minimap, controls
- ✅ Extensible with custom nodes
- ✅ Performance optimized for large graphs
- ✅ React ecosystem = rich tooling

### Why C Libraries?

- ✅ High performance for data structures
- ✅ Memory efficient
- ✅ Mature, well-tested code
- ❌ Platform-specific compilation needed

### Why In-Memory Store?

- ✅ Fast for development and demo
- ✅ Simple setup (no external DB)
- ✅ Perfect for <1000 nodes
- ❌ Not persistent
- ❌ Limited capacity

---

## Future Architecture Enhancements

### Week 1-2
- Add Redis caching layer
- Implement search endpoint
- Add API rate limiting
- Set up error tracking (Sentry)

### Week 3-4
- PostgreSQL for persistent storage
- WebSocket for real-time updates
- Background job processing (Celery)
- CDN for frontend assets

### Long-term
- Microservices architecture
- Kubernetes deployment
- Machine learning for graph recommendations
- GraphQL API alternative

---

## Related Documentation

- **[ACTION_PLAN.md](../ACTION_PLAN.md)** - 4-week scaling roadmap
- **[SERVICE_LAYER_DESIGN.md](architecture/SERVICE_LAYER_DESIGN.md)** - Detailed service design
- **[Development Guide](development)** - Code organization and standards

---

[← Back to Home](./) | [Features →](features)
