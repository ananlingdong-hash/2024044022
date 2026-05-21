import { http } from "@/api/http"

export async function createMonitorTask(name: string, cronExpr: string) {
  const result = await http.post("/tasks", { name, cronExpr })
  return result.data as { id: string; name: string; cronExpr: string; enabled: boolean; createdAt: string }
}

export async function fetchMonitorTasks() {
  const result = await http.get("/tasks")
  return result.data as Array<{ id: string; name: string; cronExpr: string; enabled: boolean; createdAt: string }>
}
