const EMOJI_ALLOWED = /[\p{Extended_Pictographic}\uFE0F\u200D\u{1F3FB}-\u{1F3FF}]/gu;

export const isEmojiOnly = (value: string) => {
  if (!value) {
    return false;
  }

  const stripped = value.replace(EMOJI_ALLOWED, '');
  return stripped.length === 0;
};
