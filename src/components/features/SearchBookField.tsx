import React from "react";
import { SearchIcon } from "../common/icons/SearchIcon";

type SearchBookFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

const SearchBookField: React.FC<SearchBookFieldProps> = ({ value, onChange, onSearch }) => (
  <div className="flex w-full items-center">
    <input
      type="text"
      className="flex-1 px-4 h-11 text-sm border border-black rounded-[10px] outline-none"
      placeholder="Search for a book..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSearch();
      }}
    />
    <button
      className="ml-3 px-4 h-11 min-w-[44px] flex items-center justify-center rounded-[10px] border border-none"
      style={{ backgroundColor: "#FAC304" }}
      onClick={onSearch}
      type="button"
    >
      <SearchIcon className="w-5 h-5" />
    </button>
  </div>
);

export default SearchBookField;
