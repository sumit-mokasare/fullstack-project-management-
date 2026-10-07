// One place that decides what each project role can do.
// Role names match your backend: admin, project_admin, project_manger, member.
// Change true/false below to fit your rules.

export const ROLES = ["admin", "project_admin", "project_manger", "member"];

const NONE = {
  editProject: false,
  deleteProject: false,
  manageMembers: false,
  createTask: false,
  editTask: false,
  deleteTask: false,
  changeStatus: false,
  assignTask: false,
  addSubtask: false,
  toggleSubtask: false, // the tick button
  deleteSubtask: false,
  createNote: false,
  editNote: false,
  deleteNote: false,
};

const PERMISSIONS = {
  admin: {
    editProject: true,
    deleteProject: true,
    manageMembers: true,
    createTask: true,
    editTask: true,
    deleteTask: true,
    changeStatus: true,
    assignTask: true,
    addSubtask: true,
    toggleSubtask: true,
    deleteSubtask: true,
    createNote: true,
    editNote: true,
    deleteNote: true,
  },
  project_admin: {
    editProject: true,
    deleteProject: false,
    manageMembers: true,
    createTask: true,
    editTask: true,
    deleteTask: true,
    changeStatus: true,
    assignTask: true,
    addSubtask: true,
    toggleSubtask: true,
    deleteSubtask: true,
    createNote: true,
    editNote: true,
    deleteNote: true,
  },
  project_manger: {
    ...NONE,
    createTask: true,
    editTask: true,
    changeStatus: true,
    assignTask: true,
    addSubtask: true,
    toggleSubtask: true,
    deleteSubtask: true,
    createNote: true,
    editNote: true,
  },
  member: {
    ...NONE,
    changeStatus: true,
    toggleSubtask: true, // can tick subtasks, but can't add or delete them
  },
};

// Unknown or missing role gets no permissions.
export const getPermissions = (role) => PERMISSIONS[role] || NONE;

export const NO_PERMISSION_TEXT = "You don't have permission to do this";
