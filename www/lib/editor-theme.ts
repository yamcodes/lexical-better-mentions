import { BetterMentionsTheme } from "lexical-better-mentions";

const mentionsStyle =
  "px-1 mx-2/3 mx-px align-baseline inline-block rounded break-words cursor-pointer select-none leading-5";
const mentionsStyleFocused = "ring-2 ring-offset-1"; 

const betterMentionsTheme: BetterMentionsTheme = {
  "@": `${mentionsStyle} dark:bg-green-500 bg-green-600 text-accent`,
  "@Focused": `${mentionsStyleFocused} dark:ring-green-500 ring-green-600 ring-offset-background`,
  "#": `${mentionsStyle} dark:bg-blue-400 bg-blue-600 text-accent`,
  "#Focused": `${mentionsStyleFocused} dark:ring-blue-400 ring-blue-600 ring-offset-background`,
  "due:": `${mentionsStyle} dark:bg-yellow-400 bg-yellow-600 text-accent`,
  "due:Focused": `${mentionsStyleFocused} dark:ring-yellow-400 ring-yellow-600 ring-offset-background`,
  // 👇 use a configuration object if you need to apply different styles to trigger and value
  "rec:": {
    trigger: "text-blue-500",
    value: "text-orange-500",
    container: "mx-[2px] px-[4px] rounded border border-muted cursor-pointer",
    containerFocused:
      "mx-[2px] px-[4px] rounded border border-muted cursor-pointer",
  },
  "\\w+:": `${mentionsStyle} dark:bg-gray-400 bg-gray-500 text-accent`,
  "\\w+:Focused": `${mentionsStyleFocused} dark:ring-gray-400 ring-gray-500 ring-offset-background`,
};

const theme = {
  ltr: "text-left",
  rtl: "text-right",
  betterMentions: betterMentionsTheme,
};

export default theme;
