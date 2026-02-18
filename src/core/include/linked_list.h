#ifndef LINKED_LIST_H
#define LINKED_LIST_H

typedef struct Node {
    int data;
    struct Node* next;
} Node;

// Node creation and basic operations
Node* createNode(int data);
Node* insertEnd(Node* head, int data);
Node* insertBegin(Node* head, int data);
Node* deleteNode(Node* head, int data);
void display(Node* head, const char* label);
void freeList(Node* head);

// Search algorithm
int search(Node* head, int target);

// Sort algorithms
Node* bubbleSort(Node* head);
Node* mergeSort(Node* head);

// Reverse algorithm
Node* reverseList(Node* head);

// Utility functions
int getListLength(Node* head);
Node* insertArray(Node* head, int* arr, int size);

#endif
