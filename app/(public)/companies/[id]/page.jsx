import DirectoryDetailPage from "@/components/directory/detail/DirectoryDetailPage";
import {
  buildDetailMetadata,
  generateDetailStaticParams,
} from "@/components/directory/detail/DirectoryDetailPage";

export const revalidate = 60;

export async function generateStaticParams() {
  return await generateDetailStaticParams();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return await buildDetailMetadata({ id, basePath: "/companies" });
}

export default function SupplierDetailsPage(props) {
  return <DirectoryDetailPage {...props} basePath="/companies" />;
}
