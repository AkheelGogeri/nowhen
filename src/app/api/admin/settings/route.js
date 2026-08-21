import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const result = await sql`SELECT * FROM site_settings WHERE id = 1`;
    return NextResponse.json(result[0] || {});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { hero_slides, marquee_text, banner_text, collection_text } = await req.json();

    const result = await sql`
      UPDATE site_settings
      SET
        hero_slides = ${JSON.stringify(hero_slides)},
        marquee_text = ${marquee_text},
        banner_text = ${banner_text},
        collection_text = ${collection_text},
        updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}