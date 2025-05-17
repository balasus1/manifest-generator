import { saveToDatabase } from "@/app/action";

export async function POST(req) {
  try {
    const { fileName, formData, createdAt, deviceModel } = await req.json();
    await saveToDatabase(fileName, formData, createdAt, deviceModel);

    return Response.json({ success: true });
  } catch (err) {
    console.error("API save error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}