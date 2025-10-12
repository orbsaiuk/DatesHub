import ProductCard from "./ProductCard";

export default function ProductsGrid({ products, tenant }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} tenant={tenant} />
      ))}
    </div>
  );
}
