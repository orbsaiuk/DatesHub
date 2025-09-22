"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const BreadcrumbContext = createContext();

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};

export const BreadcrumbProvider = ({ children }) => {
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState(null);
  const [showHome, setShowHome] = useState(true);

  const setBreadcrumbs = useCallback((breadcrumbs) => {
    setCustomBreadcrumbs(breadcrumbs);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setCustomBreadcrumbs(null);
  }, []);

  const toggleHome = useCallback((show) => {
    setShowHome(show);
  }, []);

  const addBreadcrumb = useCallback((breadcrumb) => {
    setCustomBreadcrumbs(prev => {
      if (!prev) return [breadcrumb];
      return [...prev, breadcrumb];
    });
  }, []);

  const removeBreadcrumb = useCallback((index) => {
    setCustomBreadcrumbs(prev => {
      if (!prev) return null;
      const newBreadcrumbs = prev.filter((_, i) => i !== index);
      return newBreadcrumbs.length === 0 ? null : newBreadcrumbs;
    });
  }, []);

  const updateBreadcrumb = useCallback((index, breadcrumb) => {
    setCustomBreadcrumbs(prev => {
      if (!prev) return null;
      const newBreadcrumbs = [...prev];
      newBreadcrumbs[index] = breadcrumb;
      return newBreadcrumbs;
    });
  }, []);

  const value = {
    customBreadcrumbs,
    showHome,
    setBreadcrumbs,
    clearBreadcrumbs,
    toggleHome,
    addBreadcrumb,
    removeBreadcrumb,
    updateBreadcrumb,
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};
