export type PhilippineLocation = {
  regionCode?: string | null;
  regionName?: string | null;
  provinceCode?: string | null;
  provinceName?: string | null;
  cityCode?: string | null;
  cityName?: string | null;
  barangayCode?: string | null;
  barangayName?: string | null;
};

export function cleanLocationValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function locationLabel(location: PhilippineLocation) {
  const parts = [
    cleanLocationValue(location.barangayName),
    cleanLocationValue(location.cityName),
    cleanLocationValue(location.provinceName),
    cleanLocationValue(location.regionName),
  ];

  return parts.filter(Boolean).join(", ") || null;
}

export function cityProvinceLabel(location: PhilippineLocation) {
  const parts = [cleanLocationValue(location.cityName), cleanLocationValue(location.provinceName)];
  return parts.filter(Boolean).join(", ") || locationLabel(location);
}

export function locationFromForm(formData: FormData): Required<Record<keyof PhilippineLocation, string | null>> & {
  locationLabel: string | null;
} {
  const location = {
    regionCode: cleanLocationValue(formData.get("region_code")?.toString()),
    regionName: cleanLocationValue(formData.get("region_name")?.toString()),
    provinceCode: cleanLocationValue(formData.get("province_code")?.toString()),
    provinceName: cleanLocationValue(formData.get("province_name")?.toString()),
    cityCode: cleanLocationValue(formData.get("city_code")?.toString()),
    cityName: cleanLocationValue(formData.get("city_name")?.toString()),
    barangayCode: cleanLocationValue(formData.get("barangay_code")?.toString()),
    barangayName: cleanLocationValue(formData.get("barangay_name")?.toString()),
  };

  return {
    ...location,
    locationLabel: locationLabel(location),
  };
}
