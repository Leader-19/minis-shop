
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ProductRepository } from "@/repositories/product.repository";
import { ProductService } from "@/services/product.service";

const repository = new ProductRepository();
const service = new ProductService(repository);

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET /api/products/:id
export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const product = await service.getProductById(id);

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false, message: "Unable to retrieve product" },
            { status: 500 }
        );
    }
}

// PUT /api/products/:id
export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const product = await service.updateProduct(id, body);

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
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
            { success: false, message: "Unable to update product" },
            { status: 500 }
        );
    }
}

// DELETE /api/products/:id
export async function DELETE(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const deleted = await service.deleteProduct(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false, message: "Unable to delete product" },
            { status: 500 }
        );
    }
}
