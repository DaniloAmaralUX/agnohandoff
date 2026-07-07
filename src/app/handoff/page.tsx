import { redirect } from "next/navigation";

/* /handoff foi elevado para a documentação de design viva em /design. */
export default function HandoffRedirect() {
  redirect("/design");
}
