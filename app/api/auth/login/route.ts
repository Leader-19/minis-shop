
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AdminRepository } from "@/repositories/admin.repository";
import { AuthService } from "@/services/auth.service";
import { createSession } from "@/lib/auth";

const service = new AuthService(new AdminRepository());

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const admin = await service.login(body);

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        await createSession(admin);

        return NextResponse.json({
            success: true,
            message: "Login successful",
            data: admin,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid login information",
                    errors: error.issues,
                },
                { status: 422 }
            );
        }

        console.error("Admin login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to login",
            },
            { status: 500 }
        );
    }
}
