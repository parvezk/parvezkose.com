import { redirect } from "next/navigation";

/** Legacy URL: main landing is now `/`. */
export default function ImmersiveLegacyRedirect() {
  redirect("/");
}
