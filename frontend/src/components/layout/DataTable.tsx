import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Article } from '../../constants/types';
import { useIsDarkMode } from '../../contexts/ThemeContext';

interface DataTableProps {
  data: Article[];
  columns: GridColDef[];
  error: Error | null;
}

function DataTable({ data, columns, error }: Readonly<DataTableProps>) {
  const isDarkMode = useIsDarkMode();

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
        <p className="m-0 font-semibold">Unable to load articles.</p>
        <p className="m-0 mt-2 text-sm">{error.message}</p>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-900">
      <DataGrid
        className="app-data-grid"
        rows={data}
        columns={columns}
        autoHeight
        getRowHeight={() => 'auto'}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            printOptions: { disableToolbarButton: false },
            csvOptions: { disableToolbarButton: true },
            showQuickFilter: true,
          },
        }}
        hideFooter
        sx={{
          border: 0,
          ...(isDarkMode && {
            '--DataGrid-t-header-background-base': '#1e293b',
            '--DataGrid-t-cell-background-base': '#0f172a',
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            '& .MuiDataGrid-main, & .MuiDataGrid-virtualScroller, & .MuiDataGrid-virtualScrollerContent, & .MuiDataGrid-virtualScrollerContent--overflowed, & .MuiDataGrid-overlay, & .MuiDataGrid-filler, & .MuiDataGrid-topContainer, & .MuiDataGrid-bottomContainer':
              {
                backgroundColor: '#0f172a',
              },
          }),
        }}
      />
    </div>
  );
}

// Exportation
export default DataTable;
