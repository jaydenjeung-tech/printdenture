export type PracticeProfileFields = {
  practice_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

export function isPracticeProfileComplete(profile: PracticeProfileFields | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    profile.practice_name?.trim() &&
      profile.phone?.trim() &&
      profile.address?.trim() &&
      profile.city?.trim() &&
      profile.state?.trim() &&
      profile.zip?.trim()
  );
}

/** Review-step shipping fields (camelCase) used on the order page. */
export function isOrderShippingComplete(data: {
  practiceName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}): boolean {
  return isPracticeProfileComplete({
    practice_name: data.practiceName,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
  });
}

export const PRACTICE_PROFILE_LABELS: Record<keyof PracticeProfileFields, string> = {
  practice_name: "Practice name",
  phone: "Phone",
  address: "Street address",
  city: "City",
  state: "State",
  zip: "ZIP",
};
