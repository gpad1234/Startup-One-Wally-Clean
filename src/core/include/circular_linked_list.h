#ifndef CIRCULAR_LINKED_LIST_H
#define CIRCULAR_LINKED_LIST_H

typedef struct CNode {
    int data;
    struct CNode* next;
} CNode;

// Node creation and basic operations
CNode* createCNode(int data);
CNode* insertCEnd(CNode* head, int data);
CNode* insertCBegin(CNode* head, int data);
CNode* insertCAfter(CNode* head, int afterValue, int data);
CNode* deleteCNode(CNode* head, int data);
void displayCircular(CNode* head, const char* label);
void freeCList(CNode* head);

// Search algorithm
int searchC(CNode* head, int target);

// Sort algorithms
CNode* bubbleSortC(CNode* head);
CNode* mergeSortC(CNode* head);

// Reverse algorithm
CNode* reverseCList(CNode* head);

// Utility functions
int getCListLength(CNode* head);
CNode* insertCArray(CNode* head, int* arr, int size);
CNode* getTailC(CNode* head);
int isCircular(CNode* head);

#endif
