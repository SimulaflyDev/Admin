export type KPIDef = { 
  id: string, 
  title: string, 
  icon?: any, 
  color: string, 
  trend: 'up'|'down'|'neutral', 
  type: 'currency'|'number'|'percentage' 
};

export const TIME_RANGES = ["1 Min", "1 Hour", "24 Hours", "7 Days", "1 Month", "1 Year", "2 Years"];

export const MULTIPLIERS: Record<string, number> = {
  "1 Min": 0.00002, "1 Hour": 0.0014, "24 Hours": 0.033, "7 Days": 0.23, "1 Month": 1, "1 Year": 12, "2 Years": 24
}

// Check if a metric should be averaged over time rather than summed
export const isAverage = (type: string, id: string) => type === 'percentage' || id === 'aov' || id.includes('rate') || id.includes('avg');

// Deterministic random number generator to prevent hydration mismatch between server and client
export const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateChartData(metric: KPIDef, timeRange: string, baseValue: number) {
  let points = 12;
  let labels: string[] = [];
  
  if (timeRange === "1 Min") { points = 60; labels = Array.from({length: 60}, (_, i) => `${i}s`); }
  else if (timeRange === "1 Hour") { points = 60; labels = Array.from({length: 60}, (_, i) => `${i}m`); }
  else if (timeRange === "24 Hours") { points = 24; labels = Array.from({length: 24}, (_, i) => `${i}h`); }
  else if (timeRange === "7 Days") { points = 7; labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; }
  else if (timeRange === "1 Month") { points = 30; labels = Array.from({length: 30}, (_, i) => `${i+1}`); }
  else if (timeRange === "1 Year") { points = 12; labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; }
  else if (timeRange === "2 Years") { points = 24; labels = Array.from({length: 24}, (_, i) => `'${String(25 + Math.floor(i/12)).padStart(2, '0')} M${(i%12)+1}`); }

  const avgMode = isAverage(metric.type, metric.id);
  const baseVal = avgMode ? baseValue : (baseValue * MULTIPLIERS[timeRange]) / points;
  
  let currentVal = baseVal;
  const baseSeed = metric.id.length * timeRange.length;

  return labels.map((label, idx) => {
    const rand = pseudoRandom(baseSeed + idx);
    const variance = baseVal * (avgMode ? 0.05 : 0.4) * (rand - (avgMode ? 0.5 : 0.4));
    currentVal = avgMode ? baseVal + variance : Math.max(0, currentVal + variance);
    return { name: label, value: metric.type === 'percentage' ? Number(currentVal.toFixed(1)) : Math.floor(currentVal) }
  });
}

export function formatValue(type: string, val: number) {
  if (type === 'currency') {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  } else if (type === 'percentage') {
    return `${val.toFixed(1)}%`;
  } else {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return `${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}
