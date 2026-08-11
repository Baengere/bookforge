import mammoth from "mammoth";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("FILE NAME:", file.name);
    console.log("FILE TYPE:", file.type);
    console.log("FILE SIZE:", buffer.length);
    console.log("FILE HEADER:", buffer.subarray(0, 8).toString("hex"));

    const result = await mammoth.extractRawText({
      buffer,
    });

    return Response.json({
      text: result.value,
    });
  } catch (error) {
    console.error("EXTRACTION ERROR:", error);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}