import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host !== "english-hills.com") return NextResponse.next();
  const destination = new URL(request.url);
  destination.protocol = "https:";
  destination.hostname = "www.english-hills.com";
  destination.port = "";
  return NextResponse.redirect(destination, 308);
}

export const config = { matcher: "/:path*" };
