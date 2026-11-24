import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/session";

export default async function Index() {
  redirect((await getUser()) ? "/home" : "/login");
}
