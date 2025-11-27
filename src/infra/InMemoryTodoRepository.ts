import { Todo } from "../domain/Todo";
import { ITodoRepository } from "../core/ITodoRepository";

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

  async findDueReminders(currentTime: Date): Promise<Todo[]> {
    return this.todos.filter(
      (t) => t.remindAt && t.status === "PENDING" && t.remindAt <= currentTime
    );
  }
}
