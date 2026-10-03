// 顶部信息栏天气/位置：ip-api IP 定位 + 腾讯天气（wis.qq.com）
// 说明：腾讯天气接口无 CORS，需经 Vite 开发代理转发（见 vite.config.ts 的 /qq-weather、/ip-api）
// 全部失败时保留默认展示值，不影响页面其他功能
import { reactive } from 'vue';

export const weatherState = reactive({
  temp: null as number | null,
  humidity: null as number | null, // 空气湿度（%），来自腾讯天气实时观测
  text: '晴',
  icon: '🌤️',
  location: '山东 · 寿光', // 默认回退值
  loaded: false
});

// 中文天气描述 → 图标
function iconOf(weather: string): string {
  if (weather.includes('雷')) return '⛈️';
  if (weather.includes('雹')) return '🌨️';
  if (weather.includes('雪')) return '❄️';
  if (weather.includes('雨')) return '🌧️';
  if (weather.includes('雾') || weather.includes('霾')) return '🌫️';
  if (weather.includes('沙') || weather.includes('尘')) return '🌪️';
  if (weather.includes('晴')) return '☀️';
  if (weather.includes('云')) return '⛅';
  if (weather.includes('阴')) return '☁️';
  return '🌤️';
}

const CACHE_KEY = 'weather-cache-v2';
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟内不重复请求

// IP 定位：ip-api（免费无密钥，lang=zh-CN 返回中文省市）
async function getCity(): Promise<{ province: string; city: string } | null> {
  try {
    const res = await fetch('/ip-api/json/?lang=zh-CN&fields=status,regionName,city');
    const json = await res.json();
    if (json?.status === 'success' && json.city) {
      return { province: json.regionName || '', city: json.city };
    }
  } catch {
    /* 忽略，返回 null */
  }
  return null;
}

// 腾讯天气实时观测：当前温度 + 天气现象
async function fetchObserve(
  province: string,
  city: string
): Promise<{ temp: number | null; humidity: number | null; text: string } | null> {
  try {
    const url =
      `/qq-weather?source=pc&weather_type=observe` +
      `&province=${encodeURIComponent(province)}&city=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    const json = await res.json();
    const ob = json?.data?.observe;
    if (ob && ob.degree != null && ob.weather) {
      return {
        temp: Number(ob.degree),
        humidity: ob.humidity != null ? Number(ob.humidity) : null,
        text: String(ob.weather)
      };
    }
  } catch {
    /* 走兜底 */
  }
  return null;
}

// 兜底：24 小时预报（白天天气 + 最高最低温取平均近似当前值）
async function fetchForecastFallback(
  province: string,
  city: string
): Promise<{ temp: number | null; humidity: number | null; text: string } | null> {
  try {
    const url =
      `/qq-weather?source=pc&weather_type=forecast_24h` +
      `&province=${encodeURIComponent(province)}&city=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    const json = await res.json();
    const f = json?.data?.forecast_24h?.['0'];
    if (f && f.day_weather_short) {
      const min = Number(f.min_degree);
      const max = Number(f.max_degree);
      const temp =
        Number.isFinite(min) && Number.isFinite(max) ? Math.round((min + max) / 2) : null;
      return { temp, humidity: null, text: String(f.day_weather_short) };
    }
  } catch {
    /* 忽略 */
  }
  return null;
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(snapshot: Record<string, unknown>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...snapshot, ts: Date.now() }));
  } catch {
    /* 忽略 */
  }
}

let started = false;

export function initWeather() {
  if (started) return;
  started = true;

  // 优先使用缓存，避免每次刷新都请求外部接口
  const cached = readCache();
  if (cached) {
    if (cached.temp != null) weatherState.temp = cached.temp;
    if (cached.humidity != null) weatherState.humidity = cached.humidity;
    if (cached.text) weatherState.text = cached.text;
    if (cached.icon) weatherState.icon = cached.icon;
    if (cached.location) weatherState.location = cached.location;
    weatherState.loaded = true;
    return;
  }

  (async () => {
    const loc = await getCity();
    if (!loc) return; // 定位失败，保留默认值
    weatherState.location = loc.province ? `${loc.province} · ${loc.city}` : loc.city;

    // 实时观测优先，失败则退回 24 小时预报
    const w =
      (await fetchObserve(loc.province, loc.city)) ||
      (await fetchForecastFallback(loc.province, loc.city));
    if (w) {
      weatherState.temp = w.temp;
      weatherState.humidity = w.humidity;
      weatherState.text = w.text;
      weatherState.icon = iconOf(w.text);
    }
    weatherState.loaded = true;
    writeCache({
      temp: weatherState.temp,
      humidity: weatherState.humidity,
      text: weatherState.text,
      icon: weatherState.icon,
      location: weatherState.location
    });
  })();
}
