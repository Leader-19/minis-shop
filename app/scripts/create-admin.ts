
import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

loadEnvConfig(process.cwd());

async function main() {
    const { AdminRepository } = await import(
        "../../repositories"
    );

    const name = process.env.INITIAL_ADMIN_NAME;
    const email = process.env.INITIAL_ADMIN_EMAIL;
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!name || !email || !password) {
        throw new Error("Initial admin environment variables are missing");
    }

    if (password.length < 12) {
        throw new Error("Initial admin password must have at least 12 characters");
    }

    const repository = new AdminRepository();

    const existing = await repository.findByEmail(email);

    if (existing) {
        console.log("Admin account already exists:", email);
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await repository.create({
        id: randomUUID(),
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: "super_admin",
        status: "active",
        created_at: new Date().toISOString(),
    });

    console.log("Initial administrator created:", email);
}

main().catch((error) => {
    console.error("Admin setup failed:", error);
    process.exitCode = 1;
});
