
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AdminRepository } from "@/repositories/admin.repository";
import type { AdminSession } from "@/types/admin";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export class AuthService {
    constructor(
        private readonly repository: AdminRepository
    ) { }

    async login(input: unknown): Promise<AdminSession | null> {
        const data = loginSchema.parse(input);

        const admin = await this.repository.findByEmail(data.email);

        if (!admin || admin.status !== "active") {
            return null;
        }

        const validPassword = await bcrypt.compare(
            data.password,
            admin.password_hash
        );

        if (!validPassword) {
            return null;
        }

        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        };
    }
}
