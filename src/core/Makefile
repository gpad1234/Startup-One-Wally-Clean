# Makefile for WALLY-CLEAN Core Libraries
# Builds C shared libraries for use by Python adapters

CC = gcc
CFLAGS = -Wall -Wextra -Werror -g -O2 -fPIC -Iinclude
LDFLAGS = -shared

# Detect OS for library extension
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    LIB_EXT = .dylib
else ifeq ($(UNAME_S),Linux)
    LIB_EXT = .so
else
    $(error Unsupported operating system: $(UNAME_S))
endif

# Directories
SRC_DIR = src
INC_DIR = include
BUILD_DIR = build
LIB_DIR = $(BUILD_DIR)/lib
OBJ_DIR = $(BUILD_DIR)/obj

# Source files
SIMPLE_DB_SRC = $(SRC_DIR)/simple_db.c
LINKED_LIST_SRC = $(SRC_DIR)/linked_list.c
DOUBLY_LINKED_LIST_SRC = $(SRC_DIR)/doubly_linked_list.c
CIRCULAR_LINKED_LIST_SRC = $(SRC_DIR)/circular_linked_list.c
ANIMATION_SRC = $(SRC_DIR)/animation.c

# Object files
SIMPLE_DB_OBJ = $(OBJ_DIR)/simple_db.o
LINKED_LIST_OBJ = $(OBJ_DIR)/linked_list.o
DOUBLY_LINKED_LIST_OBJ = $(OBJ_DIR)/doubly_linked_list.o
CIRCULAR_LINKED_LIST_OBJ = $(OBJ_DIR)/circular_linked_list.o
ANIMATION_OBJ = $(OBJ_DIR)/animation.o

# Shared libraries
LIB_SIMPLE_DB = $(LIB_DIR)/libsimpledb$(LIB_EXT)
LIB_LINKED_LIST = $(LIB_DIR)/liblinkedlist$(LIB_EXT)
LIB_DOUBLY_LINKED_LIST = $(LIB_DIR)/libdoublylinkedlist$(LIB_EXT)
LIB_CIRCULAR_LINKED_LIST = $(LIB_DIR)/libcircularlinkedlist$(LIB_EXT)

# All libraries
LIBS = $(LIB_SIMPLE_DB) $(LIB_LINKED_LIST) $(LIB_DOUBLY_LINKED_LIST) $(LIB_CIRCULAR_LINKED_LIST)

# ============================================================================
# TARGETS
# ============================================================================

.PHONY: all clean help dirs

# Default target
all: dirs $(LIBS)
	@echo ""
	@echo "✅ All core libraries built successfully!"
	@echo ""
	@echo "Libraries:"
	@ls -lh $(LIB_DIR)

# Create build directories
dirs:
	@mkdir -p $(LIB_DIR) $(OBJ_DIR)

# ============================================================================
# LIBRARY TARGETS
# ============================================================================

# SimpleDB library
$(LIB_SIMPLE_DB): $(SIMPLE_DB_OBJ)
	@echo "🔗 Linking $@..."
	$(CC) $(LDFLAGS) $^ -o $@

# Linked List library
$(LIB_LINKED_LIST): $(LINKED_LIST_OBJ)
	@echo "🔗 Linking $@..."
	$(CC) $(LDFLAGS) $^ -o $@

# Doubly Linked List library
$(LIB_DOUBLY_LINKED_LIST): $(DOUBLY_LINKED_LIST_OBJ)
	@echo "🔗 Linking $@..."
	$(CC) $(LDFLAGS) $^ -o $@

# Circular Linked List library
$(LIB_CIRCULAR_LINKED_LIST): $(CIRCULAR_LINKED_LIST_OBJ)
	@echo "🔗 Linking $@..."
	$(CC) $(LDFLAGS) $^ -o $@

# ============================================================================
# OBJECT FILE RULES
# ============================================================================

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c $(INC_DIR)/%.h
	@echo "📦 Compiling $<..."
	$(CC) $(CFLAGS) -c $< -o $@

# SimpleDB has no main, compile without it
$(SIMPLE_DB_OBJ): $(SIMPLE_DB_SRC) $(INC_DIR)/simple_db.h
	@echo "📦 Compiling $<..."
	$(CC) $(CFLAGS) -DLIB_BUILD -c $< -o $@

# ============================================================================
# UTILITY TARGETS
# ============================================================================

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	@echo "✅ Clean complete"

help:
	@echo "WALLY-CLEAN Core Library Build System"
	@echo ""
	@echo "Targets:"
	@echo "  all     - Build all core libraries (default)"
	@echo "  clean   - Remove all build artifacts"
	@echo "  help    - Show this help message"
	@echo ""
	@echo "Libraries built:"
	@echo "  libsimpledb          - Key-value hash table database"
	@echo "  liblinkedlist        - Singly linked list"
	@echo "  libdoublylinkedlist  - Doubly linked list"
	@echo "  libcircularlinkedlist- Circular linked list"
	@echo ""
	@echo "Output:"
	@echo "  Libraries: $(LIB_DIR)/"
	@echo "  Objects:   $(OBJ_DIR)/"
	@echo ""
	@echo "Usage:"
	@echo "  make          # Build all libraries"
	@echo "  make clean    # Clean build"
	@echo "  make help     # Show this help"

# ============================================================================
# DEPENDENCIES
# ============================================================================

# Automatically track header dependencies
$(SIMPLE_DB_OBJ): $(INC_DIR)/simple_db.h
$(LINKED_LIST_OBJ): $(INC_DIR)/linked_list.h
$(DOUBLY_LINKED_LIST_OBJ): $(INC_DIR)/doubly_linked_list.h
$(CIRCULAR_LINKED_LIST_OBJ): $(INC_DIR)/circular_linked_list.h
$(ANIMATION_OBJ): $(INC_DIR)/animation.h
