import type {AssessmentAnswers} from './science';
export type Muscle = 'Chest' | 'Back' | 'Shoulders' | 'Quads' | 'Hamstrings' | 'Glutes' | 'Biceps' | 'Triceps' | 'Core' | 'Forearms';
export const MUSCLES: Muscle[] = ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Core', 'Forearms'];
export type Gear = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'bands';
export type Setup = 'full_gym' | 'dumbbells' | 'home';
export type Goal = 'hypertrophy' | 'strength' | 'recomposition' | 'fat_loss' | 'endurance' | 'sport';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Split = 'auto' | 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part';
export type Volume = 'balanced' | 'high';
export type Unit = 'kg' | 'lb';
export interface Exercise { id: string; name: string; muscle: Muscle; gear: Gear; type: 'compound' | 'isolation'; instructions: string; }
export interface Profile { name: string; goal: Goal; level: Level; daysPerWeek: number; minutes: number; split: Split; setup: Setup; priorities: Muscle[]; armwrestling: boolean; sessionsPerDay: 1 | 2 | 3; volume: Volume; unit: Unit; }
export interface PlanMove { exerciseId: string; sets: number; repMin: number; repMax: number; rest: number; }
export interface Session { id: string; name: string; exercises: PlanMove[]; }
export interface WorkoutDay { id: string; weekday: number; title: string; focus: string; recovery: boolean; sessions: Session[]; conditioning?: {minutes:number; activity:string}; }
export interface Plan { id: string; createdAt: string; splitName: string; profile: Profile; days: WorkoutDay[]; }
export interface LoggedSet { exerciseId: string; setNumber: number; weight: number; reps: number; rir: number; performedAt: string; }
export interface WorkoutLog { id: string; planDayId: string; sessionId: string; dayTitle: string; sessionName: string; beganAt: string; completedAt: string; sets: LoggedSet[]; }
export interface ActiveWorkout { dayId: string; sessionId: string; beganAt: string; sets: LoggedSet[]; }
export interface State { profile: Profile; plan: Plan | null; history: WorkoutLog[]; active: ActiveWorkout | null; customExercises: Exercise[]; assessment?: AssessmentAnswers; }
export const INITIAL_PROFILE: Profile = { name: '', goal: 'hypertrophy', level: 'intermediate', daysPerWeek: 5, minutes: 70, split: 'auto', setup: 'full_gym', priorities: [], armwrestling: false, sessionsPerDay: 1, volume: 'balanced', unit: 'kg' };
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export function mondayIndex(d: Date): number { return (d.getDay() + 6) % 7; }
export function makeId(): string { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
export const GOALS: Record<Goal,string> = { hypertrophy: 'Muscle growth', strength: 'Strength', recomposition: 'Fat loss + muscle', fat_loss:'Fat loss', endurance:'Fitness & stamina', sport:'Sport performance' };
export const LEVELS: Record<Level,string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
export const SPLITS: Record<Split,string> = { auto: 'Auto-select', full_body: 'Full body', upper_lower: 'Upper / Lower', push_pull_legs: 'Push / Pull / Legs', body_part: 'Body-part split' };
export const SETUPS: Record<Setup,string> = { full_gym: 'Full gym', dumbbells: 'Dumbbells + bodyweight', home: 'Bodyweight + bands' };
