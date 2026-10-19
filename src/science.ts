import {Goal,Level,Muscle,MUSCLES,Profile,Setup} from './types';

/** Practical starting rules, not medical clearance or physiological testing. */
export type AssessmentAnswers={
 goal:string; stamina:'low'|'moderate'|'high'; strength:'new'|'some'|'strong';
 experience:'new'|'returning'|'consistent'; age:string; gender:string;
 sport:string; futureSport:string; weight:string; height:string;
 chest:string; waist:string; hips:string; fatLoss:string;
 days:'auto'|'2'|'3'|'4'|'5'|'6'; minutes:'30'|'45'|'60'|'75';
 equipment:Setup; limitations:string; focus:Muscle[];
};
export const DEFAULT_ASSESSMENT:AssessmentAnswers={
 goal:'',stamina:'moderate',strength:'new',experience:'new',age:'',gender:'Prefer not to say',
 sport:'',futureSport:'',weight:'',height:'',chest:'',waist:'',hips:'',fatLoss:'',
 days:'auto',minutes:'45',equipment:'full_gym',limitations:'',focus:[...MUSCLES]
};
export function safeFocus(input:readonly Muscle[]):Muscle[]{
 const chosen=new Set(input);return MUSCLES.filter(m=>chosen.has(m));
}
export function focusIsAll(input:readonly Muscle[]):boolean {return safeFocus(input).length===MUSCLES.length;}
export function recommendDays(a:AssessmentAnswers):number {
 const age=Number(a.age);
 const activeSport=!!a.sport.trim()&&!/^none|no sport$/i.test(a.sport.trim());
 const limitation=!!a.limitations.trim()&&!/^none|no$/i.test(a.limitations.trim());
 let days=a.strength==='new'||a.stamina==='low'||a.experience==='new'?2:
   a.experience==='consistent'&&a.stamina==='high'?5:3;
 if(a.strength==='some'&&a.stamina==='high'&&a.experience==='consistent')days=4;
 if(activeSport)days=Math.min(days,3);
 if(age<18)days=Math.min(days,3);
 // Age alone is not a reason to restrict an experienced older adult's training.
 if(limitation)days=Math.min(days,2);
 if(a.days!=='auto') days=Math.min(days,Number(a.days));
 return Math.max(2,Math.min(6,days));
}
export function assessmentToProfile(a:AssessmentAnswers,base:Profile):Profile {
 const goal:Goal=a.goal==='strength'?'strength':a.goal==='fat_loss'?'fat_loss':a.goal==='fitness'?'endurance':a.goal==='sport'?'sport':a.goal==='recomposition'?'recomposition':'hypertrophy';
 const level:Level=Number(a.age)<18||a.strength==='new'||a.experience==='new'?'beginner':a.strength==='strong'&&a.experience==='consistent'?'advanced':'intermediate';
 const focus=safeFocus(a.focus);
 return {...base,goal,level,daysPerWeek:recommendDays(a),minutes:Number(a.minutes),setup:a.equipment,
   split:'auto',volume:'balanced',sessionsPerDay:1,
   armwrestling:/armwrestl/i.test(a.sport+' '+a.futureSport),priorities:focusIsAll(focus)?[]:focus};
}
export type TrainingMethod={title:string;details:string;effort:string;sets:string;rest:string;condition:string};
export function trainingMethod(profile:Profile):TrainingMethod {
 const novice=profile.level==='beginner';
 if(novice)return {title:'Build your foundation',details:'Learn smooth, controlled movement; cover all major muscle groups and leave recovery between sessions.',effort:'Keep about 2–4 repetitions in reserve (RIR).',sets:'Start with 1–2 work sets per exercise.',rest:'About 60–120 seconds; longer if needed.',condition:'Advanced intensity methods are not needed.'};
 if(profile.goal==='endurance')return {title:'Build an aerobic base',details:'Use full-body resistance training alongside gradually increasing walking, cycling, swimming or other comfortable cardio.',effort:'Smooth reps with about 2–3 in reserve.',sets:'Usually 2–3 work sets per exercise.',rest:'About 60–120 seconds.',condition:'Increase cardio gradually. Breathing hard is not a sign you need heavier weights.'};
 if(profile.goal==='sport')return {title:'Support your sport',details:'Gym work develops general strength. Sport skill, field practice and recovery remain important, and this is not a sport-specific coaching prescription.',effort:'Usually stop 2–3 reps before failure.',sets:'Generally 2–3 sets per exercise.',rest:'Take enough rest to maintain technique and speed.',condition:'Avoid exhausting leg work immediately before important matches or training.'};
 if(profile.goal==='fat_loss'||profile.goal==='recomposition')return {title:'Build muscle while getting leaner',details:'Resistance training supports muscle retention. Add enjoyable cardio gradually and manage nutrition sustainably.',effort:'Usually stop 1–3 reps before failure.',sets:'Usually 2–3 work sets per exercise.',rest:'About 1–2 minutes, more on demanding lifts.',condition:'Fat cannot be selectively burned from particular body parts.'};
 if(profile.goal==='strength')return {title:'Strength first',details:'Practice key lifts, gradually add resistance, and use longer rests for high-quality sets.',effort:'Usually stop 1–3 repetitions before failure.',sets:'Generally 2–4 challenging sets on key lifts.',rest:'Around 2–3 minutes on heavy lifts.',condition:'Avoid maximal testing without suitable coaching and preparation.'};
 if(profile.level==='advanced')return {title:'Progress with control',details:'Distribute challenging weekly sets across recoverable sessions. More volume is not automatically better.',effort:'Most sets around 1–3 RIR; failure is optional, not required.',sets:'Build weekly set volume gradually based on progress and recovery.',rest:'About 1–3 minutes, depending on exercise difficulty.',condition:'Supersets or drop sets can save time but are optional; use them selectively.'};
 return {title:'Progress gradually',details:'Progress load or repetitions when the top of the target range feels controlled.',effort:'Most sets around 1–3 repetitions in reserve.',sets:'Usually 2–3 work sets per exercise.',rest:'About 1–2 minutes, longer for compound lifts.',condition:'Prioritize technique, full comfortable range of motion, and consistent attendance.'};
}
export function coachingNotes(a:AssessmentAnswers):string[] {
 const notes:string[]=[];
 if(Number(a.age)<18)notes.push('Under 18: use a supervised, age-appropriate plan reviewed by a qualified youth coach and parent/guardian.');
 if(Number(a.age)>=65)notes.push('Include balance and functional strength work; progress gradually.');
 if(a.limitations.trim())notes.push('Physical limitations were reported. This plan is general; ask a qualified professional to review exercise selection.');
 if(a.sport.trim())notes.push('Existing sport training takes priority when allocating recovery and lower-body workload.');
 if(a.goal==='fat_loss'||a.goal==='recomposition')notes.push('Fat loss depends substantially on energy balance. Resistance training supports muscle retention; no exercise can target fat loss from one body part.');
 if(a.focus.length===MUSCLES.length)notes.push('All muscle groups selected: the program stays balanced rather than treating every group as a special priority.');
 return notes;
}

/** Broad sport categories offer context, not sport-specific technical coaching. */
export function sportGuidance(a:AssessmentAnswers):string|null {
 const sport=(a.futureSport||a.sport).trim();if(!sport)return null;
 if(/running|marathon|cycling|triathlon|swim/i.test(sport))return 'Endurance focus: lift on days that allow recovery around long or intense endurance sessions. Progress aerobic work gradually.';
 if(/football|soccer|basketball|cricket|tennis|hockey|badminton/i.test(sport))return 'Field/court sport: focus on general strength, single-leg control and mobility. Avoid high-fatigue leg sessions immediately before games.';
 if(/powerlifting|weightlift/i.test(sport))return 'Strength sport: prioritize supervised technique and progressive practice of the relevant competition lifts.';
 if(/wrestling|boxing|martial|judo|jiu|mma|armwrest/i.test(sport))return 'Combat/grip sport: moderate extra pulling and grip volume when sport practice is heavy; protect elbows and wrists.';
 if(/bodybuild|physique/i.test(sport))return 'Bodybuilding: balance major muscle groups while progressing recoverable weekly sets and repetitions.';
 return `For ${sport}, this plan develops general strength; add sport-specific practice with a qualified coach.`;
}
