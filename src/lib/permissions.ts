// Every permission a role can be given. Keys must match those used in the
// database policies (supabase/migrations). Admins have all of them, and only
// admins can edit roles or make someone an admin.
export const PERMISSIONS = [
  { key: "manage_members", label: "Manage team members", description: "Change anyone's role, qualifications and active status." },
  { key: "manage_qualifications", label: "Manage qualifications", description: "Add and edit the list of qualifications." },
  { key: "manage_buildings", label: "Manage buildings", description: "Add and edit buildings." },
  { key: "manage_positions", label: "Manage positions", description: "Add and edit positions." },
  { key: "manage_events", label: "Manage events", description: "Schedule events and assign people to positions." },
  { key: "view_watch_list", label: "View watch list", description: "See people to watch for or who are banned." },
  { key: "manage_watch_list", label: "Manage watch list", description: "Add, edit and remove watch list entries." },
  { key: "view_incidents", label: "View all incident reports", description: "See every incident report, not just their own." },
  { key: "manage_incidents", label: "Manage incident reports", description: "Edit and close any incident report." },
] as const;

export type Permission = (typeof PERMISSIONS)[number]["key"];
