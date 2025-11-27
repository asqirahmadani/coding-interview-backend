import { Todo } from "../domain/Todo";

export interface ITodoRepository {
  create(todo: Omit<Todo, "id" | "createdAt" | "updatedAt">): Promise<Todo>;
  update(
    id: string,
    updates: Partial<Omit<Todo, "id" | "userId" | "createdAt">>
  ): Promise<Todo | null>;
  findById(id: string): Promise<Todo | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<Todo[]>;
  delete(id: string): Promise<Todo | null>;
  shareTodo(todoId: string, targetUserId: string): Promise<Todo | null>;
  unshareTodo(todoId: string, targetUserId: string): Promise<Todo | null>;
  findDueReminders(currentTime: Date): Promise<Todo[]>;
}
