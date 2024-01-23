import { CreateEditorArgs, createEditor } from "lexical";
import { describe, expect, test } from "vitest";
import { BetterMentionsItemData } from "./BetterMentionsPluginProps";
import { $createBetterMentionNode, BetterMentionNode } from "./MentionNode";

const editorConfig: CreateEditorArgs = {
  nodes: [BetterMentionNode],
};

export function exportJSON(
  trigger: string,
  value: string,
  data?: { [p: string]: BetterMentionsItemData },
) {
  let node: BetterMentionNode | undefined = undefined;
  const editor = createEditor(editorConfig);
  editor.update(() => {
    node = $createBetterMentionNode(trigger, value, data);
  });
  if (!node) {
    throw new Error("Node is undefined");
  }
  return (node as BetterMentionNode).exportJSON();
}

describe("BetterMentionNode", () => {
  test("should include a data prop when exporting to JSON and data is provided when creating the node", () => {
    const node = exportJSON("@", "Jane", {
      email: "jane@example.com",
    });
    expect(node).toStrictEqual({
      trigger: "@",
      type: "betterMention",
      value: "Jane",
      data: {
        email: "jane@example.com",
      },
      version: 1,
    });
  });

  test("should not include a data prop when exporting to JSON if no data is provided when creating the node", () => {
    const node = exportJSON("@", "Jane");
    expect(node).toStrictEqual({
      trigger: "@",
      type: "betterMention",
      value: "Jane",
      version: 1,
    });
  });
});
