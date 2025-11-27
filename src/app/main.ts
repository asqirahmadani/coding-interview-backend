import express, { Request, Response, NextFunction } from "express";

import { InMemoryUserRepository } from "../infra/InMemoryUserRepository";
import { InMemoryTodoRepository } from "../infra/InMemoryTodoRepository";
import { SimpleScheduler } from "../infra/SimpleScheduler";
import { TodoService } from "../core/TodoService";
import { createRouter } from "../api/routes";

async function bootstrap() {
  // Wire up dependencies
  const userRepo = new InMemoryUserRepository();
  const todoRepo = new InMemoryTodoRepository();
  const scheduler = new SimpleScheduler();
  const todoService = new TodoService(todoRepo, userRepo);

  console.log("Todo Reminder Service - Bootstrap Complete");
  console.log("Repositories and services initialized.");
  console.log("Note: HTTP server implementation left for candidate to add.");

  // Setup HTTP Server
  const app = express()
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

  const router = createRouter(todoService, userRepo);
  app.use("/api", router);
  app
    .get("/", (res: Response) => {
      res.json({
        message: "Todo Reminder Service API",
        version: "1.0.0",
        endpoints: {
          users: {
            getById: "GET /api/users/:id",
            getUserTodos: "GET /api/users/:id/todos",
            create: "POST /api/users",
          },
          todos: {
            getById: "GET /api/todos/:id",
            create: "POST /api/todos",
            update: "PUT /api/todos/:id",
            complete: "PATCH /api/todos/:id/complete",
            delete: "DELETE /api/todos/:id",
          },
          health: "GET /api/health",
        },
      });
    })

    .use((err: any, res: Response) => {
      console.error("Unhandled error:", err);
      res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    });

  // Setup Background Reminder Processing
  const REMINDER_CHECK_INTERVAL = 60000; // 60s
  scheduler.scheduleRecurring(
    "reminder-check",
    REMINDER_CHECK_INTERVAL,
    async () => {
      try {
        const now = new Date();
        console.log(`\n Processing reminders at ${now.toISOString()}`);

        const processedCount = await todoService.processReminders();

        if (processedCount > 0) {
          console.log(`Processed ${processedCount} reminder(s)`);
        } else {
          console.log("No reminders due at this time");
        }
      } catch (error) {
        console.error("Error processing reminders:", error);
      }
    }
  );

  console.log(
    `Reminder scheduler started (every ${REMINDER_CHECK_INTERVAL / 1000}s)`
  );

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || "localhost";

  const server = app.listen(PORT, () => {
    console.log(`🎉 Server is running!`);
    console.log(`📍 URL: http://${HOST}:${PORT}`);
  });

  // Graceful Shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Stop scheduler
    scheduler.stopAll();
    console.log("Scheduler stopped");

    // Close HTTP server
    server.close(() => {
      console.log("HTTP server closed");
      console.log("Shutdown complete. Goodbye!");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught errors
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("unhandledRejection");
  });
}

// Start the app
bootstrap().catch((error) => {
  console.error("Failed to bootstrap application:", error);
  process.exit(1);
});
// Candidate should implement HTTP server here
// Example: scheduler.scheduleRecurring('reminder-check', 60000, () => todoService.processReminders());

// TODO: Implement HTTP server with the following routes:
// GET /users/:id - Get user by ID
// GET /users/:userId/todos - Get all todos for a user
// POST /users - Create a new user
// GET /todos/:id - Get todo by ID
// POST /todos - Create a new todo
// POST /todos/:id/share - Share a todo with another user
// PUT /todos/:id - Update a todo
// DELETE /todos/:id - Delete a todo
