// src/config/rajaOngkir.ts
import axios from "axios";
import { env } from "./env";
import { logger } from "../utils/logger";

export const rajaOngkirClient = axios.create({
  baseURL: env.RAJAONGKIR_BASE_URL,
  headers: {
    key: env.RAJAONGKIR_API_KEY, // sesuai dokumentasi: header 'key' :contentReference[oaicite:2]{index=2}
    Accept: "application/json",
  },
  timeout: 10_000,
});

// --- Types sederhana untuk hasil mapping ---
export type Province = {
  id: number;
  name: string;
};

export type City = {
  id: number;
  name: string;
  zip_code?: string | null;
};

export type District = {
  id: number;
  name: string;
  zip_code?: string | null;
};

export type Subdistrict = {
  id: number;
  name: string;
  zip_code?: string | null;
};

export type ShippingCostOption = {
  name: string;        // JNE, J&T, dsb
  code: string;        // jne, jnt, dsb
  service: string;     // REG, YES, dll
  description: string; // teks deskripsi
  cost: number;        // harga (int)
  etd: string;         // estimasi waktu, ex: "2-3 HARI"
};

// Helper generic untuk ambil data, plus logging
async function getData<T>(url: string): Promise<T> {
  try {
    const res = await rajaOngkirClient.get(url);
    return res.data?.data as T;
  } catch (err: any) {
    logger.error(
      { err, url },
      "RajaOngkir request failed (GET %s)",
      url
    );
    throw new Error(
      err?.response?.data?.meta?.message ||
        "Gagal mengambil data dari RajaOngkir"
    );
  }
}

// Provinces
export async function fetchProvinces(): Promise<Province[]> {
  // GET https://rajaongkir.komerce.id/api/v1/destination/province :contentReference[oaicite:3]{index=3}
  const data = await getData<Array<{ id: number; name: string }>>(
    "/destination/province"
  );
  return data.map((p) => ({
    id: p.id,
    name: p.name,
  }));
}

// Cities by province
export async function fetchCities(
  provinceId: number
): Promise<City[]> {
  // GET .../destination/city/{province_id} :contentReference[oaicite:4]{index=4}
  const data = await getData<Array<{ id: number; name: string; zip_code?: string }>>(
    `/destination/city/${provinceId}`
  );
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    zip_code: c.zip_code ?? undefined,
  }));
}

// Districts by city
export async function fetchDistricts(
  cityId: number
): Promise<District[]> {
  // GET .../destination/district/{city_id} :contentReference[oaicite:5]{index=5}
  const data = await getData<Array<{ id: number; name: string; zip_code?: string }>>(
    `/destination/district/${cityId}`
  );
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    zip_code: d.zip_code ?? undefined,
  }));
}

// Subdistricts by district
export async function fetchSubdistricts(
  districtId: number
): Promise<Subdistrict[]> {
  // GET .../destination/sub-district/{district_id} :contentReference[oaicite:6]{index=6}
  const data = await getData<Array<{ id: number; name: string; zip_code?: string }>>(
    `/destination/sub-district/${districtId}`
  );
  return data.map((s) => ({
    id: s.id,
    name: s.name,
    zip_code: s.zip_code ?? undefined,
  }));
}

// Hitung ongkir domestik
export async function calculateDomesticCost(params: {
  originId: number;
  destinationId: number;
  weightGrams: number;
  courier: string; // jne, jnt, anteraja, dsb
}): Promise<ShippingCostOption[]> {
  const { originId, destinationId, weightGrams, courier } = params;

  try {
    const body = new URLSearchParams();
    body.append("origin", String(originId));
    body.append("destination", String(destinationId));
    body.append("weight", String(weightGrams));
    body.append("courier", courier);
    // param price optional, kita biarkan kosong supaya dapat semua opsi layanan
    // ref: calculate/domestic-cost docs :contentReference[oaicite:7]{index=7}

    const res = await rajaOngkirClient.post(
      "/calculate/domestic-cost",
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const raw = res.data;

    if (!raw || raw.meta?.code !== 200 || !Array.isArray(raw.data)) {
      throw new Error(raw?.meta?.message || "Gagal menghitung ongkir");
    }

    const costs: ShippingCostOption[] = raw.data.map((item: any) => ({
      name: item.name,
      code: item.code,
      service: item.service,
      description: item.description,
      cost: item.cost,
      etd: item.etd,
    }));

    return costs;
  } catch (err: any) {
    logger.error(
      { err, params },
      "RajaOngkir calculateDomesticCost failed"
    );
    throw new Error(
      err?.response?.data?.meta?.message ||
        "Gagal menghitung ongkir dari RajaOngkir"
    );
  }
}
