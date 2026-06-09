import { describe, expect, test } from "vitest";
import { EditorState } from "@codemirror/state";

function applyInsert(doc: string, from: number, to: number, text: string) {
  const state = EditorState.create({ doc, selection: { anchor: from, head: to } });
  const sel = state.selection.main;
  const tr = state.update({
    changes: { from: sel.from, to: sel.to, insert: text },
    selection: { anchor: sel.from + text.length },
  });
  return { doc: tr.state.doc.toString(), cursor: tr.state.selection.main.anchor };
}

describe("insertAtCursor transaction", () => {
  test("inserts at a collapsed cursor", () => {
    const r = applyInsert("ab cd", 3, 3, "X");
    expect(r.doc).toBe("ab Xcd");
    expect(r.cursor).toBe(4);
  });

  test("replaces a selection", () => {
    const r = applyInsert("ab OLD cd", 3, 6, "NEW");
    expect(r.doc).toBe("ab NEW cd");
    expect(r.cursor).toBe(6);
  });
});
