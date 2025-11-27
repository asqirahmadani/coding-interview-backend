import { ITodoRepository } from "./ITodoRepository";
import { IUserRepository } from "./IUserRepository";
import { Todo, TodoStatus } from "../domain/Todo";

export class TodoService {
  constructor(
    private todoRepo: ITodoRepository,
    private userRepo: IUserRepository
  ) {}

  /* 
  Create a new todo
  */
  async createTodo(data: {
    userId: string;
    title: string;
    description?: string;
    remindAt?: string | Date;
  }): Promise<Todo> {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Todo title cannot be empty");
    }

    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw new Error(`User with id ${data.userId} not found!`);
    }

    if (data.remindAt !== undefined) {
      data.remindAt =
        typeof data.remindAt === "string"
          ? new Date(data.remindAt)
          : (data.remindAt as Date);
    }

    const todo = await this.todoRepo.create({
      userId: data.userId,
      title: data.title,
      description: data.description,
      status: "PENDING",
      remindAt: data.remindAt ? data.remindAt : undefined,
    });

    return todo;
  }

  /* 
  Get a todo by id
  */
  async getTodoById(todoId: string): Promise<Todo | null> {
    return this.todoRepo.findById(todoId);
  }

  /* 
  Get all todos for a specific user
  */
  async getTodosByUser(userId: string): Promise<Todo[]> {
    return this.todoRepo.findByUserId(userId);
  }

  /* 
  Update a todo
  */
  async updateTodo(
    todoId: string,
    data: {
      title?: string;
      description?: string;
      status?: TodoStatus;
      remindAt?: string | Date;
    }
  ): Promise<Todo> {
    const todo = await this.todoRepo.findById(todoId);
    if (!todo) {
      throw new Error(`Todo with id ${todoId} not found!`);
    }

    if (data.title !== undefined && data.title.trim() === "") {
      throw new Error("Todo title cannot be empty");
    }

    const updates: Partial<Omit<Todo, "id" | "userId" | "createdAt">> = {};

    if (data.title !== undefined) {
      updates.title = data.title;
    }

    if (data.description !== undefined) {
      updates.description = data.description;
    }

    if (data.status !== undefined) {
      updates.status = data.status;
    }

    if (data.remindAt !== undefined) {
      updates.remindAt =
        typeof data.remindAt === "string"
          ? new Date(data.remindAt)
          : (data.remindAt as Date);
    }

    const updated = await this.todoRepo.update(todoId, updates);
    if (!updated) {
      throw new Error(`Failed to update todo ${todoId}`);
    }

    return updated;
  }

  /* 
  Mark a todo as complete
  */
  async completeTodo(todoId: string): Promise<Todo> {
    const todo = await this.todoRepo.findById(todoId);

    if (!todo) {
      throw new Error(`Todo with id ${todoId} not found!`);
    }

    if (todo.status == "DONE") {
      return todo;
    }

    const updated = await this.todoRepo.update(todoId, {
      status: "DONE",
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new Error(`Failed to update todo ${todoId}`);
    }

    return updated;
  }

  /* 
  Delete a todo
  */
  async deleteTodo(todoId: string): Promise<void> {
    const todo = await this.todoRepo.findById(todoId);
    if (!todo) {
      throw new Error(`Todo with id ${todoId} not found`);
    }

    await this.todoRepo.delete(todoId);
  }

  /* 
  Process reminders
  */
  async processReminders(): Promise<number> {
    const now = new Date();
    const dueTodos = await this.todoRepo.findDueReminders(now);
    let processed = 0;

    for (const todo of dueTodos) {
      try {
        await this.todoRepo.update(todo.id, {
          status: "REMINDER_DUE",
          updatedAt: new Date(),
        });
        processed++;
      } catch (error) {
        console.error(`Failed to process reminder for todo ${todo.id}:`, error);
      }
    }

    return processed;
  }
}
