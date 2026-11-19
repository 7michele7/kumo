import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { CloudflareLogo } from "./cloudflare-logo";

describe("CloudflareLogo", () => {
  it.each(["full", "glyph"] as const)(
    "names the %s logo with an SVG title",
    (variant) => {
      render(<CloudflareLogo variant={variant} />);
      const logo = screen.getByTitle("Cloudflare logo").closest("svg");
      expect(logo).not.toBeNull();
      expect(logo?.hasAttribute("role")).toBe(false);
      expect(logo?.hasAttribute("aria-labelledby")).toBe(false);
    },
  );

  it("lets a consumer aria-label replace the default name", () => {
    render(<CloudflareLogo aria-label="Powered by Cloudflare" />);
    expect(screen.getByLabelText("Powered by Cloudflare").tagName).toBe("svg");
  });
});
