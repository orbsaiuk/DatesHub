import DirectoryPage from "@/components/directory/DirectoryPage";
import { generateCompaniesMetadata } from "./generateMetadata";

export async function generateMetadata({ searchParams }) {
  return await generateCompaniesMetadata(await searchParams);
}

export default function CompaniesPage(props) {
  return <DirectoryPage type="companies" {...props} />;
}
