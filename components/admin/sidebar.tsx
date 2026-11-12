
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminSession } from "@/types/admin";

const navigation = [
    { label: "Dashboard", href: "/admin", icon: "▦" },
    { label: "Products", href: "/admin/products", icon: "□" },
    { label: "Categories", href: "/admin/categories", icon: "▤" },
    { label: "Orders", href: "/admin/orders", icon: "▣" },
    { label: "Customers", href: "/admin/customers", icon: "♙" },
    { label: "Inventory", href: "/admin/inventory", icon: "▥" },
    { label: "Banners", href: "/admin/banners", icon: "▧" },
    { label: "Reports", href: "/admin/reports", icon: "▨" },
    { label: "Settings", href: "/admin/settings", icon: "⚙" },
    { label: "Admin Users", href: "/admin/users", icon: "♙" },
];

export default function AdminSidebar({
    admin,
}: {
    admin: AdminSession;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    async function logout() {
        setLoggingOut(true);

        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.replace("/admin/login");
            router.refresh();
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <>
            <div className="flex items-center justify-between border-b bg-slate-950 p-4 text-white md:hidden">
                <span className="font-bold">STORE ADMIN</span>

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-lg border border-slate-700 px-3 py-2"
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>
            </div>

            <aside
                className={`${
                    menuOpen ? "block" : "hidden"
                } w-full shrink-0 bg-slate-950 text-white md:flex md:min-h-screen md:w-64 md:flex-col`}
            >
                <div className="border-b border-slate-800 p-6">
                    <h2 className="text-lg font-bold">GOOGLE SHOP</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Administration Panel
                    </p>
                </div>

                <nav className="flex-1 space-y-1 p-3">
                    {navigation.map((item) => {
                        const active = item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                                    active
                                        ? "bg-blue-600 font-semibold text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 p-4">
                    <p className="truncate text-sm font-semibold">
                        {admin.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                        {admin.role}
                    </p>

                    <button
                        onClick={logout}
                        disabled={loggingOut}
                        className="mt-4 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
                    >
                        {loggingOut ? "Logging out..." : "Sign Out"}
                    </button>
                </div>
            </aside>
        </>
    );
}
