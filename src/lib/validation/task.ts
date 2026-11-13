import { z } from "zod";

const taskStatusEnum = z.enum(["planned", "in_progress", "complete"]);

const titleSchema = z
  .string()
  .trim()
  .min(1, { message: "Title is required" })
  .max(120, { message: "Title must be 120 characters or fewer" });

const notesSchema = z
  .string()
  .trim()
  .max(1000, { message: "Notes must be 1000 characters or fewer" })
  .optional()
  .nullable()
  .transform((val) => (!val || val === "" ? null : val));

export const createTaskSchema = z.object({
  title: titleSchema,
  notes: notesSchema,
  status: taskStatusEnum.default("planned"),
  clientId: z.string().uuid({ message: "Invalid client ID format" }).optional(),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid({ message: "Invalid task ID" }),
  title: titleSchema,
  notes: notesSchema,
});

export const updateStatusSchema = z.object({
  id: z.string().uuid({ message: "Invalid task ID" }),
  status: taskStatusEnum,
});

export const deleteTaskSchema = z.object({
  id: z.string().uuid({ message: "Invalid task ID" }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
