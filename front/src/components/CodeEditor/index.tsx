"use client";

import React from "react";

import { Editor, EditorProps } from "@monaco-editor/react";

export default function CodeEditor(props: EditorProps) {
  return (
    <Editor
      theme="vs-dark"
      height="auto"
      language="python"
      options={{
        lineNumbers: "off",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        suggest: { showWords: true },
      }}
      defaultValue="# Your code goes here..."
      {...props}
    />
  );
}
