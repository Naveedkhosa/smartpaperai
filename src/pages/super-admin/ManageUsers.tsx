import React, { useMemo, useState } from "react";
import {
  UserCog,
  User,
  Shield,
  Layers,
  School,
  MoreHorizontal,
  Filter,
  Search,
  RefreshCcw,
  Edit3,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from "lucide-react";
import SuperAdminLayout from "../../components/SuperAdminLayout";

type Status = "Active" | "Pending" | "Blocked";

type Teacher = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: Status;
  classes: string[];
};

type Student = {
  id: string;
  name: string;
  className: string;
  teacher: string;
  status: Status;
};

const teacherColumns = [
  { label: "Name", icon: User },
  { label: "Email" },
  { label: "Role", icon: Shield },
  { label: "Status" },
  { label: "Classes", icon: Layers },
  { label: "Actions" },
];

const studentColumns = [
  { label: "Name", icon: User },
  { label: "Class", icon: School },
  { label: "Teacher", icon: User },
  { label: "Status" },
  { label: "Actions" },
];

const statusColors: Record<Status, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Blocked: "bg-rose-50 text-rose-700",
};

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: "t1", name: "Jane Doe", email: "jane@school.edu", role: "Teacher", status: "Active", classes: ["Grade 10", "Grade 11"] },
    { id: "t2", name: "Michael Lee", email: "m.lee@school.edu", role: "Teacher", status: "Pending", classes: ["Grade 9"] },
    { id: "t3", name: "Sara Khan", email: "sara.khan@school.edu", role: "Teacher", status: "Blocked", classes: ["Grade 8"] },
  ]);
  const [students, setStudents] = useState<Student[]>([
    { id: "s1", name: "Alex Kim", className: "Grade 9", teacher: "Ms. Patel", status: "Active" },
    { id: "s2", name: "Priya Singh", className: "Grade 10", teacher: "Jane Doe", status: "Pending" },
    { id: "s3", name: "David Chen", className: "Grade 8", teacher: "Sara Khan", status: "Blocked" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [classFilter, setClassFilter] = useState<string>("All");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formClass, setFormClass] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [formRole, setFormRole] = useState("Teacher");
  const [formTargetId, setFormTargetId] = useState<string | null>(null);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setClassFilter("All");
    setActionMenu(null);
  };

  const allClasses = useMemo(() => {
    const teacherClasses = teachers.flatMap((t) => t.classes);
    const studentClasses = students.map((s) => s.className);
    return ["All", ...Array.from(new Set([...teacherClasses, ...studentClasses]))];
  }, [teachers, students]);
  const classOptions = useMemo(() => allClasses.filter((c) => c !== "All"), [allClasses]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesClass = classFilter === "All" || t.classes.includes(classFilter);
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [teachers, search, statusFilter, classFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      const matchesClass = classFilter === "All" || s.className === classFilter;
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [students, search, statusFilter, classFilter]);

  const toggleStatus = (id: string, type: "teacher" | "student") => {
    if (type === "teacher") {
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: t.status === "Blocked" ? "Active" : "Blocked" } : t))
      );
    } else {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: s.status === "Blocked" ? "Active" : "Blocked" } : s))
      );
    }
    setActionMenu(null);
  };

  const resetPassword = (id: string) => {
    console.info("Reset password for", id);
    setActionMenu(null);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormTargetId(null);
    setFormName("");
    setFormEmail("");
    setFormClass(classOptions[0] || "");
    setFormTeacher("");
    setFormRole("Teacher");
    setModalOpen(true);
  };

  const openEditModal = (row: Teacher | Student) => {
    setIsEditing(true);
    setFormTargetId(row.id);
    setFormName(row.name);
    if ("email" in row) setFormEmail(row.email);
    if ("classes" in row) setFormClass(row.classes[0] || classOptions[0] || "");
    if ("className" in row) setFormClass(row.className);
    if ("teacher" in row) setFormTeacher(row.teacher);
    if ("role" in row) setFormRole(row.role);
    setModalOpen(true);
    setActionMenu(null);
  };

  const handleSaveUser = () => {
    if (!formName.trim()) return;
    if (activeTab === "teachers") {
      if (isEditing && formTargetId) {
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === formTargetId ? { ...t, name: formName, email: formEmail, role: formRole, classes: formClass ? [formClass] : [] } : t
          )
        );
      } else {
        setTeachers((prev) => [
          { id: `t-${Date.now()}`, name: formName, email: formEmail || "teacher@example.com", role: formRole, status: "Active", classes: formClass ? [formClass] : [] },
          ...prev,
        ]);
      }
    } else {
      if (isEditing && formTargetId) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === formTargetId ? { ...s, name: formName, className: formClass || "Unassigned", teacher: formTeacher || "TBD" } : s
          )
        );
      } else {
        setStudents((prev) => [
          { id: `s-${Date.now()}`, name: formName, className: formClass || "Unassigned", teacher: formTeacher || "TBD", status: "Active" },
          ...prev,
        ]);
      }
    }
    setModalOpen(false);
  };

  const deleteUser = (id: string, type: "teacher" | "student") => {
    if (type === "teacher") setTeachers((prev) => prev.filter((t) => t.id !== id));
    else setStudents((prev) => prev.filter((s) => s.id !== id));
    setActionMenu(null);
  };

  const renderStatus = (status: Status) => (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusColors[status]}`}>
      {status}
    </span>
  );

  const rows = activeTab === "teachers" ? filteredTeachers : filteredStudents;
  const columns = activeTab === "teachers" ? teacherColumns : studentColumns;

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500">Teachers & Students · interactive glass UI with working controls.</p>
        </header>

        <div className="glass-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 pt-4">
            <button
              onClick={() => setActiveTab("teachers")}
              className={`px-3 py-2 text-sm font-semibold rounded-lg ${
                activeTab === "teachers" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Teachers
              </div>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-3 py-2 text-sm font-semibold rounded-lg ${
                activeTab === "students" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Students
              </div>
            </button>
            <div className="ml-auto flex flex-wrap gap-2">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email"
                  className="h-10 w-52 rounded-lg border border-white/40 bg-white/50 backdrop-blur pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-300"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | "All")}
                className="h-10 rounded-[10px] border border-white/40 bg-white/50 backdrop-blur px-3 text-sm text-slate-700"
              >
                {["All", "Active", "Pending", "Blocked"].map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-10 rounded-[10px] border border-white/40 bg-white/50 backdrop-blur px-3 text-sm text-slate-700"
              >
                {allClasses.map((c) => (
                  <option key={c} value={c}>
                    Class: {c}
                  </option>
                ))}
              </select>
              <button
                onClick={resetFilters}
                className="h-10 rounded-[10px] border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-emerald-400 hover:text-emerald-700 inline-flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={openAddModal}
                className="h-10 rounded-[10px] bg-[#2563eb] text-white px-3 py-2 text-sm font-semibold shadow hover:bg-[#1d4ed8]"
              >
                {activeTab === "teachers" ? "Add Teacher" : "Add Student"}
              </button>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="overflow-hidden rounded-[12px] border border-white/40 bg-white/30 backdrop-blur shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-white/40 text-slate-500 border-b border-white/50">
                  <tr>
                    {columns.map((c) => (
                      <th key={c.label} className="px-4 py-3 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          {c.icon && <c.icon className="h-4 w-4 text-slate-400" />}
                          {c.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/40">
                      {activeTab === "teachers" ? (
                        <>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-200" />
                              <div className="font-semibold text-slate-900">{(row as Teacher).name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{(row as Teacher).email}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-slate-400" />
                              {(row as Teacher).role}
                            </div>
                          </td>
                          <td className="px-4 py-3">{renderStatus((row as Teacher).status)}</td>
                          <td className="px-4 py-3">{(row as Teacher).classes.join(", ") || "—"}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-200" />
                              <div className="font-semibold text-slate-900">{(row as Student).name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4 text-slate-400" />
                              {(row as Student).className}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              {(row as Student).teacher}
                            </div>
                          </td>
                          <td className="px-4 py-3">{renderStatus((row as Student).status)}</td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === row.id ? null : row.id)}
                          className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-200"
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </button>
                        {actionMenu === row.id && (
                          <div className="absolute right-2 mt-2 w-44 glass-compact p-2 text-sm z-10">
                            <button
                              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-white/50"
                              onClick={() => openEditModal(row)}
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </button>
                            {activeTab === "teachers" && (
                              <button
                                className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-white/50"
                                onClick={() => resetPassword(row.id)}
                              >
                                <RefreshCcw className="h-4 w-4" />
                                Reset Password
                              </button>
                            )}
                            <button
                              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-white/50 text-rose-600"
                              onClick={() => toggleStatus(row.id, activeTab === "teachers" ? "teacher" : "student")}
                            >
                              {((row as Teacher).status === "Blocked" || (row as Student).status === "Blocked") ? (
                                <>
                                  <ToggleRight className="h-4 w-4" />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-4 w-4" />
                                  Block
                                </>
                              )}
                            </button>
                            <button
                              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-white/50 text-rose-600"
                              onClick={() => deleteUser(row.id, activeTab === "teachers" ? "teacher" : "student")}
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500">
                        No users match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="glass-card max-w-lg w-full p-6 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                {isEditing ? "Edit User" : activeTab === "teachers" ? "Add Teacher" : "Add Student"}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <label className="text-slate-600">Name</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/40 bg-white/60 backdrop-blur px-3"
                    placeholder="Full name"
                  />
                </div>
                {activeTab === "teachers" && (
                  <div className="space-y-1">
                    <label className="text-slate-600">Email</label>
                    <input
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/40 bg-white/60 backdrop-blur px-3"
                      placeholder="Email"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-slate-600">Class</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/40 bg-white/60 backdrop-blur px-3"
                  >
                    {classOptions.length === 0 && <option value="">No classes available</option>}
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {activeTab === "students" && (
                  <div className="space-y-1">
                    <label className="text-slate-600">Teacher</label>
                    <input
                      value={formTeacher}
                      onChange={(e) => setFormTeacher(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/40 bg-white/60 backdrop-blur px-3"
                      placeholder="Teacher name"
                    />
                  </div>
                )}
                {activeTab === "teachers" && (
                  <div className="space-y-1">
                    <label className="text-slate-600">Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/40 bg-white/60 backdrop-blur px-3"
                    >
                      <option>Teacher</option>
                      <option>Admin</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-white/50 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="rounded-lg bg-[#2563eb] text-white px-4 py-2 text-sm font-semibold shadow hover:bg-[#1d4ed8]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}

