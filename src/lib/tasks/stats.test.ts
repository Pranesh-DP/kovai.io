import { describe, it, expect } from "vitest";
import { computeStats, getRecentActivity, filterTasks } from "./stats";
import { Task } from "@/types/task";

function mockTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    user_id: "user-1",
    title: "Test Task",
    notes: null,
    status: "planned",
    status_changed_at: new Date("2026-01-01T12:00:00Z").toISOString(),
    created_at: new Date("2026-01-01T10:00:00Z").toISOString(),
    updated_at: new Date("2026-01-01T12:00:00Z").toISOString(),
    ...overrides,
  };
}

describe("computeStats", () => {
  it("handles an empty task list correctly", () => {
    const stats = computeStats([]);
    expect(stats).toEqual({
      total: 0,
      planned: 0,
      inProgress: 0,
      complete: 0,
      completionPercent: 0,
    });
  });

  it("computes counts and rounded completion percentage", () => {
    const tasks: Task[] = [
      mockTask({ id: "1", status: "planned" }),
      mockTask({ id: "2", status: "in_progress" }),
      mockTask({ id: "3", status: "complete" }),
    ];

    const stats = computeStats(tasks);
    expect(stats.total).toBe(3);
    expect(stats.planned).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.complete).toBe(1);
    // 1 / 3 = 33.333% -> rounds to 33
    expect(stats.completionPercent).toBe(33);
  });

  it("calculates 100% completion when all tasks are complete", () => {
    const tasks: Task[] = [
      mockTask({ id: "1", status: "complete" }),
      mockTask({ id: "2", status: "complete" }),
    ];

    const stats = computeStats(tasks);
    expect(stats.completionPercent).toBe(100);
  });

  it("calculates 0% completion when no tasks are complete", () => {
    const tasks: Task[] = [
      mockTask({ id: "1", status: "planned" }),
      mockTask({ id: "2", status: "in_progress" }),
    ];

    const stats = computeStats(tasks);
    expect(stats.completionPercent).toBe(0);
  });
});

describe("getRecentActivity", () => {
  const taskA = mockTask({
    id: "A",
    title: "Task A",
    status_changed_at: "2026-01-01T10:00:00Z",
  });
  const taskB = mockTask({
    id: "B",
    title: "Task B",
    status_changed_at: "2026-01-03T10:00:00Z", // latest
  });
  const taskC = mockTask({
    id: "C",
    title: "Task C",
    status_changed_at: "2026-01-02T10:00:00Z",
  });

  it("sorts tasks by status_changed_at descending", () => {
    const recent = getRecentActivity([taskA, taskB, taskC]);
    expect(recent.map((t) => t.id)).toEqual(["B", "C", "A"]);
  });

  it("respects the limit argument", () => {
    const recent = getRecentActivity([taskA, taskB, taskC], 2);
    expect(recent.length).toBe(2);
    expect(recent.map((t) => t.id)).toEqual(["B", "C"]);
  });

  it("does not mutate the input array", () => {
    const original = [taskA, taskB, taskC];
    getRecentActivity(original);
    expect(original[0].id).toBe("A");
  });
});

describe("filterTasks", () => {
  const tasks: Task[] = [
    mockTask({ id: "1", title: "Write weekly report", status: "planned" }),
    mockTask({ id: "2", title: "Fix login bug", status: "in_progress" }),
    mockTask({ id: "3", title: "Review pull requests", status: "complete" }),
    mockTask({ id: "4", title: "Write unit tests", status: "complete" }),
  ];

  it("returns all tasks when status is 'all' and search is empty", () => {
    const filtered = filterTasks(tasks, "all", "");
    expect(filtered.length).toBe(4);
  });

  it("filters accurately by status", () => {
    const planned = filterTasks(tasks, "planned");
    expect(planned.length).toBe(1);
    expect(planned[0].id).toBe("1");

    const complete = filterTasks(tasks, "complete");
    expect(complete.length).toBe(2);
    expect(complete.map((t) => t.id)).toEqual(["3", "4"]);
  });

  it("searches title case-insensitively", () => {
    const results = filterTasks(tasks, "all", "REPORT");
    expect(results.length).toBe(1);
    expect(results[0].title).toBe("Write weekly report");
  });

  it("ignores surrounding whitespace in the search string", () => {
    const results = filterTasks(tasks, "all", "   report   ");
    expect(results.length).toBe(1);
    expect(results[0].title).toBe("Write weekly report");
  });

  it("combines status filter and title search correctly", () => {
    // Both 'Write weekly report' (planned) and 'Write unit tests' (complete) match 'write'
    const plannedWrite = filterTasks(tasks, "planned", "write");
    expect(plannedWrite.length).toBe(1);
    expect(plannedWrite[0].id).toBe("1");

    const completeWrite = filterTasks(tasks, "complete", "write");
    expect(completeWrite.length).toBe(1);
    expect(completeWrite[0].id).toBe("4");
  });

  it("returns empty array when no tasks match", () => {
    const results = filterTasks(tasks, "all", "nonexistent term");
    expect(results).toEqual([]);
  });
});

