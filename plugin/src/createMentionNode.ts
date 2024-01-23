import { LexicalEditor, LexicalNodeReplacement } from "lexical";
import { EditorConfig } from "lexical/LexicalEditor";
import React, { ElementType } from "react";
import { BetterMentionComponentProps } from "./BetterMentionsPluginProps";
import { BetterMentionNode, SerializedBetterMentionNode } from "./MentionNode";

export type CustomBetterMentionNodeKlass = ReturnType<typeof generateClass>;

export let CustomBetterMentionNode: CustomBetterMentionNodeKlass;

/**
 * Instead of using the default `BetterMentionNode` class, you can
 * extend it and use the mention component of your choice.
 */
export function createBetterMentionNode(
  mentionComponent: ElementType<BetterMentionComponentProps>,
): [CustomBetterMentionNodeKlass, LexicalNodeReplacement] {
  CustomBetterMentionNode =
    CustomBetterMentionNode || generateClass(mentionComponent);
  return [
    CustomBetterMentionNode,
    {
      replace: BetterMentionNode,
      with: (node: BetterMentionNode) => {
        return new CustomBetterMentionNode(
          node.getTrigger(),
          node.getValue(),
          node.getData(),
        );
      },
    },
  ];
}

function generateClass(
  mentionComponent: ElementType<BetterMentionComponentProps>,
) {
  return class CustomBetterMentionNode extends BetterMentionNode {
    static getType() {
      return "custom-betterMention";
    }
    static clone(node: CustomBetterMentionNode) {
      return new CustomBetterMentionNode(
        node.__trigger,
        node.__value,
        node.__data,
        node.__key,
      );
    }
    static importJSON(serializedNode: SerializedBetterMentionNode) {
      return new CustomBetterMentionNode(
        serializedNode.trigger,
        serializedNode.value,
        serializedNode.data,
      );
    }
    exportJSON(): SerializedBetterMentionNode {
      const data = this.__data;
      return {
        trigger: this.__trigger,
        value: this.__value,
        ...(data ? { data } : {}),
        type: "custom-betterMention",
        version: 1,
      };
    }
    component(): ElementType<BetterMentionComponentProps> | null {
      return mentionComponent;
    }
    decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
      return super.decorate(editor, config);
    }
  };
}
