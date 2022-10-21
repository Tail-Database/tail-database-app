import React, { useEffect, useState } from 'react';
import {
  createColumnHelper,
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

function Tail() {

  return (
    <p>Tail info</p>
  );
}

export default Tail;
