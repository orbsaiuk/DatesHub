import DirectoryDetailPage from "@/components/directory/detail/DirectoryDetailPage";
import {
  buildDetailMetadata,
  generateDetailStaticParams,
} from "@/components/directory/detail/DirectoryDetailPage";

export const revalidate = 60;

export async function generateStaticParams() {
  return await generateDetailStaticParams({ type: "supplier" });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return await buildDetailMetadata({
    id,
    basePath: "/suppliers",
    type: "supplier",
  });
}

export default function SupplierDetailsPage(props) {
  return <DirectoryDetailPage {...props} basePath="/suppliers" />;
}
