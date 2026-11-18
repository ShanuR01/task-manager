
const API_URL = "http://localhost:3000";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: Task["status"];
  dueDate?: string;
}

// LLM: Retrieves all tasks from the backend.
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
}

// LLM: Creates a new task through the backend API.
export async function createTask(data: CreateTaskData): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
}

// LLM: Updates an existing task through the backend API.
export async function updateTask(
  id: string,
  data: Partial<CreateTaskData>
): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return response.json();
}

// LLM: Deletes a task through the backend API.
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
}
