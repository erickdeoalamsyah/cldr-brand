import { create } from "zustand";
import { api, ApiResponse } from "@/lib/api";
import { API_BASE_URL } from "@/lib/api";

// ====== Types ======

export interface Address {
  id: number;
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine: string;
  provinceId: number;
  cityId: number;
  subdistrictId: number;
  postalCode?: string | null;
  isPrimary: boolean;
  provinceName?: string | null;
  cityName?: string | null;
  districtName?: string | null;
  subdistrictName?: string | null;
}

export type Province = { id: number; name: string };
export type City = { id: number; name: string; zip_code?: string | null };
export type Subdistrict = { id: number; name: string; zip_code?: string | null };

type AddressesResponse = ApiResponse<Address[]>;
type AddressResponse = ApiResponse<Address>;

// ====== Form State ======

interface AddressFormState {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  postalCode: string;
  provinceId: number | "";
  cityId: number | "";
  subdistrictId: number | "";
}

// ====== Store Interface ======

interface AddressStore {
  // Address list state
  addresses: Address[];
  loading: boolean;
  loadError: string | null;
  actionMessage: string | null;

  // Form state
  modalOpen: boolean;
  editingAddress: Address | null;
  formState: AddressFormState;
  formError: string | null;
  submitting: boolean;

  // Location data
  provinces: Province[];
  cities: City[];
  subdistricts: Subdistrict[];
  loadingLocation: boolean;

  // Address list actions
  loadAddresses: (token: string) => Promise<void>;
  deleteAddress: (addressId: number, token: string) => Promise<void>;
  setPrimaryAddress: (addressId: number, token: string) => Promise<void>;
  setActionMessage: (message: string | null) => void;

  // Modal actions
  openAddModal: () => void;
  openEditModal: (address: Address) => void;
  closeModal: () => void;

  // Form actions
  updateFormField: (field: keyof AddressFormState, value: any) => void;
  setFormError: (error: string | null) => void;
  submitForm: (token: string) => Promise<void>;

  // Location actions
  loadProvinces: () => Promise<void>;
  loadCities: (provinceId: number) => Promise<void>;
  loadSubdistricts: (cityId: number) => Promise<void>;
  resetCities: () => void;
  resetSubdistricts: () => void;
}

// ====== Initial Form State ======

const initialFormState: AddressFormState = {
  label: "",
  recipientName: "",
  phone: "",
  addressLine: "",
  postalCode: "",
  provinceId: "",
  cityId: "",
  subdistrictId: "",
};

// ====== Store Implementation ======

export const useAddressStore = create<AddressStore>((set, get) => ({
  // Initial state
  addresses: [],
  loading: false,
  loadError: null,
  actionMessage: null,

  modalOpen: false,
  editingAddress: null,
  formState: { ...initialFormState },
  formError: null,
  submitting: false,

  provinces: [],
  cities: [],
  subdistricts: [],
  loadingLocation: false,

  // Address list actions
  loadAddresses: async (token: string) => {
    set({ loading: true, loadError: null });
    try {
      const res = await api.get<AddressesResponse>("/addresses", token);
      set({ addresses: res.data || [], loading: false });
    } catch (err: any) {
      console.error(err);
      set({
        loadError: err.message || "Gagal memuat daftar alamat.",
        loading: false,
      });
    }
  },

  deleteAddress: async (addressId: number, token: string) => {
    set({ actionMessage: null });
    try {
      await api.delete<ApiResponse<null>>(`/addresses/${addressId}`, token);
      set({ actionMessage: "Alamat berhasil dihapus." });
      await get().loadAddresses(token);
    } catch (err: any) {
      console.error(err);
      set({ actionMessage: err.message || "Gagal menghapus alamat." });
    }
  },

  setPrimaryAddress: async (addressId: number, token: string) => {
    set({ actionMessage: null });
    try {
      await api.post<ApiResponse<null>>(
        `/addresses/${addressId}/set-primary`,
        {},
        token
      );
      set({ actionMessage: "Alamat utama berhasil diubah." });
      await get().loadAddresses(token);
    } catch (err: any) {
      console.error(err);
      set({ actionMessage: err.message || "Gagal mengubah alamat utama." });
    }
  },

  setActionMessage: (message: string | null) => {
    set({ actionMessage: message });
  },

  // Modal actions
  openAddModal: () => {
    set({
      modalOpen: true,
      editingAddress: null,
      formState: { ...initialFormState },
      formError: null,
      actionMessage: null,
      cities: [],
      subdistricts: [],
    });
    get().loadProvinces();
  },

  openEditModal: (address: Address) => {
    set({
      modalOpen: true,
      editingAddress: address,
      formState: {
        label: address.label || "",
        recipientName: address.recipientName,
        phone: address.phone,
        addressLine: address.addressLine,
        postalCode: address.postalCode || "",
        provinceId: address.provinceId,
        cityId: address.cityId,
        subdistrictId: address.subdistrictId,
      },
      formError: null,
      actionMessage: null,
    });
    get().loadProvinces();
    get().loadCities(address.provinceId);
    get().loadSubdistricts(address.cityId);
  },

  closeModal: () => {
    set({
      modalOpen: false,
      editingAddress: null,
      formState: { ...initialFormState },
      formError: null,
      cities: [],
      subdistricts: [],
    });
  },

  // Form actions
  updateFormField: (field: keyof AddressFormState, value: any) => {
    set((state) => ({
      formState: { ...state.formState, [field]: value },
    }));

    // Handle cascading resets
    if (field === "provinceId") {
      get().resetCities();
      get().resetSubdistricts();
      if (value) {
        get().loadCities(Number(value));
      }
    } else if (field === "cityId") {
      get().resetSubdistricts();
      if (value) {
        get().loadSubdistricts(Number(value));
      }
    }
  },

  setFormError: (error: string | null) => {
    set({ formError: error });
  },

  submitForm: async (token: string) => {
    const { formState, editingAddress, provinces, cities, subdistricts } =
      get();

    set({ formError: null });

    // Validation
    if (!formState.recipientName.trim()) {
      set({ formError: "Nama penerima wajib diisi." });
      return;
    }
    if (!formState.phone.trim()) {
      set({ formError: "Nomor telepon wajib diisi." });
      return;
    }
    if (!formState.addressLine.trim()) {
      set({ formError: "Detail alamat wajib diisi." });
      return;
    }
    if (
      !formState.provinceId ||
      !formState.cityId ||
      !formState.subdistrictId
    ) {
      set({
        formError: "Provinsi, kota/kabupaten, dan kecamatan wajib dipilih.",
      });
      return;
    }

    const provinceNum = Number(formState.provinceId);
    const cityNum = Number(formState.cityId);
    const subdistrictNum = Number(formState.subdistrictId);

    const selectedProvince = provinces.find((p) => p.id === provinceNum);
    const selectedCity = cities.find((c) => c.id === cityNum);
    const selectedSubdistrict = subdistricts.find(
      (s) => s.id === subdistrictNum
    );

    const payload = {
      label: formState.label.trim() || null,
      recipientName: formState.recipientName.trim(),
      phone: formState.phone.trim(),
      addressLine: formState.addressLine.trim(),
      postalCode: formState.postalCode.trim() || null,
      provinceId: provinceNum,
      cityId: cityNum,
      subdistrictId: subdistrictNum,
      provinceName: selectedProvince?.name ?? null,
      cityName: selectedCity?.name ?? null,
      subdistrictName: selectedSubdistrict?.name ?? null,
    };

    try {
      set({ submitting: true });

      if (editingAddress) {
        await api.put<AddressResponse>(
          `/addresses/${editingAddress.id}`,
          payload,
          token
        );
      } else {
        await api.post<AddressResponse>("/addresses", payload, token);
      }

      await get().loadAddresses(token);
      get().closeModal();
    } catch (err: any) {
      console.error(err);
      set({ formError: err.message || "Gagal menyimpan alamat." });
    } finally {
      set({ submitting: false });
    }
  },

  // Location actions
  loadProvinces: async () => {
    try {
      set({ loadingLocation: true });
      const res = await fetch(`${API_BASE_URL}/shipping/provinces`);
      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.message || "Gagal load provinsi");
      }
      set({ provinces: json.data as Province[], loadingLocation: false });
    } catch (err: any) {
      console.error(err);
      set({
        formError: err.message || "Gagal memuat daftar provinsi.",
        loadingLocation: false,
      });
    }
  },

  loadCities: async (provinceId: number) => {
    try {
      set({ loadingLocation: true });
      const url = `${API_BASE_URL}/shipping/cities?provinceId=${provinceId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.message || "Gagal load kota/kabupaten");
      }
      set({ cities: json.data as City[], loadingLocation: false });
    } catch (err: any) {
      console.error(err);
      set({
        formError: err.message || "Gagal memuat daftar kota/kabupaten.",
        loadingLocation: false,
      });
    }
  },

  loadSubdistricts: async (cityId: number) => {
    try {
      set({ loadingLocation: true });
      const url = `${API_BASE_URL}/shipping/districts?cityId=${cityId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.message || "Gagal load kecamatan");
      }
      set({ subdistricts: json.data as Subdistrict[], loadingLocation: false });
    } catch (err: any) {
      console.error(err);
      set({
        formError: err.message || "Gagal memuat daftar kecamatan.",
        loadingLocation: false,
      });
    }
  },

  resetCities: () => {
    set((state) => ({
      cities: [],
      formState: { ...state.formState, cityId: "" },
    }));
  },

  resetSubdistricts: () => {
    set((state) => ({
      subdistricts: [],
      formState: { ...state.formState, subdistrictId: "" },
    }));
  },
}));