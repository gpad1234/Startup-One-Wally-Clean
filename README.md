# Symmetrical Robot - Graph Database & Data Structures

A comprehensive educational project demonstrating:
- **Graph Database** with BFS, DFS, Dijkstra's algorithm
- **Modern React Web UI** for graph visualization and natural language querying
- **In-memory database** (SimpleDB) in C with Python bindings
- **Linked list implementations** (singly, doubly, circular)
- **FFI integration** showing C/Python interoperability

## 🚀 Quick Start (React + Flask)

### One Command Startup

```bash
# Make the script executable
chmod +x run.sh

# Start both servers
./run.sh
```

Then open: **http://localhost:5173**

### Manual Startup

```bash
# Terminal 1: Start Flask API
python3 graph_web_ui.py

# Terminal 2: Start React UI
cd graph-ui
npm install  # only needed first time
npm run dev
```

**Live at**:
- 🔴 API: http://127.0.0.1:5000
- 🔵 UI: http://localhost:5173

## ✨ Features

- ✅ Interactive D3.js graph visualization
- ✅ Natural language query interface ("add node Alice", "path from A to B")
- ✅ Real-time graph statistics and node management
- ✅ All graph algorithms: BFS, DFS, Dijkstra, topological sort
- ✅ CORS properly configured for frontend-backend communication
- ✅ Beautiful, responsive React UI with Zustand state management
- ✅ Full CRUD operations via natural language
- ✅ Hot module replacement during development
- ✅ **Automated Quality Control Dashboard** with persistent test result storage

## 🧪 Quality Control Dashboard (NEW!)

**Automated testing with persistent result storage and real-time monitoring.**

```bash
# Start the QC Dashboard
./start_qc.sh

# Access at http://localhost:5001
```

### Features:
- 🎯 **One-Click Testing** - Test by layer (Core, Adapter, Service, API)
- 📊 **Real-Time Statistics** - Success rates, test counts, duration tracking
- 📈 **Historical Trends** - Track quality over time with SQLite persistence
- 🔍 **Failure Monitoring** - Instantly see which tests are failing
- 🤖 **Auto-Discovery** - Automatically finds and runs new tests
- 🌐 **REST API** - Integrate with CI/CD pipelines
- 📱 **Responsive UI** - Access from any device

**See:** [QC_QUICKSTART.md](QC_QUICKSTART.md) | [QC_DASHBOARD_README.md](QC_DASHBOARD_README.md)

## 📊 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite + D3.js |
| Backend | Flask + Python 3.12 |
| State | Zustand (lightweight) |
| HTTP Client | Axios |
| Styling | CSS3 |
| Build | Vite (ultra-fast) |

## 📚 Documentation

See **[WEB_UI_README.md](WEB_UI_README.md)** for complete guide.

### Graph Database (Python)

```bash
# Run graph database demo
make run-graph-db

# Run comprehensive examples
make run-graph-examples

# Run all graph tests
make test-graph
```

### Simple Database (C + Python)

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
