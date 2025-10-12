"use client";

import { useState, useEffect } from "react";
import DrectoryProductSkeleton from "./DrectoryProductSkeleton";
import ProductsHeader from "./ProductsHeader";
import ProductsGrid from "./ProductsGrid";
import ProductsPagination from "./ProductsPagination";
import EmptyProductsState from "./EmptyProductsState";

export default function DirectoryProductsSection({ tenant, tenantType }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    totalPages: 0,
  });

  const ITEMS_PER_PAGE = 6;

  const fetchProducts = async (page = 1) => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/products/tenant?tenantType=${tenantType}&tenantId=${tenant.id}&page=${page}&limit=${ITEMS_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.items) {
        setProducts(data.items);
        setStats(data.stats);
        setCurrentPage(page);
      } else {
        setProducts([]);
        setStats({ total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setStats({ total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset state when tenant changes
    setCurrentPage(1);
    setProducts([]);
    fetchProducts(1);
  }, [tenant?.id, tenantType]);

  const handlePageChange = (page) => {
    if (
      page !== currentPage &&
      page >= 1 &&
      page <= stats.totalPages &&
      !loading
    ) {
      fetchProducts(page);
      // Scroll to top of products section
      document.getElementById("products-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (loading) {
    return <DrectoryProductSkeleton />;
  }

  if (!products.length) {
    return <EmptyProductsState />;
  }

  return (
    <div id="products-section" className="space-y-6">
      <ProductsHeader total={stats.total} />

      <ProductsGrid products={products} tenant={tenant} />

      {/* Pagination Controls */}
      <ProductsPagination
        stats={stats}
        currentPage={currentPage}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
