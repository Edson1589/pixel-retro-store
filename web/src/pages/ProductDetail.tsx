import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProduct } from "../services/api";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import ErrorCard from "../components/ErrorCard";

export default function ProductDetail() {
  // 👇 Cambié id → slug
  const { slug } = useParams<{ slug?: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem, cartError } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const p = await fetchProduct(slug);
        console.log("👉 PRODUCT:", p); // 👈 revisa que stock y condition estén aquí
        setProduct(p);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return <div className="p-6 text-center">Cargando producto...</div>;
  }

  if (error) {
    return <ErrorCard code={error} />;
  }

  if (!product) {
    return <div className="p-6 text-center">Producto no encontrado</div>;
  }

  const price =
    typeof product.price === "number"
      ? product.price
      : parseFloat(product.price || "0");

  const handleAdd = () => addItem(product, 1);

  // 🔥 traducción de condición
  const conditionMap: Record<string, string> = {
    new: "Nuevo",
    used: "Usado",
    refurbished: "Reacondicionado",
  };
  const conditionLabel = conditionMap[product.condition] ?? product.condition;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link
        to="/"
        className="text-sm text-gray-600 hover:text-black mb-6 inline-block"
      >
        ← Volver a la tienda
      </Link>

      {cartError && <ErrorCard code={cartError} />}

      <div className="md:grid md:grid-cols-[400px_1fr] gap-8 items-start bg-white rounded-2xl shadow-md p-6">
        {/* Imagen */}
        <div className="flex justify-center">
          <img
            src={product.image_url ?? "/placeholder.png"}
            alt={product.name}
            className="rounded-xl shadow-md max-h-[400px] object-contain"
          />
        </div>

        {/* Info producto */}
        <div>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

          <div className="text-2xl font-semibold text-green-600 mb-4">
            Bs. {price.toFixed(2)}
          </div>

          {product.description && (
            <p className="mb-6 text-gray-700 leading-relaxed">
              {product.description}
            </p>
          )}

          {product.category && (
            <div className="text-sm text-gray-500 mb-2">
              Categoría:{" "}
              <span className="font-medium">{product.category.name}</span>
            </div>
          )}

          {/* Stock y condición */}
          <div className="text-sm text-gray-500 mb-2">
            Stock: <span className="font-medium">{product.stock}</span>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            Condición: <span className="font-medium">{conditionLabel}</span>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={product.stock < 1}
              className="px-5 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-40"
            >
              {product.stock < 1 ? "Sin stock" : "Añadir al carrito"}
            </button>
            <Link
              to="/cart"
              className="px-5 py-3 rounded-xl border font-medium hover:bg-gray-100"
            >
              Ir al carrito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
