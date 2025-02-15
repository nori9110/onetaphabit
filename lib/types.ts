// データ型定義
export interface SalesData {
  顧客ID: number;
  年齢: number;
  性別: string;
  地域: string;
  購入カテゴリー: string;
  購入金額: number;
  購入日: string;
  支払方法: string;
}

export interface AggregatedData {
  totalSales: number;
  totalCustomers: number;
  salesByCategory: {
    category: string;
    amount: number;
  }[];
  monthlySales: {
    month: string;
    amount: number;
  }[];
  customersByAge: {
    ageGroup: string;
    count: number;
  }[];
  customersByGender: {
    gender: string;
    count: number;
  }[];
  salesByRegion: {
    region: string;
    amount: number;
  }[];
}