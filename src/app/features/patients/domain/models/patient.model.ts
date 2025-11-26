export type PatientGender = "male" | "female" | "other";
export type PatientGoalType = "definition" | "maintenance" | "bulking";

export interface Patient {
  user_id: string;
  nutritionist_id: string;
  first_name: string;
  last_name: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: PatientGender;
  goal_type: PatientGoalType;
  activity_level: string | null;
  desired_weight_kg: number | null;
  user_profile_completed: boolean;
  created_at: string;
  updated_at: string;
  has_profile_picture: boolean;
  id?: string;
  email?: string;
  [key: string]: unknown;
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
