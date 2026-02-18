#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "animation.h"

// Sleep function for milliseconds
void sleep_ms(int milliseconds) {
    usleep(milliseconds * 1000);
}

// Animated display with color highlighting
void animateDisplay(Node* head, const char* label) {
    if (head == NULL) {
        printf("%s%s%s: %s[Empty]%s\n", BOLD, CYAN, label, RED, RESET);
        return;
    }
    
    printf("%s%s%s: %s", BOLD, CYAN, label, RESET);
    Node* current = head;
    int position = 0;
    
    while (current != NULL) {
        printf("%s[%d]%s", BOLD, current->data, RESET);
        
        if (current->next != NULL) {
            printf(" %s→%s ", BLUE, RESET);
        } else {
            printf(" %s→%s ", BLUE, RESET);
        }
        
        current = current->next;
        position++;
        sleep_ms(ANIMATION_DELAY / 2);
    }
    
    printf("%sNULL%s\n", RED, RESET);
}

// Animate insertion with visual feedback
void animateInsert(Node* head, int value, const char* position) {
    printf("\n%s=== INSERTING %d at %s ===%s\n", YELLOW, value, position, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sSearching for insertion point...%s\n", CYAN, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sCreating node with value: %s[%d]%s\n", CYAN, BOLD, value, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sLinking node to list...%s\n", CYAN, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%s✓ Node %s[%d]%s inserted successfully!%s\n", GREEN, BOLD, value, GREEN, RESET);
    sleep_ms(ANIMATION_DELAY / 2);
}

// Animate deletion with visual feedback
void animateDelete(Node* head, int value) {
    printf("\n%s=== DELETING %d ===%s\n", YELLOW, value, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sSearching for node with value: %s[%d]%s\n", CYAN, BOLD, value, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    Node* current = head;
    int position = 0;
    
    while (current != NULL) {
        if (current->data == value) {
            printf("%sFound at position %d!%s\n", GREEN, position, RESET);
            sleep_ms(ANIMATION_DELAY);
            break;
        }
        printf("%s[%d]%s → ", BOLD, current->data, RESET);
        current = current->next;
        position++;
        sleep_ms(ANIMATION_DELAY / 3);
    }
    
    printf("\n%sUpdating links...%s\n", CYAN, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sFreeing memory...%s\n", CYAN, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%s✓ Node deleted successfully!%s\n", GREEN, RESET);
    sleep_ms(ANIMATION_DELAY / 2);
}

// Animate search with visual feedback
void animateSearch(Node* head, int target) {
    printf("\n%s=== SEARCHING FOR %d ===%s\n", YELLOW, target, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    Node* current = head;
    int position = 0;
    
    printf("%sTraversing list: ", CYAN);
    
    while (current != NULL) {
        if (current->data == target) {
            printf("%s[%s%d%s] %sFound!%s\n", BOLD, GREEN, current->data, BOLD, GREEN, RESET);
            sleep_ms(ANIMATION_DELAY);
            printf("%s✓ Element found at position %d (0-indexed)%s\n", GREEN, position, RESET);
            return;
        } else {
            printf("%s[%d]%s → ", BOLD, current->data, RESET);
        }
        
        current = current->next;
        position++;
        sleep_ms(ANIMATION_DELAY / 3);
    }
    
    printf("\n%s✗ Element not found!%s\n", RED, RESET);
    sleep_ms(ANIMATION_DELAY / 2);
}

// Animate sort with visual feedback
void animateSort(Node* head, const char* algorithm) {
    printf("\n%s=== SORTING USING %s ===%s\n", YELLOW, algorithm, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sInitial list: %s", CYAN, RESET);
    Node* temp = head;
    while (temp != NULL) {
        printf("%s[%d]%s → ", BOLD, temp->data, RESET);
        temp = temp->next;
        sleep_ms(ANIMATION_DELAY / 4);
    }
    printf("%sNULL%s\n", RED, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sComparing and reordering elements...%s\n", CYAN, RESET);
    for (int i = 0; i < 5; i++) {
        printf("%s.", YELLOW);
        fflush(stdout);
        sleep_ms(ANIMATION_DELAY / 3);
    }
    printf("%s\n", RESET);
    sleep_ms(ANIMATION_DELAY / 2);
    
    printf("%sSorted list: %s", GREEN, RESET);
    temp = head;
    while (temp != NULL) {
        printf("%s[%d]%s → ", BOLD, temp->data, RESET);
        temp = temp->next;
        sleep_ms(ANIMATION_DELAY / 4);
    }
    printf("%sNULL%s\n", RED, RESET);
    sleep_ms(ANIMATION_DELAY / 2);
    
    printf("%s✓ Sorting complete!%s\n", GREEN, RESET);
    sleep_ms(ANIMATION_DELAY / 2);
}

// Animate reverse with visual feedback
void animateReverse(Node* head) {
    printf("\n%s=== REVERSING LIST ===%s\n", YELLOW, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sOriginal list: %s", CYAN, RESET);
    Node* temp = head;
    while (temp != NULL) {
        printf("%s[%d]%s → ", BOLD, temp->data, RESET);
        temp = temp->next;
        sleep_ms(ANIMATION_DELAY / 3);
    }
    printf("%sNULL%s\n", RED, RESET);
    sleep_ms(ANIMATION_DELAY);
    
    printf("%sReversing pointers...%s\n", CYAN, RESET);
    for (int i = 0; i < 5; i++) {
        printf("%s↻", YELLOW);
        fflush(stdout);
        sleep_ms(ANIMATION_DELAY / 3);
    }
    printf("%s\n", RESET);
    sleep_ms(ANIMATION_DELAY / 2);
    
    printf("%sReversed list: %s", GREEN, RESET);
    temp = head;
    while (temp != NULL) {
        printf("%s[%d]%s → ", BOLD, temp->data, RESET);
        temp = temp->next;
        sleep_ms(ANIMATION_DELAY / 3);
    }
    printf("%sNULL%s\n", RED, RESET);
    sleep_ms(ANIMATION_DELAY / 2);
    
    printf("%s✓ Reverse complete!%s\n", GREEN, RESET);
    sleep_ms(ANIMATION_DELAY / 2);
}
