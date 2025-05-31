import React, { useState } from "react";
import SearchBookField from "../features/SearchBookField";

const SearchSection: React.FC = () => {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    // Implement search logic here
    alert(`Searching for: ${search}`);
  };

  return (
    <section className="py-6 px-4">
      <h2 className="text-xl font-semibold mb-2">Search</h2>
      <SearchBookField value={search} onChange={setSearch} onSearch={handleSearch} />
      {/* Optionally, show search results here */}
    </section>
  );
};

export default SearchSection;
