
import { z } from "zod";
import { randomUUID } from "crypto";
import { ProductRepository } from "@/repositories/product.repository";

const productSchema = z.object({
    category_id: z.string().default(""),
    name: z.string().min(2).max(150),
    description: z.string().default(""),
    price_usd: z.coerce.number().min(0),
    price_khr: z.coerce.number().min(0),
    stock: z.coerce.number().int().min(0),
    image_file_id: z.string().default(""),
    status: z.enum(["active", "inactive"]).default("active"),
});

export class ProductService {
    constructor(
        private readonly repository: ProductRepository
    ) { }

    async getAllProducts() {
        return this.repository.findAll();
    }

    async getProductById(id: string) {
        return this.repository.findById(id);
    }

    async createProduct(input: unknown) {
        const validated = productSchema.parse(input);

        const product = {
            id: randomUUID(),
            ...validated,
            created_at: new Date().toISOString(),
        };

        await this.repository.create(product);

        return product;
    }

    async updateProduct(id: string, input: unknown) {
        const existing = await this.repository.findById(id);

        if (!existing) {
            return null;
        }

        const validated = productSchema.parse(input);

        const product = {
            id,
            ...validated,
            created_at: existing.created_at,
        };

        await this.repository.update(id, product);

        return product;
    }

    async deleteProduct(id: string) {
        const existing = await this.repository.findById(id);

        if (!existing) {
            return false;
        }

        await this.repository.delete(id);

        return true;
    }
}
