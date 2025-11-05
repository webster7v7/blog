export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): TOCItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');

    headings.push({ id, text, level });
  }

  return headings;
}

export function addHeadingIds(markdown: string): string {
  return markdown.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
    const id = text
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${hashes} ${text} {#${id}}`;
  });
}

export function processMarkdown(content: string): string {
  // 基础处理，可以在这里添加自定义的 Markdown 处理逻辑
  return content;
}

