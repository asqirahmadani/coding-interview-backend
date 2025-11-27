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
    const todo = this.todos.find((t) => t.id === id);
    return todo || null;
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return this.todos.filter((t) => t.userId === userId).map((t) => ({ ...t }));
  }

  async delete(id: string): Promise<void> {
    const index = this.todos.findIndex((t) => t.id === id);

    if (index !== -1) {
      this.todos.splice(index, 1);
    }
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
