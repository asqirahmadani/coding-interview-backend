import { ITodoRepository } from "../core/ITodoRepository";
import { Todo } from "../domain/Todo";

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];

  async create(
    todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ): Promise<Todo> {
    const id = `todo-${Math.floor(Math.random() * 1000000)}`;
    const now = new Date();

    const todo: Todo = {
      ...todoData,
      id,
      createdAt: now,
      updatedAt: now,
      sharedWith: [],
    };

    this.todos.push(todo);
    return todo;
  }

  async update(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    this.todos[index] = {
      ...this.todos[index],
      ...updates,
      updatedAt: new Date(),
    };

    return this.todos[index];
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = this.todos.find((t) => t.id === id && !t.deletedAt);
    return todo || null;
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<Todo[]> {
    const valiPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);

    const skip = (valiPage - 1) * validLimit;

    const userTodos = this.todos
      .filter(
        (t) =>
          !t.deletedAt &&
          (t.userId === userId ||
            (t.sharedWith && t.sharedWith.includes(userId)))
      )
      .map((t) => ({ ...t }));

    return userTodos.slice(skip, skip + validLimit);
  }

  async delete(id: string): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    this.todos[index] = {
      ...this.todos[index],
      deletedAt: new Date(),
    };

    return this.todos[index];
  }

  async shareTodo(todoId: string, targetUserId: string): Promise<Todo | null> {
    const todo = await this.findById(todoId);

    if (!todo) {
      return null;
    }

    const sharedWith = todo.sharedWith || [];

    if (sharedWith.includes(targetUserId)) {
      return { ...todo };
    }

    const updatedSharedWith = [...sharedWith, targetUserId];

    return this.update(todoId, { sharedWith: updatedSharedWith });
  }

  async unshareTodo(
    todoId: string,
    targetUserId: string
  ): Promise<Todo | null> {
    const todo = await this.findById(todoId);

    if (!todo) {
      return null;
    }

    if (!todo.sharedWith || todo.sharedWith.length === 0) {
      return { ...todo };
    }

    const updatedSharedWith = todo.sharedWith.filter(
      (id) => id !== targetUserId
    );

    return this.update(todoId, { sharedWith: updatedSharedWith });
  }

  async findDueReminders(currentTime: Date): Promise<Todo[]> {
    return this.todos.filter(
      (t) => t.remindAt && t.status === "PENDING" && t.remindAt <= currentTime
    );
  }
}
