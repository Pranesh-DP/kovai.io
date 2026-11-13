"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Circle, CircleDot, CheckCircle2, AlertCircle } from "lucide-react";
import { Task, TaskStatus } from "@/types/task";
import { createTaskSchema, updateTaskSchema } from "@/lib/validation/task";
import { createTask, updateTask } from "@/lib/tasks/actions";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useOnlineStatus } from "@/lib/utils/useOnlineStatus";

export interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialTitle?: string;
  taskToEdit?: Task | null;
  onSuccess?: (task: Task, mode: "create" | "edit") => void;
}

const STATUS_OPTIONS: {
  status: TaskStatus;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}[] = [
  { status: "planned", label: "Planned", icon: Circle },
  { status: "in_progress", label: "In Progress", icon: CircleDot },
  { status: "complete", label: "Complete", icon: CheckCircle2 },
];

const DRAFT_TITLE_KEY = "clearpane_draft_title";

export function TaskFormDialog({
  isOpen,
  onClose,
  mode,
  initialTitle = "",
  taskToEdit,
  onSuccess,
}: TaskFormDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isOnline = useOnlineStatus();

  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("planned");

  const [fieldErrors, setFieldErrors] = React.useState<{
    title?: string;
    notes?: string;
  }>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Client ID for idempotent creates
  const [clientId, setClientId] = React.useState<string>("");

  const titleInputRef = React.useRef<HTMLInputElement>(null);

  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);
  const [prevTaskToEdit, setPrevTaskToEdit] = React.useState(taskToEdit);
  const [prevMode, setPrevMode] = React.useState(mode);
  const [prevInitialTitle, setPrevInitialTitle] = React.useState(initialTitle);

  // Synchronize state during render when dialog opens or taskToEdit/mode/initialTitle changes
  if (
    isOpen !== prevIsOpen ||
    taskToEdit !== prevTaskToEdit ||
    mode !== prevMode ||
    initialTitle !== prevInitialTitle
  ) {
    setPrevIsOpen(isOpen);
    setPrevTaskToEdit(taskToEdit);
    setPrevMode(mode);
    setPrevInitialTitle(initialTitle);

    if (isOpen) {
      setServerError(null);
      setFieldErrors({});

      if (mode === "edit" && taskToEdit) {
        setTitle(taskToEdit.title);
        setNotes(taskToEdit.notes ?? "");
        setStatus(taskToEdit.status);
      } else {
        // Create mode: prefer passed initialTitle, else check sessionStorage
        let defaultTitle = initialTitle;
        if (!defaultTitle) {
          try {
            if (typeof window !== "undefined") {
              const draft = sessionStorage.getItem(DRAFT_TITLE_KEY);
              if (draft) {
                defaultTitle = draft;
                sessionStorage.removeItem(DRAFT_TITLE_KEY);
              }
            }
          } catch {
            // ignore storage errors
          }
        }

        setTitle(defaultTitle);
        setNotes("");
        setStatus("planned");
        setClientId(
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "",
        );
      }
    }
  }

  // Auto-focus title input on open
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Determine if form is dirty (has unsaved modifications)
  const isDirty = React.useMemo(() => {
    if (mode === "edit" && taskToEdit) {
      return (
        title !== taskToEdit.title || notes !== (taskToEdit.notes ?? "")
      );
    }
    return title.trim().length > 0 || notes.trim().length > 0;
  }, [mode, taskToEdit, title, notes]);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (isSaving) return;

    setServerError(null);
    setFieldErrors({});

    // Client-side validation using the shared Zod schemas
    if (mode === "create") {
      const validation = createTaskSchema.safeParse({
        title,
        notes,
        status,
        clientId: clientId || undefined,
      });

      if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        setFieldErrors({
          title: errors.title?.[0],
          notes: errors.notes?.[0],
        });
        return;
      }

      setIsSaving(true);
      try {
        const res = await createTask(validation.data);

        if (!res.ok) {
          if (res.code === "unauthenticated") {
            try {
              sessionStorage.setItem(DRAFT_TITLE_KEY, title);
            } catch {
              // ignore
            }
            showToast({
              message: "Your session has expired. Please sign in again.",
              type: "error",
            });
            const currentPath =
              typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "/dashboard";
            router.push(`/login?next=${encodeURIComponent(currentPath)}`);
            return;
          }

          if (res.code === "validation" && res.fieldErrors) {
            setFieldErrors({
              title: res.fieldErrors.title?.[0],
              notes: res.fieldErrors.notes?.[0],
            });
            setServerError(res.message);
          } else {
            setServerError(res.message);
          }
          return;
        }

        // Success
        setClientId(crypto.randomUUID());
        showToast({
          message: "Task created",
          type: "success",
        });
        onSuccess?.(res.data, "create");
        onClose();
      } catch (err) {
        console.error("Create task exception:", err);
        setServerError("A network error occurred. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Edit mode
      if (!taskToEdit) return;

      const validation = updateTaskSchema.safeParse({
        id: taskToEdit.id,
        title,
        notes,
      });

      if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        setFieldErrors({
          title: errors.title?.[0],
          notes: errors.notes?.[0],
        });
        return;
      }

      setIsSaving(true);
      try {
        const res = await updateTask(validation.data);

        if (!res.ok) {
          if (res.code === "unauthenticated") {
            showToast({
              message: "Your session has expired. Please sign in again.",
              type: "error",
            });
            const currentPath =
              typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "/dashboard";
            router.push(`/login?next=${encodeURIComponent(currentPath)}`);
            return;
          }

          if (res.code === "validation" && res.fieldErrors) {
            setFieldErrors({
              title: res.fieldErrors.title?.[0],
              notes: res.fieldErrors.notes?.[0],
            });
            setServerError(res.message);
          } else {
            setServerError(res.message);
          }
          return;
        }

        // Success
        showToast({
          message: "Task updated",
          type: "success",
        });
        onSuccess?.(res.data, "edit");
        onClose();
      } catch (err) {
        console.error("Update task exception:", err);
        setServerError("A network error occurred. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create Task" : "Edit Task"}
      description={
        mode === "create"
          ? "Add a new task to your workspace."
          : "Update the title or notes for this task."
      }
      closeOnClickOutside={!isDirty && !isSaving}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 mt-2">
        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Title Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="task-title-input"
              className="text-xs font-medium text-slate-200"
            >
              Title <span className="text-indigo-400">*</span>
            </label>
            {title.length > 100 && (
              <span
                className={`text-[11px] font-mono ${
                  title.length >= 120 ? "text-amber-400" : "text-slate-400"
                }`}
              >
                {title.length}/120
              </span>
            )}
          </div>
          <input
            ref={titleInputRef}
            id="task-title-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) {
                setFieldErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isSaving}
            maxLength={120}
            placeholder="e.g. Prepare client onboarding notes"
            aria-invalid={!!fieldErrors.title}
            aria-describedby={
              fieldErrors.title ? "task-title-error" : undefined
            }
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/60 border text-slate-100 placeholder-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              fieldErrors.title
                ? "border-red-500/60 focus:border-red-500"
                : "border-white/10 focus:border-indigo-400/50"
            }`}
          />
          {fieldErrors.title && (
            <p
              id="task-title-error"
              role="alert"
              className="text-xs text-red-400 mt-0.5"
            >
              {fieldErrors.title}
            </p>
          )}
        </div>

        {/* Notes Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="task-notes-input"
              className="text-xs font-medium text-slate-200"
            >
              Notes{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                notes.length >= 1000 ? "text-amber-400" : "text-slate-400"
              }`}
            >
              {notes.length}/1000
            </span>
          </div>
          <textarea
            id="task-notes-input"
            rows={4}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (fieldErrors.notes) {
                setFieldErrors((prev) => ({ ...prev, notes: undefined }));
              }
            }}
            disabled={isSaving}
            maxLength={1000}
            placeholder="Add any extra context or details…"
            aria-invalid={!!fieldErrors.notes}
            aria-describedby={
              fieldErrors.notes ? "task-notes-error" : undefined
            }
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900/60 border text-slate-100 placeholder-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
              fieldErrors.notes
                ? "border-red-500/60 focus:border-red-500"
                : "border-white/10 focus:border-indigo-400/50"
            }`}
          />
          {fieldErrors.notes && (
            <p
              id="task-notes-error"
              role="alert"
              className="text-xs text-red-400 mt-0.5"
            >
              {fieldErrors.notes}
            </p>
          )}
        </div>

        {/* Status Selector (Create mode only) */}
        {mode === "create" && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-200">
              Initial Status
            </span>
            <div
              role="radiogroup"
              aria-label="Initial task status"
              className="flex items-center p-1 rounded-xl bg-slate-900/60 border border-white/10 gap-1"
            >
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.status;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.status}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSaving}
                    onClick={() => setStatus(opt.status)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                      isSelected
                        ? "bg-white/15 text-white shadow-sm border border-white/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isSelected
                          ? opt.status === "complete"
                            ? "text-emerald-400"
                            : opt.status === "in_progress"
                              ? "text-indigo-400"
                              : "text-slate-300"
                          : "text-slate-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions row: Cancel & Save */}
        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isSaving || !isOnline}
            title={!isOnline ? "Cannot save changes while offline" : undefined}
          >
            {mode === "create" ? "Create Task" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
