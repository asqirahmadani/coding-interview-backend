import { IScheduler } from "../core/IScheduler";

export class SimpleScheduler implements IScheduler {
  private intervals = new Map<string, NodeJS.Timeout>();

  scheduleRecurring(
    name: string,
    intervalMs: number,
    fn: () => void | Promise<void>
  ): void {
    // avoid duplicate schedule
    if (this.intervals.has(name)) {
      console.warn(`Task ${name} already scheduled, stopping previous`);
    }

    const wrappedFn = async () => {
      try {
        await fn();
      } catch (error) {
        console.error(`Error in scheduled task ${name}:`, error);
      }
    };

    const interval = setInterval(wrappedFn, intervalMs);
    this.intervals.set(name, interval);

    console.log(`Scheduled task '${name}' to run every ${intervalMs}ms`);
  }

  stop(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
      console.log(`Stopped task '${name}'`);
    }
  }

  stopAll(): void {
    for (const name of this.intervals.keys()) {
      this.stop(name);
    }
  }
}
