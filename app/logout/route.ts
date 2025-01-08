import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { clearStorage } from "../authstore";

export async function GET(request: NextRequest) {
  console.log(`GET /logout: ${(JSON.stringify(request), null, 2)}`);
  await clearStorage();
  // Complete other logout logic (e.g. auth logout)
  redirect("/");
}
