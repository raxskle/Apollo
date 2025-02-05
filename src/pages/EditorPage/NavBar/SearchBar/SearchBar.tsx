import { Input } from "antd";
import "./SearchBar.scss";
import { useDecorateSearch } from "./useDecorateSearch";

import { useState } from "react";

function SearchBar() {
  const { onSearch, debouncedOnSearch } = useDecorateSearch();

  const [showText, setShowText] = useState("");

  return (
    <div
      className="search-bar"
      onBlur={() => {
        setShowText("");
        onSearch("");
      }}
    >
      <Input
        placeholder="Search text"
        allowClear
        value={showText} //  value设置showText，输入不防抖，高亮防抖
        onChange={(e) => {
          setShowText(e.target.value);
          debouncedOnSearch(e.target.value);
        }}
        style={{ width: 200, padding: "8px 12px", borderRadius: "8px" }}
      />
    </div>
  );
}
export default SearchBar;
