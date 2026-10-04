import { describe, expect, it } from "vitest";
import { splitArithmetic } from "./remark-ltr-math";

const names = (nodes: ReturnType<typeof splitArithmetic>) =>
  nodes.map((n) => (n.type === "text" ? `T(${n.value})` : `N(${n.children[0].value})`));

describe("remarkLtrMath", () => {
  it("wraps arithmetic runs and leaves surrounding Hebrew alone", () => {
    expect(names(splitArithmetic("שילמת: 100 × 10.10 = 1,010 שקלים."))).toEqual([
      "T(שילמת: )",
      "N(100 × 10.10 = 1,010)",
      "T( שקלים.)",
    ]);
  });

  it("handles percentages, minus signs and approximations", () => {
    expect(names(splitArithmetic("20,000 × 1% = 200 ועוד 17.9 − 11.4 = 6.5 ובערך 1,551 ÷ 19,646 ≈ 7.9%"))).toEqual([
      "N(20,000 × 1% = 200)",
      "T( ועוד )",
      "N(17.9 − 11.4 = 6.5)",
      "T( ובערך )",
      "N(1,551 ÷ 19,646 ≈ 7.9%)",
    ]);
  });

  it("leaves single numbers and plain text untouched", () => {
    expect(names(splitArithmetic("בדוכן של 8 שקלים"))).toEqual(["T(בדוכן של 8 שקלים)"]);
    expect(names(splitArithmetic("אין כאן מספרים"))).toEqual(["T(אין כאן מספרים)"]);
  });

  it("treats a ratio like 1:10 as arithmetic so it stays LTR", () => {
    expect(names(splitArithmetic("מינוף 1:10 בחשבון"))).toEqual(["T(מינוף )", "N(1:10)", "T( בחשבון)"]);
  });
});
