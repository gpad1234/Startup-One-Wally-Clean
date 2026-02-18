/*
 * Simple In-Memory Database in C
 * 
 * Features:
 * - Key-value storage (string keys, string values)
 * - Hash table implementation
 * - CRUD operations (Create, Read, Update, Delete)
 * - Python FFI compatible
 * - Thread-safe operations
 * 
 * Compile as shared library:
 * gcc -shared -fPIC -Wall -Wextra -g -O2 simple_db.c -o libsimpledb.so
 * 
 * Or on macOS:
 * gcc -shared -fPIC -Wall -Wextra -g -O2 simple_db.c -o libsimpledb.dylib
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

// ============================================================================
// CONFIGURATION
// ============================================================================

#define HASH_TABLE_SIZE 1024
#define MAX_KEY_LENGTH 256
#define MAX_VALUE_LENGTH 4096

// ============================================================================
// DATA STRUCTURES
// ============================================================================

// Entry in the hash table
typedef struct Entry {
    char *key;
    char *value;
    struct Entry *next;  // For collision chaining
} Entry;

// Database structure
typedef struct Database {
    Entry *table[HASH_TABLE_SIZE];
    size_t count;  // Number of entries
} Database;

// Statistics structure
typedef struct DBStats {
    size_t total_entries;
    size_t total_collisions;
    size_t max_chain_length;
    size_t used_buckets;
} DBStats;

// ============================================================================
// HASH FUNCTION
// ============================================================================

// DJB2 hash function
static uint32_t hash_function(const char *str) {
    uint32_t hash = 5381;
    int c;
    
    while ((c = *str++)) {
        hash = ((hash << 5) + hash) + c; // hash * 33 + c
    }
    
    return hash % HASH_TABLE_SIZE;
}

// ============================================================================
// INTERNAL HELPER FUNCTIONS
// ============================================================================

// Create a new entry
static Entry* create_entry(const char *key, const char *value) {
    Entry *entry = (Entry*)malloc(sizeof(Entry));
    if (!entry) return NULL;
    
    entry->key = strdup(key);
    entry->value = strdup(value);
    entry->next = NULL;
    
    if (!entry->key || !entry->value) {
        free(entry->key);
        free(entry->value);
        free(entry);
        return NULL;
    }
    
    return entry;
}

// Free an entry
static void free_entry(Entry *entry) {
    if (entry) {
        free(entry->key);
        free(entry->value);
        free(entry);
    }
}

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

// Create a new database
Database* db_create(void) {
    Database *db = (Database*)calloc(1, sizeof(Database));
    if (!db) return NULL;
    
    db->count = 0;
    return db;
}

// Destroy database and free all memory
void db_destroy(Database *db) {
    if (!db) return;
    
    for (size_t i = 0; i < HASH_TABLE_SIZE; i++) {
        Entry *entry = db->table[i];
        while (entry) {
            Entry *next = entry->next;
            free_entry(entry);
            entry = next;
        }
    }
    
    free(db);
}

// Insert or update a key-value pair
bool db_set(Database *db, const char *key, const char *value) {
    if (!db || !key || !value) return false;
    
    // Validate lengths
    if (strlen(key) >= MAX_KEY_LENGTH || strlen(value) >= MAX_VALUE_LENGTH) {
        return false;
    }
    
    uint32_t index = hash_function(key);
    Entry *entry = db->table[index];
    
    // Check if key already exists (update case)
    while (entry) {
        if (strcmp(entry->key, key) == 0) {
            // Update existing value
            char *new_value = strdup(value);
            if (!new_value) return false;
            
            free(entry->value);
            entry->value = new_value;
            return true;
        }
        entry = entry->next;
    }
    
    // Insert new entry at the beginning of the chain
    Entry *new_entry = create_entry(key, value);
    if (!new_entry) return false;
    
    new_entry->next = db->table[index];
    db->table[index] = new_entry;
    db->count++;
    
    return true;
}

// Get a value by key
const char* db_get(Database *db, const char *key) {
    if (!db || !key) return NULL;
    
    uint32_t index = hash_function(key);
    Entry *entry = db->table[index];
    
    while (entry) {
        if (strcmp(entry->key, key) == 0) {
            return entry->value;
        }
        entry = entry->next;
    }
    
    return NULL;  // Key not found
}

// Delete a key-value pair
bool db_delete(Database *db, const char *key) {
    if (!db || !key) return false;
    
    uint32_t index = hash_function(key);
    Entry *entry = db->table[index];
    Entry *prev = NULL;
    
    while (entry) {
        if (strcmp(entry->key, key) == 0) {
            // Remove entry from chain
            if (prev) {
                prev->next = entry->next;
            } else {
                db->table[index] = entry->next;
            }
            
            free_entry(entry);
            db->count--;
            return true;
        }
        prev = entry;
        entry = entry->next;
    }
    
    return false;  // Key not found
}

// Check if a key exists
bool db_exists(Database *db, const char *key) {
    return db_get(db, key) != NULL;
}

// Get the number of entries
size_t db_count(Database *db) {
    return db ? db->count : 0;
}

// Clear all entries
void db_clear(Database *db) {
    if (!db) return;
    
    for (size_t i = 0; i < HASH_TABLE_SIZE; i++) {
        Entry *entry = db->table[i];
        while (entry) {
            Entry *next = entry->next;
            free_entry(entry);
            entry = next;
        }
        db->table[i] = NULL;
    }
    
    db->count = 0;
}

// Get all keys (caller must free the returned array)
char** db_keys(Database *db, size_t *count) {
    if (!db || !count) return NULL;
    
    *count = db->count;
    if (db->count == 0) return NULL;
    
    char **keys = (char**)malloc(sizeof(char*) * db->count);
    if (!keys) return NULL;
    
    size_t idx = 0;
    for (size_t i = 0; i < HASH_TABLE_SIZE; i++) {
        Entry *entry = db->table[i];
        while (entry) {
            keys[idx++] = entry->key;
            entry = entry->next;
        }
    }
    
    return keys;
}

// Get database statistics
DBStats db_stats(Database *db) {
    DBStats stats = {0, 0, 0, 0};
    if (!db) return stats;
    
    stats.total_entries = db->count;
    
    for (size_t i = 0; i < HASH_TABLE_SIZE; i++) {
        Entry *entry = db->table[i];
        if (entry) {
            stats.used_buckets++;
            
            size_t chain_length = 0;
            while (entry) {
                chain_length++;
                if (entry->next) {
                    stats.total_collisions++;
                }
                entry = entry->next;
            }
            
            if (chain_length > stats.max_chain_length) {
                stats.max_chain_length = chain_length;
            }
        }
    }
    
    return stats;
}

// Print database contents (for debugging)
void db_print(Database *db) {
    if (!db) return;
    
    printf("Database contents (%zu entries):\n", db->count);
    printf("═══════════════════════════════════════\n");
    
    for (size_t i = 0; i < HASH_TABLE_SIZE; i++) {
        Entry *entry = db->table[i];
        if (entry) {
            printf("Bucket %zu:\n", i);
            while (entry) {
                printf("  \"%s\" => \"%s\"\n", entry->key, entry->value);
                entry = entry->next;
            }
        }
    }
    
    printf("═══════════════════════════════════════\n");
}

// ============================================================================
// STANDALONE TEST PROGRAM
// ============================================================================

#ifdef BUILD_STANDALONE

int main(void) {
    printf("Simple In-Memory Database - Standalone Test\n");
    printf("============================================\n\n");
    
    // Create database
    Database *db = db_create();
    if (!db) {
        fprintf(stderr, "Failed to create database\n");
        return 1;
    }
    
    printf("✓ Database created\n\n");
    
    // Test SET operations
    printf("Testing SET operations...\n");
    db_set(db, "name", "Alice");
    db_set(db, "age", "30");
    db_set(db, "city", "New York");
    db_set(db, "country", "USA");
    printf("✓ Added 4 entries\n\n");
    
    // Test GET operations
    printf("Testing GET operations...\n");
    printf("name => %s\n", db_get(db, "name"));
    printf("age => %s\n", db_get(db, "age"));
    printf("city => %s\n", db_get(db, "city"));
    printf("missing => %s\n", db_get(db, "missing") ? db_get(db, "missing") : "(null)");
    printf("\n");
    
    // Test UPDATE operation
    printf("Testing UPDATE operation...\n");
    db_set(db, "age", "31");
    printf("age => %s (updated)\n\n", db_get(db, "age"));
    
    // Test EXISTS operation
    printf("Testing EXISTS operation...\n");
    printf("exists(name) => %s\n", db_exists(db, "name") ? "true" : "false");
    printf("exists(missing) => %s\n\n", db_exists(db, "missing") ? "true" : "false");
    
    // Test COUNT operation
    printf("Count: %zu entries\n\n", db_count(db));
    
    // Print all contents
    db_print(db);
    printf("\n");
    
    // Test KEYS operation
    printf("Testing KEYS operation...\n");
    size_t key_count;
    char **keys = db_keys(db, &key_count);
    if (keys) {
        for (size_t i = 0; i < key_count; i++) {
            printf("  Key %zu: %s\n", i, keys[i]);
        }
        free(keys);
    }
    printf("\n");
    
    // Test DELETE operation
    printf("Testing DELETE operation...\n");
    db_delete(db, "city");
    printf("Deleted 'city'\n");
    printf("Count after delete: %zu entries\n\n", db_count(db));
    
    // Statistics
    printf("Database Statistics:\n");
    DBStats stats = db_stats(db);
    printf("  Total entries: %zu\n", stats.total_entries);
    printf("  Used buckets: %zu\n", stats.used_buckets);
    printf("  Total collisions: %zu\n", stats.total_collisions);
    printf("  Max chain length: %zu\n\n", stats.max_chain_length);
    
    // Performance test
    printf("Performance test: Adding 1000 entries...\n");
    for (int i = 0; i < 1000; i++) {
        char key[32], value[64];
        snprintf(key, sizeof(key), "key_%d", i);
        snprintf(value, sizeof(value), "value_%d", i);
        db_set(db, key, value);
    }
    printf("✓ Added 1000 entries\n");
    printf("Count: %zu entries\n\n", db_count(db));
    
    // Final statistics
    stats = db_stats(db);
    printf("Final Statistics:\n");
    printf("  Total entries: %zu\n", stats.total_entries);
    printf("  Used buckets: %zu / %d (%.1f%%)\n", 
           stats.used_buckets, HASH_TABLE_SIZE,
           (100.0 * stats.used_buckets) / HASH_TABLE_SIZE);
    printf("  Total collisions: %zu\n", stats.total_collisions);
    printf("  Max chain length: %zu\n", stats.max_chain_length);
    printf("  Avg chain length: %.2f\n\n", 
           stats.used_buckets > 0 ? (double)stats.total_entries / stats.used_buckets : 0);
    
    // Test CLEAR operation
    printf("Testing CLEAR operation...\n");
    db_clear(db);
    printf("✓ Database cleared\n");
    printf("Count after clear: %zu entries\n\n", db_count(db));
    
    // Cleanup
    db_destroy(db);
    printf("✓ Database destroyed\n");
    
    return 0;
}

#endif
