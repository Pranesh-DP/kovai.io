import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TaskFormDialog } from "./TaskFormDialog";
import * as actions from "@/lib/tasks/actions";
import type { ActionResult } from "@/lib/tasks/actions";
import type { Task } from "@/types/task";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock Toast
const mockShowToast = vi.fn();
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({
    showToast: mockShowToast,
    dismissToast: vi.fn(),
  }),
}));

// Mock online status
vi.mock("@/lib/utils/useOnlineStatus", () => ({
  useOnlineStatus: () => true,
}));

// Mock server actions
vi.mock("@/lib/tasks/actions", () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
}));

describe("TaskFormDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("shows 'Title is required' when submitted with empty title", async () => {
    render(
      <TaskFormDialog
        isOpen={true}
        onClose={vi.fn()}
        mode="create"
      />,
    );

    const submitBtn = screen.getByRole("button", { name: "Create Task" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const errorMsg = screen.getByText("Title is required");
      expect(errorMsg).toBeDefined();
      expect(document.body.contains(errorMsg)).toBe(true);
    });
    expect(actions.createTask).not.toHaveBeenCalled();
  });

  it("shows 'Title is required' when submitted with whitespace-only title", async () => {
    render(
      <TaskFormDialog
        isOpen={true}
        onClose={vi.fn()}
        mode="create"
      />,
    );

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "     " } });

    const submitBtn = screen.getByRole("button", { name: "Create Task" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const errorMsg = screen.getByText("Title is required");
      expect(errorMsg).toBeDefined();
      expect(document.body.contains(errorMsg)).toBe(true);
    });
    expect(actions.createTask).not.toHaveBeenCalled();
  });

  it("shows error when title exceeds 120 characters", async () => {
    render(
      <TaskFormDialog
        isOpen={true}
        onClose={vi.fn()}
        mode="create"
      />,
    );

    const titleInput = screen.getByLabelText(/Title/i);
    const longTitle = "a".repeat(121);
    fireEvent.change(titleInput, { target: { value: longTitle } });

    const submitBtn = screen.getByRole("button", { name: "Create Task" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const errorMsg = screen.getByText("Title must be 120 characters or fewer");
      expect(errorMsg).toBeDefined();
      expect(document.body.contains(errorMsg)).toBe(true);
    });
    expect(actions.createTask).not.toHaveBeenCalled();
  });

  it("calls createTask exactly once even if Save is clicked repeatedly while saving", async () => {
    let resolveAction: (val: ActionResult<Task>) => void;
    const delayedPromise = new Promise<ActionResult<Task>>((resolve) => {
      resolveAction = resolve;
    });

    vi.mocked(actions.createTask).mockReturnValue(delayedPromise);

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <TaskFormDialog
        isOpen={true}
        onClose={onClose}
        mode="create"
        onSuccess={onSuccess}
      />,
    );

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "Deliberate Task" } });

    const submitBtn = screen.getByRole("button", { name: "Create Task" });

    // Click repeatedly
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);

    // Verify createTask was only called once
    expect(actions.createTask).toHaveBeenCalledTimes(1);

    // Resolve the promise
    resolveAction!({
      ok: true,
      data: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        user_id: "user-1",
        title: "Deliberate Task",
        notes: null,
        status: "planned",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status_changed_at: new Date().toISOString(),
      },
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
