export interface Filter_Options {
  search: string[];
  defaultSort: string;
  filters: { [key: string]: { type: string; filter: string } };
}
