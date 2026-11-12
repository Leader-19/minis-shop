import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ProductRepository } from "@/repositories/product.repository";
import { ProductService } from "@/services/product.service";
import { requireAdmin } from "@/lib/api-auth";

const repository = new ProductRepository();
const service = new ProductService(repository);

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const products = await service.getAllProducts();

        return NextResponse.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false, message: "Unable to retrieve products" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const body = await request.json();
        const product = await service.createProduct(body);

        return NextResponse.json(
            {
                success: true,
                message: "Product created successfully",
                data: product,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: error.issues,
                },
                { status: 422 }
            );
        }

        console.error(error);

        return NextResponse.json(
            { success: false, message: "Unable to create product" },
            { status: 500 }
        );
    }
}