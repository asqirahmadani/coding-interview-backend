# Implementation Notes

**Candidate:** Muhamad Asqi Rahmadani  
**Date:** 27-11-2025  
**Time Spent:** 4 hours

## Main Bugs/Issues Found

### 1. Repository Update Creating New Records

**Issue:**
The InMemoryTodoRepository.update() method had a critical bug where it would create a new todo if the ID wasn't found, instead of returning null. This violates data integrity principles and could lead to phantom records with incomplete data.
**Fix:**
Modified to return null when todo is not found, and properly update updatedAt timestamp.
**Impact:**
Prevented data corruption and ensured consistent behavior across the application. Update operations now fail predictably when targeting non-existent records.

### 2. Loose Equality Operators (== vs ===)

**Issue:**  
Throughout the repositories, loose equality operators (==) were used instead of strict equality (===). This could lead to type coercion bugs where different types might be incorrectly matched.
**Fix:**  
Replaced all == with === for strict type checking.
**Impact:**
Eliminated potential type coercion issues and improved code reliability. JavaScript's strict equality ensures that "1" !== 1, preventing subtle bugs.

### 3. Missing Input Validation in TodoService

**Issue:**  
TodoService.createTodo() had no validation for:

- Empty or whitespace-only titles
- Non-existent user IDs
- Invalid date formats for remindAt

This allowed creation of invalid todos that could break application logic.
**Fix:**  
Added comprehensive validation
**Impact:**
Prevents invalid data from entering the system and provides clear error messages to API consumers.

### 4. Incorrect Reminder Processing Logic

**Issue:**  
findDueReminders() didn't properly filter by status. It would return todos with any status, including already-processed "REMINDER_DUE" or "DONE" todos, causing duplicate notifications.
**Fix:**  
Added proper status filtering
**Impact:**
Ensures reminders are only processed once, preventing spam and maintaining proper todo lifecycle.

### 5. Scheduler Crashes on Errors

**Issue:**  
SimpleScheduler didn't handle errors in scheduled tasks. Any error would crash the entire application instead of just logging and continuing.
**Fix:**  
Wrapped scheduled functions in try-catch blocks
**Impact:**
Application remains stable even when reminder processing encounters errors. Failures are logged but don't affect system availability.

### 6. Generic Error Messages

**Issue:**  
Errors like "Not found" provided no context about what wasn't found (user? todo? which ID?).
**Fix:**  
Made all error messages specific and actionable
**Impact:**
Improved debugging experience and better error messages for API consumers.

### 7. Memory Leaks from Direct Array References

**Issue:**  
Repository methods returned direct references to internal arrays, allowing external code to mutate the repository's state.
**Fix:**  
Return copies of objects/arrays
**Impact:**
Prevents external mutations of repository state, maintaining data integrity.

### 8. No Scheduler Initialization

**Issue:**  
The scheduler was instantiated but never actually started. The scheduleRecurring method was never called in main.ts.
**Fix:**  
Added proper scheduler initialization with recurring reminder processing
**Impact:**
Background reminder processing now actually runs as intended.

---

## How I Fixed Them

### Type Safety Issues

- Replaced all any types with proper TypeScript interfaces
- Used strict equality (===) throughout
- Added proper type annotations for function parameters and return values
- Defined Partial<Todo> for update operations to ensure type safety

### Validation Issues

- Added title validation (non-empty, non-whitespace)
- Added user existence validation before creating todos
- Added proper date parsing and validation for remindAt
- Added input sanitization in HTTP routes (query params, request bodies)

### Data Integrity Issues

- Fixed update method to not create new records
- Added updatedAt timestamp updates on every modification
- Implemented defensive copying to prevent external mutations

### Logic Errors

- Fixed reminder filtering to only process PENDING todos
- Implemented idempotent reminder processing
- Added proper pagination with validation (page ≥ 1, limit 1-100)

### Error Handling

- Added try-catch blocks in scheduler
- Implemented specific error messages with context
- Added proper HTTP status codes (400, 404, 500)
- Implemented graceful shutdown handling (SIGTERM, SIGINT)

---

## Framework/Database Choices

### HTTP Framework

**Choice: Express.js**  
**Reasoning:**

- Most popular Node.js web framework with extensive documentation
- Large ecosystem of middleware and plugins
- Simple and unopinionated, perfect for this exercise's requirements
- Great TypeScript support with @types/express
  Easy to test and familiar to most developers

### Database

**Choice: In-Memory (as provided)**  
**Reasoning:**

- Meets exercise requirements without over-engineering
- Allows focus on business logic and bug fixes
- Fast for testing and development
- Easy to swap out later due to repository pattern
- No setup complexity for reviewers

### Other Libraries/Tools

- ts-node / ts-node-dev: For TypeScript execution and hot-reloading during development
- jest / ts-jest: For unit testing with TypeScript support

---

## Database Schema Design

(If applicable)

```sql
-- SQL schema or document schema here
```

---

## How to Run My Implementation

### Prerequisites

- Node.js v18+
- npm or yarn package manager

### Setup Steps

1. Clone/extract the project repository
2. Install dependencies:

```bash
npm install
```

3. Ensure TypeScript is compiled (optional):

```bash
npm run build
```

### Running the Application

```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start

# The server will start on http://localhost:3000
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Optional Improvements Implemented

- [ ] Authentication/Authorization
- [ ] Pagination
- [ ] Filtering/Sorting
- [ ] Rate Limiting
- [ ] Logging
- [ ] Docker Setup
- [ ] Environment Configuration
- [ ] Integration Tests
- [ ] API Documentation
- [ ] Health Check Endpoint
- [ ] Other: **\*\***\_\_\_**\*\***

### Details

---

## Future Improvements

If I had more time, I would add/improve:

1.
2.
3.

---

## Assumptions Made

1.
2.
3.

---

## Challenges Faced

1.
2.
3.

---

## Additional Comments
