/*
 * Simple In-Memory Database - Header File
 *
 * A lightweight key-value store using hash table implementation.
 * Designed for Python FFI integration via ctypes.
 *
 * Features:
 * - String key-value pairs
 * - Hash table with collision chaining
 * - CRUD operations
 * - Statistics and debugging
 */

#ifndef SIMPLE_DB_H
#define SIMPLE_DB_H

#include <stddef.h>
#include <stdbool.h>
#include <stdint.h>

// ============================================================================
// OPAQUE TYPES
// ============================================================================

/*
 * Database handle - internal structure hidden from users.
 * Use db_create() to obtain a Database pointer.
 */
typedef struct Database Database;

// ============================================================================
// PUBLIC TYPES
// ============================================================================

/*
 * Database statistics structure.
 * Returned by db_stats() for monitoring and debugging.
 */
typedef struct {
    size_t total_entries;      /* Total key-value pairs */
    size_t total_collisions;   /* Number of hash collisions */
    size_t max_chain_length;   /* Longest collision chain */
    size_t used_buckets;       /* Non-empty hash buckets */
} DBStats;

// ============================================================================
// DATABASE LIFECYCLE
// ============================================================================

/*
 * Create a new database instance.
 *
 * Returns:
 *   Database pointer on success, NULL on failure.
 *
 * Example:
 *   Database *db = db_create();
 *   if (!db) handle_error();
 */
Database* db_create(void);

/*
 * Destroy database and free all memory.
 *
 * Args:
 *   db: Database to destroy (can be NULL)
 *
 * Example:
 *   db_destroy(db);
 *   db = NULL;
 */
void db_destroy(Database *db);

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/*
 * Set a key-value pair (insert or update).
 *
 * Args:
 *   db: Database instance
 *   key: Key string (will be copied)
 *   value: Value string (will be copied)
 *
 * Returns:
 *   true on success, false on error
 *
 * Example:
 *   db_set(db, "user:123", "Alice");
 */
bool db_set(Database *db, const char *key, const char *value);

/*
 * Get value by key.
 *
 * Args:
 *   db: Database instance
 *   key: Key to look up
 *
 * Returns:
 *   Pointer to value string (borrowed reference), or NULL if not found.
 *   WARNING: Returned pointer is valid until next modification.
 *
 * Example:
 *   const char *value = db_get(db, "user:123");
 *   if (value) printf("Found: %s\n", value);
 */
const char* db_get(Database *db, const char *key);

/*
 * Delete a key-value pair.
 *
 * Args:
 *   db: Database instance
 *   key: Key to delete
 *
 * Returns:
 *   true if deleted, false if key not found
 *
 * Example:
 *   if (db_delete(db, "user:123")) {
 *       printf("Deleted\n");
 *   }
 */
bool db_delete(Database *db, const char *key);

/*
 * Check if key exists.
 *
 * Args:
 *   db: Database instance
 *   key: Key to check
 *
 * Returns:
 *   true if key exists, false otherwise
 *
 * Example:
 *   if (db_exists(db, "user:123")) {
 *       // Key exists
 *   }
 */
bool db_exists(Database *db, const char *key);

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

/*
 * Get number of entries in database.
 *
 * Args:
 *   db: Database instance
 *
 * Returns:
 *   Number of key-value pairs
 *
 * Example:
 *   printf("Database has %zu entries\n", db_count(db));
 */
size_t db_count(Database *db);

/*
 * Remove all entries from database.
 * Database remains valid and can be reused.
 *
 * Args:
 *   db: Database instance
 *
 * Example:
 *   db_clear(db);  // Empty the database
 */
void db_clear(Database *db);

/*
 * Get array of all keys in database.
 *
 * Args:
 *   db: Database instance
 *   count: Output parameter for number of keys
 *
 * Returns:
 *   Dynamically allocated array of key strings.
 *   Caller must free the array AND each string.
 *   Returns NULL on error.
 *
 * Example:
 *   size_t count;
 *   char **keys = db_keys(db, &count);
 *   for (size_t i = 0; i < count; i++) {
 *       printf("Key: %s\n", keys[i]);
 *       free(keys[i]);  // Free each key
 *   }
 *   free(keys);  // Free array
 */
char** db_keys(Database *db, size_t *count);

/*
 * Get database statistics.
 *
 * Args:
 *   db: Database instance
 *
 * Returns:
 *   DBStats structure with usage statistics
 *
 * Example:
 *   DBStats stats = db_stats(db);
 *   printf("Entries: %zu, Collisions: %zu\n",
 *          stats.total_entries, stats.total_collisions);
 */
DBStats db_stats(Database *db);

/*
 * Print database contents to stdout.
 * For debugging purposes.
 *
 * Args:
 *   db: Database instance
 *
 * Example:
 *   db_print(db);  // Print all key-value pairs
 */
void db_print(Database *db);

#endif /* SIMPLE_DB_H */
