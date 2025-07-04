export function parseMarkdown(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Headings
  html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
  html = html.replace(/__(.*)__/gim, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*)\*/gim, "<em>$1</em>");
  html = html.replace(/_(.*)_/gim, "<em>$1</em>");
  
  // Strikethrough
  html = html.replace(/~~(.*)~~/gim, "<del>$1</del>");

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/\!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />');

  // Unordered lists
  html = html.replace(/^\s*[\-\+\*] (.*)/gim, "<ul>\n<li>$1</li>\n</ul>");
  html = html.replace(/<\/ul>\n<ul>/gim, "");

  // Ordered lists
  html = html.replace(/^\s*\d+\. (.*)/gim, "<ol>\n<li>$1</li>\n</ol>");
  html = html.replace(/<\/ol>\n<ol>/gim, "");

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/gim, '<pre><code class="language-$1">$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/gim, "<code>$1</code>");
  
  // Horizontal rule
  html = html.replace(/---/gim, "<hr>");
  
  // Paragraphs (and line breaks)
  html = html.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '<br/>').join('');
  html = html.replace(/<\/p><br\/><p>/g, "</p><p>"); // Clean up paragraphs

  return html;
}
