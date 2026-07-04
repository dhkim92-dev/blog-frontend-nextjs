import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

function sanitizeFileName(value: string) {
  return value.replaceAll(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        message: "file is required",
      },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  const fileName = `${crypto.randomUUID()}-${sanitizeFileName(file.name || "upload")}`;
  const filePath = path.join(uploadDirectory, fileName);

  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(filePath, bytes);

  return NextResponse.json({
    url: `/uploads/${fileName}`,
  });
}
