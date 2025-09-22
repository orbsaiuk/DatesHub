import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import {
  USER_COMPANY_MEMBERSHIPS_QUERY,
  COMPANY_BY_TENANT_QUERY,
} from "@/sanity/queries/company";
import { redirect } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

async function getUserCompany(userId) {
  const user = await writeClient.fetch(USER_COMPANY_MEMBERSHIPS_QUERY, {
    userId,
  });
  return user?.memberships?.[0];
}

async function getCompanyProjects(tenantId) {
  return await writeClient.fetch(COMPANY_BY_TENANT_QUERY, {
    tenantType: "company",
    tenantId,
  });
}

export default async function CompanyWorkPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await getUserCompany(userId);
  if (!membership?.company) {
    redirect("/become");
  }

  const company = await getCompanyProjects(membership.tenantId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Our Work</h1>
        <p className="text-muted-foreground mt-2">
          Showcase your projects and portfolio
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {company?.projects?.length > 0 ? (
          company.projects.map((project) => (
            <div
              key={project._id}
              className="bg-card rounded-xl border overflow-hidden"
            >
              {project.images?.[0] && (
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={urlFor(project.images[0]).width(400).height(225).url()}
                    alt={project.title}
                    width={400}
                    height={225}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {project.summary}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(project.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground">
              Add your first project to showcase your work.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
