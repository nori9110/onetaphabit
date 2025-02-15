import { SalesData, AggregatedData } from '../types';

export function processCSVData(data: string): SalesData[] {
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      if (header === '顧客ID' || header === '年齢' || header === '購入金額') {
        obj[header] = Number(values[index]);
      } else {
        obj[header] = values[index];
      }
    });
    return obj;
  });
}

function getAgeGroup(age: number): string {
  if (age < 20) return '~19歳';
  if (age < 30) return '20-29歳';
  if (age < 40) return '30-39歳';
  if (age < 50) return '40-49歳';
  if (age < 60) return '50-59歳';
  return '60歳~';
}

export function aggregateData(data: SalesData[]): AggregatedData {
  // 重複を除いた顧客IDの数を計算
  const uniqueCustomers = new Set(data.map(item => item.顧客ID));
  const totalCustomers = uniqueCustomers.size;

  // 総売上の計算
  const totalSales = data.reduce((sum, item) => sum + item.購入金額, 0);

  // カテゴリー別売上の集計
  const categoryMap = new Map<string, number>();
  data.forEach(item => {
    const current = categoryMap.get(item.購入カテゴリー) || 0;
    categoryMap.set(item.購入カテゴリー, current + item.購入金額);
  });
  const salesByCategory = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }));

  // 月別売上の集計
  const monthlyMap = new Map<string, number>();
  data.forEach(item => {
    const month = item.購入日.substring(0, 7); // YYYY-MM
    const current = monthlyMap.get(month) || 0;
    monthlyMap.set(month, current + item.購入金額);
  });
  const monthlySales = Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // 年齢層別顧客数の集計
  const ageMap = new Map<string, number>();
  data.forEach(item => {
    const ageGroup = getAgeGroup(item.年齢);
    const current = ageMap.get(ageGroup) || 0;
    ageMap.set(ageGroup, current + 1);
  });
  const customersByAge = Array.from(ageMap.entries())
    .map(([ageGroup, count]) => ({ ageGroup, count }))
    .sort((a, b) => {
      const aAge = parseInt(a.ageGroup);
      const bAge = parseInt(b.ageGroup);
      return aAge - bAge;
    });

  // 性別顧客数の集計
  const genderMap = new Map<string, number>();
  data.forEach(item => {
    const current = genderMap.get(item.性別) || 0;
    genderMap.set(item.性別, current + 1);
  });
  const customersByGender = Array.from(genderMap.entries())
    .map(([gender, count]) => ({ gender, count }));

  // 地域別売上の集計
  const regionMap = new Map<string, number>();
  data.forEach(item => {
    const current = regionMap.get(item.地域) || 0;
    regionMap.set(item.地域, current + item.購入金額);
  });
  const salesByRegion = Array.from(regionMap.entries())
    .map(([region, amount]) => ({ region, amount }));

  return {
    totalSales,
    totalCustomers,
    salesByCategory,
    monthlySales,
    customersByAge,
    customersByGender,
    salesByRegion,
  };
}