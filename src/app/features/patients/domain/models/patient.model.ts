export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  goalType: string;
  activityLevel: string;
  desiredWeightKg?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionStats {
  patientId: string;
  dailyCalories: number;
  weeklyAverage: number;
  caloriesBurned: number;
  exerciseMinutes: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface CalorieDistribution {
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks: number;
}

