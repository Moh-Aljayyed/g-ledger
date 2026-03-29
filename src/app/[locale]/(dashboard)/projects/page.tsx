"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";

const PROJECT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PLANNING: { label: "تخطيط", color: "bg-gray-100 text-gray-700" },
  ACTIVE: { label: "نشط", color: "bg-blue-100 text-blue-700" },
  ON_HOLD: { label: "متوقف", color: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "مكتمل", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "ملغي", color: "bg-red-100 text-red-700" },
};

const TASK_STATUS_CONFIG: Record<string, { label: string; color: string; headerBg: string }> = {
  TODO: { label: "للتنفيذ", color: "bg-gray-100 text-gray-700", headerBg: "bg-gray-50" },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-blue-100 text-blue-700", headerBg: "bg-blue-50" },
  REVIEW: { label: "مراجعة", color: "bg-purple-100 text-purple-700", headerBg: "bg-purple-50" },
  DONE: { label: "منجز", color: "bg-green-100 text-green-700", headerBg: "bg-green-50" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "منخفض", color: "text-gray-500" },
  MEDIUM: { label: "متوسط", color: "text-blue-500" },
  HIGH: { label: "عالي", color: "text-orange-500" },
  URGENT: { label: "عاجل", color: "text-red-600" },
};

type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const utils = trpc.useUtils();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [taskProjectId, setTaskProjectId] = useState<string>("");

  const { data, isLoading } = trpc.projects.list.useQuery();
  const { data: stats } = trpc.projects.getStats.useQuery();
  const { data: projectDetail } = trpc.projects.getById.useQuery(
    { id: expandedProject! },
    { enabled: !!expandedProject }
  );

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => { utils.projects.invalidate(); setShowCreateModal(false); },
  });
  const addTaskMutation = trpc.projects.addTask.useMutation({
    onSuccess: () => { utils.projects.invalidate(); setShowTaskModal(false); },
  });
  const updateTaskMutation = trpc.projects.updateTask.useMutation({
    onSuccess: () => utils.projects.invalidate(),
  });
  const deleteTaskMutation = trpc.projects.deleteTask.useMutation({
    onSuccess: () => utils.projects.invalidate(),
  });
  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => utils.projects.invalidate(),
  });

  const [projectForm, setProjectForm] = useState({ name: "", description: "", budget: "", startDate: "", endDate: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "" });

  const handleCreateProject = () => {
    if (!projectForm.name.trim()) return;
    createMutation.mutate({
      name: projectForm.name,
      description: projectForm.description || undefined,
      budget: projectForm.budget ? parseFloat(projectForm.budget) : undefined,
      startDate: projectForm.startDate ? new Date(projectForm.startDate) : undefined,
      endDate: projectForm.endDate ? new Date(projectForm.endDate) : undefined,
    });
    setProjectForm({ name: "", description: "", budget: "", startDate: "", endDate: "" });
  };

  const handleAddTask = () => {
    if (!taskForm.title.trim() || !taskProjectId) return;
    addTaskMutation.mutate({
      projectId: taskProjectId,
      title: taskForm.title,
      description: taskForm.description || undefined,
      priority: taskForm.priority as any,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
    });
    setTaskForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
  };

  const formatNum = (n: number) => new Intl.NumberFormat("ar-SA").format(Math.round(n));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">المشاريع والمهام</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة المشاريع ومتابعة المهام</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg hover:bg-[#005bc4] text-sm font-medium transition-colors">
          + مشروع جديد
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">إجمالي المشاريع</div>
            <div className="text-2xl font-bold text-[#021544]">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">نشط</div>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">مكتمل</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">إجمالي الميزانية</div>
            <div className="text-2xl font-bold text-[#0070F2]">{formatNum(stats.totalBudget)} <span className="text-xs text-gray-400">{currency}</span></div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">المنصرف</div>
            <div className="text-2xl font-bold text-amber-600">{formatNum(stats.totalSpent)} <span className="text-xs text-gray-400">{currency}</span></div>
          </div>
        </div>
      )}

      {/* Project Cards */}
      <div className="space-y-4">
        {data?.projects.map((project) => {
          const statusConf = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.PLANNING;
          const totalTasks = project.tasks?.length ?? 0;
          const doneTasks = project.tasks?.filter((t) => t.status === "DONE").length ?? 0;
          const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
          const isExpanded = expandedProject === project.id;

          return (
            <div key={project.id} className="bg-white rounded-xl border overflow-hidden">
              {/* Project Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedProject(isExpanded ? null : project.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#021544]">{project.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConf.color}`}>{statusConf.label}</span>
                    </div>
                    {project.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{project.description}</p>}
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Progress */}
                    <div className="w-32">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span>التقدم</span>
                        <span>{doneTasks}/{totalTasks} مهام</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00C9A7] rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    {/* Budget */}
                    {Number(project.budget) > 0 && (
                      <div className="text-end">
                        <div className="text-xs text-gray-500">الميزانية</div>
                        <div className="text-sm font-bold text-[#021544]">{formatNum(Number(project.budget))} {currency}</div>
                      </div>
                    )}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded: Tasks Kanban */}
              {isExpanded && projectDetail && (
                <div className="border-t p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-700">المهام</h4>
                    <div className="flex gap-2">
                      <select
                        value={project.status}
                        onChange={(e) => updateProjectMutation.mutate({ id: project.id, status: e.target.value as ProjectStatus })}
                        className="px-2 py-1 border rounded text-xs bg-white"
                      >
                        {Object.entries(PROJECT_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <button
                        onClick={() => { setTaskProjectId(project.id); setShowTaskModal(true); }}
                        className="text-xs px-3 py-1 bg-[#0070F2] text-white rounded hover:bg-[#005bc4] transition-colors"
                      >
                        + مهمة
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const).map((taskStatus) => {
                      const tsConf = TASK_STATUS_CONFIG[taskStatus];
                      const tasks = projectDetail.tasks.filter((t) => t.status === taskStatus);
                      return (
                        <div key={taskStatus}>
                          <div className={`${tsConf.headerBg} rounded-t-lg px-3 py-2 border border-b-0`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-600">{tsConf.label}</span>
                              <span className="text-[10px] text-gray-400">{tasks.length}</span>
                            </div>
                          </div>
                          <div className="border border-t-0 rounded-b-lg bg-gray-50/30 p-2 space-y-2 min-h-[100px]">
                            {tasks.map((task) => {
                              const prConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                              return (
                                <div key={task.id} className="bg-white rounded-lg border p-2.5 hover:shadow-sm transition-shadow">
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="text-xs font-medium text-[#021544]">{task.title}</span>
                                    <button onClick={() => deleteTaskMutation.mutate({ id: task.id })} className="text-gray-300 hover:text-red-400 text-xs shrink-0">&times;</button>
                                  </div>
                                  {task.description && <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                                  <div className="flex items-center justify-between mt-2">
                                    <span className={`text-[10px] font-bold ${prConf.color}`}>{prConf.label}</span>
                                    {task.dueDate && <span className="text-[10px] text-gray-400">{new Date(task.dueDate).toLocaleDateString("ar-SA")}</span>}
                                  </div>
                                  {/* Move buttons */}
                                  <div className="flex gap-1 mt-2">
                                    {taskStatus !== "TODO" && (
                                      <button
                                        onClick={() => {
                                          const prev = { IN_PROGRESS: "TODO", REVIEW: "IN_PROGRESS", DONE: "REVIEW" } as const;
                                          updateTaskMutation.mutate({ id: task.id, status: prev[taskStatus as keyof typeof prev] });
                                        }}
                                        className="flex-1 text-[9px] py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
                                      >
                                        &rarr;
                                      </button>
                                    )}
                                    {taskStatus !== "DONE" && (
                                      <button
                                        onClick={() => {
                                          const next = { TODO: "IN_PROGRESS", IN_PROGRESS: "REVIEW", REVIEW: "DONE" } as const;
                                          updateTaskMutation.mutate({ id: task.id, status: next[taskStatus as keyof typeof next] });
                                        }}
                                        className="flex-1 text-[9px] py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                                      >
                                        &larr;
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {tasks.length === 0 && (
                              <div className="text-center text-[10px] text-gray-400 py-4">لا توجد مهام</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(!data?.projects || data.projects.length === 0) && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-400">لا توجد مشاريع بعد. ابدأ بإنشاء مشروع جديد.</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#021544]">مشروع جديد</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">اسم المشروع *</label>
                <input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="اسم المشروع" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                <textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="وصف المشروع" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ البداية</label>
                  <input type="date" value={projectForm.startDate} onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                  <input type="date" value={projectForm.endDate} onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الميزانية</label>
                <input type="number" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreateProject} disabled={createMutation.isPending || !projectForm.name.trim()} className="flex-1 px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005bc4] disabled:opacity-50 transition-colors">
                {createMutation.isPending ? "جاري الحفظ..." : "إنشاء المشروع"}
              </button>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#021544]">مهمة جديدة</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">عنوان المهمة *</label>
                <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="عنوان المهمة" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="تفاصيل المهمة" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الأولوية</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ الاستحقاق</label>
                  <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddTask} disabled={addTaskMutation.isPending || !taskForm.title.trim()} className="flex-1 px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005bc4] disabled:opacity-50 transition-colors">
                {addTaskMutation.isPending ? "جاري الحفظ..." : "إضافة المهمة"}
              </button>
              <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
