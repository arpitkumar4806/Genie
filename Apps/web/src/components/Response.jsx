import { formatMarkdown } from "../utils/Formater";

const Response = ({ markdown }) => {
  const response = formatMarkdown(markdown);
  return (
    <div
      id="response"
      className="mb-4 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: response }}
    ></div>
  );
};

export default Response;
