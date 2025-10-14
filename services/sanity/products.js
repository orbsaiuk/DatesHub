import { writeClient } from "@/sanity/lib/serverClient";

// Get products for a company
export async function getCompanyProducts(tenantId) {
  try {
    const query = `*[_type == "product" && tenantType == "company" && tenantId == $tenantId] | order(_createdAt desc) {
      _id,
      _createdAt,
      title,
      description,
      price,
      quantity,
      currency,
      weightUnit,
      image {
        asset-> {
          _id,
          _ref,
          url
        }
      },
      company-> {
        _id,
        name
      }
    }`;

    const items = await writeClient.fetch(query, { tenantId });

    const stats = {
      total: items.length,
    };

    return { items, stats };
  } catch (error) {
    return { items: [], stats: { total: 0 } };
  }
}

// Get products for a supplier
export async function getSupplierProducts(tenantId) {
  try {
    const query = `*[_type == "product" && tenantType == "supplier" && tenantId == $tenantId] | order(_createdAt desc) {
      _id,
      _createdAt,
      title,
      description,
      price,
      quantity,
      currency,
      weightUnit,
      image {
        asset-> {
          _id,
          _ref,
          url
        }
      },
      supplier-> {
        _id,
        name
      }
    }`;

    const items = await writeClient.fetch(query, { tenantId });

    const stats = {
      total: items.length,
    };

    return { items, stats };
  } catch (error) {
    return { items: [], stats: { total: 0 } };
  }
}

// Create a new product
export async function createProduct(productData) {
  try {
    const doc = {
      _type: "product",
      tenantType: productData.tenantType,
      tenantId: productData.originalTenantId, // Use the original tenant slug
      title: productData.title,
      description: productData.description
        ? [
            {
              _key: Math.random().toString(36).substring(2, 11),
              _type: "block",
              children: [
                {
                  _key: Math.random().toString(36).substring(2, 11),
                  _type: "span",
                  text: productData.description,
                },
              ],
            },
          ]
        : undefined,
      price: productData.price ? parseFloat(productData.price) : 0,
      quantity: productData.quantity ? parseFloat(productData.quantity) : 0,
      currency: productData.currency || "SAR",
      weightUnit: productData.weightUnit || "kg",
      image: productData.imageAsset
        ? {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: productData.imageAsset._id,
            },
          }
        : undefined,
      // Add tenant reference for additional querying capabilities
      [productData.tenantType]: {
        _type: "reference",
        _ref: productData.tenantId, // This is the document ID
      },
      createdAt: new Date().toISOString(),
    };

    const result = await writeClient.create(doc);
    return result;
  } catch (error) {
    throw error;
  }
}

// Get products for a tenant (company or supplier)
export async function getProductsForTenant(
  tenantType,
  tenantId,
  page = 1,
  limit = 6
) {
  try {
    if (!tenantType || !tenantId)
      return { items: [], stats: { total: 0, page: 1, totalPages: 0 } };

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count first
    const countQuery = `count(*[_type == "product" && tenantType == $tenantType && tenantId == $tenantId])`;
    const total = await writeClient.fetch(countQuery, { tenantType, tenantId });

    // Get paginated items using Sanity's slice syntax
    const query = `*[_type == "product" && tenantType == $tenantType && tenantId == $tenantId] | order(_createdAt desc) [$offset...${offset + limit}] {
      _id,
      _createdAt,
      title,
      description,
      price,
      quantity,
      currency,
      weightUnit,
      image {
        asset-> {
          _id,
          _ref,
          url
        }
      },
      company-> {
        _id,
        name
      },
      supplier-> {
        _id,
        name
      }
    }`;

    const items = await writeClient.fetch(query, {
      tenantType,
      tenantId,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    const stats = {
      total,
      page,
      totalPages,
      limit,
    };

    return { items, stats };
  } catch (error) {
    return { items: [], stats: { total: 0, page: 1, totalPages: 0 } };
  }
}

// Delete product
export async function deleteProduct(productId) {
  try {
    const result = await writeClient.delete(productId);
    return result;
  } catch (error) {
    throw error;
  }
}
// Update product
export async function updateProduct(productId, updateData) {
  try {
    const updates = {
      title: updateData.title,
      price: updateData.price ? parseFloat(updateData.price) : 0,
      quantity: updateData.quantity ? parseFloat(updateData.quantity) : 0,
      currency: updateData.currency || "SAR",
      weightUnit: updateData.weightUnit || "kg",
      updatedAt: new Date().toISOString(),
    };

    // Handle description update
    if (updateData.description !== undefined) {
      updates.description = updateData.description
        ? [
            {
              _key: `block-${Date.now()}-${Math.random().toString(36)}`,
              _type: "block",
              children: [
                {
                  _key: `span-${Date.now()}-${Math.random().toString(36)}`,
                  _type: "span",
                  text: updateData.description,
                },
              ],
            },
          ]
        : [];
    }

    // Handle image update
    if (updateData.imageAsset) {
      updates.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: updateData.imageAsset._id,
        },
      };
    }

    const result = await writeClient.patch(productId).set(updates).commit();

    return result;
  } catch (error) {
    throw error;
  }
}
