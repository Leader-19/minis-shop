
import Link from "next/link";
import { AdminRepository } from "@/repositories/admin.repository";
import { ProductRepository } from "@/repositories/product.repository";

export default async function DashboardPage() {
    const [products, admins] = await Promise.all([
        new ProductRepository().findAll(),
        new AdminRepository().findAll(),
    ]);

    const activeProducts = products.filter(
        (product) => product.status === "active"
    );

    const outOfStock = products.filter(
        (product) => product.stock === 0
    );

    const stats = [
        {
            title: "Total Products",
            value: products.length,
            color: "text-blue-600",
        },
        {
            title: "Active Products",
            value: activeProducts.length,
            color: "text-green-600",
        },
        {
            title: "Out of Stock",
            value: outOfStock.length,
            color: "text-red-600",
        },
        {
            title: "Admin Accounts",
            value: admins.length,
            color: "text-purple-600",
        },
    ];

    return (
        <div className="p-6 lg:p-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Welcome to your store administration panel.
                </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-xl border bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm text-slate-500">
                            {stat.title}
                        </p>

                        <p className={`mt-3 text-3xl font-bold ${stat.color}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-xl border bg-white p-6">
                <h2 className="text-lg font-semibold">
                    Quick Actions
                </h2>

                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        href="/admin/products"
                        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Manage Products
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="rounded-lg border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                    >
                        Manage Categories
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="rounded-lg border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                    >
                        View Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}
