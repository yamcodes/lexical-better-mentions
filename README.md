# lexical-better-mentions

> [!NOTE]
> **This is fork of [sodenn/lexical-beautiful-mentions](https://github.com/sodenn/lexical-beautiful-mentions) with 2 additions:**
>
> 1. The [use LexicalTypeaheadMenuPlugin from `@lexical/react` PR](https://github.com/sodenn/lexical-beautiful-mentions/pull/345)
> 2. Making it compatible with React 17 (which is possible by the above change)
>
> The rest of this documentation is provided by the original author of the `*-beautiful-*` package, including the demo link.
> I simply adapted the rest of the instructions to the new package name, in order to publish it to npm.

[Demo](https://lexical-beautiful-mentions-docs.vercel.app/)

A mentions plugin for the [lexical editor](https://lexical.dev/). lexical is an extendable text editor for the web build by Meta. While the lexical playground offers a basic mentions plugin for demo purposes, this plugin is more advanced and offers more features.

- **Customizable triggers**: Use characters, words or regular expressions as triggers for mentions.
- **Editing mentions outside the editor**: Programmatically insert, delete, or rename mentions via the `useBetterMentions` hook.
- **Customizable mention style**: You can change the look of the mentions via the editor theme to match the style of your application.
- **Automatic spacing**: The plugin automatically adds spaces around the mentions, which makes it easier for the user to continue typing.
- **Adding new mentions**: You can allow users to create new mentions that are not in the suggestion list.
- **Flexible way to provide mentions**: You can use an async query function or a predefined list to provide mentions for the suggestion list.
- **Custom menu and menu item**: You can customize the look and behavior of the menu that displays the mention suggestions.
- **Additional metadata**: You can add additional metadata to the mention items, which will be included in the mention nodes when serializing the editor content.
- **Custom mention component**: You can replace the default mention component with a custom component of your choice.

## Installation

To install the plugin, run the following command:

```bash
// with npm
npm install lexical-better-mentions

// with yarn
yarn add lexical-better-mentions
```

You also need to install the `lexical` and `@lexical/react`, which is a peer dependency of this plugin.

## Usage

Import the `BetterMentionsPlugin` plugin:

```tsx
import { BetterMentionsPlugin, BetterMentionNode } from "lexical-better-mentions";
```

Add the plugin to the lexical editor:

```tsx
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";

const mentionItems = {
  "@": ["Anton", "Boris", "Catherine", "Dmitri", "Elena", "Felix", "Gina"],
  "#": ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape"],
  "due:": ["Today", "Tomorrow", "01-01-2023"],
};

const editorConfig = {
  // ...
  nodes: [BetterMentionNode] // 👈 register the mention node
};

return (
  <LexicalComposer initialConfig={editorConfig}>
    {/** ... */}
    <PlainTextPlugin // 👈 use the lexical RichTextPlugin for clipboard support
      contentEditable={/* ... */}
      placeholder={/* ... */}
      errorBoundary={/* ... */}
    />
    <BetterMentionsPlugin
      items={mentionItems}
    />
    {/** ... */}
  </LexicalComposer>
);
```

### Customize mention style

<img src="https://raw.githubusercontent.com/yamcodes/lexical-better-mentions/main/resources/screenshot1.png" width="200"/><br>

```tsx
import { BetterMentionsTheme } from "lexical-better-mentions";
// ...
const betterMentionsTheme: BetterMentionsTheme = {
  // 👇 use the trigger name as the key
  "@": "px-1 mx-px ...",
  // 👇 add the "Focused" suffix to style the focused mention
  "@Focused": "outline-none shadow-md ...",
  // 👇 use a configuration object if you need to apply different styles to trigger and value
  "due:": {
    trigger: "text-blue-400 ...",
    value: "text-orange-400 ...",
  },
}
const editorConfig = {
  // ...
  theme: {
    // ...
    betterMentions: betterMentionsTheme,
  },
};

// ...

return (
  <LexicalComposer initialConfig={editorConfig}>
    {/** ... */}
  </LexicalComposer>
);
```

### Custom mention node and component

If applying styles via the theme is not enough, you can replace the BetterMentionNode by using the lexical [Node Overrides](https://lexical.dev/docs/concepts/node-replacement) API. This allows you to change the default behavior of the mention node:

```tsx
export class CustomMentionsNode extends BetterMentionNode {
  static getType() {
    return "custom-betterMention";
  }
  static clone(node: CustomBetterMentionNode) {
    // TODO: implement
  }
  static importJSON(serializedNode: SerializedBetterMentionNode) {
    // TODO: implement
  }
  exportJSON(): SerializedBetterMentionNode {
    // TODO: implement
  }
  component(): ElementType<BetterMentionComponentProps> | null {
    // the component that renders the mention in the editor
    // return null to use the default component
    // 💡 if you only want to replace the component use the `createBetterMentionNode` helper method. See below for more details 👇
  }
  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    // TODO: implement
  }
}
const editorConfig = {
  // ...
  nodes: [
    // Don't forget to register your custom node separately!
    CustomMentionsNode,
    {
      replace: BetterMentionNode,
      with: (node: BetterMentionNode) => {
        return new CustomMentionsNode(
          node.getTrigger(),
          node.getValue(),
          node.getData(),
        );
      }
    }
  ]
}
```

The plugin also provides a helper method that overrides the default `BetterMentionNode` and uses a customized version with a component of your choice:

```tsx
const CustomMentionComponent = forwardRef<
  HTMLDivElement,
  BetterMentionComponentProps<MyData>
>(({ trigger, value, data: myData, children, ...other }, ref) => {
  return (
    <div {...other} ref={ref} title={trigger + value}>
      {value}
    </div>
  );
});
const editorConfig = {
  // ...
  nodes: [...createBetterMentionNode(CustomMentionComponent)],
};
```

### Custom menu and menu item component

<img src="https://raw.githubusercontent.com/yamcodes/lexical-better-mentions/main/resources/screenshot2.png" width="500"/><br>

```tsx
const CustomMenu = forwardRef<
  HTMLElement,
  BetterMentionsMenuProps
>(({ open, loading, ...props }, ref) => (
  <ul
    className="m-0 mt-6 ..."
    {...props}
    ref={ref}
  />
));

const CustomMenuItem = forwardRef<
  HTMLLIElement,
  BetterMentionsMenuItemProps
>(({ selected, item, ...props }, ref) => (
  <li
    className={`m-0 flex ... ${selected ? "bg-gray-100 ..." : "bg-white ..."}`}
    {...props}
    ref={ref}
  />
));

// ...

<BetterMentionsPlugin
  items={mentionItems}
  menuComponent={CustomMenu}
  menuItemComponent={CustomMenuItem}
/>
```

### Additional metadata

Additional metadata can be used to uniquely identify mentions by adding an `id` or any other unique property to the mention items. When serializing the editor content, the metadata will be included in the mention nodes:

```tsx
const mentionItems = {
  "@": [
    { value: "Catherine", id: "1", email: "catherine.a@example.com" },
    { value: "Catherine", id: "2", email: "catherine.b@example.com" },
    // ...
  ],
};
```

Serializes to the following lexical nodes:

```json
[
  {
    "trigger": "@",
    "value": "Catherine",
    "data": {
      "id": "1",
      "email": "catherine.a@example.com"
    },
    "type": "betterMention",
    "version": 1
  },
  {
    "trigger": "@",
    "value": "Catherine",
    "data": {
      "id": "2",
      "email": "catherine.b@example.com"
    },
    "type": "betterMention",
    "version": 1
  }
]
```

All additional metadata are available as props of the `BetterMentionsMenuItem` component:

```tsx
const CustomMenuItem = forwardRef<
  HTMLLIElement,
  BetterMentionsMenuItemProps
>(({ item: { data: { id, email }}, ...props }, ref) => (
 <li
  // ...
 />
));
```

### Programmatically insert, delete, or rename mentions

```tsx
import {
  BetterMentionsPlugin,
  useBetterMentions,
} from "lexical-better-mentions";

// ...

function MentionsToolbar() {
  const { removeMentions, insertMention } = useBetterMentions();
  return (
    <div className="grid gap-2 grid-cols-2">
      <Button onClick={() => removeMentions({ trigger: "#", value: "urgent" })}>
        Remove Mention
      </Button>
      <Button onClick={() => insertMention({ trigger: "#", value: "work" })}>
        Insert Mention
      </Button>
    </div>
  );
}

// ...

return (
  <LexicalComposer>
    {/** ... */}
    <BetterMentionsPlugin
      items={mentionItems}
    />
    <MentionsToolbar />
    {/** ... */}
  </LexicalComposer>
);
```

### Disable creating new mentions

```tsx
<BetterMentionsPlugin
  items={mentionItems}
  creatable={false} // 👈 hide the menu item that allows users to create new mentions
/>
```

### Async query function

```tsx
const queryMentions = async (trigger: string, query: string) => {
  const response = await fetch(
    `https://example.com/api/mentions?trigger=${trigger}&query=${query}`
  );
  const data = await response.json();
  return data as string[];
};

// ...

return (
  <LexicalComposer>
    {/** ... */}
    <BetterMentionsPlugin
      triggers={["@", "#"]} // needed to tell the plugin when to call the query function
      onSearch={queryMentions}
    />
    {/** ... */}
  </LexicalComposer>
);
```
