#include <stdio.h>
#include <stdlib.h>
#include "linked_list.h"

// Function to create a new node
Node* createNode(int data) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    if (newNode == NULL) {
        printf("Memory allocation failed!\n");
        return NULL;
    }
    newNode->data = data;
    newNode->next = NULL;
    return newNode;
}

// Function to insert at the end
Node* insertEnd(Node* head, int data) {
    Node* newNode = createNode(data);
    if (newNode == NULL) return head;
    
    if (head == NULL) {
        return newNode;
    }
    
    Node* current = head;
    while (current->next != NULL) {
        current = current->next;
    }
    current->next = newNode;
    return head;
}

// Function to insert at the beginning
Node* insertBegin(Node* head, int data) {
    Node* newNode = createNode(data);
    if (newNode == NULL) return head;
    
    newNode->next = head;
    return newNode;
}

// Function to delete a node
Node* deleteNode(Node* head, int data) {
    if (head == NULL) {
        printf("List is empty!\n");
        return head;
    }
    
    // If head needs to be deleted
    if (head->data == data) {
        Node* temp = head;
        head = head->next;
        free(temp);
        printf("Element %d deleted successfully.\n", data);
        return head;
    }
    
    // Search for the node to delete
    Node* current = head;
    while (current->next != NULL) {
        if (current->next->data == data) {
            Node* temp = current->next;
            current->next = temp->next;
            free(temp);
            printf("Element %d deleted successfully.\n", data);
            return head;
        }
        current = current->next;
    }
    
    printf("Element %d not found in the list!\n", data);
    return head;
}

// Function to display the list
void display(Node* head, const char* label) {
    if (head == NULL) {
        printf("%s: [Empty]\n", label);
        return;
    }
    
    printf("%s: ", label);
    Node* current = head;
    while (current != NULL) {
        printf("%d -> ", current->data);
        current = current->next;
    }
    printf("NULL\n");
}

// Function to reverse the linked list
Node* reverseList(Node* head) {
    Node* prev = NULL;
    Node* current = head;
    Node* next = NULL;
    
    while (current != NULL) {
        next = current->next;  // Store next node
        current->next = prev;  // Reverse the link
        prev = current;        // Move prev forward
        current = next;        // Move current forward
    }
    return prev;
}

// Function to search for a value
int search(Node* head, int target) {
    Node* current = head;
    int position = 0;
    
    while (current != NULL) {
        if (current->data == target) {
            return position;
        }
        current = current->next;
        position++;
    }
    return -1;
}

// Function to get list length
int getListLength(Node* head) {
    int count = 0;
    Node* current = head;
    while (current != NULL) {
        count++;
        current = current->next;
    }
    return count;
}

// Function to get the middle node (for merge sort)
Node* getMidNode(Node* head) {
    if (head == NULL) return head;
    
    Node* slow = head;
    Node* fast = head;
    Node* prev = NULL;
    
    while (fast != NULL && fast->next != NULL) {
        prev = slow;
        slow = slow->next;
        fast = fast->next->next;
    }
    
    if (prev != NULL) {
        prev->next = NULL;
    }
    
    return slow;
}

// Function to merge two sorted lists
Node* merge(Node* l1, Node* l2) {
    Node* dummy = createNode(0);
    Node* current = dummy;
    
    while (l1 != NULL && l2 != NULL) {
        if (l1->data <= l2->data) {
            current->next = l1;
            l1 = l1->next;
        } else {
            current->next = l2;
            l2 = l2->next;
        }
        current = current->next;
    }
    
    current->next = (l1 != NULL) ? l1 : l2;
    
    Node* result = dummy->next;
    free(dummy);
    return result;
}

// Function to sort using merge sort
Node* mergeSort(Node* head) {
    if (head == NULL || head->next == NULL) {
        return head;
    }
    
    Node* mid = getMidNode(head);
    
    Node* left = mergeSort(head);
    Node* right = mergeSort(mid);
    
    return merge(left, right);
}

// Function to sort using bubble sort
Node* bubbleSort(Node* head) {
    if (head == NULL || head->next == NULL) {
        return head;
    }
    
    Node* current;
    int swapped;
    
    do {
        swapped = 0;
        current = head;
        
        while (current->next != NULL) {
            if (current->data > current->next->data) {
                int temp = current->data;
                current->data = current->next->data;
                current->next->data = temp;
                swapped = 1;
            }
            current = current->next;
        }
    } while (swapped);
    
    return head;
}

// Function to free the list
void freeList(Node* head) {
    Node* current = head;
    while (current != NULL) {
        Node* temp = current;
        current = current->next;
        free(temp);
    }
}

// Function to insert an array of numbers creating matching nodes
Node* insertArray(Node* head, int* arr, int size) {
    if (arr == NULL || size <= 0) {
        printf("Invalid array or size!\n");
        return head;
    }
    
    for (int i = 0; i < size; i++) {
        head = insertEnd(head, arr[i]);
    }
    
    printf("✓ Inserted %d elements from array.\n", size);
    return head;
}
