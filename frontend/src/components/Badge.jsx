import { labelFor } from "../utils/i18n";

// Colored label for a severity or status value (colors in styles.css)
export default function Badge({ value }) {
  return <span className={`badge badge-${value}`}>{labelFor(value)}</span>;
}
