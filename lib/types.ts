export interface HomeCloseout {
  id: number;
  sort1: string | null;
  sort2: string | null;
  origin: string | null;
  lot: string | null;
  purchase_date: string | null;
  processing_date: string | null;
  hd_purchased: number | null;
  hd_sold: number | null;
  died: number | null;
  death_loss: number | null;
  cattle_on_feed: number | null;
  purchase_wgt: number | null;
  pb_initial_wgt: number | null;
  purchase_price_per_cwt: number | null;
  ave_dof_deads_out: number | null;
  sold_wgt_deads_out: number | null;
  pb_sold_wgt: number | null;
  dm_per_hd_per_day_deads_out: number | null;
  ave_feed_intake_per_hd_per_day_deads_out: number | null;
  adg_deads_out: number | null;
  dm_feed_per_gain_deads_out: number | null;
  feed_cost_per_gain_deads_out: number | null;
  cog_deads_in: number | null;
  cog_deads_out: number | null;
  dm_cost_per_ton: number | null;
  sold_price_per_cwt: number | null;
  vet_med_per_hd_deads_in: number | null;
  trucking_per_cwt_deads_in: number | null;
  profit_loss_per_hd_deads_in: number | null;
  profit_loss_per_hd_deads_out: number | null;
  corrected_purchase_price: number | null;
  notes_on_group: string | null;
  profit_loss_group_deads_in: number | null;
  hedge_profit_loss: number | null;
  created_at: string | null;
}

export interface Pen {
  id: number;
  pen_name: string | null;
  pen_square_feet: number | null;
  pen_type: string | null;
  pre_ship: boolean | null;
}

export interface GroupByPen {
  id: number;
  group_name: string | null;
  pen_name: string | null;
  head: number | null;
}

export interface HedgingRecord {
  id: number;
  cattle_type: string | null;
  futures_month: string | null;
  positions: number | null;
}

export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'datetime';

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
  editable?: boolean;
}
