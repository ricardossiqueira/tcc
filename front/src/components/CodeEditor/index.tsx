"use client";

import "ace-builds/src-noconflict/ace.js";

import "ace-builds/src-noconflict/ext-language_tools.js";
import "ace-builds/src-noconflict/mode-python.js";

import "ace-builds/src-noconflict/theme-ambiance.js";
import "ace-builds/src-noconflict/theme-chaos.js";
import "ace-builds/src-noconflict/theme-chrome.js";
import "ace-builds/src-noconflict/theme-cloud9_day.js";
import "ace-builds/src-noconflict/theme-cloud9_night.js";
import "ace-builds/src-noconflict/theme-cloud9_night_low_color.js";
import "ace-builds/src-noconflict/theme-cloud_editor.js";
import "ace-builds/src-noconflict/theme-cloud_editor_dark.js";
import "ace-builds/src-noconflict/theme-clouds.js";
import "ace-builds/src-noconflict/theme-clouds_midnight.js";
import "ace-builds/src-noconflict/theme-cobalt.js";
import "ace-builds/src-noconflict/theme-crimson_editor.js";
import "ace-builds/src-noconflict/theme-dawn.js";
import "ace-builds/src-noconflict/theme-dracula.js";
import "ace-builds/src-noconflict/theme-dreamweaver.js";
import "ace-builds/src-noconflict/theme-eclipse.js";
import "ace-builds/src-noconflict/theme-github.js";
import "ace-builds/src-noconflict/theme-github_dark.js";
import "ace-builds/src-noconflict/theme-github_light_default.js";
import "ace-builds/src-noconflict/theme-gob.js";
import "ace-builds/src-noconflict/theme-gruvbox.js";
import "ace-builds/src-noconflict/theme-gruvbox_dark_hard.js";
import "ace-builds/src-noconflict/theme-gruvbox_light_hard.js";
import "ace-builds/src-noconflict/theme-idle_fingers.js";
import "ace-builds/src-noconflict/theme-iplastic.js";
import "ace-builds/src-noconflict/theme-katzenmilch.js";
import "ace-builds/src-noconflict/theme-kr_theme.js";
import "ace-builds/src-noconflict/theme-kuroir.js";
import "ace-builds/src-noconflict/theme-merbivore.js";
import "ace-builds/src-noconflict/theme-merbivore_soft.js";
import "ace-builds/src-noconflict/theme-mono_industrial.js";
import "ace-builds/src-noconflict/theme-monokai.js";
import "ace-builds/src-noconflict/theme-nord_dark.js";
import "ace-builds/src-noconflict/theme-one_dark.js";
import "ace-builds/src-noconflict/theme-pastel_on_dark.js";
import "ace-builds/src-noconflict/theme-solarized_dark.js";
import "ace-builds/src-noconflict/theme-solarized_light.js";
import "ace-builds/src-noconflict/theme-sqlserver.js";
import "ace-builds/src-noconflict/theme-terminal.js";
import "ace-builds/src-noconflict/theme-textmate.js";
import "ace-builds/src-noconflict/theme-tomorrow.js";
import "ace-builds/src-noconflict/theme-tomorrow_night.js";
import "ace-builds/src-noconflict/theme-tomorrow_night_blue.js";
import "ace-builds/src-noconflict/theme-tomorrow_night_bright.js";
import "ace-builds/src-noconflict/theme-tomorrow_night_eighties.js";
import "ace-builds/src-noconflict/theme-twilight.js";
import "ace-builds/src-noconflict/theme-vibrant_ink.js";
import "ace-builds/src-noconflict/theme-xcode.js";

import ReactAce, { IAceEditorProps } from "react-ace/lib/ace";
import { useState } from "react";
import React from "react";
import { parseSnakeCaseToTitleCase } from "../../helpers/string.ts";
import { SelectTheme, type theme } from "./SelectTheme.tsx";

export default function CodeEditor(props: IAceEditorProps) {
  const [selectedTheme, setSelectedTheme] = useState<theme>("chaos");

  return (
    <div className="p-1">
      <SelectTheme
        setSelectedTheme={setSelectedTheme}
        currentTheme={parseSnakeCaseToTitleCase(selectedTheme)}
      />
      <ReactAce
        {...props}
        className="w-full rounded-sm"
        placeholder="# Your code goes here..."
        mode="python"
        theme={selectedTheme}
        editorProps={{ $blockScrolling: true }}
        fontSize={14}
        lineHeight={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          wrap: true,
        }}
      />
    </div>
  );
}
