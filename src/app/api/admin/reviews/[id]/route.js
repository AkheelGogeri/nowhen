import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { approved } = await req.json();

    const result = await sql`
      UPDATE reviews SET approved = ${approved} WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM reviews WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
