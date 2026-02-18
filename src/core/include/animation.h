#ifndef ANIMATION_H
#define ANIMATION_H

#include "linked_list.h"

// Animation speed control (milliseconds delay)
#define ANIMATION_DELAY 500

// Color codes for terminal
#define RESET   "\x1b[0m"
#define RED     "\x1b[31m"
#define GREEN   "\x1b[32m"
#define YELLOW  "\x1b[33m"
#define BLUE    "\x1b[34m"
#define CYAN    "\x1b[36m"
#define BOLD    "\x1b[1m"

// Animation functions
void animateDisplay(Node* head, const char* label);
void animateInsert(Node* head, int value, const char* position);
void animateDelete(Node* head, int value);
void animateSearch(Node* head, int target);
void animateSort(Node* head, const char* algorithm);
void animateReverse(Node* head);
void sleep_ms(int milliseconds);

#endif
