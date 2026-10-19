import { EXERCISES, isAllowed } from './exercises';
import { Exercise, Muscle, Plan, PlanMove, Profile, Split, WorkoutDay, makeId } from './types';

type Template = { title:string; muscles:Muscle[] };
const FULL: Template[] = [
  {title:'Full Body A',muscles:['Quads','Chest','Back','Hamstrings','Shoulders','Biceps','Triceps','Core']},
  {title:'Full Body B',muscles:['Glutes','Back','Chest','Quads','Shoulders','Triceps','Biceps','Core']},
  {title:'Full Body C',muscles:['Quads','Chest','Back','Hamstrings','Shoulders','Core','Forearms','Triceps']},
];
const UPPER: Template[] = [
  {title:'Upper A',muscles:['Chest','Back','Shoulders','Biceps','Triceps','Forearms','Core']},
  {title:'Lower A',muscles:['Quads','Hamstrings','Glutes','Core','Quads','Hamstrings']},
  {title:'Upper B',muscles:['Back','Shoulders','Chest','Triceps','Biceps','Forearms','Core']},
  {title:'Lower B',muscles:['Hamstrings','Glutes','Quads','Core','Quads','Hamstrings']},
];
const PPL: Template[] = [
  {title:'Push A',muscles:['Chest','Shoulders','Triceps','Chest','Shoulders','Triceps','Core']},
  {title:'Pull A',muscles:['Back','Back','Biceps','Forearms','Back','Biceps','Core']},
  {title:'Legs A',muscles:['Quads','Hamstrings','Glutes','Quads','Hamstrings','Core']},
  {title:'Push B',muscles:['Shoulders','Chest','Triceps','Shoulders','Chest','Triceps','Core']},
  {title:'Pull B',muscles:['Back','Biceps','Forearms','Back','Biceps','Core']},
  {title:'Legs B',muscles:['Hamstrings','Quads','Glutes','Hamstrings','Quads','Core']},
];
const PARTS: Template[] = [
  {title:'Chest & Triceps',muscles:['Chest','Chest','Triceps','Chest','Triceps','Shoulders','Core']},
  {title:'Back & Biceps',muscles:['Back','Back','Biceps','Back','Biceps','Forearms','Core']},
  {title:'Legs',muscles:['Quads','Hamstrings','Glutes','Quads','Hamstrings','Core']},
  {title:'Shoulders & Core',muscles:['Shoulders','Shoulders','Core','Shoulders','Chest','Core','Triceps']},
  {title:'Arms & Grip',muscles:['Biceps','Triceps','Biceps','Triceps','Forearms','Forearms','Core']},
  {title:'Upper Mix',muscles:['Chest','Back','Shoulders','Biceps','Triceps','Forearms','Core']},
];
const DAY_POSITIONS: Record<number,number[]> = {
  2:[0,3], 3:[0,2,4], 4:[0,1,3,4], 5:[0,1,2,4,5], 6:[0,1,2,3,4,5], 7:[0,1,2,3,4,5,6],
};
export const isTimed = (id: string) => ['plank','towel_hold','aw_hook','farmers'].includes(id);
export function chooseSplit(profile: Profile): Exclude<Split,'auto'> {
  if (profile.split !== 'auto') return profile.split;
  if (profile.daysPerWeek <= 3) return 'full_body';
  if (profile.daysPerWeek === 4) return 'upper_lower';
  if (profile.daysPerWeek === 5) return 'upper_lower';
  return 'push_pull_legs';
}
export function movePrescription(ex: Exercise, profile: Profile): Omit<PlanMove,'exerciseId'> {
  const heavy = ex.type === 'compound' && profile.goal === 'strength';
  const baseSets = profile.level === 'beginner' ? 2 : profile.volume === 'high' ? 4 : 3;
  const sets = Math.min(5, heavy ? baseSets + 1 : baseSets);
  const reps: [number,number] = heavy ? [4,6] : profile.goal === 'strength' ? [6,10] : ex.type === 'compound' ? [6,10] : [10,15];
  return {sets:isTimed(ex.id)?2:sets,repMin:isTimed(ex.id)?20:reps[0],repMax:isTimed(ex.id)?40:reps[1],rest:heavy?150:ex.type==='compound'?120:75};
}
function pick(muscle:Muscle, pool:Exercise[], used:Set<string>, seed:number, compoundsFirst:boolean):Exercise|null {
  const all=pool.filter(e=>e.muscle===muscle&&!used.has(e.id)&&!e.id.startsWith('aw_'));
  if (!all.length) return null;
  const preferred=all.filter(e=>e.type===(compoundsFirst?'compound':'isolation'));
  const choices=preferred.length?preferred:all;
  const ex=choices[seed%choices.length]; used.add(ex.id); return ex;
}
export function generatePlan(profile:Profile, catalog:Exercise[]=EXERCISES):Plan {
  const split=chooseSplit(profile);
  const templates=split==='full_body'?FULL:split==='upper_lower'?UPPER:split==='push_pull_legs'?PPL:PARTS;
  const daysCount=Math.min(7,Math.max(2,Math.round(profile.daysPerWeek)));
  const positions=DAY_POSITIONS[daysCount];
  const pool=catalog.filter(e=>isAllowed(e,profile.setup));
  // The time setting is PER SESSION; advanced users may split their daily workload.
  const perSession=Math.min(8,Math.max(3,Math.floor(profile.minutes/10)+(profile.volume==='high'?1:0)));
  const totalMoves=Math.min(24,perSession*profile.sessionsPerDay);
  const days:WorkoutDay[]=[];
  positions.forEach((weekday,i)=>{
    if(daysCount===7&&weekday===6){
      days.push({id:makeId(),weekday,title:'Active Recovery',focus:'Easy cardio · mobility',recovery:true,sessions:[]});return;
    }
    const template=templates[i%templates.length];
    const used=new Set<string>();const exercises:Exercise[]=[];
    const priority=profile.priorities.filter(m=>template.muscles.includes(m));
    const queue=[...template.muscles];
    if(priority.length) queue.splice(1,0,...priority,...priority);
    for(let j=0;j<totalMoves*5&&exercises.length<totalMoves;j++){
      const ex=pick(queue[j%queue.length],pool,used,i*3+j,exercises.length<Math.ceil(totalMoves/3));
      if(ex) exercises.push(ex);
    }
    // Advanced grip work only on pulling/arm-focused days, never by default on recovery days.
    if(profile.armwrestling&&/(Pull|Arms|Upper|Back)/.test(template.title)&&exercises.length>0){
      const drills=pool.filter(ex=>ex.id.startsWith('aw_'));
      const target=Math.min(profile.volume==='high'?2:1,drills.length,exercises.length);
      for(let n=0;n<target;n++) exercises[exercises.length-1-n]=drills[(i+n)%drills.length];
    }
    const count=Math.min(profile.sessionsPerDay,Math.max(1,exercises.length));
    const names=count===1?['Main session']:count===2?['Morning','Evening']:['Morning','Afternoon','Evening'];
    const sessions=names.map((name,index)=>({
      id:makeId(),name,exercises:exercises
        .slice(Math.floor(index*exercises.length/count),Math.floor((index+1)*exercises.length/count))
        .map(e=>({exerciseId:e.id,...movePrescription(e,profile)})),
    }));
    days.push({id:makeId(),weekday,title:template.title,focus:template.muscles.slice(0,3).join(' · '),recovery:false,sessions});
  });
  const splitName=split==='full_body'?'Full Body':split==='upper_lower'?'Upper / Lower':split==='push_pull_legs'?'Push / Pull / Legs':'Body-Part Split';
  return {id:makeId(),createdAt:new Date().toISOString(),splitName,profile:{...profile,priorities:[...profile.priorities]},days};
}
export function nextTargets(previous: {weight:number;reps:number;rir:number}|undefined,min:number,max:number,unit:'kg'|'lb',muscle:Muscle):{weight:number;reps:number;text:string}|null {
  if(!previous||previous.reps<1)return null;
  const step=unit==='lb'?(['Quads','Hamstrings','Glutes','Back'].includes(muscle)?5:2.5):(['Quads','Hamstrings','Glutes','Back'].includes(muscle)?2.5:1.25);
  const weight=Math.max(0,previous.weight);
  if(previous.reps>=max&&previous.rir>=2) return {weight:Math.round((weight+step)*100)/100,reps:min,text:'Rep goal reached — consider a small weight increase if technique is solid.'};
  if(previous.reps<min||previous.rir<=0) return {weight,reps:Math.max(min,Math.min(max,previous.reps)),text:'Repeat this load or reduce it if needed to maintain technique.'};
  return {weight,reps:Math.min(max,previous.reps+1),text:'Keep the load; target one more controlled rep.'};
}
export function weeklyChart(history:{completedAt:string;sets:{weight:number;reps:number}[]}[],weeks=6):{label:string;volume:number;workouts:number}[]{
  const today=new Date();today.setHours(0,0,0,0);
  const monday=new Date(today);monday.setDate(today.getDate()-(today.getDay()+6)%7);
  const entries=Array.from({length:weeks},(_,i)=>{
    const d=new Date(monday);d.setDate(monday.getDate()-(weeks-i-1)*7);
    return {start:d.getTime(),end:new Date(d.getFullYear(),d.getMonth(),d.getDate()+7).getTime(),label:`${d.getMonth()+1}/${d.getDate()}`,volume:0,workouts:0};
  });
  history.forEach(h=>{
    const t=new Date(h.completedAt).getTime();const entry=entries.find(p=>t>=p.start&&t<p.end);
    if(entry){entry.workouts++;entry.volume+=h.sets.reduce((s,x)=>s+x.weight*x.reps,0);}
  });
  return entries.map(({label,volume,workouts})=>({label,volume,workouts}));
}
