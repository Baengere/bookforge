
const BREVO_API_URL = "https://api.brevo.com/v3/contacts";
const BOOKFORGE_LIST_ID = 3;

export async function POST(request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (body.consent !== true) {
      return Response.json(
        { error: "Please confirm that you want to receive BookForge updates." },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error("BREVO_API_KEY is not configured.");

      return Response.json(
        { error: "Newsletter signup is temporarily unavailable." },
        { status: 503 }
      );
    }

    const brevoResponse = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [BOOKFORGE_LIST_ID],
        updateEnabled: true,
      }),
      cache: "no-store",
    });

    if (!brevoResponse.ok) {
      const errorDetails = await brevoResponse.text();

      console.error("Brevo newsletter signup failed:", {
        status: brevoResponse.status,
        details: errorDetails,
      });

      return Response.json(
        { error: "We couldn't complete your signup. Please try again later." },
        { status: 502 }
      );
    }

    return Response.json(
      { message: "You're signed up for BookForge updates!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter signup error:", error.message);

    return Response.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
