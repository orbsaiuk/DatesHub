import DirectoryPage from "@/components/directory/DirectoryPage";
import { generateSuppliersMetadata } from "./generateMetadata";

export async function generateMetadata({ searchParams }) {
  return await generateSuppliersMetadata(await searchParams);
}

export default function SuppliersPage(props) {
  return <DirectoryPage type="suppliers" {...props} />;
}
