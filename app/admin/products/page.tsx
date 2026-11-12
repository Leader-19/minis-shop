"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types/product";

type ProductForm = {
  category_id: string;
  name: string;
  description: string;
  price_usd: string;
  price_khr: string;
  stock: string;
  image_file_id: string;
  status: "active" | "inactive";
};

const emptyForm: ProductForm = {
  category_id: "",
  name: "",
  description: "",
  price_usd: "",
  price_khr: "",
  stock: "0",
  image_file_id: "",
  status: "active",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load products");
      }

      setProducts(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product.id);

    setForm({
      category_id: product.category_id,
      name: product.name,
      description: product.description,
      price_usd: String(product.price_usd),
      price_khr: String(product.price_khr),
      stock: String(product.stock),
      image_file_id: product.image_file_id,
      status: product.status,
    });

    setMessage("");
    setError("");
    setModalOpen(true);
  }

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      price_usd: Number(form.price_usd),
      price_khr: Number(form.price_khr),
      stock: Number(form.stock),
    };

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save product");
      }

      setMessage(
        editingId
          ? "Product updated successfully"
          : "Product created successfully",
      );

      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);

      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete product");
      }

      setMessage("Product deleted successfully");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category_id}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Product Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your shop products and inventory.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        {/* Notifications */}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {products.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Products</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {products.filter((p) => p.status === "active").length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {products.filter((p) => p.stock === 0).length}
            </p>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name or category..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {product.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {product.category_id || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          ${product.price_usd.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ៛{product.price_khr.toLocaleString()}
                        </p>
                      </td>

                      <td className="px-5 py-4">{product.stock}</td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            product.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="rounded-md border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(product)}
                            className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t px-5 py-4 text-xs text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Product" : "Create Product"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your product information below.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    required
                    minLength={2}
                    maxLength={150}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category ID
                  </label>
                  <input
                    value={form.category_id}
                    onChange={(e) => updateField("category_id", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                    placeholder="CAT001"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Price (USD) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_usd}
                    onChange={(e) => updateField("price_usd", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Price (KHR) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.price_khr}
                    onChange={(e) => updateField("price_khr", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Stock *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => updateField("stock", e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value as "active" | "inactive",
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Google Drive Image File ID
                </label>
                <input
                  value={form.image_file_id}
                  onChange={(e) => updateField("image_file_id", e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="Google Drive file ID (optional for now)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  We will add direct image upload in the next phase.
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
