#include <stdio.h>
#include <stdlib.h>
#include "circular_linked_list.h"

// Create a new circular linked list node
CNode* createCNode(int data) {
    CNode* newNode = (CNode*)malloc(sizeof(CNode));
    if (newNode == NULL) {
        printf("Memory allocation failed!\n");
        exit(1);
    }
    newNode->data = data;
    newNode->next = newNode; // Points to itself initially
    return newNode;
}

// Insert at the end of the circular list
CNode* insertCEnd(CNode* head, int data) {
    CNode* newNode = createCNode(data);
    
    if (head == NULL) {
        return newNode;
    }
    
    // Find the tail (node that points back to head)
    CNode* temp = head;
    while (temp->next != head) {
        temp = temp->next;
    }
    
    temp->next = newNode;
    newNode->next = head;
    return head;
}

// Insert at the beginning of the circular list
CNode* insertCBegin(CNode* head, int data) {
    CNode* newNode = createCNode(data);
    
    if (head == NULL) {
        return newNode;
    }
    
    // Find the tail
    CNode* temp = head;
    while (temp->next != head) {
        temp = temp->next;
    }
    
    newNode->next = head;
    temp->next = newNode;
    return newNode;
}

// Insert after a specific value
CNode* insertCAfter(CNode* head, int afterValue, int data) {
    if (head == NULL) {
        printf("List is empty. Cannot insert after %d.\n", afterValue);
        return head;
    }
    
    CNode* temp = head;
    do {
        if (temp->data == afterValue) {
            CNode* newNode = createCNode(data);
            newNode->next = temp->next;
            temp->next = newNode;
            return head;
        }
        temp = temp->next;
    } while (temp != head);
    
    printf("Value %d not found in list.\n", afterValue);
    return head;
}

// Delete a node with specific data
CNode* deleteCNode(CNode* head, int data) {
    if (head == NULL) {
        printf("List is empty.\n");
        return NULL;
    }
    
    CNode* temp = head;
    CNode* prev = NULL;
    
    // If head node contains the data
    if (head->data == data) {
        // If only one node
        if (head->next == head) {
            free(head);
            return NULL;
        }
        
        // Find the tail
        while (temp->next != head) {
            temp = temp->next;
        }
        
        temp->next = head->next;
        CNode* toDelete = head;
        head = head->next;
        free(toDelete);
        return head;
    }
    
    // Search for the node to delete
    prev = head;
    temp = head->next;
    
    do {
        if (temp->data == data) {
            prev->next = temp->next;
            free(temp);
            return head;
        }
        prev = temp;
        temp = temp->next;
    } while (temp != head);
    
    printf("Element %d not found.\n", data);
    return head;
}

// Display circular list
void displayCircular(CNode* head, const char* label) {
    if (label != NULL) {
        printf("%s", label);
    }
    
    if (head == NULL) {
        printf("NULL (empty)\n");
        return;
    }
    
    CNode* temp = head;
    do {
        printf("%d", temp->data);
        temp = temp->next;
        if (temp != head) {
            printf(" -> ");
        }
    } while (temp != head);
    
    printf(" -> (back to %d)\n", head->data);
}

// Free the entire circular list
void freeCList(CNode* head) {
    if (head == NULL) {
        return;
    }
    
    CNode* temp = head;
    CNode* next;
    
    do {
        next = temp->next;
        free(temp);
        temp = next;
    } while (temp != head);
}

// Search for an element
int searchC(CNode* head, int target) {
    if (head == NULL) {
        return -1;
    }
    
    CNode* temp = head;
    int position = 0;
    
    do {
        if (temp->data == target) {
            return position;
        }
        temp = temp->next;
        position++;
    } while (temp != head);
    
    return -1; // Not found
}

// Bubble sort for circular linked list
CNode* bubbleSortC(CNode* head) {
    if (head == NULL || head->next == head) {
        return head;
    }
    
    int swapped;
    CNode* ptr1;
    CNode* lptr = NULL;
    
    do {
        swapped = 0;
        ptr1 = head;
        
        do {
            if (ptr1->next != head && ptr1->next != lptr && ptr1->data > ptr1->next->data) {
                // Swap data
                int temp = ptr1->data;
                ptr1->data = ptr1->next->data;
                ptr1->next->data = temp;
                swapped = 1;
            }
            ptr1 = ptr1->next;
        } while (ptr1->next != head && ptr1->next != lptr);
        
        lptr = ptr1;
    } while (swapped);
    
    return head;
}

// Helper function to convert circular to linear for merge sort
CNode* breakCircular(CNode* head) {
    if (head == NULL) {
        return NULL;
    }
    
    CNode* temp = head;
    while (temp->next != head) {
        temp = temp->next;
    }
    temp->next = NULL;
    return head;
}

// Helper function to make list circular again
CNode* makeCircular(CNode* head) {
    if (head == NULL) {
        return NULL;
    }
    
    CNode* temp = head;
    while (temp->next != NULL) {
        temp = temp->next;
    }
    temp->next = head;
    return head;
}

// Helper function for merge sort - split list
CNode* splitC(CNode* head) {
    CNode* fast = head;
    CNode* slow = head;
    
    while (fast->next != NULL && fast->next->next != NULL) {
        fast = fast->next->next;
        slow = slow->next;
    }
    
    CNode* temp = slow->next;
    slow->next = NULL;
    return temp;
}

// Helper function for merge sort - merge two sorted lists
CNode* mergeC(CNode* first, CNode* second) {
    if (first == NULL) return second;
    if (second == NULL) return first;
    
    if (first->data < second->data) {
        first->next = mergeC(first->next, second);
        return first;
    } else {
        second->next = mergeC(first, second->next);
        return second;
    }
}

// Merge sort helper (works on linear list)
CNode* mergeSortLinear(CNode* head) {
    if (head == NULL || head->next == NULL) {
        return head;
    }
    
    CNode* second = splitC(head);
    
    head = mergeSortLinear(head);
    second = mergeSortLinear(second);
    
    return mergeC(head, second);
}

// Merge sort for circular linked list
CNode* mergeSortC(CNode* head) {
    if (head == NULL || head->next == head) {
        return head;
    }
    
    // Break circular structure
    head = breakCircular(head);
    
    // Perform merge sort
    head = mergeSortLinear(head);
    
    // Make it circular again
    head = makeCircular(head);
    
    return head;
}

// Reverse the circular linked list
CNode* reverseCList(CNode* head) {
    if (head == NULL || head->next == head) {
        return head;
    }
    
    CNode* prev = NULL;
    CNode* current = head;
    CNode* next = NULL;
    CNode* tail = head;
    
    // Find tail
    while (tail->next != head) {
        tail = tail->next;
    }
    
    do {
        next = current->next;
        current->next = prev;
        prev = current;
        current = next;
    } while (current != head);
    
    head->next = prev;
    head = prev;
    
    return head;
}

// Get the length of the circular list
int getCListLength(CNode* head) {
    if (head == NULL) {
        return 0;
    }
    
    int count = 0;
    CNode* temp = head;
    
    do {
        count++;
        temp = temp->next;
    } while (temp != head);
    
    return count;
}

// Insert array of elements
CNode* insertCArray(CNode* head, int* arr, int size) {
    for (int i = 0; i < size; i++) {
        head = insertCEnd(head, arr[i]);
    }
    return head;
}

// Get tail of the circular list
CNode* getTailC(CNode* head) {
    if (head == NULL) {
        return NULL;
    }
    
    CNode* temp = head;
    while (temp->next != head) {
        temp = temp->next;
    }
    
    return temp;
}

// Check if the list is circular
int isCircular(CNode* head) {
    if (head == NULL) {
        return 0;
    }
    
    CNode* temp = head->next;
    
    while (temp != NULL && temp != head) {
        temp = temp->next;
    }
    
    return (temp == head);
}
