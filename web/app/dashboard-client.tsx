// LLM: Main dashboard — task list with filter, sort, create, edit, delete and stats.
"use client";

import { useEffect, useState, useMemo } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "@/lib/api";
import type { Task } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusIcon, PencilIcon, Trash2Icon, ClipboardListIcon, LoaderIcon, AlertCircleIcon, CalendarIcon, CheckCircle2Icon, CircleDotIcon, CircleIcon, ArrowUpDownIcon } from "lucide-react";

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type SortDir = "asc" | "desc" | "none";

interface FormState {
  title: string;
  description: string;
  status: Status;
  dueDate: string;
}

const defaultForm: FormState = { title: "", description: "", status: "TODO", dueDate: "" };

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  TODO: { label: "To Do", color: "bg-slate-100 text-slate-700 border-slate-200", icon: <CircleIcon className="size-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <CircleDotIcon className="size-3" /> },
  DONE: { label: "Done", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2Icon className="size-3" /> },
};

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function TaskForm({ values, onChange, onSubmit, saving, submitLabel, onCancel }: {
  values: FormState;
  onChange: (patch: Partial<FormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-1">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">LLM Title <span className="text-destructive">*</span></Label>
        <Input value={values.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="e.g. Design landing page" maxLength={100} required />
        <p className="text-xs text-muted-foreground text-right">{values.title.length}/100</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">LLM Description</Label>
        <Textarea value={values.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="Optional details about this task…" className="resize-none" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">LLM Status</Label>
          <Select value={values.status} onValueChange={(v) => onChange({ status: v as Status })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">LLM Due Date</Label>
          <Input type="date" value={values.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} />
        </div>
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderIcon className="size-3.5 animate-spin" />}
          {saving ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function DashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(defaultForm);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<FormState>(defaultForm);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // filter + sort state
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");
  const [sortDir, setSortDir] = useState<SortDir>("none");

  // LLM: Fetches all tasks from the API and updates state.
  async function loadTasks() {
    try {
      setLoading(true);
      setError("");
      setTasks(await getTasks());
    } catch {
      setError("Unable to load tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, []);

  // LLM: Submits the create form, shows a toast, and refreshes the list.
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.title.trim()) { toast.error("Please enter a task title"); return; }
    try {
      setSaving(true);
      await createTask({ title: createForm.title.trim(), description: createForm.description.trim() || undefined, status: createForm.status, dueDate: createForm.dueDate || undefined });
      toast.success("Task created!");
      setIsCreateOpen(false);
      setCreateForm(defaultForm);
      await loadTasks();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  // LLM: Submits the edit form, shows a toast, and refreshes the list.
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask || !editForm.title.trim()) { toast.error("Please enter a task title"); return; }
    try {
      setSaving(true);
      await updateTask(editingTask.id, { title: editForm.title.trim(), description: editForm.description.trim() || undefined, status: editForm.status, dueDate: editForm.dueDate || undefined });
      toast.success("Task updated!");
      setEditingTask(null);
      await loadTasks();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  }

  // LLM: Deletes the task pending confirmation, shows a toast, and refreshes the list.
  async function handleDelete() {
    if (!deletingId) return;
    try {
      await deleteTask(deletingId);
      toast.success("Task deleted");
      await loadTasks();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setEditForm({ title: task.title, description: task.description ?? "", status: task.status, dueDate: task.dueDate?.slice(0, 10) ?? "" });
  }

  function toggleSort() {
    setSortDir((d) => d === "none" ? "asc" : d === "asc" ? "desc" : "none");
  }

  const today = new Date().toISOString().slice(0, 10);

  const displayed = useMemo(() => {
    let list = filterStatus === "ALL" ? tasks : tasks.filter((t) => t.status === filterStatus);
    if (sortDir !== "none") {
      list = [...list].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return sortDir === "asc" ? a.dueDate.localeCompare(b.dueDate) : b.dueDate.localeCompare(a.dueDate);
      });
    }
    return list;
  }, [tasks, filterStatus, sortDir]);

  const todoCount = tasks.filter((t) => t.status === "TODO").length;
  const progressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  const statCards = [
    { label: "LLM Total Tasks", value: tasks.length, icon: <ClipboardListIcon className="size-5 text-slate-500" />, accent: "border-l-slate-400" },
    { label: "LLM To Do", value: todoCount, icon: <CircleIcon className="size-5 text-slate-500" />, accent: "border-l-slate-400" },
    { label: "LLM In Progress", value: progressCount, icon: <CircleDotIcon className="size-5 text-blue-500" />, accent: "border-l-blue-400" },
    { label: "LLM Completed", value: doneCount, icon: <CheckCircle2Icon className="size-5 text-emerald-500" />, accent: "border-l-emerald-400" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ClipboardListIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">LLM Task Manager</h1>
              <p className="text-sm text-slate-500">Organise and track your work</p>
            </div>
          </div>
          <Button onClick={() => { setCreateForm(defaultForm); setIsCreateOpen(true); }} className="gap-1.5 self-start sm:self-auto">
            <PlusIcon className="size-4" />
            LLM Create Task
          </Button>
        </header>

        {/* Stat Cards */}
        <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label} className={`border-l-4 ${s.accent}`}>
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</CardTitle>
                  {s.icon}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Task Table Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>LLM All Tasks</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {/* Filter */}
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as Status | "ALL")}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">LLM All Statuses</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
                {/* Sort */}
                <Button variant="outline" size="sm" onClick={toggleSort} className="gap-1.5 h-8 text-xs">
                  <ArrowUpDownIcon className="size-3.5" />
                  LLM Due Date{sortDir === "asc" ? " ↑" : sortDir === "desc" ? " ↓" : ""}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
                <LoaderIcon className="size-8 animate-spin" />
                <p className="text-sm">Loading tasks…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-red-500">
                <AlertCircleIcon className="size-8" />
                <p className="text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={loadTasks}>Retry</Button>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
                <ClipboardListIcon className="size-10 opacity-40" />
                <p className="text-sm font-medium">LLM: No tasks yet</p>
                <p className="text-xs">Click &quot;LLM Create Task&quot; to add your first task.</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                <p className="text-sm">No tasks match the selected filter.</p>
                <Button variant="outline" size="sm" onClick={() => setFilterStatus("ALL")}>Clear filter</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-[220px]">LLM Title</TableHead>
                    <TableHead>LLM Description</TableHead>
                    <TableHead className="w-[130px]">LLM Status</TableHead>
                    <TableHead className="w-[120px]">LLM Due Date</TableHead>
                    <TableHead className="w-[120px] text-right">LLM Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayed.map((task) => {
                    const isOverdue = task.status !== "DONE" && task.dueDate && task.dueDate.slice(0, 10) < today;
                    return (
                      <TableRow key={task.id} className={isOverdue ? "bg-red-50/50" : undefined}>
                        <TableCell className="font-medium text-slate-900">{task.title}</TableCell>
                        <TableCell className="max-w-[240px] truncate text-slate-500 text-sm">{task.description || <span className="text-slate-300">—</span>}</TableCell>
                        <TableCell><StatusBadge status={task.status} /></TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <span className={`inline-flex items-center gap-1 text-sm ${isOverdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
                              <CalendarIcon className="size-3.5 shrink-0" />
                              {task.dueDate.slice(0, 10)}
                              {isOverdue && <span className="text-xs text-red-500">(overdue)</span>}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            <Button variant="outline" size="icon-sm" onClick={() => openEdit(task)} title="Edit task">
                              <PencilIcon className="size-3.5" />
                            </Button>
                            <Button variant="destructive" size="icon-sm" onClick={() => setDeletingId(task.id)} title="Delete task">
                              <Trash2Icon className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) setCreateForm(defaultForm); setIsCreateOpen(open); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>LLM Create New Task</DialogTitle>
              <DialogDescription>Fill in the details below to add a new task.</DialogDescription>
            </DialogHeader>
            <TaskForm values={createForm} onChange={(p) => setCreateForm((prev) => ({ ...prev, ...p }))} onSubmit={handleCreate} saving={saving} submitLabel="Create Task" onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editingTask !== null} onOpenChange={(open) => { if (!open) setEditingTask(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>LLM Edit Task</DialogTitle>
              <DialogDescription>Update the details of your task.</DialogDescription>
            </DialogHeader>
            <TaskForm values={editForm} onChange={(p) => setEditForm((prev) => ({ ...prev, ...p }))} onSubmit={handleUpdate} saving={saving} submitLabel="Save Changes" onCancel={() => setEditingTask(null)} />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
          <DialogContent showCloseButton={false} className="max-w-sm">
            <DialogHeader>
              <div className="flex size-10 items-center justify-center rounded-full bg-red-100 mb-2">
                <Trash2Icon className="size-5 text-red-600" />
              </div>
              <DialogTitle>LLM Delete Task</DialogTitle>
              <DialogDescription>This action cannot be undone. The task will be permanently removed.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </main>
  );
}
