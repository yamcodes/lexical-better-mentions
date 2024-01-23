import type {
  DOMConversionMap,
  DOMExportOutput,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import {
  $applyNodeReplacement,
  DecoratorNode,
  LexicalEditor,
  type DOMConversionOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
} from "lexical";
import React, { ElementType } from "react";
import {
  BetterMentionComponentProps,
  BetterMentionsItemData,
} from "./BetterMentionsPluginProps";
import MentionComponent from "./MentionComponent";
import { BetterMentionsTheme } from "./theme";

export type SerializedBetterMentionNode = Spread<
  {
    trigger: string;
    value: string;
    data?: { [p: string]: BetterMentionsItemData };
  },
  SerializedLexicalNode
>;

function convertElement(domNode: HTMLElement): DOMConversionOutput | null {
  const trigger = domNode.getAttribute("data-lexical-better-mention-trigger");
  const value = domNode.getAttribute("data-lexical-better-mention-value");
  let data: { [p: string]: BetterMentionsItemData } | undefined = undefined;
  const dataStr = domNode.getAttribute("data-lexical-better-mention-data");
  if (dataStr) {
    try {
      data = JSON.parse(dataStr);
    } catch (e) {
      console.warn("Failed to parse data attribute of better mention node", e);
    }
  }
  if (trigger != null && value !== null) {
    const node = $createBetterMentionNode(trigger, value, data);
    return { node };
  }
  return null;
}

/**
 * This node is used to represent a mention used in the BetterMentionPlugin.
 */
export class BetterMentionNode extends DecoratorNode<React.JSX.Element> {
  __trigger: string;
  __value: string;
  __data?: { [p: string]: BetterMentionsItemData };

  static getType(): string {
    return "betterMention";
  }

  static clone(node: BetterMentionNode): BetterMentionNode {
    return new BetterMentionNode(
      node.__trigger,
      node.__value,
      node.__data,
      node.__key,
    );
  }

  static importJSON(
    serializedNode: SerializedBetterMentionNode,
  ): BetterMentionNode {
    return $createBetterMentionNode(
      serializedNode.trigger,
      serializedNode.value,
      serializedNode.data,
    );
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-better-mention", "true");
    element.setAttribute("data-lexical-better-mention-trigger", this.__trigger);
    element.setAttribute("data-lexical-better-mention-value", this.__value);
    if (this.__data) {
      element.setAttribute(
        "data-lexical-better-mention-data",
        JSON.stringify(this.__data),
      );
    }
    element.textContent = this.getTextContent();
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-better-mention")) {
          return null;
        }
        return {
          conversion: convertElement,
          priority: 1,
        };
      },
    };
  }

  constructor(
    trigger: string,
    value: string,
    data?: { [p: string]: BetterMentionsItemData },
    key?: NodeKey,
  ) {
    super(key);
    this.__trigger = trigger;
    this.__value = value;
    this.__data = data;
  }

  exportJSON(): SerializedBetterMentionNode {
    const data = this.__data;
    return {
      trigger: this.__trigger,
      value: this.__value,
      ...(data ? { data } : {}),
      type: "betterMention",
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  getTextContent(): string {
    return this.__trigger + this.__value;
  }

  updateDOM(): boolean {
    return false;
  }

  getTrigger(): string {
    const self = this.getLatest();
    return self.__trigger;
  }

  getValue(): string {
    const self = this.getLatest();
    return self.__value;
  }

  setValue(value: string) {
    const self = this.getWritable();
    self.__value = value;
  }

  getData(): { [p: string]: BetterMentionsItemData } | undefined {
    const self = this.getLatest();
    return self.__data;
  }

  setData(data?: { [p: string]: BetterMentionsItemData }) {
    const self = this.getWritable();
    self.__data = data;
  }

  component(): ElementType<BetterMentionComponentProps> | null {
    return null;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const theme: BetterMentionsTheme = config.theme.betterMentions || {};
    const entry = Object.entries(theme).find(([trigger]) =>
      new RegExp(trigger).test(this.__trigger),
    );
    const key = entry && entry[0];
    const value = entry && entry[1];
    const className = typeof value === "string" ? value : undefined;
    const classNameFocused =
      className && typeof theme[key + "Focused"] === "string"
        ? (theme[key + "Focused"] as string)
        : undefined;
    const themeValues = entry && typeof value !== "string" ? value : undefined;
    return (
      <MentionComponent
        nodeKey={this.getKey()}
        trigger={this.getTrigger()}
        value={this.getValue()}
        data={this.getData()}
        className={className}
        classNameFocused={classNameFocused}
        themeValues={themeValues}
        component={this.component()}
      />
    );
  }
}

export function $createBetterMentionNode(
  trigger: string,
  value: string,
  data?: { [p: string]: BetterMentionsItemData },
): BetterMentionNode {
  const mentionNode = new BetterMentionNode(trigger, value, data);
  return $applyNodeReplacement(mentionNode);
}

export function $isBetterMentionNode(
  node: LexicalNode | null | undefined,
): node is BetterMentionNode {
  return node instanceof BetterMentionNode;
}
