import { describe, it, expect } from "vitest";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  deleteTaskSchema,
} from "./task";

describe("createTaskSchema", () => {
  it("accepts valid input with all fields", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";
    const result = createTaskSchema.safeParse({
      title: "Complete the assessment",
      notes: "Follow all instructions carefully",
      status: "in_progress",
      clientId: validUuid,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Complete the assessment");
      expect(result.data.notes).toBe("Follow all instructions carefully");
      expect(result.data.status).toBe("in_progress");
      expect(result.data.clientId).toBe(validUuid);
    }
  });

  it("defaults status to 'planned' and notes to null when omitted", () => {
    const result = createTaskSchema.safeParse({
      title: "Write documentation",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("planned");
      expect(result.data.notes).toBeNull();
    }
  });

  it("fails on empty title with 'Title is required'", () => {
    const result = createTaskSchema.safeParse({
      title: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toContain("Title is required");
    }
  });

  it("fails on whitespace-only title with 'Title is required'", () => {
    const result = createTaskSchema.safeParse({
      title: "     ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toContain("Title is required");
    }
  });

  it("accepts a 1-character title", () => {
    const result = createTaskSchema.safeParse({
      title: "A",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a 120-character title", () => {
    const result = createTaskSchema.safeParse({
      title: "A".repeat(120),
    });
    expect(result.success).toBe(true);
  });

  it("fails on 121-character title with 'Title must be 120 characters or fewer'", () => {
    const result = createTaskSchema.safeParse({
      title: "A".repeat(121),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toContain("Title must be 120 characters or fewer");
    }
  });

  it("transforms empty string notes to null", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid title",
      notes: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });

  it("transforms whitespace-only notes to null", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid title",
      notes: "     ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });

  it("transforms null notes to null", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid title",
      notes: null,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });

  it("accepts 1000-character notes", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid title",
      notes: "N".repeat(1000),
    });

    expect(result.success).toBe(true);
  });

  it("fails on 1001-character notes with 'Notes must be 1000 characters or fewer'", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid title",
      notes: "N".repeat(1001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.notes).toContain("Notes must be 1000 characters or fewer");
    }
  });

  it("fails on invalid status", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid title",
      status: "archived",
    });

    expect(result.success).toBe(false);
  });

  it("fails on invalid uuid for clientId", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid title",
      clientId: "not-a-uuid",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts valid update input", () => {
    const result = updateTaskSchema.safeParse({
      id: validUuid,
      title: "Updated title",
      notes: "Updated notes",
    });
    expect(result.success).toBe(true);
  });

  it("fails on invalid task ID", () => {
    const result = updateTaskSchema.safeParse({
      id: "invalid-id",
      title: "Updated title",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateStatusSchema", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts valid status updates", () => {
    expect(
      updateStatusSchema.safeParse({ id: validUuid, status: "complete" })
        .success,
    ).toBe(true);
    expect(
      updateStatusSchema.safeParse({ id: validUuid, status: "in_progress" })
        .success,
    ).toBe(true);
    expect(
      updateStatusSchema.safeParse({ id: validUuid, status: "planned" }).success,
    ).toBe(true);
  });

  it("fails on bad status value", () => {
    expect(
      updateStatusSchema.safeParse({
        id: validUuid,
        status: "done",
      }).success,
    ).toBe(false);
  });
});

describe("deleteTaskSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      deleteTaskSchema.safeParse({
        id: "123e4567-e89b-12d3-a456-426614174000",
      }).success,
    ).toBe(true);
  });

  it("rejects non-UUID", () => {
    expect(deleteTaskSchema.safeParse({ id: "123" }).success).toBe(false);
  });
});
