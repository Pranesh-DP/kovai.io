import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listTasks, AuthError } from "@/lib/tasks/queries";
import { TaskBoard } from "@/components/tasks/TaskBoard";

export const instant = false;

export const metadata: Metadata = {
  title: "Tasks",
  description: "Organize, filter, search, and update your tasks with calm clarity.",
};

export default async function TasksPage() {
  let tasks;
  try {
    tasks = await listTasks();
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }
    // Let other errors trigger the error boundary
    throw error;
  }

  return <TaskBoard initialTasks={tasks} />;
}
