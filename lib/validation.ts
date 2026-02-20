interface ValidationRule {
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: { regex: RegExp; message: string };
}

type ValidationRules = Record<string, ValidationRule>;

export function validate(data: Record<string, unknown>, rules: ValidationRules): string | null {
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const label = field.replace(/_/g, ' ');

    if (rule.required && (value === null || value === undefined || value === '')) {
      return `${label} is required`;
    }

    if (value === null || value === undefined || value === '') continue;

    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return `${label} must be at most ${rule.maxLength} characters`;
    }

    if (rule.min !== undefined && Number(value) < rule.min) {
      return `${label} must be at least ${rule.min}`;
    }

    if (rule.max !== undefined && Number(value) > rule.max) {
      return `${label} must be at most ${rule.max}`;
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.regex.test(value)) {
      return rule.pattern.message;
    }
  }

  return null;
}

export const homeCloseoutRules: ValidationRules = {
  lot: { required: true, maxLength: 50 },
  purchase_date: { required: true },
  hd_purchased: { min: 0, max: 100000 },
  purchase_wgt: { min: 0, max: 5000 },
  purchase_price_per_cwt: { min: 0, max: 10000 },
  hd_sold: { min: 0, max: 100000 },
  died: { min: 0, max: 100000 },
};

export const penRules: ValidationRules = {
  pen_name: { required: true, maxLength: 50 },
  pen_square_feet: { min: 0, max: 10000000 },
  bunk_space_ft: { min: 0, max: 999 },
};

export const groupByPenRules: ValidationRules = {
  group_name: { maxLength: 100 },
  pen_name: { maxLength: 100 },
  head: { min: 0, max: 100000 },
};

export const hedgingRules: ValidationRules = {
  positions: { min: 0, max: 100000 },
};
