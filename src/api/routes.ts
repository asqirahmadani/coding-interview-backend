import express, { Request, Response } from "express";

import { IUserRepository } from "../core/IUserRepository";
import { TodoService } from "../core/TodoService";

export function createRouter(
  todoService: TodoService,
  userRepo: IUserRepository
) {
  const router = express
    .Router()

    // ==========================================
    // USER ROUTES
    // ==========================================

    /* 
    GET /users/:id - get user by id
    */
    .get("/users/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const user = await userRepo.findById(id);

        if (!user) {
          return res.status(404).json({
            error: `User with id ${id} not found!`,
          });
        }

        return res.status(202).json(user);
      } catch (error: any) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
          error: "Failed to fetch user",
          message: error.message,
        });
      }
    })

    /* 
    GET /users/:userId/todos - get all todos for a user
    */
    .get("/users/:userId/todos", async (req: Request, res: Response) => {
      try {
        const { userId } = req.params;
        const { page, limit } = req.query;

        const pageNum = page ? parseInt(page as string, 10) : 1;
        const limitNum = limit ? parseInt(limit as string, 10) : 10;

        const todos = await todoService.getTodosByUser(
          userId,
          pageNum,
          limitNum
        );
        return res.status(200).json(todos);
      } catch (error: any) {
        console.error("Error fetching user todos:", error);
        return res.status(500).json({
          error: "Failed to fetch todos",
          message: error.message,
        });
      }
    })

    /* 
    POST /users - create a new user
    */
    .post("/users", async (req: Request, res: Response) => {
      try {
        const { email, name } = req.body;

        if (!email || !name) {
          return res.status(400).json({
            error: "Email and name are required!",
          });
        }

        const user = await userRepo.create({ email, name });
        return res.status(201).json(user);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    })

    // ==========================================
    // TODO ROUTES
    // ==========================================

    /* 
    GET /todos/:id - get todo by id
    */
    .get("/todos/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const todo = await todoService.getTodoById(id);

        if (!todo) {
          return res.status(404).json({
            error: `Todo with id ${id} not found!`,
          });
        }

        return res.status(200).json(todo);
      } catch (error: any) {
        console.error("Error fetching todo:", error);
        return res.status(500).json({
          error: "Failed to fetch todo",
          message: error.message,
        });
      }
    })

    /* 
    POST /todos - create a new todo 
    */
    .post("/todos", async (req: Request, res: Response) => {
      try {
        const { userId, title, description, remindAt } = req.body;

        // Validation
        if (!userId || typeof userId !== "string") {
          return res.status(400).json({
            error: "UserId is required and must be a string!",
          });
        }

        if (!title || typeof title !== "string") {
          return res.status(400).json({
            error: "Title is required and must be a string!",
          });
        }

        const todo = await todoService.createTodo({
          userId,
          title,
          description,
          remindAt: remindAt ? new Date(remindAt).toISOString() : undefined,
        });

        return res.status(201).json(todo);
      } catch (error: any) {
        console.error("Error creating todo:", error);

        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
    })

    /* 
    POST /todos/:id/share - share a todo with another user
    */
    .post("/todos/:id/share", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { targetUserId } = req.body;

        if (!targetUserId || typeof targetUserId !== "string") {
          return res.status(400).json({
            error: "targetUserId is required and must be a string",
          });
        }

        const sharedTodo = await todoService.shareTodo(id, targetUserId);

        return res.status(200).json({
          message: `Todo successfully shared with user ${targetUserId}`,
          todo: sharedTodo,
        });
      } catch (error: any) {
        console.error("Error sharing todo:", error);

        if (error.message.includes("not found")) {
          return res.status(404).json({
            error: error.message,
          });
        }

        if (
          error.message.includes("already shared") ||
          error.message.includes("Cannot share")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Failed to share todo",
          message: error.message,
        });
      }
    })

    /* 
    PUT /todos/:id - update a todo
    */
    .put("/todos/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { title, description, status, remindAt } = req.body;

        let remindAtDate: Date | undefined | null;
        if (remindAt !== undefined) {
          if (remindAt === null) {
            remindAtDate = null;
          } else {
            remindAtDate = new Date(remindAt);
            if (isNaN(remindAtDate.getTime())) {
              return res.status(400).json({
                error: "Invalid remindAt date format",
              });
            }
          }
        }

        const todo = await todoService.updateTodo(id, {
          title,
          description,
          status,
          remindAt: remindAtDate ?? undefined,
        });

        return res.status(200).json(todo);
      } catch (error: any) {
        console.error("Error updating todo:", error);

        if (error.message.includes("not found")) {
          return res.status(404).json({
            error: error.message,
          });
        }

        return res.status(400).json({
          error: "Failed to update todo",
          message: error.message,
        });
      }
    })

    /* 
    PATCH /todos/:id/complete - mark todo as complete
    */
    .patch("/todos/:id/complete", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const todo = await todoService.completeTodo(id);
        return res.status(200).json(todo);
      } catch (error: any) {
        console.error("Error completing todo:", error);

        if (error.message.includes("not found")) {
          return res.status(404).json({
            error: error.message,
          });
        }

        return res.status(400).json({
          error: "Failed to update todo",
          message: error.message,
        });
      }
    })

    /* 
    DELETE /todos/:id/share/:userId - unshare a todo from a user
    */
    .delete("/todos/:id/share/:userId", async (req: Request, res: Response) => {
      try {
        const { id, userId } = req.params;

        const unsharedTodo = await todoService.unshareTodo(id, userId);

        return res.status(200).json({
          message: `Todo access revoked from user ${userId}`,
          todo: unsharedTodo,
        });
      } catch (error: any) {
        console.error("Error unsharing todo:", error);

        if (error.message.includes("not found")) {
          return res.status(404).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Failed to unshare todo",
          message: error.message,
        });
      }
    })

    /* 
    DELETE /todos/:id - delete a todo
    */
    .delete("/todos/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await todoService.deleteTodo(id);
        return res.status(204).send();
      } catch (error: any) {
        console.error("Error deleting todo:", error);

        if (error.message.includes("not found")) {
          return res.status(404).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Failed to delete todo",
          message: error.message,
        });
      }
    })

    // ==========================================
    // HEALTH CHECK
    // ==========================================

    .get("/health", (res: Response) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    });

  return router;
}
