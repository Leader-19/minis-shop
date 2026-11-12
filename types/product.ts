
export interface Product {
    id: string;
    category_id: string;
    name: string;
    description: string;
    price_usd: number;
    price_khr: number;
    stock: number;
    image_file_id: string;
    status: "active" | "inactive";
    created_at: string;
}

export type CreateProductInput = Omit<
    Product,
    "id" | "created_at"
>;
