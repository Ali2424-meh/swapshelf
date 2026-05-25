"use client";

import {
  getAllRegions,
  getBarangaysByMunicipality,
  getMunicipalitiesByProvince,
  getProvincesByRegion,
} from "@aivangogh/ph-address";
import { useMemo, useState } from "react";
import { IconMapPin } from "@/components/icons";
import type { PhilippineLocation } from "@/lib/location";

type PhilippineLocationSelectProps = {
  defaultValue?: PhilippineLocation;
  requiredCity?: boolean;
  compact?: boolean;
};

function optionLabel(name: string, code?: string) {
  return code ? `${name}` : name;
}

function SelectField({
  id,
  label,
  name,
  value,
  onChange,
  options,
  disabled,
  required,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { code: string; name: string }[];
  disabled?: boolean;
  required?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filteredOptions = query.trim()
    ? options.filter((option) => option.name.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-foreground">
        {label}
        {required && <span className="font-normal text-orange"> *</span>}
      </label>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        disabled={disabled}
        placeholder={`Search ${label.toLowerCase()}...`}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value);
          setQuery("");
        }}
        disabled={disabled}
        required={required}
        className="mt-2 w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {filteredOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {optionLabel(option.name, option.code)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PhilippineLocationSelect({
  defaultValue,
  requiredCity = false,
  compact = false,
}: PhilippineLocationSelectProps) {
  const regions = useMemo(
    () => getAllRegions().map((region) => ({ code: region.psgcCode, name: region.designation || region.name })),
    [],
  );
  const [regionCode, setRegionCode] = useState(defaultValue?.regionCode ?? "");
  const [provinceCode, setProvinceCode] = useState(defaultValue?.provinceCode ?? "");
  const [cityCode, setCityCode] = useState(defaultValue?.cityCode ?? "");
  const [barangayCode, setBarangayCode] = useState(defaultValue?.barangayCode ?? "");

  const provinces = useMemo(
    () =>
      regionCode
        ? getProvincesByRegion(regionCode).map((province) => ({
            code: province.psgcCode,
            name: province.name,
          }))
        : [],
    [regionCode],
  );
  const cities = useMemo(
    () =>
      provinceCode
        ? getMunicipalitiesByProvince(provinceCode).map((city) => ({
            code: city.psgcCode,
            name: city.name,
          }))
        : [],
    [provinceCode],
  );
  const barangays = useMemo(
    () =>
      cityCode
        ? getBarangaysByMunicipality(cityCode).map((barangay) => ({
            code: barangay.psgcCode,
            name: barangay.name,
          }))
        : [],
    [cityCode],
  );

  const region = regions.find((item) => item.code === regionCode);
  const province = provinces.find((item) => item.code === provinceCode);
  const city = cities.find((item) => item.code === cityCode);
  const barangay = barangays.find((item) => item.code === barangayCode);
  const areaText = [barangay?.name, city?.name, province?.name, region?.name].filter(Boolean).join(", ");

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 ${compact ? "md:grid-cols-4" : "sm:grid-cols-2"}`}>
        <SelectField
          id="region_code"
          label="Region"
          name="region_code"
          value={regionCode}
          options={regions}
          required={requiredCity}
          onChange={(next) => {
            setRegionCode(next);
            setProvinceCode("");
            setCityCode("");
            setBarangayCode("");
          }}
        />
        <SelectField
          id="province_code"
          label="Province"
          name="province_code"
          value={provinceCode}
          options={provinces}
          disabled={!regionCode}
          required={requiredCity}
          onChange={(next) => {
            setProvinceCode(next);
            setCityCode("");
            setBarangayCode("");
          }}
        />
        <SelectField
          id="city_code"
          label="City or municipality"
          name="city_code"
          value={cityCode}
          options={cities}
          disabled={!provinceCode}
          required={requiredCity}
          onChange={(next) => {
            setCityCode(next);
            setBarangayCode("");
          }}
        />
        <SelectField
          id="barangay_code"
          label="Barangay"
          name="barangay_code"
          value={barangayCode}
          options={barangays}
          disabled={!cityCode}
          onChange={setBarangayCode}
        />
      </div>

      <input type="hidden" name="region_name" value={region?.name ?? ""} />
      <input type="hidden" name="province_name" value={province?.name ?? ""} />
      <input type="hidden" name="city_name" value={city?.name ?? ""} />
      <input type="hidden" name="barangay_name" value={barangay?.name ?? ""} />

      {areaText && (
        <p className="inline-flex items-center gap-1.5 rounded-lg bg-green-light px-3 py-1.5 text-xs font-medium text-green">
          <IconMapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
          {areaText}
        </p>
      )}
    </div>
  );
}
