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

### 9. Imported Todo in Test is unread

**Issue:**  
The todo interface is unread in test
**Fix:**  
Comment that import
**Impact:**
Test able to run

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

- [x] Pagination
- [x] Filtering/Sorting - Separate endpoints for owned vs shared todos
- [x] Logging - Structured console logging for requests and reminder processing
- [x] Environment Configuration - Support for PORT and HOST environment variables
- [x] Health Check Endpoint - /api/health for monitoring
- [x] Graceful Shutdown - Proper cleanup on SIGTERM/SIGINT signals
- [x] Todo Sharing - Complete implementation of sharing todos between users
- [x] Error Context - Detailed error messages with specific IDs and context
- [x] Input Validation - Comprehensive validation for all endpoints
- [x] Defensive Copying - Prevent external mutations of repository state

### Details

#### Pagination Implementation:

- Validates page ≥ 1 and limit between 1-100
- Handles edge cases (page 0, negative values, excessive limits)

#### Todo Sharing Feature:

- Users can share todos with other users
- Validates both todo and target user existence
- Prevents sharing with yourself (owner)
- Prevents duplicate shares
- Supports unsharing (revoking access)
- Shared todos appear in recipient's todo list

#### Robust Error Handling:

- All scheduled tasks wrapped in try-catch
- Graceful degradation on partial failures
- Proper HTTP status codes for different error types
- Uncaught exception and unhandled rejection handlers

---

## Future Improvements

If I had more time, I would add/improve:

1. Read Database Integration (PostgreSQL/MongoDB)
2. Authentication & Authorization
3. Advanced Job Queue (Bull/BullMQ)
4. Comprehensive Testing
5. API Documentation (Swagger/OpenAPI)
6. Advanced Features
   - Full-text search on todo titles/descriptions
   - Todo categories and tags
   - Recurring todos (daily, weekly, monthly)
   - Todo priority levels
   - File attachments
   - Activity logs/audit trail
   - Email/SMS notifications for reminders
7. Performance Optimization
8. DevOps
9. Security Enhancements
10. Code Quality

---

## Assumptions Made

1. Single-User Context: Each todo belongs to exactly one owner (userId), but can be shared with multiple users via the sharedWith array.
2. Reminder Processing: The exercise asks to mark todos as REMINDER_DUE instead of sending actual emails. In production, this would integrate with an email service (SendGrid, AWS SES, etc.).
3. Soft Delete: Implemented deletedAt field for soft deletes, assuming todos should be recoverable. Hard deletes can be added if needed.
4. Pagination Defaults: Page defaults to 1, limit defaults to 10, maximum limit is 100 to prevent excessive data transfer.
5. Shared Todo Access: Users with shared access can view todos but cannot modify or delete them (read-only). Full permission system would be needed for write access.
6. Idempotency: Reminder processing is designed to be idempotent - running it multiple times on the same todos won't cause issues due to status checks.
7. Concurrency: With in-memory storage, there are no concurrency issues. With a real database, proper locking or optimistic concurrency control would be needed.
8. API Design: RESTful conventions followed (POST for create, GET for read, PUT/PATCH for update, DELETE for delete).
9. Error Recovery: Scheduler continues running even if individual reminder processing fails, with errors logged but not propagated.

---

## Challenges Faced

1. Understanding Intentional Bugs
2. Repository Pattern with In-Memory Storage
3. Type Safety with Partial Updates
4. Scheduler Error Handling
5. Testing Edge Cases

---

## Additional Comments

**_Design Decisions_**
**Repository Pattern**: The repository pattern is maintained throughout, making it easy to swap the in-memory implementation for a real database. All database logic is isolated in repository classes.
**Service Layer**: Business logic is kept in TodoService, separate from HTTP routing and data access. This separation makes the code testable and maintainable.
**Dependency Injection**: Dependencies are passed through constructors, making the code more flexible and easier to test with mocks.
**Error Handling Strategy**: Errors are thrown from services and caught in route handlers, where they're converted to appropriate HTTP responses. This keeps error handling consistent across the API.

**_Testing Strategy_**
All unit tests focus on business logic in TodoService. Integration tests would test the full stack including HTTP routes and repositories. The provided test suite passes completely with the implemented fixes.

**_Scalability Considerations_**
For 10x load, the first bottleneck would be the in-memory storage. Moving to PostgreSQL with connection pooling would be the first step. The scheduler would need to be replaced with a proper job queue (Bull/BullMQ) backed by Redis. Multiple application instances could then run behind a load balancer.
For the reminder processing specifically, a distributed lock mechanism (Redis or database-based) would prevent duplicate processing when running multiple instances.

**_Code Quality_**

- No any types used (except in catch blocks for unknown errors)
- All functions have explicit return types
- Consistent naming conventions (camelCase for variables/functions)
- Clear separation of concerns
- Comments added where logic might not be immediately obvious

**_What Went Well_**

- Successfully identified and fixed all major bugs
- Clean, maintainable code structure
- Comprehensive error handling
- All tests passing
- Production-ready pagination implementation
- Bonus feature (todo sharing) fully implemented

**_What Could Be Better_**

- Would benefit from integration tests
- Could add more comprehensive logging (Winston or Pino)
- OpenAPI/Swagger documentation would improve developer experience
- Docker setup would make deployment easier

Thank you for the opportunity to work on this exercise! I'm happy to discuss any aspect of my implementation in detail.
