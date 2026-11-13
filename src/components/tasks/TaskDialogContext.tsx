"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Task } from "@/types/task";

const TaskFormDialog = dynamic(
  () => import("./TaskFormDialog").then((mod) => mod.TaskFormDialog),
  { ssr: false }
);

type TaskMutationCallback = (task: Task, mode: "create" | "edit") => void;

interface TaskDialogContextType {
  openCreateTask: (initialTitle?: string) => void;
  openEditTask: (task: Task) => void;
  registerOnTaskMutated: (callback: TaskMutationCallback) => () => void;
}

const TaskDialogContext = React.createContext<
  TaskDialogContextType | undefined
>(undefined);

export function TaskDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [initialTitle, setInitialTitle] = React.useState("");
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null);

  const listenersRef = React.useRef<Set<TaskMutationCallback>>(new Set());

  const openCreateTask = React.useCallback((title?: string) => {
    setMode("create");
    setTaskToEdit(null);
    setInitialTitle(title ?? "");
    setIsOpen(true);
  }, []);

  const openEditTask = React.useCallback((task: Task) => {
    setMode("edit");
    setTaskToEdit(task);
    setIsOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const registerOnTaskMutated = React.useCallback(
    (callback: TaskMutationCallback) => {
      listenersRef.current.add(callback);
      return () => {
        listenersRef.current.delete(callback);
      };
    },
    [],
  );

  const handleSuccess = React.useCallback(
    (task: Task, successMode: "create" | "edit") => {
      listenersRef.current.forEach((fn) => fn(task, successMode));
    },
    [],
  );

  // Global "n" keyboard shortcut to trigger Create Task
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "n" || e.key === "N") {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (isOpen) return;

        const target = e.target as HTMLElement | null;
        if (!target) return;

        const tagName = target.tagName.toLowerCase();
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "select" ||
          target.isContentEditable
        ) {
          return;
        }

        // Check if any dialog or modal is currently open in the DOM
        if (document.querySelector('[role="dialog"]')) {
          return;
        }

        e.preventDefault();
        openCreateTask();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, openCreateTask]);

  return (
    <TaskDialogContext.Provider
      value={{
        openCreateTask,
        openEditTask,
        registerOnTaskMutated,
      }}
    >
      {children}
      <TaskFormDialog
        isOpen={isOpen}
        onClose={closeDialog}
        mode={mode}
        initialTitle={initialTitle}
        taskToEdit={taskToEdit}
        onSuccess={handleSuccess}
      />
    </TaskDialogContext.Provider>
  );
}

export function useTaskDialog() {
  const context = React.useContext(TaskDialogContext);
  if (!context) {
    throw new Error("useTaskDialog must be used within a TaskDialogProvider");
  }
  return context;
}

