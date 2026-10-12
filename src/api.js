import { mockAdvice, mockReport } from './mock';

const BASE = import.meta.env.VITE_API_BASE;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const API_TIMEOUT = 10000;

// Save profile locally because the backend profile endpoint
// is not available yet.
export const saveProfile = async (profile) => {
  return { profileId: 'demo1' };
};

// Fetch with timeout.
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'The request took too long. Please try again.'
      );
    }

    throw new Error(
      'Unable to connect. Check your internet connection and try again.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// Convert latitude and longitude to the nearest supported grid cell.
function toCellId(lat, lon) {
  const snap = (value, min, max) =>
    Math.min(max, Math.max(min, Math.round(value * 10) / 10));

  const latitude = snap(lat, 28.4, 28.9);
  const longitude = snap(lon, 76.9, 77.4);

  return `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
}

// Check whether the location is inside the supported Delhi-NCR grid.
export function isLocationSupported(place) {
  return (
    place &&
    place.lat >= 28.35 &&
    place.lat <= 28.95 &&
    place.lon >= 76.85 &&
    place.lon <= 77.45
  );
}

// Convert API response into the format used by our components.
function normalizeAdvice(data) {
  const options = data.options || [];
  const exposures = options.map((option) => option.exposure);

  const best = exposures.length ? Math.min(...exposures) : 0;
  const plan = exposures.length ? Math.max(...exposures) : 0;

  const savedPct =
    plan > 0
      ? Math.round(((plan - best) / plan) * 100)
      : 0;

  return {
    naqi: data.aqi,
    band: data.category,

    decision: {
      outdoor: data.outdoor,
      mask: data.mask,
      remote: data.remote_day,
    },

    exposure: {
      plan,
      best,
      savedPct,
    },

    windows: options.map((option) => ({
      depart: option.time,
      mode: option.mode,
      exposure: option.exposure,
    })),
  };
}

export const getAdvice = async (profileId, persona, home) => {
  if (USE_MOCK) {
    return mockAdvice;
  }

  if (!BASE) {
    throw new Error(
      'API URL is not configured. Please check your environment settings.'
    );
  }

  if (!home || !isLocationSupported(home)) {
    throw new Error(
      'Location outside coverage. Please choose a supported Delhi-NCR location.'
    );
  }

  const cell = toCellId(home.lat, home.lon);

  const params = new URLSearchParams({
    userId: profileId || 'demo1',
    cell,
    date: new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
    }),
  });

  const response = await fetchWithTimeout(
    `${BASE}/advise?${params}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      'The server returned an invalid response. Please try again.'
    );
  }

  if (data.aqi == null) {
    throw new Error(
      'No air-quality data is available for this location and date.'
    );
  }

  return normalizeAdvice(data);
};

export const getReport = async (profileId, persona, home) => {
  if (USE_MOCK) {
    return mockReport;
  }

  throw new Error(
    'The real report API is not available yet. Please enable mock mode to preview the report.'
  );
};