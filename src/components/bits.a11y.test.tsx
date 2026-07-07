import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { EmptyState } from "./bits";
import { Bot } from "lucide-react";

describe("EmptyState — acessibilidade", () => {
  it("não tem violações de a11y (axe)", async () => {
    const { container } = render(
      <EmptyState
        icon={Bot}
        title="Nenhum agente ainda"
        description="Crie seu primeiro agente para começar."
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
