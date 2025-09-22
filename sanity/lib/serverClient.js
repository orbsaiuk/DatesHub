import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN;

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "published",
});
