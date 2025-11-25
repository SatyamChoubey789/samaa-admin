// lib/editor-extensions.ts
// Centralized TipTap extensions configuration

import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Heading from "@tiptap/extension-heading"
import TextAlign from "@tiptap/extension-text-align"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import Blockquote from "@tiptap/extension-blockquote"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Placeholder from "@tiptap/extension-placeholder"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import { Color } from "@tiptap/extension-color"
import {TextStyle} from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import { createLowlight, common } from "lowlight"

const lowlight = createLowlight(common)

export const getEditorExtensions = () => [
  StarterKit.configure({
    bulletList: false,
    orderedList: false,
    heading: false, // We'll use our own heading extension
  }),
  Underline,
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      class: "text-blue-600 underline cursor-pointer",
    },
  }),
  Image.configure({
    inline: false,
    HTMLAttributes: {
      class: "max-w-full h-auto rounded-lg my-4",
    },
  }),
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: "list-disc list-outside ml-4",
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: "list-decimal list-outside ml-4",
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: "border-l-4 border-gray-300 pl-4 italic my-4",
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: "bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto",
    },
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: "border-collapse table-auto w-full my-4",
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: "border-b",
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: "border border-gray-300 px-4 py-2",
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: "border border-gray-300 px-4 py-2 bg-gray-100 font-semibold",
    },
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  Placeholder.configure({
    placeholder: "Start writing your story…",
  }),
]