export type DocumentContent = Record<string, unknown>;

export type DocumentData = {
  id: string;
  title: string;
  content: DocumentContent;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_shared?: boolean;
};

export type UserData = {
  id: string;
  name: string;
  email: string;
};

export type DocumentShare = {
  id: string;
  document_id: string;
  user_id: string;
};

export async function listUsers(userId: string): Promise<UserData[]> {
  const response = await fetch("/api/users", {
    headers: {
      "x-user-id": userId,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load users");
  }

  return response.json();
}

export async function listDocumentShares(
  documentId: string,
  userId: string
): Promise<DocumentShare[]> {
  const response = await fetch(`/api/documents/${documentId}/shares`, {
    headers: {
      "x-user-id": userId,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load document shares");
  }

  return response.json();
}

export async function shareDocument(
  documentId: string,
  ownerId: string,
  userId: string
): Promise<DocumentShare> {
  const response = await fetch(`/api/documents/${documentId}/shares`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": ownerId,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error("Could not share document");
  }

  return response.json();
}

export async function listDocuments(userId: string): Promise<DocumentData[]> {
  const response = await fetch("/api/documents", {
    headers: {
      "x-user-id": userId,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load documents");
  }

  return response.json();
}

export async function createDocument(
  userId: string,
  title?: string
): Promise<DocumentData> {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error("Could not create document");
  }

  return response.json();
}

export async function importDocument(
  userId: string,
  file: File
): Promise<DocumentData> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documents/import", {
    method: "POST",
    headers: {
      "x-user-id": userId,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Could not import document");
  }

  return response.json();
}

export async function getDocument(
  documentId: string,
  userId: string
): Promise<DocumentData> {
  const response = await fetch(`/api/documents/${documentId}`, {
    headers: {
      "x-user-id": userId,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load document");
  }

  return response.json();
}

export async function updateDocument(
  documentId: string,
  userId: string,
  data: {
    title: string;
    content: DocumentContent;
  }
): Promise<DocumentData> {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Could not save document");
  }

  return response.json();
}
