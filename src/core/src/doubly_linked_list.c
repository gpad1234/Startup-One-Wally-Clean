#include <stdio.h>
#include <stdlib.h>
#include "doubly_linked_list.h"

// Create a new doubly linked list node
DNode* createDNode(int data) {
    DNode* newNode = (DNode*)malloc(sizeof(DNode));
    if (newNode == NULL) {
        printf("Memory allocation failed!\n");
        exit(1);
    }
    newNode->data = data;
    newNode->next = NULL;
    newNode->prev = NULL;
    return newNode;
}

// Insert at the end of the list
DNode* insertDEnd(DNode* head, int data) {
    DNode* newNode = createDNode(data);
    
    if (head == NULL) {
        return newNode;
    }
    
    DNode* temp = head;
    while (temp->next != NULL) {
        temp = temp->next;
    }
    
    temp->next = newNode;
    newNode->prev = temp;
    return head;
}

// Insert at the beginning of the list
DNode* insertDBegin(DNode* head, int data) {
    DNode* newNode = createDNode(data);
    
    if (head != NULL) {
        head->prev = newNode;
    }
    newNode->next = head;
    return newNode;
}

// Insert after a specific value
DNode* insertDAfter(DNode* head, int afterValue, int data) {
    if (head == NULL) {
        printf("List is empty. Cannot insert after %d.\n", afterValue);
        return head;
    }
    
    DNode* temp = head;
    while (temp != NULL && temp->data != afterValue) {
        temp = temp->next;
    }
    
    if (temp == NULL) {
        printf("Value %d not found in list.\n", afterValue);
        return head;
    }
    
    DNode* newNode = createDNode(data);
    newNode->next = temp->next;
    newNode->prev = temp;
    
    if (temp->next != NULL) {
        temp->next->prev = newNode;
    }
    temp->next = newNode;
    
    return head;
}

// Insert before a specific value
DNode* insertDBefore(DNode* head, int beforeValue, int data) {
    if (head == NULL) {
        printf("List is empty. Cannot insert before %d.\n", beforeValue);
        return head;
    }
    
    if (head->data == beforeValue) {
        return insertDBegin(head, data);
    }
    
    DNode* temp = head;
    while (temp != NULL && temp->data != beforeValue) {
        temp = temp->next;
    }
    
    if (temp == NULL) {
        printf("Value %d not found in list.\n", beforeValue);
        return head;
    }
    
    DNode* newNode = createDNode(data);
    newNode->next = temp;
    newNode->prev = temp->prev;
    
    temp->prev->next = newNode;
    temp->prev = newNode;
    
    return head;
}

// Delete a node with specific data
DNode* deleteDNode(DNode* head, int data) {
    if (head == NULL) {
        printf("List is empty.\n");
        return NULL;
    }
    
    DNode* temp = head;
    
    // If head node contains the data
    if (temp->data == data) {
        head = temp->next;
        if (head != NULL) {
            head->prev = NULL;
        }
        free(temp);
        return head;
    }
    
    // Search for the node to delete
    while (temp != NULL && temp->data != data) {
        temp = temp->next;
    }
    
    // If data was not found
    if (temp == NULL) {
        printf("Element %d not found.\n", data);
        return head;
    }
    
    // Unlink the node
    if (temp->next != NULL) {
        temp->next->prev = temp->prev;
    }
    if (temp->prev != NULL) {
        temp->prev->next = temp->next;
    }
    
    free(temp);
    return head;
}

// Display list forward
void displayDForward(DNode* head, const char* label) {
    if (label != NULL) {
        printf("%s", label);
    }
    
    if (head == NULL) {
        printf("NULL\n");
        return;
    }
    
    DNode* temp = head;
    while (temp != NULL) {
        printf("%d", temp->data);
        if (temp->next != NULL) {
            printf(" <-> ");
        }
        temp = temp->next;
    }
    printf(" <-> NULL\n");
}

// Display list backward
void displayDBackward(DNode* head, const char* label) {
    if (head == NULL) {
        if (label != NULL) {
            printf("%s", label);
        }
        printf("NULL\n");
        return;
    }
    
    // Get to the tail
    DNode* temp = head;
    while (temp->next != NULL) {
        temp = temp->next;
    }
    
    if (label != NULL) {
        printf("%s", label);
    }
    
    // Traverse backward
    while (temp != NULL) {
        printf("%d", temp->data);
        if (temp->prev != NULL) {
            printf(" <-> ");
        }
        temp = temp->prev;
    }
    printf(" <-> NULL\n");
}

// Free the entire list
void freeDList(DNode* head) {
    DNode* temp;
    while (head != NULL) {
        temp = head;
        head = head->next;
        free(temp);
    }
}

// Search for an element
int searchD(DNode* head, int target) {
    DNode* temp = head;
    int position = 0;
    
    while (temp != NULL) {
        if (temp->data == target) {
            return position;
        }
        temp = temp->next;
        position++;
    }
    
    return -1; // Not found
}

// Bubble sort for doubly linked list
DNode* bubbleSortD(DNode* head) {
    if (head == NULL || head->next == NULL) {
        return head;
    }
    
    int swapped;
    DNode* ptr1;
    DNode* lptr = NULL;
    
    do {
        swapped = 0;
        ptr1 = head;
        
        while (ptr1->next != lptr) {
            if (ptr1->data > ptr1->next->data) {
                // Swap data
                int temp = ptr1->data;
                ptr1->data = ptr1->next->data;
                ptr1->next->data = temp;
                swapped = 1;
            }
            ptr1 = ptr1->next;
        }
        lptr = ptr1;
    } while (swapped);
    
    return head;
}

// Helper function for merge sort - split list
DNode* splitD(DNode* head) {
    DNode* fast = head;
    DNode* slow = head;
    
    while (fast->next != NULL && fast->next->next != NULL) {
        fast = fast->next->next;
        slow = slow->next;
    }
    
    DNode* temp = slow->next;
    slow->next = NULL;
    if (temp != NULL) {
        temp->prev = NULL;
    }
    
    return temp;
}

// Helper function for merge sort - merge two sorted lists
DNode* mergeD(DNode* first, DNode* second) {
    if (first == NULL) return second;
    if (second == NULL) return first;
    
    if (first->data < second->data) {
        first->next = mergeD(first->next, second);
        if (first->next != NULL) {
            first->next->prev = first;
        }
        first->prev = NULL;
        return first;
    } else {
        second->next = mergeD(first, second->next);
        if (second->next != NULL) {
            second->next->prev = second;
        }
        second->prev = NULL;
        return second;
    }
}

// Merge sort for doubly linked list
DNode* mergeSortD(DNode* head) {
    if (head == NULL || head->next == NULL) {
        return head;
    }
    
    DNode* second = splitD(head);
    
    head = mergeSortD(head);
    second = mergeSortD(second);
    
    return mergeD(head, second);
}

// Reverse the doubly linked list
DNode* reverseDList(DNode* head) {
    DNode* temp = NULL;
    DNode* current = head;
    
    while (current != NULL) {
        temp = current->prev;
        current->prev = current->next;
        current->next = temp;
        current = current->prev;
    }
    
    if (temp != NULL) {
        head = temp->prev;
    }
    
    return head;
}

// Get the length of the list
int getDListLength(DNode* head) {
    int count = 0;
    DNode* temp = head;
    
    while (temp != NULL) {
        count++;
        temp = temp->next;
    }
    
    return count;
}

// Insert array of elements
DNode* insertDArray(DNode* head, int* arr, int size) {
    for (int i = 0; i < size; i++) {
        head = insertDEnd(head, arr[i]);
    }
    return head;
}

// Get tail of the list
DNode* getTail(DNode* head) {
    if (head == NULL) {
        return NULL;
    }
    
    DNode* temp = head;
    while (temp->next != NULL) {
        temp = temp->next;
    }
    
    return temp;
}
