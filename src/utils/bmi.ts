/**
 * Body Mass Index (BMI) calculation and classification utilities.
 * Note: BMI is an approximate screening measure and not a complete assessment
 * of body composition, metabolic fitness, or personal health.
 */

export interface BMIResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity' | 'Pediatric Assessment';
  description: string;
  isPediatric: boolean;
  healthyWeightRangeKg: { min: number; max: number };
  disclaimer: string;
}

export function calculateBMI(weightKg: number, heightCm: number, age: number = 25): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Normal weight',
      description: 'Please enter valid positive measurements for height and weight.',
      isPediatric: age < 18,
      healthyWeightRangeKg: { min: 0, max: 0 },
      disclaimer: 'Measurements must be greater than zero.',
    };
  }

  const heightM = heightCm / 100;
  const rawBMI = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBMI * 10) / 10;

  // Healthy weight reference (adult BMI 18.5 - 24.9)
  const minHealthyKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxHealthyKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  const disclaimer =
    'Important: BMI is a general population screening tool, not a diagnostic medical measure. It does not distinguish between muscle mass and body fat, nor does it evaluate cardiovascular health or nutritional status.';

  if (age < 18) {
    return {
      bmi,
      category: 'Pediatric Assessment',
      description: `For individuals under age 18 (age ${age}), standard adult BMI categories do not apply directly. Pediatric health practitioners evaluate growth percentiles based on age and sex charts rather than adult cutoffs.`,
      isPediatric: true,
      healthyWeightRangeKg: { min: minHealthyKg, max: maxHealthyKg },
      disclaimer,
    };
  }

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'Underweight',
      description: 'Your calculated BMI is below the standard adult reference range. Focus on nutrient-dense meals and gentle strength building.',
      isPediatric: false,
      healthyWeightRangeKg: { min: minHealthyKg, max: maxHealthyKg },
      disclaimer,
    };
  }

  if (bmi < 25) {
    return {
      bmi,
      category: 'Normal weight',
      description: 'Your calculated BMI falls within the standard healthy weight range for adults. Keep sustaining balanced daily habits!',
      isPediatric: false,
      healthyWeightRangeKg: { min: minHealthyKg, max: maxHealthyKg },
      disclaimer,
    };
  }

  if (bmi < 30) {
    return {
      bmi,
      category: 'Overweight',
      description: 'Your calculated BMI is slightly above the standard reference range. Regular daily physical activity and nourishing food habits support long-term vitality.',
      isPediatric: false,
      healthyWeightRangeKg: { min: minHealthyKg, max: maxHealthyKg },
      disclaimer,
    };
  }

  return {
    bmi,
    category: 'Obesity',
    description: 'Your calculated BMI is in the higher reference range. Setting sustainable, gentle wellness goals and consulting your healthcare team can provide tailored support.',
    isPediatric: false,
    healthyWeightRangeKg: { min: minHealthyKg, max: maxHealthyKg },
    disclaimer,
  };
}
