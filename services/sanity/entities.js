import { writeClient } from "@/sanity/lib/serverClient";
import { uuid } from "@sanity/uuid";
import { ensureCategoriesExistAndGetRefs } from "./categories.js";
import {
  USER_COMPANY_MEMBERSHIPS_QUERY,
  COMPANY_DASHBOARD_QUERY,
  COMPANY_EDIT_QUERY,
} from "@/sanity/queries/company";
import {
  USER_SUPPLIER_MEMBERSHIPS_QUERY,
  SUPPLIER_DASHBOARD_QUERY,
  SUPPLIER_EDIT_QUERY,
} from "@/sanity/queries/supplier";

export async function createCompanyDocument(doc, tenantId) {
  const categoryRefs = await ensureCategoriesExistAndGetRefs(
    Array.isArray(doc.categories) ? doc.categories : []
  );

  const deterministicCompanyId = `company.${doc._id}`;
  const companyDoc = {
    _id: deterministicCompanyId,
    _type: "company",
    tenantType: "company",
    tenantId,
    name: doc.name,
    slug: {
      _type: "slug",
      current:
        doc.name
          ?.toLowerCase()
          ?.replace(/[^a-z0-9]+/g, "-")
          ?.replace(/(^-|-$)/g, "")
          ?.slice(0, 96) || tenantId,
    },
    logo: doc.logo || null,
    description: doc.description
      ? [
        {
          _key: uuid(),
          _type: "block",
          children: [{ _type: "span", _key: uuid(), text: doc.description }],
          markDefs: [],
        },
      ]
      : [],
    website: doc.website || null,
    totalEmployees: doc.totalEmployees || null,
    foundingYear: doc.foundingYear ? Number(doc.foundingYear) : null,
    registrationNumber:
      typeof doc.registrationNumber === "number"
        ? doc.registrationNumber
        : doc.registrationNumber
          ? Number(doc.registrationNumber)
          : null,
    socialLinks: doc.socialLinks || [],
    contact: doc.contact || null,
    companyType: doc.companyType || null,
    categories: categoryRefs.map((r) => ({ ...r, _key: uuid() })),
    extraServices: doc.extraServices,
    locations: Array.isArray(doc.locations)
      ? doc.locations.map((l) => ({
        _key: l?._key || uuid(),
        address: l?.address || null,
        city: l?.city || null,
        region: l?.region || null,
        country: l?.country || null,
        zipCode: l?.zipCode || null,
        geo: l?.geo || undefined,
      }))
      : [],
    openingHours: doc.openingHours,
  };

  return await writeClient.createIfNotExists(companyDoc);
}

export async function createSupplierDocument(doc, tenantId) {
  const categoryRefs = await ensureCategoriesExistAndGetRefs(
    Array.isArray(doc.categories) ? doc.categories : []
  );

  const deterministicSupplierId = `supplier.${doc._id}`;
  const supplierDoc = {
    _id: deterministicSupplierId,
    _type: "supplier",
    tenantType: "supplier",
    tenantId,
    name: doc.name,
    slug: {
      _type: "slug",
      current:
        doc.name
          ?.toLowerCase()
          ?.replace(/[^a-z0-9]+/g, "-")
          ?.replace(/(^-|-$)/g, "")
          ?.slice(0, 96) || tenantId,
    },
    logo: doc.logo || null,
    description: doc.description
      ? [
        {
          _key: uuid(),
          _type: "block",
          children: [{ _type: "span", _key: uuid(), text: doc.description }],
          markDefs: [],
        },
      ]
      : [],
    website: doc.website || null,
    foundingYear: doc.foundingYear ? Number(doc.foundingYear) : null,
    registrationNumber:
      typeof doc.registrationNumber === "number"
        ? doc.registrationNumber
        : doc.registrationNumber
          ? Number(doc.registrationNumber)
          : null,
    supplierType: doc.supplierType || null,
    contact: doc.contact || null,
    categories: categoryRefs.map((r) => ({ ...r, _key: uuid() })),
    extraServices: doc.extraServices,
    locations: Array.isArray(doc.locations)
      ? doc.locations.map((l) => ({
        _key: l?._key || uuid(),
        address: l?.address || null,
        city: l?.city || null,
        region: l?.region || null,
        country: l?.country || null,
        zipCode: l?.zipCode || null,
        geo: l?.geo || undefined,
      }))
      : [],
    openingHours: doc.openingHours,
  };

  return await writeClient.createIfNotExists(supplierDoc);
}

export async function getUserCompany(userId) {
  const user = await writeClient.fetch(USER_COMPANY_MEMBERSHIPS_QUERY, {
    userId,
  });
  return user?.memberships?.[0];
}

export async function getCompanyData(tenantId) {
  const company = await writeClient.fetch(COMPANY_DASHBOARD_QUERY, {
    tenantId,
  });
  return company;
}

export async function getUserSupplier(userId) {
  const user = await writeClient.fetch(USER_SUPPLIER_MEMBERSHIPS_QUERY, {
    userId,
  });
  return user?.memberships?.[0];
}

export async function getSupplierData(tenantId) {
  const supplier = await writeClient.fetch(SUPPLIER_DASHBOARD_QUERY, {
    tenantId,
  });
  return supplier;
}

export async function getSupplierEditData(tenantId) {
  return await writeClient.fetch(SUPPLIER_EDIT_QUERY, { tenantId });
}

export async function getCompanyEditData(tenantId) {
  return await writeClient.fetch(COMPANY_EDIT_QUERY, { tenantId });
}
