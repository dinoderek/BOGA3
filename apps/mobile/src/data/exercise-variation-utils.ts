type VariationDescriptorPart = {
  keySlug: string;
  valueSlug: string;
};

type VariationLabelPart = {
  keyDisplayName: string;
  valueDisplayName: string;
};

const NON_ALPHANUMERIC_PATTERN = /[^a-z0-9]+/g;

export const normalizeWhitespace = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
};

export const normalizeSlug = (value: string | null | undefined) => {
  const normalized = normalizeWhitespace(value).toLowerCase().replace(NON_ALPHANUMERIC_PATTERN, '_');
  return normalized.replace(/^_+|_+$/g, '').replace(/_+/g, '_');
};

export const buildExerciseVariationDescriptor = (parts: VariationDescriptorPart[]) =>
  parts
    .map((part) => ({
      keySlug: normalizeSlug(part.keySlug),
      valueSlug: normalizeSlug(part.valueSlug),
    }))
    .sort((left, right) =>
      left.keySlug === right.keySlug
        ? left.valueSlug.localeCompare(right.valueSlug)
        : left.keySlug.localeCompare(right.keySlug)
    )
    .map((part) => `${part.keySlug}:${part.valueSlug}`)
    .join('|');

export const buildExerciseVariationLabel = (parts: VariationLabelPart[]) => {
  const normalizedParts = parts
    .map((part) => ({
      keyDisplayName: normalizeWhitespace(part.keyDisplayName),
      valueDisplayName: normalizeWhitespace(part.valueDisplayName),
    }))
    .filter((part) => part.keyDisplayName && part.valueDisplayName);

  if (normalizedParts.length === 0) {
    return '';
  }

  if (normalizedParts.length === 1) {
    return normalizedParts[0]?.valueDisplayName ?? '';
  }

  return normalizedParts.map((part) => `${part.keyDisplayName}: ${part.valueDisplayName}`).join(' / ');
};
