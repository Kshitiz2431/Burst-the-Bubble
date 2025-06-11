// app/admin/templates/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  PlusCircle, 
  Pencil, 
  Download,
  FileText,
  ArrowDownToLine 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeleteTemplateDialog } from "@/components/templates/delete-dialog";
import { PublishButton } from "@/components/admin/publish-button";

async function getTemplates() {
  try {
    const templates = await prisma.template.findMany({
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return templates;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch templates");
  }
}

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const templates = await getTemplates();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-gray-500">
            Manage your letter and one-liner templates
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new" className="bg-[#B33771] hover:bg-[#92295c]">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Template
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Template Image Preview */}
              <div className="w-48 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`/api/templates/${template.id}/image`}
                  alt={template.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{template.title}</h2>
                    <div className="flex gap-2 mb-2">
                      {template.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-sm"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/api/templates/${template.id}/admin-download`} target="_blank" download>
                        <ArrowDownToLine className="w-4 h-4" />
                      </Link>
                    </Button>
                    <PublishButton
                        id={template.id}
                        type="templates"
                        isPublished={template.published}
                    />
                    {/* <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/templates/preview/${template.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button> */}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/templates/edit/${template.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    {/* <Button asChild size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                      <Link href={`/admin/templates/${template.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Link>
                    </Button> */}
                    <DeleteTemplateDialog
                      templateId={template.id} 
                      templateTitle={template.title}
                    />
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{template.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {template._count.purchases} downloads
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {template.type}
                  </div>
                  <div>
                    Price: {template.price ? `₹${template.price}` : 'Free'}
                  </div>
                  <div>
                    Added {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs ${
                    template.published 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-gray-50 text-gray-600'
                  }`}>
                    {template.published ? 'Published' : 'Draft'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found</p>
          <Button asChild className="mt-4">
            <Link href="/admin/templates/new" className="bg-[#B33771] hover:bg-[#92295c]">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Template
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}