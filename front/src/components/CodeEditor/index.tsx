"use client";

import React from "react";
import Editor, { EditorProps, Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";

interface IEditorProps extends EditorProps {
  readOnly?: boolean;
}

export default function CodeEditor({
  readOnly = false,
  ...props
}: IEditorProps) {
  const handleEditorMount = (
    _editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monaco.editor.defineTheme("ayu-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "5c6773", fontStyle: "italic" },
        { token: "keyword", foreground: "f29718" },
        { token: "number", foreground: "d3423e" },
        { token: "string", foreground: "86b300" },
        { token: "operator", foreground: "f29718" },
        { token: "function", foreground: "f07178" },
        { token: "variable", foreground: "d4d7d6" },
        { token: "type", foreground: "39bae6" },
      ],
      colors: {
        "editor.foreground": "#d9d7ce",
        "editor.background": "#111111",
        "editorCursor.foreground": "#ffcc00",
        "editor.lineHighlightBackground": "#1f2430",
        "editorLineNumber.foreground": "#5c6773",
        "editor.selectionBackground": "#284b63",
        "editor.inactiveSelectionBackground": "#1f2430",
      },
    });
    // Set the custom theme
    monaco.editor.setTheme("ayu-dark");
  };

  if (readOnly)
    props.options = {
      ...props.options,
      readOnly: true,
      cursorStyle: "line",
      renderLineHighlight: "none",
    };

  return (
    <div
      style={{
        borderRadius: "0.5rem",
        overflow: "hidden", // Ensures content stays within the rounded border
      }}
    >
      {
        /* Hide Monaco Editor cursor */
        readOnly && (
          <style>
            {`
            .monaco-editor .cursor {
              display: none !important;
            }
          `}
          </style>
        )
      }
      <Editor
        theme="one-dark"
        height="60vh"
        language="python"
        options={{
          lineNumbers: "off",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          suggest: { showWords: true },
        }}
        defaultValue="# Your code goes here..."
        onMount={handleEditorMount}
        {...props}
      />
    </div>
  );
}
