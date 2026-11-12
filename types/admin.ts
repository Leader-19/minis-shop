
export type AdminRole = "super_admin" | "admin" | "manager";

export interface Admin {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: AdminRole;
    status: "active" | "inactive";
    created_at: string;
}

export interface AdminSession {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
}
