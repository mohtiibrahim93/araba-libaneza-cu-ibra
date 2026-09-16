/**
 * The side-by-side table every dialect comparison page carries.
 *
 * Extracted because six pages render the same thing and the markup is long
 * enough to bury the content in them. It also keeps one table shape across the
 * set, which is what makes the pages scannable as a group — and readable to an
 * assistant quoting one row out of a page.
 */
interface ComparisonTableProps {
  /** Column headings, first one being the label column. */
  columns: string[];
  /** One array per row, same length as `columns`. */
  rows: string[][];
  caption?: string;
}

const ComparisonTable = ({ columns, rows, caption }: ComparisonTableProps) => (
  <div className="overflow-x-auto -mx-4 md:mx-0">
    <table className="min-w-full text-left border border-border rounded-lg overflow-hidden">
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead className="bg-muted">
        <tr>
          {columns.map((c) => (
            <th key={c} className="p-3 text-sm font-semibold text-foreground">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]} className="border-t border-border align-top">
            {row.map((cell, i) => (
              <td
                key={i}
                className={i === 0 ? "p-3 text-sm font-medium text-foreground" : "p-3 text-sm text-muted-foreground"}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ComparisonTable;
