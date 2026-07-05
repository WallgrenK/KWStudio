import type { DocumentBlockType, DocumentBlockTypeMetadataDto } from "~/types/documents";
import type { EditorBlock } from "~/types/documentEditor";
import { bulletListPlugin } from "./bulletListPlugin";
import { calloutPlugin } from "./calloutPlugin";
import { dividerPlugin } from "./dividerPlugin";
import { headingPlugin } from "./headingPlugin";
import { imagePlugin } from "./imagePlugin";
import { paragraphPlugin } from "./paragraphPlugin";
import { pricingTablePlugin } from "./pricingTablePlugin";
import { signaturePlaceholderPlugin } from "./signaturePlaceholderPlugin";
import { timelinePlugin } from "./timelinePlugin";
import type { EditorPlugin } from "./types";

const builtInPlugins: EditorPlugin[] = [
  headingPlugin,
  paragraphPlugin,
  bulletListPlugin,
  pricingTablePlugin,
  timelinePlugin,
  calloutPlugin,
  imagePlugin,
  signaturePlaceholderPlugin,
  dividerPlugin,
];

const pluginMap = new Map<DocumentBlockType, EditorPlugin>(
  builtInPlugins.map((plugin) => [plugin.blockType, plugin]),
);

function enrichPlugin(plugin: EditorPlugin, metadata: DocumentBlockTypeMetadataDto | null): EditorPlugin {
  if (!metadata) return plugin;
  return {
    ...plugin,
    label: metadata.label || plugin.label,
    order: metadata.toolbarMeta?.order ?? plugin.order,
    group: metadata.toolbarMeta?.group ?? plugin.group,
    icon: metadata.toolbarMeta?.icon ?? plugin.icon,
  };
}

export const editorPluginRegistry = {
  get(blockType: DocumentBlockType, metadata: DocumentBlockTypeMetadataDto | null = null): EditorPlugin | null {
    const plugin = pluginMap.get(blockType);
    if (!plugin) return null;
    return enrichPlugin(plugin, metadata);
  },

  list(metadataByType: Record<string, DocumentBlockTypeMetadataDto> = {}): EditorPlugin[] {
    return builtInPlugins
      .map((plugin) => enrichPlugin(plugin, metadataByType[plugin.blockType] ?? null))
      .sort((a, b) => a.order - b.order);
  },

  createDefault(blockType: DocumentBlockType, sortOrder: number): EditorBlock {
    const plugin = pluginMap.get(blockType);
    if (!plugin) {
      throw new Error(`Unknown block type: ${blockType}`);
    }
    return plugin.createDefaultBlock(sortOrder);
  },
};
