#ifndef DOUBLY_LINKED_LIST_H
#define DOUBLY_LINKED_LIST_H

typedef struct DNode {
    int data;
    struct DNode* next;
    struct DNode* prev;
} DNode;

// Node creation and basic operations
DNode* createDNode(int data);
DNode* insertDEnd(DNode* head, int data);
DNode* insertDBegin(DNode* head, int data);
DNode* insertDAfter(DNode* head, int afterValue, int data);
DNode* insertDBefore(DNode* head, int beforeValue, int data);
DNode* deleteDNode(DNode* head, int data);
void displayDForward(DNode* head, const char* label);
void displayDBackward(DNode* head, const char* label);
void freeDList(DNode* head);

// Search algorithm
int searchD(DNode* head, int target);

// Sort algorithms
DNode* bubbleSortD(DNode* head);
DNode* mergeSortD(DNode* head);

// Reverse algorithm
DNode* reverseDList(DNode* head);

// Utility functions
int getDListLength(DNode* head);
DNode* insertDArray(DNode* head, int* arr, int size);
DNode* getTail(DNode* head);

#endif
