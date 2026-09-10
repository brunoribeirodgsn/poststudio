import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL!;

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36) + s.length.toString(36);
}

async function initDb(sql: ReturnType<typeof neon>) {
  await sql`
    CREATE TABLE IF NOT EXISTS ps_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT DEFAULT 'Creator',
      credits INTEGER DEFAULT 250,
      avatar TEXT DEFAULT 'BR',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json() as { email: string; password: string; name: string };

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    const sql = neon(DATABASE_URL);
    await initDb(sql);

    const existing = await sql`SELECT id FROM ps_users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 400 });
    }

    const hash = simpleHash(password);
    const avatar = name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase() || "BR";

    const rows = await sql`
      INSERT INTO ps_users (name, email, password_hash, avatar)
      VALUES (${name}, ${email}, ${hash}, ${avatar})
      RETURNING id, name, email, plan, credits, avatar
    `;

    const user = rows[0];
    return NextResponse.json({ user: { ...user, id: String(user.id) } });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 });
  }
}
