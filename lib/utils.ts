export function calculateReadingTime(content: string): number {
  // 中文按字数计算，英文按单词计算
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = content.match(/[a-zA-Z]+/g) || [];
  
  // 假设中文阅读速度 400字/分钟，英文 200词/分钟
  const chineseTime = chineseChars.length / 400;
  const englishTime = englishWords.length / 200;
  
  return Math.ceil(chineseTime + englishTime);
}

export function countWords(content: string): number {
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = content.match(/[a-zA-Z]+/g) || [];
  
  return chineseChars.length + englishWords.length;
}

export function formatDate(dateString: string, formatType: 'full' | 'short' = 'full'): string {
  const date = new Date(dateString);
  
  if (formatType === 'short') {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }
  
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

