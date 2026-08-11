export function splitIntoChapters(text) {
  const chapterPattern =
    /^(chapter\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+).*)$/gim;

  const matches = [...text.matchAll(chapterPattern)];

  if (matches.length === 0) {
    return [
      {
        chapterNumber: 1,
        title: "Chapter One",
        content: text.trim(),
      },
    ];
  }

  const chapters = [];

  matches.forEach((match, index) => {
    const title = match[1].trim();

    const start = match.index + match[0].length;

    const end =
      index + 1 < matches.length
        ? matches[index + 1].index
        : text.length;

    const content = text.slice(start, end).trim();

    chapters.push({
      chapterNumber: index + 1,
      title,
      content,
    });
  });

  return chapters;
}