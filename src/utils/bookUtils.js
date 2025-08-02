export const getBookSectionType = (section_type) => {
  if (section_type === "chapters") {
    return "chapter";
  } else if (section_type === "parts") {
    return "part";
  } else {
    return null;
  }
};
