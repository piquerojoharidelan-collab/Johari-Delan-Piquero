import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBMI } from './bmi.ts';

test('BMI calculation: computes accurate standard adult BMI', () => {
  // Height 180cm, Weight 75kg -> 75 / (1.8 * 1.8) = 23.15 -> 23.1
  const result = calculateBMI(75, 180, 28);
  assert.equal(result.bmi, 23.1);
  assert.equal(result.category, 'Normal weight');
  assert.equal(result.isPediatric, false);
});

test('BMI calculation: correctly flags overweight category for adults', () => {
  // Height 175cm, Weight 85kg -> 85 / (1.75 * 1.75) = 27.75 -> 27.8
  const result = calculateBMI(85, 175, 35);
  assert.equal(result.bmi, 27.8);
  assert.equal(result.category, 'Overweight');
  assert.equal(result.isPediatric, false);
});

test('BMI calculation: handles pediatric disclaimer for age under 18', () => {
  const result = calculateBMI(50, 160, 15);
  assert.equal(result.isPediatric, true);
  assert.equal(result.category, 'Pediatric Assessment');
  assert.match(result.description, /growth percentiles/i);
});

test('BMI calculation: handles invalid non-positive inputs safely', () => {
  const result = calculateBMI(0, 0, 25);
  assert.equal(result.bmi, 0);
  assert.match(result.description, /valid positive measurements/i);
});
