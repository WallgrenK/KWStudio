import { useContext } from "react";
import { DocumentEditorContext, type DocumentEditorContextValue } from "./DocumentEditorContext";

export function useDocumentEditor(): DocumentEditorContextValue {
  const context = useContext(DocumentEditorContext);
  if (!context) {
    throw new Error("useDocumentEditor must be used within DocumentEditorProvider.");
  }
  return context;
}
