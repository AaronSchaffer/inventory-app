import { ColumnDef, ColumnType } from './types';

export const allColumns: ColumnDef[] = [
  { key: 'id', label: 'ID', type: 'number', editable: false },
  { key: 'sort1', label: 'Sort 1', type: 'text' },
  { key: 'sort2', label: 'Sort 2', type: 'text' },
  { key: 'origin', label: 'Origin', type: 'text' },
  { key: 'lot', label: 'Lot', type: 'text' },
  { key: 'purchase_date', label: 'Purchase Date', type: 'date' },
  { key: 'processing_date', label: 'Processing Date', type: 'date' },
  { key: 'hd_purchased', label: 'HD Purchased', type: 'number' },
  { key: 'hd_sold', label: 'HD Sold', type: 'number' },
  { key: 'died', label: 'Died', type: 'number' },
  { key: 'death_loss', label: 'Death Loss %', type: 'number' },
  { key: 'cattle_on_feed', label: 'Cattle on Feed', type: 'number' },
  { key: 'purchase_wgt', label: 'Purchase Wgt', type: 'number' },
  { key: 'pb_initial_wgt', label: 'PB Initial Wgt', type: 'number' },
  { key: 'purchase_price_per_cwt', label: 'Purchase $/CWT', type: 'currency' },
  { key: 'ave_dof_deads_out', label: 'Ave DOF (Deads Out)', type: 'number' },
  { key: 'sold_wgt_deads_out', label: 'Sold Wgt (Deads Out)', type: 'number' },
  { key: 'pb_sold_wgt', label: 'PB Sold Wgt', type: 'number' },
  { key: 'dm_per_hd_per_day_deads_out', label: 'DM/HD/Day (Deads Out)', type: 'number' },
  { key: 'ave_feed_intake_per_hd_per_day_deads_out', label: 'Ave Feed Intake/HD/Day', type: 'number' },
  { key: 'adg_deads_out', label: 'ADG (Deads Out)', type: 'number' },
  { key: 'dm_feed_per_gain_deads_out', label: 'DM Feed/Gain (Deads Out)', type: 'number' },
  { key: 'feed_cost_per_gain_deads_out', label: 'Feed Cost/Gain (Deads Out)', type: 'currency' },
  { key: 'cog_deads_in', label: 'COG (Deads In)', type: 'currency' },
  { key: 'cog_deads_out', label: 'COG (Deads Out)', type: 'currency' },
  { key: 'dm_cost_per_ton', label: 'DM Cost/Ton', type: 'currency' },
  { key: 'sold_price_per_cwt', label: 'Sold $/CWT', type: 'currency' },
  { key: 'vet_med_per_hd_deads_in', label: 'Vet/Med/HD (Deads In)', type: 'currency' },
  { key: 'trucking_per_cwt_deads_in', label: 'Trucking/CWT (Deads In)', type: 'currency' },
  { key: 'profit_loss_per_hd_deads_in', label: 'P/L per HD (Deads In)', type: 'currency' },
  { key: 'profit_loss_per_hd_deads_out', label: 'P/L per HD (Deads Out)', type: 'currency' },
  { key: 'corrected_purchase_price', label: 'Corrected Purchase Price', type: 'currency' },
  { key: 'notes_on_group', label: 'Notes', type: 'text' },
  { key: 'profit_loss_group_deads_in', label: 'P/L Group (Deads In)', type: 'currency' },
  { key: 'hedge_profit_loss', label: 'Hedge P/L', type: 'currency' },
  { key: 'created_at', label: 'Created At', type: 'datetime', editable: false },
];

export const newGroupFields = ['lot', 'purchase_date', 'hd_purchased', 'purchase_wgt', 'purchase_price_per_cwt'];
export const newGroupTableColumns = ['lot', 'purchase_date', 'hd_purchased', 'purchase_wgt', 'purchase_price_per_cwt'];
export const keyDetailsFields = ['lot', 'purchase_date', 'hd_purchased', 'purchase_wgt', 'purchase_price_per_cwt', 'origin', 'died', 'hd_sold', 'trucking_per_cwt_deads_in', 'vet_med_per_hd_deads_in', 'dm_cost_per_ton', 'notes_on_group'];
export const keyDetailsTableColumns = ['lot', 'purchase_date', 'hd_purchased', 'origin', 'died', 'hd_sold', 'notes_on_group'];
export const allDetailsTableColumns = ['lot', 'origin', 'purchase_date', 'hd_purchased', 'hd_sold', 'purchase_wgt', 'sold_wgt_deads_out', 'profit_loss_per_hd_deads_out'];

export function formatValue(value: unknown, type?: ColumnType): string {
  if (value === null || value === undefined) return '-';
  if (type === 'currency') return `$${Number(value).toFixed(2)}`;
  if (type === 'date') return value ? new Date(value as string).toLocaleDateString() : '-';
  if (type === 'datetime') return value ? new Date(value as string).toLocaleString() : '-';
  if (type === 'number') return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(value);
}

export function formatDateForInput(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string);
  return date.toISOString().split('T')[0];
}

export function getColumn(key: string): ColumnDef | undefined {
  return allColumns.find(c => c.key === key);
}
