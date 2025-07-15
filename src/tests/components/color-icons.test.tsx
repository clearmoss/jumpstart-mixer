import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ColorIcons from "@/components/color-icons";
import { BASEPATH } from "@/lib/utils";

describe("ColorIcons component", () => {
  it("renders the correct number of icons with proper attributes", () => {
    const packColors = [
      { color: "R", count: 10 },
      { color: "G", count: 5 },
      { color: "B", count: 3 },
    ];
    const { container } = render(<ColorIcons packColors={packColors} />);
    const images = container.querySelectorAll("img");

    expect(images.length).toBe(3);

    expect(images[0]).toHaveAttribute("src", `${BASEPATH}/icons/R.svg`);
    expect(images[0]).toHaveAttribute("alt", "R");
    expect(images[0]).toHaveClass("h-7 w-7");

    expect(images[1]).toHaveAttribute("src", `${BASEPATH}/icons/G.svg`);
    expect(images[1]).toHaveAttribute("alt", "G");
    expect(images[1]).toHaveClass("h-5 w-5");

    expect(images[2]).toHaveAttribute("src", `${BASEPATH}/icons/B.svg`);
    expect(images[2]).toHaveAttribute("alt", "B");
    expect(images[2]).toHaveClass("h-5 w-5");
  });

  it("renders nothing when packColors is empty", () => {
    const { container } = render(<ColorIcons packColors={[]} />);

    const images = container.querySelectorAll("img");
    expect(images.length).toBe(0);
  });
});
