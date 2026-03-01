import hljs from "highlight.js";

const formatCode = (markdown) => {
  const formatted = markdown.replace(/`([^`]+)`/g, function (match, code) {
    const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<code class="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700 text-sm dark:bg-zinc-700 dark:text-white" style="font-family: 'Google Sans Code', monospace;">${escapedCode}</code>`;
  });

  return formatted;
};

const formatCodeBlocks = (markdown) => {
  const formatted = markdown.replace(
    /```(?:([a-zA-Z0-9]+)\n)?([\s\S]*?)```/g,
    function (match, language, code) {
      const langClass = language ? ` class="language-${language}"` : "";
      const highlightedCode = language
        ? hljs.highlight(code.trim(), { language }).value
        : hljs.highlightAuto(code.trim()).value;
      return `
                <div class="overflow-hidden my-4">
                    <div class="flex justify-between items-center my-1 px-4 py-2 bg-zinc-100 rounded-t-2xl rounded-b-sm dark:bg-zinc-700">
                        <span class="text-sm font-medium">${language}</span>
                        <button 
                            class="px-1 py-0.5 text-sm font-bold rounded-md hover:bg-zinc-200 hover:shadow-md focus:outline-none dark:hover:bg-zinc-600"
                            onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent.trim())"
                        >
                            Copy
                        </button>
                    </div>
                    <pre class="p-4 rounded-t-sm rounded-b-2xl bg-zinc-100 overflow-x-auto dark:bg-zinc-700"><code${langClass} class="text-sm hljs" style="font-family: 'Google Sans Code', monospace;">${highlightedCode}</code></pre>
                </div>`;
    },
  );
  return formatted;
};

const formatTable = (markdown) => {
  const lines = markdown.split("\n");
  let inTable = false;
  let currentRowIndex = 0;
  let tableHTML = "";
  let result = "";
  const rowspanCells = {};
  let firstTableLineIndex = -1;
  const rowspanCount = {};
  const tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isSeparator = line.match(/\|\s*:?-+:?\s*\|/);

    if (line.includes("|") && !isSeparator) {
      if (firstTableLineIndex === -1) {
        firstTableLineIndex = i;
      }
      const parts = line.split("|");
      if (parts[0].trim() === "") parts.shift();
      if (parts[parts.length - 1].trim() === "") parts.pop();

      tableRows.push({ content: parts, originalLineIndex: i });

      parts.forEach((cell, cellIndex) => {
        const cellContent = cell.trim();

        if (cellContent === "" && currentRowIndex > 0) {
          const cellKey = `${cellIndex}`;
          if (!rowspanCells[cellKey]) {
            rowspanCells[cellKey] = [];
          }
          rowspanCells[cellKey].push(currentRowIndex);

          if (!rowspanCount[cellKey]) {
            rowspanCount[cellKey] = {};
          }

          let lastNonEmptyRow = currentRowIndex - 1;
          while (
            lastNonEmptyRow >= 0 &&
            rowspanCells[cellKey].includes(lastNonEmptyRow)
          ) {
            lastNonEmptyRow--;
          }

          if (lastNonEmptyRow >= 0) {
            if (!rowspanCount[cellKey][lastNonEmptyRow]) {
              rowspanCount[cellKey][lastNonEmptyRow] = 2;
            } else {
              rowspanCount[cellKey][lastNonEmptyRow]++;
            }
          }
        }
      });
    }
  }

  inTable = false;

  for (let i = 0; i < tableRows.length; i++) {
    const lineContent = tableRows[i].content;
    const originalLineIndex = tableRows[i].originalLineIndex;

    if (!inTable) {
      inTable = true;
      tableHTML = '<table class="w-full border-collapse my-4">';
    }

    const nextLine = lines[originalLineIndex + 1];
    const isHeader = nextLine && nextLine.match(/\|\s*:?-+:?\s*\|/);

    tableHTML += '<tr class="border-b border-zinc-200">';

    lineContent.forEach((cell, cellIndex) => {
      const cellContent = cell.trim();
      const cellKey = `${cellIndex}`;

      if (
        cellContent === "" &&
        rowspanCells[cellKey] &&
        rowspanCells[cellKey].includes(currentRowIndex)
      ) {
        return;
      }

      const rowspan =
        rowspanCount[cellKey] && rowspanCount[cellKey][currentRowIndex]
          ? ` rowspan="${rowspanCount[cellKey][currentRowIndex]}"`
          : "";

      if (isHeader) {
        tableHTML += `<th class="py-2 px-4 bg-zinc-100 font-semibold text-left dark:bg-zinc-700"${rowspan}>${cellContent}</th>`;
      } else {
        tableHTML += `<td class="py-2 px-4 border-t border-zinc-200"${rowspan}>${cellContent}</td>`;
      }
    });

    tableHTML += "</tr>";
    currentRowIndex++;
  }

  let lastTableLineIndex = -1;
  if (tableRows.length > 0) {
    lastTableLineIndex = tableRows[tableRows.length - 1].originalLineIndex;
  }

  if (firstTableLineIndex !== -1 && lastTableLineIndex !== -1) {
    for (let i = 0; i < firstTableLineIndex; i++) {
      result += lines[i] + "\n";
    }
    if (inTable) {
      tableHTML += "</table>";
      result += tableHTML;
    }
    for (let i = lastTableLineIndex + 1; i < lines.length; i++) {
      result += lines[i] + "\n";
    }
  } else {
    result = markdown;
  }

  return result;
};

const formatLists = (markdown) => {
  const lines = markdown.split("\n");
  let result = "";
  let inList = false;
  let listType = "";
  let listContent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/);
    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);

    if (unorderedMatch || orderedMatch) {
      const content = unorderedMatch ? unorderedMatch[1] : orderedMatch[1];
      const isOrdered = !!orderedMatch;

      if (!inList) {
        inList = true;
        listType = isOrdered ? "ol" : "ul";
        const listClass = isOrdered ? "list-decimal" : "list-disc";
        listContent = `<${listType} class="${listClass} pl-5 my-4 space-y-2"><li class="ml-2">${content}</li>`;
      } else {
        listContent += `<li class="ml-2">${content}</li>`;
      }
    } else if (inList) {
      inList = false;
      listContent += `</${listType}>`;
      result += listContent + "\n";
      result += line + "\n";
    } else {
      result += line + "\n";
    }
  }

  if (inList) {
    listContent += `</${listType}>`;
    result += listContent;
  }

  return result;
};

const formatPlainText = (markdown) => {
  let formatted = markdown;

  formatted = formatted.replace(
    /^(#{1,6})\s+(.+)$/gm,
    function (match, hashes, content) {
      const level = hashes.length;
      const sizeClasses = {
        1: "text-4xl font-bold mt-6 mb-4",
        2: "text-3xl font-bold mt-5 mb-3",
        3: "text-2xl font-bold mt-4 mb-2",
        4: "text-xl font-semibold mt-3 mb-2",
        5: "text-lg font-semibold mt-2 mb-1",
        6: "text-base font-semibold mt-2 mb-1",
      };
      return `<h${level} class="${
        sizeClasses[level]
      }">${content.trim()}</h${level}>`;
    },
  );

  formatted = formatted.replace(
    /\*\*([^*]+)\*\*|__([^_]+)__/g,
    function (match, content1, content2) {
      return `<strong class="font-bold">${content1 || content2}</strong>`;
    },
  );

  formatted = formatted.replace(
    /\*([^*]+)\*|_([^_]+)_/g,
    function (match, content1, content2) {
      return `<em class="italic">${content1 || content2}</em>`;
    },
  );

  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    function (match, text, url) {
      return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline">${text}</a>`;
    },
  );

  formatted = formatted.replace(
    /!\[([^\]]+)\]\(([^)]+)\)/g,
    function (match, alt, url) {
      return `<img src="${url}" alt="${alt}" class="max-w-full h-auto my-4 rounded-md">`;
    },
  );

  formatted = formatted.replace(
    /<p[^>]*>!<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a><\/p>/g,
    function (match, url, alt) {
      return `<img src="${url}" alt="${alt}" class="max-w-full h-auto my-4 rounded-md">`;
    },
  );

  formatted = formatted.replace(
    /!<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
    function (match, url, alt) {
      return `<img src="${url}" alt="${alt}" class="max-w-full h-auto my-4 rounded-md">`;
    },
  );

  formatted = formatted.replace(
    /^\s*---+\s*$/gm,
    '<hr class="my-8 border-zinc-300">',
  );

  formatted = formatted.replace(
    /^>\s*(.+)$/gm,
    '<blockquote class="border-l-4 border-zinc-300 pl-4 italic my-4"><p>$1</p></blockquote>',
  );

  formatted = formatted.replace(
    /^(?!<[a-z][^>]*>)(.+)$/gm,
    function (match, content) {
      if (content.trim() === "") return "";
      if (content.match(/^<(\/)?[a-z][^>]*>/)) return content; // Don't wrap if already HTML
      return `<p class="my-3 leading-relaxed">${content.trim()}</p>`;
    },
  );

  return formatted;
};

export const formatMarkdown = (markdown) => {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  const parts = [];
  let lastIndex = 0;

  const codeBlockRegex = /```(?:([a-zA-Z0-9]+)\n)?([\s\S]*?)```/g;
  let match;

  const processedParts = [];

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: markdown.substring(lastIndex, match.index),
      });
    }

    const language = match[1] || "";
    const code = match[2].trim();
    parts.push({
      type: "code",
      language,
      content: code,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < markdown.length) {
    parts.push({
      type: "text",
      content: markdown.substring(lastIndex),
    });
  }

  for (const part of parts) {
    if (part.type === "code") {
      processedParts.push(
        formatCodeBlocks(`\`\`\`${part.language}\n${part.content}\`\`\``),
      );
    } else {
      let formatted = part.content;
      formatted = formatCode(formatted);
      formatted = formatTable(formatted);
      formatted = formatLists(formatted);
      formatted = formatPlainText(formatted);

      processedParts.push(formatted);
    }
  }

  let result = processedParts.join("");

  result = result.replace(
    /<p>!\[([^\]]+)\]\(([^)]+)\)<\/p>/g,
    '<img src="$2" alt="$1">',
  );
  result = result.replace(
    /<p>!<a href="([^"]+)">([^<]+)<\/a><\/p>/g,
    '<img src="$1" alt="$2">',
  );

  return result;
};
