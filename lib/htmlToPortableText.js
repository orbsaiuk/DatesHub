import { parse } from "node-html-parser";
import { uuid } from "@sanity/uuid";

function makeSpan(text, marks = []) {
  return { _key: uuid(), _type: "span", text: text || "", marks: [...marks] };
}

function makeBlock({ style = "normal", children = [], listItem, level }) {
  const block = {
    _key: uuid(),
    _type: "block",
    style,
    markDefs: [],
    children: children.length ? children : [makeSpan("")],
  };
  if (listItem) block.listItem = listItem;
  if (level) block.level = level;
  return block;
}

function extractInline(node, activeMarks = []) {
  const spans = [];
  const stackMarks = [...activeMarks];
  node.childNodes?.forEach((child) => {
    if (child.nodeType === 3) {
      // text node
      const text = child.rawText || "";
      if (text) spans.push(makeSpan(text, stackMarks));
      return;
    }
    if (child.nodeType === 1) {
      const tag = child.tagName?.toLowerCase();
      let marks = stackMarks;
      if (tag === "strong" || tag === "b") marks = [...marks, "strong"];
      if (tag === "em" || tag === "i") marks = [...marks, "em"];
      // Ignore links/marks for simplicity (annotations require schema setup)
      spans.push(...extractInline(child, marks));
    }
  });
  return spans;
}

export default function htmlToPortableText(html) {
  if (!html || typeof html !== "string") return [];
  const root = parse(html);
  const blocks = [];

  const walk = (node) => {
    if (node.nodeType === 3) {
      // text at root -> wrap in paragraph
      const text = node.rawText?.trim();
      if (text)
        blocks.push(makeBlock({ style: "normal", children: [makeSpan(text)] }));
      return;
    }
    if (node.nodeType !== 1) return;

    const tag = node.tagName?.toLowerCase();
    switch (tag) {
      case "h1":
      case "h2":
      case "h3":
      case "h4": {
        const style = tag;
        const children = extractInline(node);
        blocks.push(makeBlock({ style, children }));
        break;
      }
      case "p": {
        const children = extractInline(node);
        blocks.push(makeBlock({ style: "normal", children }));
        break;
      }
      case "ul": {
        node.childNodes?.forEach((li) => {
          if (li.tagName?.toLowerCase() === "li") {
            const children = extractInline(li);
            blocks.push(
              makeBlock({ style: "normal", children, listItem: "bullet" })
            );
          }
        });
        break;
      }
      case "ol": {
        node.childNodes?.forEach((li) => {
          if (li.tagName?.toLowerCase() === "li") {
            const children = extractInline(li);
            blocks.push(
              makeBlock({ style: "normal", children, listItem: "number" })
            );
          }
        });
        break;
      }
      case "blockquote": {
        const children = extractInline(node);
        blocks.push(makeBlock({ style: "blockquote", children }));
        break;
      }
      case "img": {
        // Convert img to Sanity image block
        const src = node.getAttribute("src");
        const alt = node.getAttribute("alt") || "";
        if (src) {
          blocks.push({
            _key: uuid(),
            _type: "image",
            asset: {
              _type: "reference",
              _ref: src, // This would need proper asset handling in production
            },
            alt: alt,
          });
        }
        break;
      }
      case "br": {
        // newline -> new empty block
        blocks.push(makeBlock({ style: "normal", children: [makeSpan("")] }));
        break;
      }
      default: {
        // For other containers (div, section), walk children
        node.childNodes?.forEach(walk);
      }
    }
  };

  root.childNodes?.forEach(walk);
  // Fallback if no blocks produced
  return blocks.length
    ? blocks
    : [makeBlock({ style: "normal", children: [makeSpan("")] })];
}
