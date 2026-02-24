export type ChartDatum = {
  label: string;
  value: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
