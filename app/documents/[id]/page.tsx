import DocumentPageClient from "@/components/documents/DocumentPageClient";

// This route needs the document id before it can render the editor.
export const instant = false;

export default async function DocumentPage(
  props: PageProps<"/documents/[id]">
) {
  const { id } = await props.params;

  return <DocumentPageClient documentId={id} />;
}
