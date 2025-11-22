"use client";

interface DataTableProps<TData> {
  columns: string[];
  data: TData[];
  renderCell: (item: TData, column: string) => React.ReactNode;
}

export function DataTable<TData>({
  columns,
  data,
  renderCell,
}: DataTableProps<TData>) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: 6 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            {columns.map((column) => (
              <th key={column} style={{ padding: 12, textAlign: "left", border: "1px solid #ddd", fontWeight: "bold" }}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 24, textAlign: "center", border: "1px solid #ddd" }}>
                No results.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column} style={{ padding: 12, border: "1px solid #ddd" }}>
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
