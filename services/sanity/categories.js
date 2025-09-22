import { writeClient } from "@/sanity/lib/serverClient";
import { uuid } from "@sanity/uuid";

export async function ensureCategoriesExistAndGetRefs(input = []) {
  if (!Array.isArray(input) || input.length === 0) return [];

  const stringTitles = [];
  const refIds = [];

  for (const item of input) {
    if (typeof item === "string" && item.trim()) {
      stringTitles.push(item.trim());
      continue;
    }
    if (item && typeof item === "object") {
      // Support either reference objects or objects with a title
      if (typeof item.title === "string" && item.title.trim()) {
        stringTitles.push(item.title.trim());
        continue;
      }
      if (item._type === "reference" && typeof item._ref === "string") {
        refIds.push(item._ref);
        continue;
      }
    }
  }

  const uniqueTitles = Array.from(new Set(stringTitles));
  const refsFromInput = Array.from(new Set(refIds)).map((_ref) => ({
    _type: "reference",
    _ref,
  }));

  // Fast-path: only references provided
  if (uniqueTitles.length === 0) return refsFromInput;

  // Ensure categories exist for provided titles
  const existing = await writeClient.fetch(
    `*[_type=="category" && title in $titles]{ _id, title }`,
    { titles: uniqueTitles }
  );
  const byTitle = new Map(existing.map((c) => [c.title, c._id]));

  for (const title of uniqueTitles) {
    if (byTitle.has(title)) continue;
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 96) || uuid();
    const created = await writeClient.create({
      _type: "category",
      title,
      slug: { _type: "slug", current: slug },
    });
    byTitle.set(title, created._id);
  }

  const refsFromTitles = uniqueTitles
    .map((t) => byTitle.get(t))
    .filter(Boolean)
    .map((_id) => ({ _type: "reference", _ref: _id }));

  return [...refsFromInput, ...refsFromTitles];
}
