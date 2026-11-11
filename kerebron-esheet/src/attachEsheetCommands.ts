import { mountStandaloneRenderer } from '@esheet/renderer-standalone';

import { Ui } from '@kerebron/ui';
import { createRegexMatcher } from '@kerebron/ui/autocomplete';
import { AutocompleteSource } from '@kerebron/ui/autocomplete';
import { bindSelect } from '@kerebron/ui/events';
import { TemplatesRegistry } from '@kerebron/ui/templates';

const demoForm = `
id: standalone-demo
title: Standalone Renderer Demo
pages:
  - id: page-1
    fields:
    - id: field1
      fieldType: text
      question: Field1?
      required: true
    - id: field2
      fieldType: text
      question: Field2?
      required: true
`;

export function attachEsheetCommands(editor) {
  const ui: Ui = editor.ci.resolve('ui');

  const regexAutocomplete: AutocompleteSource = {
    match: createRegexMatcher(editor, [/[@\/][^\s@\/]*/]),
    processRequest: async function (trigger, match, createPopup) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const templates: TemplatesRegistry = editor.ci.resolve('templates');

      if (match.text.startsWith('@')) {
        const items = [
          '@regex_trigger',
          '@alice',
          '@bob',
          '@doug',
          '@greg',
          '@monika',
        ].filter((str) => str.startsWith(match.text));
        if (items.length === 0) {
          return;
        }

        const popup = createPopup();
        ui.setPopupContent(
          popup,
          templates['dropdown-list']({
            items: items.map((i) => ({ label: i, value: i })),
          }),
        );
        bindSelect(
          popup,
          (value) => editor.chain().replaceRangeText(match.range, value).run(),
        );

        return { ...match, meta: items };
      }

      if (match.text.startsWith('/')) {
        const popup = createPopup();

        const standalone = mountStandaloneRenderer(popup, {
          formDataInput: demoForm,
        });

        popup.addEventListener('remove', () => {
          standalone.unmount();
        })

        popup.addEventListener('keydown', (event: KeyboardEvent) => {
          if (!event.target) {
            return;
          }
          if (event.key === 'Enter') {
            const value = JSON.stringify(standalone.getResponse(), null, 2);
            editor.chain().replaceRangeText(match.range, value).run();
            popup.remove();
          }
        }, true);

        return { ...match };
      }
    },
  };
  editor.chain().addAutocompleteSource(regexAutocomplete).run();
}
