import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isTextNode,
  $setSelection,
  BLUR_COMMAND,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { ElementType, useCallback, useEffect, useMemo, useRef } from "react";
import {
  BetterMentionsItemData,
  BetterMentionComponentProps as CustomBetterMentionComponentProps,
} from "./BetterMentionsPluginProps";
import { $isBetterMentionNode } from "./MentionNode";
import { IS_IOS } from "./environment";
import { getNextSibling, getPreviousSibling } from "./mention-utils";
import { BetterMentionsThemeValues } from "./theme";

interface BetterMentionComponentProps {
  nodeKey: NodeKey;
  trigger: string;
  value: string;
  data?: { [p: string]: BetterMentionsItemData };
  component?: ElementType<CustomBetterMentionComponentProps> | null;
  className?: string;
  classNameFocused?: string;
  themeValues?: BetterMentionsThemeValues;
}

export default function BetterMentionComponent(
  props: BetterMentionComponentProps,
) {
  const {
    value,
    trigger,
    data,
    className,
    classNameFocused,
    themeValues,
    nodeKey,
    component: Component,
  } = props;
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const ref = useRef<any>(null);
  const mention = trigger + value;

  const finalClasses = useMemo(() => {
    if (className) {
      const classes = [className];
      if (isSelected && classNameFocused) {
        classes.push(classNameFocused);
      }
      return classes.join(" ").trim() || undefined;
    }
    return "";
  }, [isSelected, className, classNameFocused]);

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        payload.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isBetterMentionNode(node)) {
          node.remove();
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  const onArrowLeftPress = useCallback(
    (event: KeyboardEvent) => {
      const node = $getNodeByKey(nodeKey);
      if (!node || !node.isSelected()) {
        return false;
      }
      let handled = false;
      const nodeToSelect = getPreviousSibling(node);
      if ($isElementNode(nodeToSelect)) {
        nodeToSelect.selectEnd();
        handled = true;
      }
      if ($isTextNode(nodeToSelect)) {
        nodeToSelect.select();
        handled = true;
      }
      if ($isDecoratorNode(nodeToSelect)) {
        nodeToSelect.selectNext();
        handled = true;
      }
      if (nodeToSelect === null) {
        node.selectPrevious();
        handled = true;
      }
      if (handled) {
        event.preventDefault();
      }
      return handled;
    },
    [nodeKey],
  );

  const onArrowRightPress = useCallback(
    (event: KeyboardEvent) => {
      const node = $getNodeByKey(nodeKey);
      if (!node || !node.isSelected()) {
        return false;
      }
      let handled = false;
      const nodeToSelect = getNextSibling(node);
      if ($isElementNode(nodeToSelect)) {
        nodeToSelect.selectStart();
        handled = true;
      }
      if ($isTextNode(nodeToSelect)) {
        nodeToSelect.select(0, 0);
        handled = true;
      }
      if ($isDecoratorNode(nodeToSelect)) {
        nodeToSelect.selectPrevious();
        handled = true;
      }
      if (nodeToSelect === null) {
        node.selectNext();
        handled = true;
      }
      if (handled) {
        event.preventDefault();
      }
      return handled;
    },
    [nodeKey],
  );

  const onClick = useCallback(
    (event: MouseEvent) => {
      if (
        event.target === ref.current ||
        ref.current?.contains(event.target as Node)
      ) {
        if (!event.shiftKey) {
          clearSelection();
        }
        setSelected(true);
        return true;
      }
      return false;
    },
    [clearSelection, setSelected],
  );

  const onBlur = useCallback(() => {
    const node = $getNodeByKey(nodeKey);
    if (node && node.isSelected()) {
      $setSelection(null);
    }
    return false;
  }, [nodeKey]);

  // Make sure that the focus is removed when clicking next to the mention
  const onSelectionChange = useCallback(() => {
    if (IS_IOS && isSelected) {
      setSelected(false);
      return true;
    }
    return false;
  }, [isSelected, setSelected]);

  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        onArrowLeftPress,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        onArrowRightPress,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(BLUR_COMMAND, onBlur, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        onSelectionChange,
        COMMAND_PRIORITY_LOW,
      ),
    );
    return () => {
      unregister();
    };
  }, [
    editor,
    onArrowLeftPress,
    onArrowRightPress,
    onClick,
    onBlur,
    onDelete,
    onSelectionChange,
  ]);

  if (Component) {
    return (
      <Component
        ref={ref}
        trigger={trigger}
        value={value}
        data={data}
        className={finalClasses}
        data-better-mention={mention}
      >
        {mention}
      </Component>
    );
  }

  if (themeValues) {
    return (
      <span
        ref={ref}
        className={
          isSelected && !!themeValues.containerFocused
            ? themeValues.containerFocused
            : themeValues.container
        }
        data-better-mention={mention}
      >
        <span className={themeValues.trigger}>{trigger}</span>
        <span className={themeValues.value}>{value}</span>
      </span>
    );
  }

  return (
    <span ref={ref} className={finalClasses} data-better-mention={mention}>
      {mention}
    </span>
  );
}
