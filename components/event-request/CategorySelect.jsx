"use client";

import { useState, useEffect } from "react";
import EventRequestSelect from "./EventRequestSelect";
import { Tag } from "lucide-react";

export default function CategorySelect({
  companyTenantId,
  setValue,
  trigger,
  error,
  hasValue,
  value,
}) {
  const [categories, setCategories] = useState([]);
  const [extraServices, setExtraServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch company categories and services
  useEffect(() => {
    if (companyTenantId) {
      fetchCompanyServices();
    }
  }, [companyTenantId]);

  const fetchCompanyServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/company/${companyTenantId}/services`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        setExtraServices(data.extraServices || []);
      }
    } catch (error) {
      console.error("Error fetching company services:", error);
    } finally {
      setLoading(false);
    }
  };

  const options = [
    ...categories.map((cat) => ({
      value: cat._id,
      label: cat.title,
    })),
    ...extraServices.map((service) => ({
      value: service,
      label: service,
    })),
  ];

  return (
    <EventRequestSelect
      name="category"
      label="نوع الخدمة المطلوبة"
      options={options}
      placeholder="اختر نوع الخدمة المطلوبة"
      icon={<Tag size={16} />}
      required={true}
      error={error}
      hasValue={hasValue}
      setValue={setValue}
      trigger={trigger}
      value={value}
      loading={loading}
    />
  );
}
