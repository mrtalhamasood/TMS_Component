import type { ReactNode } from "react";

interface TableProps {
  headers: string[];
  rows: ReactNode[][];
}

export default function Table({ headers, rows }: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-900 text-white">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-sm font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-middle text-sm text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
