# WALLY Ontology Editor

**Interactive Fish-Eye Graph Visualization for Large-Scale Ontologies**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-161.35.239.151-blue?style=flat-square)](http://161.35.239.151)
[![Documentation](https://img.shields.io/badge/Docs-GitHub%20Pages-green?style=flat-square)](https://gpad1234.github.io/Startup-One-Wally-Clean/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=flat-square&logo=github)](https://github.com/gpad1234/Startup-One-Wally-Clean)

---

## 📚 **[Full Documentation →](https://gpad1234.github.io/Startup-One-Wally-Clean/)**

Complete documentation including features, architecture, deployment guides, and API reference is available at:

**https://gpad1234.github.io/Startup-One-Wally-Clean/**

---

WALLY is a next-generation ontology editor featuring:
- **🎯 Fish-Eye Visualization** - Distance-based scaling for focus+context view
- **🗺️ Interactive MiniMap** - Click, drag, and scroll navigation
- **⚡ Real-Time Pagination** - BFS-based viewport loading
- **🖱️ Click-to-Recenter** - Dynamic viewport updates
- **🎨 Beautiful Design** - Gradient nodes, smooth animations
- **📊 Scalable Architecture** - Designed for 1000+ node ontologies

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm 10+

### Start Development

```bash
# Terminal 1: Start Flask API
python3 ontology_api.py

# Terminal 2: Start React Frontend
cd graph-ui
npm install  # only needed first time
npm run dev
```

**Access the application:**
- 🔵 Frontend: http://localhost:5173 (Fish-Eye Graph)
- 🔴 Backend API: http://localhost:5002

**Try it:**
1. Click any node to recenter the fish-eye view
2. Adjust the radius slider to control viewport depth
3. Use the MiniMap to navigate and pan around the graph

📖 **[Complete Setup Guide →](https://gpad1234.github.io/Startup-One-Wally-Clean/getting-started.html)**

## ✨ Key Features

- ✅ **Fish-Eye Visualization** - Nodes scale by distance from center (1.8x → 0.5x)
- ✅ **Interactive MiniMap** - Pannable, zoomable overview with click navigation
- ✅ **Click-to-Recenter** - Any node becomes the new center
- ✅ **Viewport Pagination** - BFS algorithm loads only visible nodes
- ✅ **Bidirectional Traversal** - Navigate parent→child and child→parent
- ✅ **Real-Time Updates** - Instant viewport fetching on interaction
- ✅ **Beautiful Design** - Gradient nodes, glow effects, smooth animations
- ✅ **Production Ready** - Deployed at http://161.35.239.151

📖 **[Full Feature List →](https://gpad1234.github.io/Startup-One-Wally-Clean/features.html)**

---

## 📚 Documentation

### 📖 GitHub Pages Site

Complete documentation is available at: **https://gpad1234.github.io/Startup-One-Wally-Clean/**

| Documentation | Description |
|---------------|-------------|
| [**Home**](https://gpad1234.github.io/Startup-One-Wally-Clean/) | Project overview and quick links |
| [**Features**](https://gpad1234.github.io/Startup-One-Wally-Clean/features.html) | Fish-eye visualization details |
| [**Getting Started**](https://gpad1234.github.io/Startup-One-Wally-Clean/getting-started.html) | Installation and setup guide |
| [**Development**](https://gpad1234.github.io/Startup-One-Wally-Clean/development.html) | Developer workflow and standards |
| [**Deployment**](https://gpad1234.github.io/Startup-One-Wally-Clean/deployment.html) | Production deployment guide |
| [**Architecture**](https://gpad1234.github.io/Startup-One-Wally-Clean/architecture.html) | System design and algorithms |

### 📄 Additional Guides

- [ACTION_PLAN.md](ACTION_PLAN.md) - 4-week scaling roadmap
- [DIGITALOCEAN_DEPLOY.md](DIGITALOCEAN_DEPLOY.md) - Complete deployment guide (923 lines)
- [SESSION_2026_02_18.md](SESSION_2026_02_18.md) - Latest development session summary
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture documentation

---

## 🏗️ Architecture

### System Overview

```
┌─────────────┐      HTTP/JSON      ┌──────────────┐      ┌─────────────┐
│   React     │◄──────Relative──────►│  Flask API   │◄────►│  GraphDB    │
│  Frontend   │      URLs: /api/*    │  Port 5002   │      │ (In-Memory) │
│  Port 5173  │                      │              │      │             │
│             │                      │  Pagination  │      │ C Libraries │
│  Fish-Eye   │                      │  BFS Algo    │      │ libsimple   │
│  ReactFlow  │                      │              │      │   db.so     │
└─────────────┘                      └──────────────┘      └─────────────┘
```

### Fish-Eye Algorithm (BFS)

```python
def get_viewport(center_node, radius, limit):
    # 1. BFS traversal from center
    # 2. Track distance from center (0, 1, 2, ...)
    # 3. Bidirectional: parent→child + child→parent
    # 4. Return nodes with distance metadata
    # 5. Frontend applies visual scaling by distance
```

**[Full Architecture Details →](https://gpad1234.github.io/Startup-One-Wally-Clean/architecture.html)**

---

## 📊 Technology Stack

### Production Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React 18 + Vite | UI framework + build tool |
| Graph Viz | ReactFlow | Interactive graph rendering |
| Backend | Flask + Python 3.12 | REST API server |
| Ontology | rdflib 7.6.0 | RDF/OWL operations |
| Database | GraphDB (In-Memory) | Triple store |
| Data Structures | C Libraries | High-performance core |
| Proxy | nginx | Reverse proxy + SSL |
| Services | systemd | Process management |
| Platform | DigitalOcean Ubuntu 24.04 | Cloud hosting |

---

```bash
# Build C library
make build-db

# Run C test
make run-db-test

# Use Python wrapper
python3 simple_db_python.py
```

## 📋 Project Structure

## 📋 Project Structure

```
.
├── graph_web_ui.py           # Flask web server for graph UI
├── templates/
│   └── graph_ui.html         # Interactive web interface
├── graph_db.py               # Graph database implementation
├── graph_examples.py         # 6 comprehensive examples
├── simple_db.c               # In-memory hash table (C)
├── simple_db_python.py       # Python wrapper (ctypes FFI)
├── linked_list.h/c           # Singly linked list library
├── doubly_linked_list.h/c    # Doubly linked list
├── circular_linked_list.h/c  # Circular linked list
├── driver.c                  # Interactive CLI driver
├── test.c                    # Test programs
├── Makefile                  # Build automation
│
├── GRAPH_DB_GUIDE.md         # Graph database API reference
├── GRAPH_ALGORITHMS_GUIDE.md # BFS, DFS, Dijkstra theory
├── ADJACENCY_LIST_GUIDE.md   # Graph representation guide
├── WEB_UI_README.md          # Web UI documentation
├── ARCHITECTURE.md           # System architecture
├── SIMPLE_DB_SPEC.md         # Database specification
└── README.md                 # This file
```

## Build System

The project uses GNU `make` for building. Compiled binaries are placed in the `bin/` directory, and object files in the `obj/` directory.

### Building

```bash
# Build only the driver (default)
make

# Build both driver and test executables
make build-all

# Clean build artifacts
make clean

# Rebuild from scratch
make rebuild
```

### Running

```bash
# Run the interactive driver
make run

# Run automated tests
make run-test

# Show help
make help
```

### Manual Execution

```bash
# Run driver directly
./bin/linked_list_driver

# Run test directly
./bin/test
```

## Library API

### Core Data Structure

```c
typedef struct Node {
    int data;
    struct Node* next;
} Node;
```

### Functions

#### Node Management
- `Node* createNode(int data)` - Create a new node
- `Node* insertEnd(Node* head, int data)` - Insert at end of list
- `Node* insertBegin(Node* head, int data)` - Insert at beginning of list
- `Node* deleteNode(Node* head, int data)` - Delete a node with given value
- `void display(Node* head, const char* label)` - Print the list
- `void freeList(Node* head)` - Free all memory

#### Algorithms
- `int search(Node* head, int target)` - Linear search (returns position or -1)
- `int getListLength(Node* head)` - Get number of elements
- `Node* bubbleSort(Node* head)` - Sort using bubble sort algorithm
- `Node* mergeSort(Node* head)` - Sort using merge sort algorithm
- `Node* reverseList(Node* head)` - Reverse the list in-place

## Interactive Driver Features

The driver provides a menu-driven interface with the following operations:

1. **Insert at End** - Add element to the end of the list
2. **Insert at Beginning** - Add element to the start of the list
3. **Delete Node** - Remove an element by value
4. **Display List** - Print all elements
5. **Search Element** - Find element and return its position (0-indexed)
6. **Get List Length** - Count total elements
7. **Sort (Bubble Sort)** - Sort using bubble sort (non-destructive)
8. **Sort (Merge Sort)** - Sort using merge sort (non-destructive)
9. **Reverse List** - Reverse the list (non-destructive)
10. **Clear List** - Remove all elements
0. **Exit** - Quit the program

### Example Session

```
$ make run
Starting interactive driver...

╔════════════════════════════════════════╗
║  Welcome to Linked List Manager v1.0  ║
╚════════════════════════════════════════╝

========================================
     Linked List Interactive Driver
========================================
1.  Insert at End
2.  Insert at Beginning
...
0.  Exit
========================================
Enter your choice: 1
Enter value to insert at end: 42
✓ Element 42 inserted at end.
Current List: 42 -> NULL
```

## Compilation Details

### Compiler Flags
- `-Wall -Wextra` - Enable all warnings
- `-g` - Include debug symbols
- `-O2` - Optimization level 2

### Compilation Steps

1. **Library object file**: `linked_list.c` → `obj/linked_list.o`
2. **Driver object file**: `driver.c` → `obj/driver.o`
3. **Driver executable**: Link `driver.o` + `linked_list.o` → `bin/linked_list_driver`

## Algorithm Complexity

### Search
- **Time**: O(n)
- **Space**: O(1)

### Bubble Sort
- **Best Case**: O(n)
- **Average Case**: O(n²)
- **Worst Case**: O(n²)
- **Space**: O(1) - in-place

### Merge Sort
- **Best Case**: O(n log n)
- **Average Case**: O(n log n)
- **Worst Case**: O(n log n)
- **Space**: O(n) - requires temporary lists

### Reverse
- **Time**: O(n)
- **Space**: O(1) - in-place

## Implementation Notes

- **Memory Safety**: All allocations checked; proper deallocation via `freeList()`
- **Non-destructive Operations**: Sort and reverse create temporary copies to preserve original list
- **Error Handling**: Graceful handling of empty lists and invalid operations
- **Clean Interface**: Library functions don't depend on I/O; presentation separated from logic

## File Descriptions

### linked_list.h
Public API header file defining the Node structure and all function prototypes.

### linked_list.c
Complete implementation of all linked list operations. Includes both public API functions and internal helper functions (like `getMidNode()`, `merge()` for merge sort).

### driver.c
Interactive command-line interface allowing users to perform operations on the linked list. Reads user input and calls library functions.

### test.c
Simple automated test demonstrating all library functionality. Includes basic environment and calculation tests.

### Makefile
Build automation script with targets for compilation, execution, and cleanup. Features:
- Automatic directory creation
- Dependency tracking
- Phony targets for convenience
- Built-in help documentation

## Testing

The test program verifies:
- Basic environment setup (C compilation works)
- Simple arithmetic operations
- Library can be built and linked correctly

To extend testing, modify `test.c` with additional test cases.

## Future Enhancements

Possible additions:
- Doubly linked list support
- Circular linked list support
- Stack/Queue implementations using linked lists
- File I/O for list persistence
- Performance benchmarking tools
- Unit testing framework integration

## Compilation Examples

### Standard Build
```bash
$ make clean && make
# or
$ make rebuild
```

### Verbose Build
```bash
$ make verbose
```

### Quick Run
```bash
$ make run
```

## License

This is an educational project for learning C programming and data structures.

---

**Created**: November 2025
**Author**: Educational C Programming Project
