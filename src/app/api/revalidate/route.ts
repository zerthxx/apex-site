import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sanity-webhook-secret");
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { _type?: string; slug?: { current?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { _type, slug } = body;

  if (_type === "blogPost") {
    revalidatePath("/blogi");
    if (slug?.current) {
      revalidatePath(`/blogi/${slug.current}`);
    }
  } else if (_type === "caseStudy") {
    revalidatePath("/portfolio");
    if (slug?.current) {
      revalidatePath(`/portfolio/${slug.current}`);
    }
  } else {
    revalidatePath("/");
  }

  return NextResponse.json({ revalidated: true, timestamp: Date.now() });
}
