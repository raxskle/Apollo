import { useCallback, useRef } from "react";
import { NodeEntry, Range } from "slate";
import { isCustomElement, isCustomText } from "../../../../types/editor";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { setSearch } from "../../../../store/viewSlice";
import { debounce } from "lodash";

export const useDecorateSearch = () => {
  const search = useSelector((state: RootState) => state.view.search);
  const dispath = useDispatch();

  const onSearch = useCallback(
    (value: string) => {
      dispath(setSearch(value));
    },
    [dispath]
  );

  const debouncedOnSearch = useRef(debounce(onSearch, 400)).current;
  // debounce()之后，如果不用useRef或者用useCallback包裹函数，
  // 每次render都会重新创建一个函数，导致debounce失效

  const decorateSearch = useCallback(
    ([node, path]: NodeEntry): Range[] => {
      const ranges = [];

      if (
        search &&
        isCustomElement(node) &&
        Array.isArray(node.children) &&
        node.children.every(isCustomText)
      ) {
        const texts = node.children.map((it) => it.text);
        const str = texts.join("");
        const length = search.length;
        let start = str.indexOf(search);
        let index = 0;
        let iterated = 0;
        while (start !== -1) {
          // Skip already iterated strings
          while (
            index < texts.length &&
            start >= iterated + texts[index].length
          ) {
            iterated = iterated + texts[index].length;
            index++;
          }
          // Find the index of array and relative position
          let offset = start - iterated;
          let remaining = length;
          while (index < texts.length && remaining > 0) {
            const currentText = texts[index];
            const currentPath = [...path, index];
            const taken = Math.min(remaining, currentText.length - offset);
            ranges.push({
              anchor: { path: currentPath, offset },
              focus: { path: currentPath, offset: offset + taken },
              highlight: true,
            });
            remaining = remaining - taken;
            if (remaining > 0) {
              iterated = iterated + currentText.length;
              // Next block will be indexed from 0
              offset = 0;
              index++;
            }
          }
          // Looking for next search block
          start = str.indexOf(search, start + search.length);
        }
      }

      return ranges;
    },
    [search]
  );

  return { search, onSearch, decorateSearch, debouncedOnSearch };
};
