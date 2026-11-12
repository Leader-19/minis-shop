
import { sheets, GOOGLE_SPREADSHEET_ID } from "@/lib/google-sheets";
import type { Admin } from "@/types/admin";

export class AdminRepository {
    private readonly range = "admins!A2:G";

    async findAll(): Promise<Admin[]> {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            range: this.range,
        });

        return (response.data.values ?? []).map((row) => this.mapRow(row));
    }

    async findByEmail(email: string): Promise<Admin | null> {
        const admins = await this.findAll();

        return admins.find(
            (admin) => admin.email.toLowerCase() === email.toLowerCase()
        ) ?? null;
    }

    async findById(id: string): Promise<Admin | null> {
        const admins = await this.findAll();

        return admins.find((admin) => admin.id === id) ?? null;
    }

    async create(admin: Admin): Promise<void> {
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            range: "admins!A:G",
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [[
                    admin.id,
                    admin.name,
                    admin.email,
                    admin.password_hash,
                    admin.role,
                    admin.status,
                    admin.created_at,
                ]],
            },
        });
    }

    private mapRow(row: string[]): Admin {
        return {
            id: row[0] ?? "",
            name: row[1] ?? "",
            email: row[2] ?? "",
            password_hash: row[3] ?? "",
            role: (row[4] ?? "admin") as Admin["role"],
            status: row[5] === "inactive" ? "inactive" : "active",
            created_at: row[6] ?? "",
        };
    }
}
