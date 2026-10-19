const test=require('node:test');
const assert=require('node:assert/strict');
const {EXERCISES,isAllowed}=require('../.test-dist/exercises');
const {INITIAL_PROFILE}=require('../.test-dist/types');
const {generatePlan,chooseSplit,nextTargets,weeklyChart}=require('../.test-dist/generator');

test('generator creates valid exercises for 270 user profiles',()=>{
 let n=0;
 for(const daysPerWeek of [2,3,4,5,6,7])for(const setup of ['full_gym','dumbbells','home'])for(const sessionsPerDay of [1,2,3])for(const split of ['auto','full_body','upper_lower','push_pull_legs','body_part']){
   const p={...INITIAL_PROFILE,daysPerWeek,setup,sessionsPerDay,split,level:'advanced',volume:'high',minutes:90,armwrestling:true};
   const plan=generatePlan(p);
   assert.equal(plan.days.length,daysPerWeek);
   assert.deepEqual(plan.days.map(d=>d.weekday).sort(),[...new Set(plan.days.map(d=>d.weekday))].sort());
   for(const d of plan.days){
     if(d.recovery){assert.equal(d.sessions.length,0);continue}
     assert.equal(d.sessions.length,sessionsPerDay);
     for(const session of d.sessions){
       assert.ok(session.exercises.length>0);
       for(const move of session.exercises){
         const ex=EXERCISES.find(x=>x.id===move.exerciseId);
         assert.ok(ex,`Missing exercise ${move.exerciseId}`);
         assert.ok(isAllowed(ex,setup),`${ex.name} not allowed in ${setup}`);
         assert.ok(move.sets>0 && move.repMax>=move.repMin && move.rest>0);
       }
     }
   }
   n++;
 }
 assert.equal(n,270);
});
test('beginner presets use less volume than advanced presets',()=>{
 const p={...INITIAL_PROFILE,daysPerWeek:4};
 const b=generatePlan({...p,level:'beginner'}).days.find(d=>!d.recovery).sessions[0].exercises[0];
 const a=generatePlan({...p,level:'advanced',volume:'high'}).days.find(d=>!d.recovery).sessions[0].exercises[0];
 assert.ok(b.sets<a.sets);
});
test('next target only increases load when performance supports it',()=>{
 assert.equal(nextTargets(undefined,8,12,'kg','Chest'),null);
 const harder=nextTargets({weight:20,reps:12,rir:3},8,12,'kg','Chest');
 assert.ok(harder && harder.weight>20 && harder.reps===8);
 const steady=nextTargets({weight:20,reps:8,rir:0},8,12,'kg','Chest');
 assert.equal(steady.weight,20);
});
test('chart returns six empty periods for no history',()=>{
 const points=weeklyChart([]);assert.equal(points.length,6);assert.ok(points.every(p=>p.workouts===0&&p.volume===0));
});
const {DEFAULT_ASSESSMENT,safeFocus,focusIsAll,recommendDays,assessmentToProfile,trainingMethod,sportGuidance}=require('../.test-dist/science');
test('all ten muscles can be selected at once and keep balanced programming',()=>{
 const all=[...require('../.test-dist/types').MUSCLES];
 assert.equal(all.length,10);
 assert.equal(focusIsAll(all),true);
 const a={...DEFAULT_ASSESSMENT,goal:'hypertrophy',age:'30',focus:all};
 const p=assessmentToProfile(a,INITIAL_PROFILE);
 assert.deepEqual(p.priorities,[]);
 const plan=generatePlan(p);
 assert.ok(plan.days.filter(d=>!d.recovery).length>=2);
});
test('any nonempty muscle subset is persisted into profile as priorities',()=>{
 const a={...DEFAULT_ASSESSMENT,goal:'strength',age:'26',strength:'strong',experience:'consistent',focus:['Back','Biceps','Forearms']};
 const p=assessmentToProfile(a,INITIAL_PROFILE);
 assert.deepEqual(p.priorities,['Back','Biceps','Forearms']);
 assert.equal(p.goal,'strength');
 const plan=generatePlan(p);
 assert.ok(plan.days.every(d=>d.recovery||d.sessions[0].exercises.length>0));
});
test('repeat values in focus are deduplicated with stable ordering',()=>{
 assert.deepEqual(safeFocus(['Biceps','Biceps','Chest']),['Chest','Biceps']);
 assert.equal(focusIsAll([]),false);
});
test('beginners and active athletes have recoverable starting schedules',()=>{
 const novice={...DEFAULT_ASSESSMENT,goal:'fitness',age:'45'};
 assert.equal(recommendDays(novice),2);
 const runner={...DEFAULT_ASSESSMENT,goal:'sport',age:'28',stamina:'high',strength:'strong',experience:'consistent',sport:'running'};
 assert.equal(recommendDays(runner),3);
 assert.match(sportGuidance(runner),/Endurance focus/);
});
test('training method and optional cardio adjust to goal and experience',()=>{
 for(const goal of ['strength','hypertrophy','recomposition','fat_loss','endurance','sport']) {
   const p={...INITIAL_PROFILE,goal,level:'advanced',daysPerWeek:4};
   const plan=generatePlan(p);
   assert.ok(trainingMethod(p).effort.length>0);
   if(['fat_loss','endurance','recomposition'].includes(goal))assert.ok(plan.days.some(d=>d.conditioning?.minutes>0));
 }
});
test('a forearm focus appears in a two-day full-body plan',()=>{
 const p={...INITIAL_PROFILE,daysPerWeek:2,minutes:45,priorities:['Forearms'],split:'auto'};
 const plan=generatePlan(p);const moves=plan.days.flatMap(d=>d.sessions.flatMap(s=>s.exercises));
 assert.ok(moves.some(m=>EXERCISES.find(e=>e.id===m.exerciseId)?.muscle==='Forearms'));
});
