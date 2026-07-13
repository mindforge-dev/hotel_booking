// UI component types

import { ColumnDef } from "@tanstack/react-table";
import { RowWithId, PaginationProps } from "./common";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

// Data Table Types
export interface DataTableProps<TData extends RowWithId, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  batchActions?: React.ReactNode;
  pagination?: PaginationProps;
}

// Form Types
export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

// Sheet Types
export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<any>,
    any {}

// Toast Types
export type ToastProps = React.ComponentPropsWithoutRef<any>;
export type ToastActionElement = React.ReactElement<any>;

// Date Field Types
export interface DateFieldProps {
  label: string;
  field: ControllerRenderProps<any, any>;
  disabledDates?: (date: Date) => boolean;
}

// Modal Types
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Navigation Types
export interface NavbarProps {
  onMenuClick: () => void;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
}

export interface SidebarToggleProps {
  onToggle: () => void;
}

// Filter Types
export interface RoomsFilterProps {
  onFilterChange: (filters: any) => void;
  isLoading?: boolean;
}

export interface RoomsFilters {
  page?: number;
  limit?: number;
  name?: string;
  hotelId?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: number;
}