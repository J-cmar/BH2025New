import getSideEffects from "../../util/sideEffectsScraper";


export async function POST(req, res) {
  const body = await req.json();
  const { drugName } = body;


  if (!drugName) {
    return new Response(JSON.stringify({ error: "Drug name is required" }), {
      status: 400,
    });
  }

  try {
    const results = await getSideEffects(drugName);
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Scraping failed:", error);
    return new Response(JSON.stringify({ error: "Scraping failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

}