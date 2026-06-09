import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { cpp } from "@codemirror/lang-cpp";
import { HighlightStyle, syntaxHighlighting, bracketMatching, indentOnInput } from "@codemirror/language";
import { tags as ht } from "@lezer/highlight";

const fragmentaryHighlight = HighlightStyle.define([
  { tag: ht.keyword, color: "hsl(var(--hl-keyword))" },
  { tag: ht.controlKeyword, color: "hsl(var(--hl-keyword))" },
  { tag: ht.typeName, color: "hsl(var(--hl-type))" },
  { tag: ht.function(ht.variableName), color: "hsl(var(--hl-func))" },
  { tag: ht.definition(ht.variableName), color: "hsl(var(--hl-func))" },
  { tag: ht.variableName, color: "hsl(var(--hl-text))" },
  { tag: ht.number, color: "hsl(var(--hl-num))" },
  { tag: ht.string, color: "hsl(var(--hl-str))" },
  { tag: ht.comment, color: "hsl(var(--hl-comment))", fontStyle: "italic" },
  { tag: ht.operator, color: "hsl(var(--hl-op))" },
  { tag: ht.bracket, color: "hsl(var(--hl-op))" },
  { tag: ht.punctuation, color: "hsl(var(--hl-op))" },
  { tag: ht.bool, color: "hsl(var(--hl-keyword))" },
  { tag: ht.atom, color: "hsl(var(--hl-num))" },
  { tag: ht.meta, color: "hsl(var(--hl-comment))" },
]);

const baseTheme = EditorView.theme(
  {
    "&": {
      color: "hsl(var(--hl-text))",
      backgroundColor: "transparent",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "hsl(var(--accent))",
      padding: "12px 6px",
      lineHeight: "1.5",
    },
    ".cm-gutters": {
      color: "hsl(var(--soft))",
      backgroundColor: "transparent",
      border: "none",
      borderRight: "1px solid hsl(var(--hair))",
      paddingRight: "6px",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 6px 0 8px",
      fontVariantNumeric: "tabular-nums",
    },
    ".cm-activeLineGutter": {
      color: "hsl(var(--accent))",
      backgroundColor: "transparent",
    },
    ".cm-activeLine": {
      backgroundColor: "hsl(var(--accent) / 0.06)",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "hsl(var(--accent) / 0.22)",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "hsl(var(--accent) / 0.28)",
    },
    ".cm-cursor": {
      borderLeftColor: "hsl(var(--accent))",
      borderLeftWidth: "2px",
    },
  },
);

export type CodeEditorHandle = { insertAtCursor: (text: string) => void };

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  errorLines?: Set<number>;
};

export const CodeEditor = forwardRef<CodeEditorHandle, Props>(function CodeEditor(
  { value, onChange, className, errorLines },
  ref,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  useImperativeHandle(ref, () => ({
    insertAtCursor(text: string) {
      const view = viewRef.current;
      if (!view) return;
      const sel = view.state.selection.main;
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert: text },
        selection: { anchor: sel.from + text.length },
      });
      view.focus();
    },
  }), []);

  useEffect(() => {
    if (!hostRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        bracketMatching(),
        indentOnInput(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        baseTheme,
        syntaxHighlighting(fragmentaryHighlight),
        cpp(),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString());
        }),
        EditorView.lineWrapping,
      ],
    });
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (view.state.doc.toString() !== value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || !errorLines) return;
    const host = hostRef.current;
    if (!host) return;
    const existing = host.querySelectorAll(".cm-line-error");
    existing.forEach((el) => el.classList.remove("cm-line-error"));
    if (errorLines.size === 0) return;
    const lineEls = host.querySelectorAll(".cm-line");
    errorLines.forEach((ln) => {
      const idx = ln - 1;
      if (idx >= 0 && idx < lineEls.length) {
        lineEls[idx].classList.add("cm-line-error");
      }
    });
  }, [errorLines, value]);

  return <div ref={hostRef} className={className} />;
});
