/**
 * Calculates the minimal range to replace between two strings.
 * 
 * @param oldStr The last successfully synced content
 * @param newStr The current editor content
 * @returns { startIndex: number, endIndex: number, content: string }
 */
export function calculateDiff(oldStr: string, newStr: string) {
  let start = 0;
  let oldEnd = oldStr.length;
  let newEnd = newStr.length;

  // Find common prefix
  while (start < oldEnd && start < newEnd && oldStr[start] === newStr[start]) {
    start++;
  }

  // Find common suffix
  while (
    oldEnd > start &&
    newEnd > start &&
    oldStr[oldEnd - 1] === newStr[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }

  return {
    startIndex: start,
    endIndex: oldEnd,
    content: newStr.slice(start, newEnd),
  };
}
