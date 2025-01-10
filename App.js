import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentState,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

const MyEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      try {
        return EditorState.createWithContent(
          convertFromRaw(JSON.parse(savedContent))
        );
      } catch (e) {
        console.error("Error parsing saved content:", e);
        return EditorState.createWithContent(ContentState.createFromText("")); // Start with default text if parse fails
      }
    }
    return EditorState.createWithContent(ContentState.createFromText("")); // Start with default text
  });

  useEffect(() => {
    // Persist the editor content to localStorage before the page is unloaded
    const handleBeforeUnload = () => {
      localStorage.setItem(
        "editorContent",
        JSON.stringify(convertToRaw(editorState.getCurrentContent()))
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [editorState]);

  const handleSave = () => {
    // Persist the editor content to localStorage when the save button is clicked
    localStorage.setItem(
      "editorContent",
      JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    );
    alert("Content Saved!");
  };

  const handleBeforeInput = (chars) => {
    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const startKey = selectionState.getStartKey();
    const startOffset = selectionState.getStartOffset();
    const block = currentContent.getBlockForKey(startKey);
    const text = block.getText().slice(0, startOffset);

    if (chars === " ") {
      let newText = text;
      let newEditorState = editorState;

      if (text.startsWith("***")) {
        newText = text.replace("***", "");
        newEditorState = RichUtils.toggleInlineStyle(
          EditorState.push(
            editorState,
            Modifier.replaceText(currentContent, selectionState, newText),
            "change-block-type"
          ),
          "UNDERLINE"
        );
      } else if (text.startsWith("**")) {
        newText = text.replace("**", "");
        newEditorState = RichUtils.toggleInlineStyle(
          EditorState.push(
            editorState,
            Modifier.replaceText(currentContent, selectionState, newText),
            "change-block-type"
          ),
          "RED"
        );
      } else if (text.startsWith("*")) {
        newText = text.replace("*", "");
        newEditorState = RichUtils.toggleInlineStyle(
          EditorState.push(
            editorState,
            Modifier.replaceText(currentContent, selectionState, newText),
            "change-block-type"
          ),
          "BOLD"
        );
      } else if (text.startsWith("#")) {
        newText = text.replace("#", "");
        newEditorState = EditorState.push(
          editorState,
          Modifier.replaceText(currentContent, selectionState, newText),
          "change-block-type"
        );
        newEditorState = RichUtils.toggleBlockType(
          newEditorState,
          "header-one"
        );
      } else {
        return "not-handled";
      }
      setEditorState(newEditorState);
      return "handled";
    }
    return "not-handled";
  };

  const styleMap = {
    RED: {
      color: "red",
    },
    UNDERLINE: {
      textDecoration: "underline",
    },
  };

  const initialContentState = ContentState.createFromText(`This is a heading

This is a bold line

This is a red line

This line is underlined`);

  return (
    <div style={{ width: "80%", margin: "0 auto" }}>
      <h1>Demo editor by &lt;Your Name&gt;</h1>
      <button onClick={handleSave}>Save</button>
      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          minHeight: "200px",
        }}
      >
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
          placeholder="Start typing here..."
          defaultContentState={initialContentState}
        />
      </div>
    </div>
  );
};

export default MyEditor;
