// src/modules/shipping/shipping.service.ts
import {
  fetchProvinces,
  fetchCities,
  fetchDistricts,
  fetchSubdistricts,
  calculateDomesticCost,
} from "../../config/rajaOngkir";
import { env } from "../../config/env";

export class ShippingService {
  static getProvinces() {
    return fetchProvinces();
  }

  static getCities(provinceId: number) {
    return fetchCities(provinceId);
  }

  static getDistricts(cityId: number) {
    return fetchDistricts(cityId);
  }

  static getSubdistricts(districtId: number) {
    return fetchSubdistricts(districtId);
  }

 
  static async estimateShippingCost(input: {
    destinationId: number;
    weightGrams: number;
    courier: string;
  }) {
    const originId = env.RAJAONGKIR_ORIGIN_ID
      ? parseInt(env.RAJAONGKIR_ORIGIN_ID, 10)
      : null;

    if (!originId || Number.isNaN(originId)) {
      throw new Error(
        "RAJAONGKIR_ORIGIN_ID belum dikonfigurasi di environment"
      );
    }

    return calculateDomesticCost({
      originId,
      destinationId: input.destinationId,
      weightGrams: input.weightGrams,
      courier: input.courier,
    });
  }
}
