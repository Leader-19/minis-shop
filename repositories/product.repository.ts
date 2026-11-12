
import { sheets, GOOGLE_SPREADSHEET_ID } from "@/lib/google-sheets";
import { Product } from "@/types/product";

const RANGE = "products!A2:J";

export class ProductRepository {
    async findAll(): Promise<Product[]> {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values ?? [];

        return rows.map((row) => this.mapRow(row));
    }

    async findById(id: string): Promise<Product | null> {
        const products = await this.findAll();
        return products.find((product) => product.id === id) ?? null;
    }

    async create(product: Product): Promise<void> {
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            range: "products!A:J",
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [this.toRow(product)],
            },
        });
    }

    async update(id: string, product: Product): Promise<void> {
        const rowNumber = await this.findRowNumber(id);

        if (!rowNumber) {
            throw new Error("Product not found");
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            range: `products!A${rowNumber}:J${rowNumber}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [this.toRow(product)],
            },
        });
    }

    async delete(id: string): Promise<void> {
        const rowNumber = await this.findRowNumber(id);

        if (!rowNumber) {
            throw new Error("Product not found");
        }

        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            fields: "sheets.properties",
        });

        const sheet = spreadsheet.data.sheets?.find(
            (item) => item.properties?.title === "products"
        );

        const sheetId = sheet?.properties?.sheetId;

        if (sheetId === undefined || sheetId === null) {
            throw new Error("Products sheet not found");
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId,
                                dimension: "ROWS",
                                startIndex: rowNumber - 1,
                                endIndex: rowNumber,
                            },
                        },
                    },
                ],
            },
        });
    }

    private async findRowNumber(id: string): Promise<number | null> {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            range: "products!A2:A",
        });

        const rows = response.data.values ?? [];
        const index = rows.findIndex((row) => row[0] === id);

        return index === -1 ? null : index + 2;
    }

    private mapRow(row: string[]): Product {
        return {
            id: row[0] ?? "",
            category_id: row[1] ?? "",
            name: row[2] ?? "",
            description: row[3] ?? "",
            price_usd: Number(row[4] ?? 0),
            price_khr: Number(row[5] ?? 0),
            stock: Number(row[6] ?? 0),
            image_file_id: row[7] ?? "",
            status: row[8] === "inactive" ? "inactive" : "active",
            created_at: row[9] ?? "",
        };
    }

    private toRow(product: Product): (string | number)[] {
        return [
            product.id,
            product.category_id,
            product.name,
            product.description,
            product.price_usd,
            product.price_khr,
            product.stock,
            product.image_file_id,
            product.status,
            product.created_at,
        ];
    }
}
