import React, { useEffect, useState } from 'react';
import ReactTimeAgo from 'react-time-ago'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Link } from "react-router-dom";
import '../App.css';
import Layout from '../Layout';
import { TailRecord } from '../models/tail/record';
import { db } from '../taildatabase/db';

const uniqueTailRecords = (arr: TailRecord[]) => [...new Map(arr.map(item => [item.hash, item])).values()];

const columnHelper = createColumnHelper<TailRecord>();

const columns = [
  columnHelper.accessor('hash', {
    header: () => 'TAIL Hash / Asset ID',
    cell: info => <Link to={`/tail/${info.getValue()}`}>{info.getValue()}</Link>,
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

const Tails = ({ tails, updated }: { tails: TailRecord[]; updated: number | null; }) => {
  const table = useReactTable({
    data: tails,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <table className="table">
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
      {updated && (<>Last updated: <ReactTimeAgo date={updated} locale="en-US" timeStyle={"round"} /></>)}
    </>
  );
};

const tailsTable = db.table<TailRecord>('tails');

function HomePage() {
  const [updated, setUpdated] = useState<number | null>(null);
  const [tails, setTails] = useState<TailRecord[]>([]);
  const [searchResults, setSearchResults] = useState<TailRecord[]>([]);

  const updateDb = (tailRecords: TailRecord[]) =>
    tailsTable.clear()
      .then(() => tailsTable.bulkAdd(tailRecords));

  useEffect(() => {
    (function getTails() {
      window.taildatabase.getTails()
        .then((tailRecords: any) => {
          setTails(tailRecords);

          return updateDb(tailRecords);
        })
        .then(()=> {
          setUpdated(Date.now());
          setTimeout(getTails, 10000);
        });
    })();
  }, []);

  const onSearchChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;

    if (searchTerm.length === 64) {
      const results = await tailsTable
        .where('hash')
        .equals(searchTerm)
        .toArray();

      setSearchResults(results);
    } else if (searchTerm.length <= 5) {
      const [codeResults, nameResults] = await Promise.all([
        tailsTable
          .where('code')
          .startsWithIgnoreCase(searchTerm)
          .toArray(),
        tailsTable
          .where('name')
          .startsWithIgnoreCase(searchTerm)
          .toArray()
      ]);

      setSearchResults(uniqueTailRecords([...codeResults, ...nameResults]));
    } else {
      const results = await tailsTable
        .where('name')
        .startsWithIgnoreCase(searchTerm)
        .toArray();

      setSearchResults(results);
    }
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-md-12 search">
          <div className="form-group">
            <label htmlFor="search"></label> <input type="text" className="form-control" id="search" name="search" placeholder="Search by name, code, or hash..." onChange={onSearchChange} />
          </div>
        </div>
        <div className="col-md-12">
          <Tails tails={searchResults.length > 0 ? searchResults : tails} updated={updated} />
        </div>
      </div>

    </Layout>
  );
}

export default HomePage;
