console.log('1')

import { CoreEditor } from '@kerebron/editor';
import { AdvancedEditorKit } from '@kerebron/editor-kits/AdvancedEditorKit';
import { createAssetLoad } from '@kerebron/wasm/web';

import { attachEsheetCommands } from './attachEsheetCommands.ts';

const editor = CoreEditor.create({
  uri: 'test.md',
  assetLoad: createAssetLoad('/wasm'),
  element: document.getElementById('editor')!,
  editorKits: [
    new AdvancedEditorKit(),
  ],
});

const uiMarkdown = (await import('./ui.md?raw')).default;
await editor.loadDocumentText('text/markdown', uiMarkdown);

attachEsheetCommands(editor);
