export interface BetterMentionsThemeValues {
  trigger?: string;
  value?: string;
  container?: string;
  containerFocused?: string;
}

/**
 * The theme configuration for BetterMentions. Rules:
 * - The keys are regular expressions that match the triggers.
 * - The values are strings with class names or
 *   {@link BetterMentionsThemeValues} objects.
 * - Append `Focused` to the key to apply styles when the trigger
 *   is focused. Limitation: the value must be a string with class names.
 * - If you need to apply different styles to trigger and value,
 *   use an {@link BetterMentionsThemeValues} object instead of a string.
 */
export type BetterMentionsTheme = Record<
  string,
  string | BetterMentionsThemeValues
>;
