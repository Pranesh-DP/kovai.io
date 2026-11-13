import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as React from "react";
import { TaskCard } from "./TaskCard";
import { useTaskMutations } from "@/lib/tasks/useTaskMutations";
import * as actions from "@/lib/tasks/actions";
import { Task } from "@/types/task";

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

// Mock actions
vi.mock("@/lib/tasks/actions", () => ({
  updateTaskStatus: vi.fn(),
}));

const mockTask: Task = {
  id: "task-100",
  user_id: "user-1",
  title: "Test Status Control Task",
  notes: "Some notes",
  status: "planned",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status_changed_at: new Date().toISOString(),
};

// Test wrapper combining TaskCard and useTaskMutations
function TaskCardStatusTestContainer({ initialTask }: { initialTask: Task }) {
  const [tasks, setTasks] = React.useState<Task[]>([initialTask]);
  const { handleStatusChange, pendingIds } = useTaskMutations(setTasks);

  const currentTask = tasks.find((t) => t.id === initialTask.id) ?? initialTask;

  return (
    <div>
      <div data-testid="current-status">{currentTask.status}</div>
      <TaskCard
        task={currentTask}
        isPending={pendingIds.has(currentTask.id)}
        onStatusChange={handleStatusChange}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    </div>
  );
}

describe("Task Status Control & Rollback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("calls handler with the right status when clicked", async () => {
    const onStatusChange = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onStatusChange={onStatusChange}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    // Segmented radio options: index 0 = planned, 1 = in_progress, 2 = complete
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(3);

    // Click "In Progress" (index 1)
    fireEvent.click(radios[1]);
    expect(onStatusChange).toHaveBeenCalledWith(mockTask, "in_progress");

    // Click "Complete" (index 2)
    fireEvent.click(radios[2]);
    expect(onStatusChange).toHaveBeenCalledWith(mockTask, "complete");
  });

  it("updates status optimistically and persists when action succeeds", async () => {
    vi.mocked(actions.updateTaskStatus).mockResolvedValue({
      ok: true,
      data: {
        ...mockTask,
        status: "in_progress",
      },
    });

    render(<TaskCardStatusTestContainer initialTask={mockTask} />);

    expect(screen.getByTestId("current-status").textContent).toBe("planned");

    const radios = screen.getAllByRole("radio");
    // Click "In Progress"
    fireEvent.click(radios[1]);

    // Optimistically updated
    expect(screen.getByTestId("current-status").textContent).toBe("in_progress");
    expect(actions.updateTaskStatus).toHaveBeenCalledWith({
      id: mockTask.id,
      status: "in_progress",
    });

    await waitFor(() => {
      expect(screen.getByTestId("current-status").textContent).toBe(
        "in_progress",
      );
    });
  });

  it("rolls back to previous status and shows error toast when action fails", async () => {
    vi.mocked(actions.updateTaskStatus).mockResolvedValue({
      ok: false,
      code: "unknown",
      message: "Database error updating status",
    });

    render(<TaskCardStatusTestContainer initialTask={mockTask} />);

    expect(screen.getByTestId("current-status").textContent).toBe("planned");

    const radios = screen.getAllByRole("radio");
    // Click "In Progress"
    fireEvent.click(radios[1]);

    // Immediately updates optimistically
    expect(screen.getByTestId("current-status").textContent).toBe("in_progress");

    // After action rejects, state must roll back to "planned"
    await waitFor(() => {
      expect(screen.getByTestId("current-status").textContent).toBe("planned");
    });

    // Check error toast was fired with Retry action
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        message: "Database error updating status",
        action: expect.objectContaining({
          label: "Retry",
        }),
      }),
    );
  });
});
