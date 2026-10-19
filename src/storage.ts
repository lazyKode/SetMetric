import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_PROFILE, State } from './types';
const KEY = '@setmetric/state/v1';
export const initialState = (): State => ({ profile:{...INITIAL_PROFILE}, plan:null, history:[], active:null,customExercises:[] });
export async function loadState(): Promise<State> {
  try {
    const saved = await AsyncStorage.getItem(KEY);
    if (!saved) return initialState();
    const parsed = JSON.parse(saved);
    if (!parsed || !parsed.profile || !Array.isArray(parsed.history)) return initialState();
    return {...initialState(),...parsed,profile:{...INITIAL_PROFILE,...parsed.profile}};
  } catch { return initialState(); }
}
export async function saveState(data: State): Promise<void> { await AsyncStorage.setItem(KEY,JSON.stringify(data)); }
