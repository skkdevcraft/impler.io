import { Table as MantineTable } from '@mantine/core';
import { getErrorObject } from '@impler/shared/dist/utils';
import useStyles from './Styles';
import { variables } from '@config';
import { InvalidWarning } from '@components/InvalidWarning';

interface TableProps {
  headings: {
    label: string;
    key: string;
  }[];
  data: any[];
  emptyMessage?: string;
}

const Table = ({ data, headings, emptyMessage }: TableProps) => {
  const { classes } = useStyles();
  let errorObject: Record<string, string>;

  const rows = data.map((row, index) => {
    errorObject = getErrorObject(row[variables.ERROR]);

    return (
      <tr key={index}>
        {headings.map((heading) =>
          errorObject[heading.key] ? (
            <td key={heading.key} className={classes.invalidCell}>
              {row[heading.key]}
              <InvalidWarning label={errorObject[heading.key]} />
            </td>
          ) : (
            <td key={heading.key}>{row[heading.key]}</td>
          )
        )}
      </tr>
    );
  });
  const emptyRow = (
    <tr>
      <td colSpan={headings.length}>{emptyMessage || 'No record found!'}</td>
    </tr>
  );

  return (
    <div className={classes.tableWrapper}>
      <MantineTable>
        <thead className={classes.thead}>
          <tr>
            {headings.map((heading) => (
              <th key={heading.key}>{heading.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className={classes.tbody}>{data.length ? rows : emptyRow}</tbody>
      </MantineTable>
    </div>
  );
};

export default Table;
