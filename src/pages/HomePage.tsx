import React, { useEffect, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Link } from "react-router-dom";
import '../App.css';

declare global {
  interface Window {
    taildatabase?: any
  }
}

type Tail = {
  hash: string;
  name: string;
  code: number;
};

const columnHelper = createColumnHelper<Tail>();

const columns = [
  columnHelper.accessor('hash', {
    header: () => 'TAIL Hash / Asset ID',
    cell: info => <Link to={`/tail/${info.getValue()}`}>{info.getValue().slice(0, 20)}...</Link>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.name, {
    id: 'name',
    cell: info => <i>{info.getValue()}</i>,
    header: () => 'Name',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('code', {
    header: () => 'Code',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
];

function HomePage() {
  const [tails, setTails] = useState([]);
  const table = useReactTable({
    data: tails,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    window.taildatabase.getTails().then((res: any) => setTails(res))
  }, []);

  return (
    <table className="tail-table">
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default HomePage;
