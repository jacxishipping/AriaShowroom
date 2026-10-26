"use client";

import React from "react";
import Table, { TableProps } from "@mui/material/Table";
import TableContainer, { TableContainerProps } from "@mui/material/TableContainer";
import TableHead, { TableHeadProps } from "@mui/material/TableHead";
import TableBody, { TableBodyProps } from "@mui/material/TableBody";
import TableRow, { TableRowProps } from "@mui/material/TableRow";
import TableCell, { TableCellProps } from "@mui/material/TableCell";
import TablePagination, { TablePaginationProps } from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";

export interface MuiTableProps extends Omit<TableProps, "size"> {
  dense?: boolean;
  size?: "small" | "medium";
}

export interface MuiTableContainerProps extends TableContainerProps {
  elevation?: number;
}

export const MuiTableContainer = React.forwardRef<HTMLDivElement, MuiTableContainerProps>(
  function MuiTableContainer({ children, className = "", elevation = 1, ...props }, ref) {
    return (
      <TableContainer
        ref={ref}
        component={Paper}
        elevation={elevation}
        className={className}
        sx={{ overflowX: "auto" }}
        {...props}
      >
        {children}
      </TableContainer>
    );
  }
);

export const MuiTable = React.forwardRef<HTMLTableElement, MuiTableProps>(
  function MuiTable({ children, dense = true, size, className = "", ...props }, ref) {
    return (
      <Table
        ref={ref}
        size={size || (dense ? "small" : "medium")}
        className={className}
        {...props}
      >
        {children}
      </Table>
    );
  }
);

export const MuiTableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  function MuiTableHead({ children, className = "", ...props }, ref) {
    return (
      <TableHead ref={ref} className={className} {...props}>
        {children}
      </TableHead>
    );
  }
);

export const MuiTableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function MuiTableBody({ children, className = "", ...props }, ref) {
    return (
      <TableBody ref={ref} className={className} {...props}>
        {children}
      </TableBody>
    );
  }
);

export const MuiTableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  function MuiTableRow({ children, hover = true, className = "", ...props }, ref) {
    return (
      <TableRow ref={ref} hover={hover} className={className} {...props}>
        {children}
      </TableRow>
    );
  }
);

export interface MuiTableCellProps extends TableCellProps {
  header?: boolean;
}

export const MuiTableCell = React.forwardRef<HTMLTableCellElement, MuiTableCellProps>(
  function MuiTableCell({ children, header, align, className = "", ...props }, ref) {
    const alignClass =
      align === "right"
        ? "text-end"
        : align === "center"
        ? "text-center"
        : "text-start";
    return (
      <TableCell
        ref={ref}
        variant={header ? "head" : undefined}
        component={header ? "th" : undefined}
        align={align}
        className={`${alignClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </TableCell>
    );
  }
);

export const MuiTablePagination = TablePagination;

export {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
};
export default MuiTable;
