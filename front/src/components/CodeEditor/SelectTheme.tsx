"use client";

import { parseSnakeCaseToTitleCase } from "@/helpers/string";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";

export type theme =
  | "ambiance"
  | "chaos"
  | "chrome"
  | "cloud9_day"
  | "cloud9_night"
  | "cloud9_night_low_color"
  | "cloud_editor"
  | "cloud_editor_dark"
  | "clouds"
  | "clouds_midnight"
  | "cobalt"
  | "crimson_editor"
  | "dawn"
  | "dracula"
  | "dreamweaver"
  | "eclipse"
  | "github"
  | "github_dark"
  | "github_light_default"
  | "gob"
  | "gruvbox"
  | "gruvbox_dark_hard"
  | "gruvbox_light_hard"
  | "idle_fingers"
  | "iplastic"
  | "katzenmilch"
  | "kr_theme"
  | "kuroir"
  | "merbivore"
  | "merbivore_soft"
  | "mono_industrial"
  | "monokai"
  | "nord_dark"
  | "one_dark"
  | "pastel_on_dark"
  | "solarized_dark"
  | "solarized_light"
  | "sqlserver"
  | "terminal"
  | "textmate"
  | "tomorrow"
  | "tomorrow_night"
  | "tomorrow_night_blue"
  | "tomorrow_night_bright"
  | "tomorrow_night_eighties"
  | "twilight"
  | "vibrant_ink"
  | "xcode";

const themeList: theme[] = [
  "ambiance",
  "chaos",
  "chrome",
  "cloud9_day",
  "cloud9_night",
  "cloud9_night_low_color",
  "cloud_editor",
  "cloud_editor_dark",
  "clouds",
  "clouds_midnight",
  "cobalt",
  "crimson_editor",
  "dawn",
  "dracula",
  "dreamweaver",
  "eclipse",
  "github",
  "github_dark",
  "github_light_default",
  "gob",
  "gruvbox",
  "gruvbox_dark_hard",
  "gruvbox_light_hard",
  "idle_fingers",
  "iplastic",
  "katzenmilch",
  "kr_theme",
  "kuroir",
  "merbivore",
  "merbivore_soft",
  "mono_industrial",
  "monokai",
  "nord_dark",
  "one_dark",
  "pastel_on_dark",
  "solarized_dark",
  "solarized_light",
  "sqlserver",
  "terminal",
  "textmate",
  "tomorrow",
  "tomorrow_night",
  "tomorrow_night_blue",
  "tomorrow_night_bright",
  "tomorrow_night_eighties",
  "twilight",
  "vibrant_ink",
  "xcode",
];

interface IProps {
  setSelectedTheme: (t: theme) => void;
  currentTheme: string;
}

export function SelectTheme({ setSelectedTheme, currentTheme }: IProps) {
  return (
    <Select
      onValueChange={(e: theme) => setSelectedTheme(e)}
      defaultValue="selectedTheme"
    >
      <SelectTrigger className="z-10 hover:cursor-pointer border text-sm px-2 py-1 rounded-sm mb-1">
        <SelectValue>
          Theme: {currentTheme}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-10 bg-white dark:bg-black">
        <SelectGroup className="overflow-y-scroll max-h-64">
          {themeList.map((t) => {
            return (
              <SelectItem
                value={t}
                key={t}
                className="text-sm hover:border-none hover:bg-neutral-300 dark:hover:bg-neutral-800 hover:cursor-pointer p-1 rounded-sm"
              >
                {parseSnakeCaseToTitleCase(t)}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
