import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskCard } from "./TaskCard";
import { Task } from "@/types/task";

describe("Rendering safety (XSS prevention)", () => {
  it("renders script tags and HTML in title and notes as safe plain text", () => {
    const maliciousTask: Task = {
      id: "task-xss-1",
      user_id: "user-1",
      title: "<script>alert(1)</script>",
      notes: '<img src="x" onerror="alert(2)" />',
      status: "planned",
      status_changed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { container } = render(
      <TaskCard
        task={maliciousTask}
        onStatusChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    // The literal text strings must be present in the document
    expect(screen.getByText("<script>alert(1)</script>")).toBeDefined();
    expect(
      screen.getByText('<img src="x" onerror="alert(2)" />'),
    ).toBeDefined();

    // No actual <script> or <img> element should exist from the user content
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector('img[src="x"]')).toBeNull();
  });
});

