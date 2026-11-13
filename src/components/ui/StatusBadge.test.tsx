import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders text and icon for 'planned' status", () => {
    const { container } = render(<StatusBadge status="planned" />);
    const textElement = screen.getByText("Planned");
    expect(textElement).toBeDefined();
    expect(document.body.contains(textElement)).toBe(true);

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders text and icon for 'in_progress' status", () => {
    const { container } = render(<StatusBadge status="in_progress" />);
    const textElement = screen.getByText("In Progress");
    expect(textElement).toBeDefined();
    expect(document.body.contains(textElement)).toBe(true);

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders text and icon for 'complete' status", () => {
    const { container } = render(<StatusBadge status="complete" />);
    const textElement = screen.getByText("Complete");
    expect(textElement).toBeDefined();
    expect(document.body.contains(textElement)).toBe(true);

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("supports small size variant", () => {
    const { container } = render(<StatusBadge status="complete" size="sm" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("text-xs");
    expect(screen.getByText("Complete")).toBeDefined();
  });
});
