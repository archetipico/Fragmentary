import { describe, expect, test } from "vitest";
import { glslReference, filterReference } from "./glsl-reference";

describe("glsl reference data", () => {
  test("every item has a non-empty sig, snippet, and desc", () => {
    for (const g of glslReference) {
      expect(g.items.length).toBeGreaterThan(0);
      for (const it of g.items) {
        expect(it.sig.trim()).not.toBe("");
        expect(it.snippet.trim()).not.toBe("");
        expect(it.desc.trim()).not.toBe("");
      }
    }
  });

  test("snippets are unique within a group", () => {
    for (const g of glslReference) {
      const seen = new Set<string>();
      for (const it of g.items) {
        expect(seen.has(it.snippet)).toBe(false);
        seen.add(it.snippet);
      }
    }
  });
});

describe("filterReference", () => {
  test("empty query returns all groups unchanged", () => {
    expect(filterReference(glslReference, "  ")).toEqual(glslReference);
  });

  test("matches on signature text, case-insensitive", () => {
    const out = filterReference(glslReference, "SMOOTH");
    const snippets = out.flatMap((g) => g.items.map((i) => i.snippet));
    expect(snippets).toContain("smoothstep(e0, e1, x)");
  });

  test("matches on description text", () => {
    const out = filterReference(glslReference, "magnitude");
    const snippets = out.flatMap((g) => g.items.map((i) => i.snippet));
    expect(snippets).toContain("length(v)");
  });

  test("drops groups with no matches", () => {
    const out = filterReference(glslReference, "zzz-no-match");
    expect(out).toEqual([]);
  });
});
