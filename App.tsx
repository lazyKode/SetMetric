import React,{useEffect,useMemo,useState} from 'react';
import {Alert,ActivityIndicator,KeyboardAvoidingView,Modal,Platform,ScrollView,Share,StatusBar,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {BY_ID,EXERCISES,isAllowed} from './src/exercises';
import {chooseSplit,generatePlan,isTimed,nextTargets,weeklyChart} from './src/generator';
import {initialState,loadState,saveState} from './src/storage';
import {ActiveWorkout,Exercise,Gear,Goal,Level,LoggedSet,Muscle,MUSCLES,PlanMove,Profile,Session,Setup,Split,State,Unit,Volume,WorkoutDay,WEEKDAYS,GOALS,LEVELS,SPLITS,SETUPS,makeId,mondayIndex} from './src/types';
import {Btn,C,Chip,H1,H2,Label,Muted,Panel,Row,Rule,S,Stat} from './src/ui';
import {AssessmentFlow} from './src/assessment';
import {trainingMethod,focusIsAll,coachingNotes,sportGuidance} from './src/science';

type Tab='home'|'plan'|'generator'|'library'|'insights'|'settings'|'day'|'workout';
type SwapContext={dayId:string;sessionId:string;exerciseId?:string}|null;
const SHORT_GOALS:Goal[]=['hypertrophy','strength','recomposition'];
const LEVEL_CHOICES:Level[]=['beginner','intermediate','advanced'];
const SPLIT_CHOICES:Split[]=['auto','full_body','upper_lower','push_pull_legs','body_part'];
const SETUP_CHOICES:Setup[]=['full_gym','dumbbells','home'];
const fmt=(n:number)=>Number.isInteger(n)?String(n):n.toFixed(1);
const estimate1RM=(weight:number,reps:number)=>reps>0&&reps<=12?weight*(1+reps/30):weight;
const dateTitle=(iso:string)=>new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});

function AppInner(){
 const [db,setDb]=useState<State>(initialState());const[loaded,setLoaded]=useState(false);
 const[tab,setTab]=useState<Tab>('home');const[selectedDay,setSelectedDay]=useState<string>('');
 const[workingProfile,setWorkingProfile]=useState<Profile>(initialState().profile);
 const[search,setSearch]=useState('');const[muscleFilter,setMuscleFilter]=useState<Muscle|'All'>('All');
 const[swap,setSwap]=useState<SwapContext>(null);const[customOpen,setCustomOpen]=useState(false);
 const[customName,setCustomName]=useState('');const[customMuscle,setCustomMuscle]=useState<Muscle>('Chest');
 const[customGear,setCustomGear]=useState<Gear>('dumbbell');const[customCue,setCustomCue]=useState('');
 const[drafts,setDrafts]=useState<Record<string,{weight:string;reps:string;rir:string}>>({});
 const[clock,setClock]=useState(Date.now());const[restUntil,setRestUntil]=useState(0);
 const[editSession,setEditSession]=useState<string|null>(null);
 useEffect(()=>{loadState().then(x=>{setDb(x);setWorkingProfile(x.profile);setLoaded(true)});},[]);
 useEffect(()=>{if(loaded)saveState(db).catch(()=>Alert.alert('Storage error','Changes could not be saved. Check device storage.'));},[db,loaded]);
 useEffect(()=>{if(!db.active||!restUntil)return;const id=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(id)},[db.active,restUntil]);
 const put=(update:(old:State)=>State)=>setDb(update);
 const catalog=useMemo(()=>[...EXERCISES,...db.customExercises],[db.customExercises]);
 const byId=useMemo(()=>Object.fromEntries(catalog.map(e=>[e.id,e])) as Record<string,Exercise>,[catalog]);
 const plan=db.plan;
 const today=useMemo(()=>plan?.days.find(d=>d.weekday===mondayIndex(new Date()))||plan?.days.find(d=>!d.recovery),[plan]);
 const day=plan?.days.find(x=>x.id===selectedDay)||today;
 const activeDay=plan?.days.find(x=>x.id===db.active?.dayId);
 const activeSession=activeDay?.sessions.find(x=>x.id===db.active?.sessionId);
 const totalSets=db.history.reduce((n,w)=>n+w.sets.length,0);
 const workVolume=db.history.reduce((n,w)=>n+w.sets.reduce((sum,x)=>sum+x.weight*x.reps,0),0);
 const latestFor=(id:string):LoggedSet|undefined=>{for(const log of [...db.history].reverse()){const match=log.sets.filter(s=>s.exerciseId===id).sort((a,b)=>b.setNumber-a.setNumber)[0];if(match)return match;}return undefined};
 const goto=(t:Tab)=>{setTab(t);if(t==='generator')setWorkingProfile({...db.profile,priorities:[...db.profile.priorities]});if(t==='library'){setSearch('');setMuscleFilter('All');setSwap(null)}};
 const openDay=(id:string)=>{setSelectedDay(id);setEditSession(null);setTab('day')};
 const beginWorkout=(d:WorkoutDay,s:Session)=>{
   if(db.active&&(db.active.dayId!==d.id||db.active.sessionId!==s.id)){
     Alert.alert('Workout in progress','Finish or discard your current workout before starting another.');setTab('workout');return;
   }
   if(!db.active)put(o=>({...o,active:{dayId:d.id,sessionId:s.id,beganAt:new Date().toISOString(),sets:[]}}));
   setDrafts({});setRestUntil(0);setTab('workout');
 };
 const finishWorkout=()=>{
   if(!db.active||!activeDay||!activeSession)return;
   if(!db.active.sets.length){Alert.alert('No sets logged','Log at least one set to save this workout.');return}
   const workout={id:makeId(),planDayId:activeDay.id,sessionId:activeSession.id,dayTitle:activeDay.title,sessionName:activeSession.name,beganAt:db.active.beganAt,completedAt:new Date().toISOString(),sets:db.active.sets};
   put(o=>({...o,history:[...o.history,workout],active:null}));setRestUntil(0);setTab('home');
   Alert.alert('Workout saved',`${workout.sets.length} sets logged. Great work.`);
 };
 const discardWorkout=()=>Alert.alert('Discard workout?','The unsaved set entries will be lost.',[
   {text:'Keep training',style:'cancel'},{text:'Discard',style:'destructive',onPress:()=>{put(o=>({...o,active:null}));setTab('home')}}]);
 const toggleLogged=(id:string,setNo:number,move:PlanMove)=>{
   if(!db.active)return;const found=db.active.sets.some(s=>s.exerciseId===id&&s.setNumber===setNo);
   if(found){put(o=>({...o,active:o.active?{...o.active,sets:o.active.sets.filter(s=>!(s.exerciseId===id&&s.setNumber===setNo))}:null}));return}
   const key=`${id}:${setNo}`;const previous=latestFor(id);const ex=byId[id];
   const proposed=previous&&ex?nextTargets(previous,move.repMin,move.repMax,db.profile.unit,ex.muscle):null;
   const weight=Number(drafts[key]?.weight??String(proposed?.weight??previous?.weight??0));
   const reps=Number(drafts[key]?.reps??String(proposed?.reps??move.repMin));
   const rir=Number(drafts[key]?.rir??'2');
   if(!Number.isFinite(weight)||weight<0||weight>10000||!Number.isInteger(reps)||reps<1||reps>1000||!Number.isFinite(rir)||rir<0||rir>10){Alert.alert('Invalid set','Enter a valid weight, reps (or seconds), and RIR (0–10).');return}
   const set:LoggedSet={exerciseId:id,setNumber:setNo,weight,reps,rir,performedAt:new Date().toISOString()};
   put(o=>({...o,active:o.active?{...o.active,sets:[...o.active.sets,set]}:null}));setRestUntil(Date.now()+move.rest*1000);setClock(Date.now());
 };
 const editMove=(sessionId:string,id:string,change:(m:PlanMove)=>PlanMove|null)=>{
   if(db.active){Alert.alert('Workout in progress','Complete the current workout before editing your plan.');return}
   put(o=>!o.plan?o:{...o,plan:{...o.plan,days:o.plan.days.map(d=>d.id!==selectedDay?d:{...d,sessions:d.sessions.map(s=>s.id!==sessionId?s:{...s,exercises:s.exercises.flatMap(m=>m.exerciseId!==id?[m]:(()=>{const revised=change(m);return revised?[revised]:[]})())})})}});
 };
 const addOrSwap=(id:string)=>{
   if(!swap||!db.plan)return;
   if(db.active){Alert.alert('Workout in progress','Complete the current workout before editing your plan.');return}
   const day0=db.plan.days.find(x=>x.id===swap.dayId);const session0=day0?.sessions.find(x=>x.id===swap.sessionId);
   if(session0?.exercises.some(m=>m.exerciseId===id&&m.exerciseId!==swap.exerciseId)){Alert.alert('Already in session','This exercise is already in that session.');return}
   put(o=>!o.plan?o:{...o,plan:{...o.plan,days:o.plan.days.map(d=>d.id!==swap.dayId?d:{...d,sessions:d.sessions.map(s=>s.id!==swap.sessionId?s:{...s,exercises:swap.exerciseId?s.exercises.map(m=>m.exerciseId===swap.exerciseId?{...m,exerciseId:id}:m):[...s.exercises,{exerciseId:id,sets:3,repMin:8,repMax:12,rest:90}]})})}});
   setSelectedDay(swap.dayId);setSwap(null);setTab('day');
 };
 const exportCSV=async()=>{
   const rows=['date,workout,session,exercise,sets,weight,reps,rir,unit'];
   for(const h of db.history)for(const s of h.sets){const cell=(t:string)=>`"${t.replace(/"/g,'""')}"`;
     rows.push([cell(h.completedAt),cell(h.dayTitle),cell(h.sessionName),cell(byId[s.exerciseId]?.name||s.exerciseId),s.setNumber,s.weight,s.reps,s.rir,db.profile.unit].join(','));}
   try{await Share.share({message:rows.join('\n'),title:'SetMetric training history (CSV text)'})}catch{Alert.alert('Could not share','The device share dialog is unavailable.')}
 };
 const customSave=()=>{
   if(!customName.trim())return Alert.alert('Name required','Enter a name for your exercise.');
   const ex:Exercise={id:'custom_'+makeId(),name:customName.trim(),muscle:customMuscle,gear:customGear,type:'isolation',instructions:customCue.trim()||'Use a controlled range of motion and comfortable load.'};
   put(o=>({...o,customExercises:[...o.customExercises,ex]}));setCustomName('');setCustomCue('');setCustomOpen(false);
 };
 const Header=({title,subtitle,back}: {title:string;subtitle?:string;back?:()=>void})=><View style={{marginBottom:23}}>
   <Row style={{justifyContent:'space-between',marginBottom:15}}><TouchableOpacity onPress={back||(()=>goto('home'))}><Text style={[S.eyebrow,{letterSpacing:back?1.5:3}]}>{back?'←  BACK':'S E T M E T R I C'}</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" onPress={()=>goto('settings')} style={{width:33,height:33,backgroundColor:C.card,borderRadius:11,justifyContent:'center',alignItems:'center',borderColor:C.line,borderWidth:1}}><Text style={{color:C.accent,fontSize:20}}>⚙</Text></TouchableOpacity></Row>
   <H1>{title}</H1>{subtitle?<Muted style={{marginTop:5}}>{subtitle}</Muted>:null}
 </View>;
 const Selector=({choices,value,onChange}: {choices:{value:string;label:string}[];value:string;onChange:(v:string)=>void})=><View style={{flexDirection:'row',flexWrap:'wrap',marginTop:10}}>{choices.map(o=><Chip key={o.value} title={o.label} selected={value===o.value} onPress={()=>onChange(o.value)}/>)}</View>;
 const BlockTitle=({title,action,onPress}: {title:string;action?:string;onPress?:()=>void})=><Row style={{justifyContent:'space-between',marginTop:10,marginBottom:13}}><H2>{title}</H2>{action&&onPress?<TouchableOpacity onPress={onPress}><Text style={{color:C.accent,fontWeight:'700',fontSize:13}}>{action}  →</Text></TouchableOpacity>:null}</Row>;
 const ExerciseLine=({move,idx,sessionId,editable}: {move:PlanMove;idx:number;sessionId:string;editable:boolean})=>{
   const ex=byId[move.exerciseId];if(!ex)return null;
   return <View style={{paddingVertical:12,borderBottomColor:C.line,borderBottomWidth:0.7}}>
     <Row><View style={{width:31,height:31,borderRadius:10,backgroundColor:C.accentDark,alignItems:'center',justifyContent:'center',marginRight:12}}><Text style={{color:C.accent,fontWeight:'800',fontSize:12}}>{idx+1}</Text></View>
       <View style={{flex:1}}><Text style={{color:C.text,fontWeight:'700',fontSize:14}}>{ex.name}</Text><Muted style={{fontSize:11}}>{ex.muscle} · {move.sets} × {move.repMin}–{move.repMax}{isTimed(ex.id)?' sec':''} · {move.rest}s rest</Muted></View>
       {editable?<TouchableOpacity onPress={()=>{setSwap({dayId:selectedDay,sessionId,exerciseId:ex.id});setMuscleFilter(ex.muscle);setSearch('');setTab('library')}}><Text style={{color:C.accent,fontWeight:'700',fontSize:12}}>Swap</Text></TouchableOpacity>:null}
     </Row>{editable?<Row style={{marginLeft:42,marginTop:10,flexWrap:'wrap',gap:7}}>
       <TouchableOpacity onPress={()=>editMove(sessionId,ex.id,m=>({...m,sets:Math.max(1,m.sets-1)}))}><Text style={tinyBtn}>− Set</Text></TouchableOpacity>
       <TouchableOpacity onPress={()=>editMove(sessionId,ex.id,m=>({...m,sets:Math.min(8,m.sets+1)}))}><Text style={tinyBtn}>+ Set</Text></TouchableOpacity>
       <TouchableOpacity onPress={()=>editMove(sessionId,ex.id,m=>({...m,repMin:Math.max(1,m.repMin-1),repMax:Math.max(2,m.repMax-1)}))}><Text style={tinyBtn}>− Rep</Text></TouchableOpacity>
       <TouchableOpacity onPress={()=>editMove(sessionId,ex.id,m=>({...m,repMin:m.repMin+1,repMax:m.repMax+1}))}><Text style={tinyBtn}>+ Rep</Text></TouchableOpacity>
       <TouchableOpacity onPress={()=>Alert.alert('Remove exercise?',ex.name,[{text:'Cancel',style:'cancel'},{text:'Remove',style:'destructive',onPress:()=>editMove(sessionId,ex.id,()=>null)}])}><Text style={[tinyBtn,{color:C.red}]}>Remove</Text></TouchableOpacity>
     </Row>:null}
   </View>;
 };
 const RootHome=()=>{
   const next=today&&!today.recovery?today:plan?.days.find(x=>!x.recovery);
   const active=next?.sessions[0];
   return <>
      <View style={{marginTop:12,marginBottom:25}}><Text style={{color:C.accent,fontSize:11,fontWeight:'900',letterSpacing:3}}>SETMETRIC</Text><Text style={{color:C.text,fontWeight:'900',fontSize:35,letterSpacing:-1,marginTop:8}}>Ready for today.</Text><Muted style={{marginTop:6}}>One clear plan. Make every workout count.</Muted></View>
      <Panel style={{padding:22,backgroundColor:'#183A34',borderColor:'#357A68'}}>
        <Text style={{color:C.accent,fontWeight:'900',letterSpacing:1.8,fontSize:10}}>YOUR PROGRAM</Text>
        <Text style={{color:C.text,fontSize:25,fontWeight:'900',marginTop:9}}>{plan?`${plan.days.filter(d=>!d.recovery).length} days per week`:'Personalized fitness'}</Text>
        <Text style={{color:'#C4DBD5',fontSize:13,lineHeight:20,marginTop:5}}>{plan?.splitName||'A schedule built around you'} · {plan?.profile.minutes||45} min workouts</Text>
        <View style={{marginTop:18}}><Btn title="View my week  →" onPress={()=>goto('plan')}/></View>
      </Panel>
      {db.active?<Panel style={{borderColor:C.accent}}><Text style={{color:C.accent,fontWeight:'900',marginBottom:10}}>Workout in progress</Text><Btn title="Resume workout →" onPress={()=>goto('workout')}/></Panel>:null}
      {next?<><View style={{flexDirection:'row',justifyContent:'space-between',marginTop:19,marginBottom:10}}><H2>Up next</H2><TouchableOpacity onPress={()=>goto('plan')}><Text style={{color:C.accent,fontWeight:'800'}}>See all days →</Text></TouchableOpacity></View>
        <Panel style={{padding:19}}><Text style={{color:C.accent,fontSize:11,fontWeight:'900',letterSpacing:1.4}}>{WEEKDAYS[next.weekday].toUpperCase()} · TRAINING</Text><Text style={{fontSize:22,color:C.text,fontWeight:'900',marginTop:7}}>{next.title}</Text><Muted style={{marginTop:5}}>{next.focus}</Muted><Rule/><Btn title="Start this day →" onPress={()=>openDay(next.id)}/></Panel>
      </>:null}
      <View style={{flexDirection:'row',gap:12,marginTop:9}}>
        <View style={{flex:1}}><Panel><Text style={{color:C.text,fontSize:25,fontWeight:'900'}}>{db.history.length}</Text><Muted>Workouts logged</Muted></Panel></View>
        <View style={{flex:1}}><Panel><Text style={{color:C.text,fontSize:25,fontWeight:'900'}}>{totalSets}</Text><Muted>Sets completed</Muted></Panel></View>
      </View>
      <TouchableOpacity style={{paddingVertical:14,alignItems:'center'}} onPress={()=>goto('generator')}><Text style={{color:C.muted,fontWeight:'700'}}>Update my answers or focus  →</Text></TouchableOpacity>
   </>;
 };
 const PlanScreen=()=>{
   if(!plan)return <><Header title="My week"/><Panel><H2>Your weekly schedule is waiting</H2><Muted style={{marginVertical:14}}>A few simple choices and it is ready.</Muted><Btn title="Create my plan" onPress={()=>goto('generator')}/></Panel></>;
   const method=trainingMethod(plan.profile);
   const focused=db.assessment?.focus||MUSCLES;
   return <>
    <View style={{marginTop:12,marginBottom:22}}><Text style={{color:C.accent,fontSize:11,fontWeight:'900',letterSpacing:2.5}}>YOUR TRAINING WEEK</Text><Text style={{color:C.text,fontSize:33,fontWeight:'900',marginTop:7,letterSpacing:-1}}>{plan.days.filter(d=>!d.recovery).length} training days</Text><Muted style={{marginTop:6}}>{plan.splitName} · {plan.profile.minutes} minutes per workout</Muted></View>
    <View style={{backgroundColor:'#16382F',borderRadius:16,padding:16,marginBottom:19,borderWidth:1,borderColor:'#326554'}}><Text style={{color:C.accent,fontWeight:'800',fontSize:11,letterSpacing:1.4}}>TRAINING FOCUS</Text><Text style={{color:C.text,fontSize:15,fontWeight:'800',marginTop:7}}>{focusIsAll(focused)?'All body parts · Balanced':focused.join(' · ')}</Text><Muted style={{fontSize:11,marginTop:6}}>The plan also trains other major muscles for balance.</Muted></View>
    {WEEKDAYS.map((w,index)=>{const d=plan.days.find(x=>x.weekday===index);const rest=!d||d.recovery;return <TouchableOpacity key={w} accessibilityRole="button" disabled={!d||d.recovery} onPress={()=>d&&openDay(d.id)} activeOpacity={0.8} style={[styles.weekItem,{opacity:rest?0.72:1,borderColor:d&&index===mondayIndex(new Date())?C.accent:C.line}]}>
      <View style={{width:50,height:50,backgroundColor:rest?'#182329':'#1C3C36',borderRadius:14,alignItems:'center',justifyContent:'center'}}><Text style={{color:rest?C.muted:C.accent,fontSize:12,fontWeight:'900'}}>{w.toUpperCase()}</Text></View>
      <View style={{flex:1,marginLeft:13}}><Text style={{color:rest?C.muted:C.text,fontWeight:'800',fontSize:15}}>{rest?'Rest / easy movement':d.title}</Text><Muted style={{fontSize:11,marginTop:4}}>{rest?'Recover for your next session':`${d.sessions.reduce((n,x)=>n+x.exercises.length,0)} exercises · ${d.focus}`}</Muted></View>
      <Text style={{fontSize:22,color:rest?C.dim:C.accent}}>{rest?'—':'›'}</Text>
     </TouchableOpacity>})}
    <Panel style={{marginTop:13}}><Text style={{color:C.text,fontWeight:'900',fontSize:16}}>{method.title}</Text><Muted style={{marginTop:8}}>{method.details}</Muted><Muted style={{marginTop:9,fontSize:12}}>{method.effort} {method.rest}</Muted></Panel>
    {db.assessment&&sportGuidance(db.assessment)?<Panel><Text style={{color:C.accent,fontWeight:'900',fontSize:12}}>YOUR SPORT</Text><Muted style={{marginTop:8}}>{sportGuidance(db.assessment)}</Muted></Panel>:null}
    {db.assessment?coachingNotes(db.assessment).map((note,i)=><Muted key={i} style={{marginTop:8,fontSize:12}}>{note}</Muted>):null}
    <TouchableOpacity style={{alignItems:'center',paddingVertical:19}} onPress={()=>goto('generator')}><Text style={{color:C.accent,fontWeight:'800'}}>Change my answers or focus →</Text></TouchableOpacity>
   </>;
 };
 const DayScreen=()=>!day?PlanScreen():<><Header title={day.title} subtitle={`${WEEKDAYS[day.weekday]} · ${day.focus}`} back={()=>goto('plan')}/>
   {day.recovery?<Panel><H2>Recover & rebuild</H2><Muted style={{marginTop:10}}>Walk, perform easy mobility, or rest. Recovery supports adaptation.</Muted></Panel>:day.sessions.map(s=><Panel key={s.id}>
     <Row style={{justifyContent:'space-between',marginBottom:6}}><View><Text style={[S.eyebrow,{marginBottom:5}]}>{s.name.toUpperCase()}</Text><Text style={{fontSize:19,color:C.text,fontWeight:'800'}}>{s.exercises.length} exercises</Text></View><TouchableOpacity onPress={()=>{if(db.active){Alert.alert('Workout in progress','Finish or discard the active workout before editing the plan.');return}setEditSession(editSession===s.id?null:s.id)}}><Text style={{color:C.accent,fontWeight:'800',fontSize:12}}>{editSession===s.id?'DONE EDITING':'EDIT'}</Text></TouchableOpacity></Row>
     {s.exercises.map((m,i)=><ExerciseLine key={`${m.exerciseId}-${i}`} move={m} idx={i} sessionId={s.id} editable={editSession===s.id}/>)}
     {editSession===s.id?<TouchableOpacity style={{paddingVertical:15}} onPress={()=>{setSwap({dayId:day.id,sessionId:s.id});setSearch('');setMuscleFilter('All');setTab('library')}}><Text style={{color:C.accent,fontWeight:'800'}}>+ ADD EXERCISE</Text></TouchableOpacity>:null}
     <View style={{marginTop:15}}><Btn title={db.active&&db.active.dayId===day.id&&db.active.sessionId===s.id?'RESUME SESSION  →':'START SESSION  →'} onPress={()=>beginWorkout(day,s)}/></View>
   </Panel>)}
   {day.conditioning?<Panel style={{borderColor:'#315D51'}}><Text style={{color:C.accent,fontWeight:'800'}}>OPTIONAL CARDIO</Text><Text style={{color:C.text,fontSize:16,fontWeight:'800',marginTop:8}}>{day.conditioning.minutes} minutes</Text><Muted style={{marginTop:5}}>{day.conditioning.activity}</Muted></Panel>:null}
 </>;
 const GeneratorScreen=()=> <AssessmentFlow base={db.profile} initial={db.assessment} onGenerate={(profile,answers)=>{
   const generate=()=>{const newPlan=generatePlan(profile,[...EXERCISES,...db.customExercises]);put(o=>({...o,profile,assessment:answers,plan:newPlan,active:null}));setSelectedDay('');setTab('plan');};
   if(db.active)Alert.alert('Finish your current workout','Your workout must be saved or discarded before changing the schedule.');
   else if(plan)Alert.alert('Update weekly schedule?','Completed workout records will remain saved.',[{text:'Not yet',style:'cancel'},{text:'Update schedule',onPress:generate}]);
   else generate();
 }}/>;
 const LibraryScreen=()=>{
  const matches=catalog.filter(ex=>(muscleFilter==='All'||ex.muscle===muscleFilter)&&(!swap||isAllowed(ex,db.profile.setup))&&ex.name.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.muscle.localeCompare(b.muscle));
  return <><Header title={swap?'Choose an exercise':'Exercise library'} subtitle={swap?'Tap an exercise to add or replace it.':`${catalog.length} exercises · Filter by muscle and equipment.`} back={swap?()=>{setSelectedDay(swap.dayId);setSwap(null);setTab('day')}:undefined}/>
   <Row style={{gap:10,marginBottom:14}}><TextInput value={search} onChangeText={setSearch} style={[S.input,{flex:1}]} placeholder="Search exercises" placeholderTextColor={C.dim} accessibilityLabel="Search exercises"/>{!swap?<Btn title="+ CUSTOM" small onPress={()=>setCustomOpen(true)}/>:null}</Row>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:11,flexGrow:0}}><Chip title="All" selected={muscleFilter==='All'} onPress={()=>setMuscleFilter('All')}/>{MUSCLES.map(m=><Chip key={m} title={m} selected={muscleFilter===m} onPress={()=>setMuscleFilter(m)}/>)}</ScrollView>
   {matches.map(ex=><TouchableOpacity key={ex.id} onPress={()=>swap?addOrSwap(ex.id):Alert.alert(ex.name,`${ex.muscle} · ${ex.gear}\n\n${ex.instructions}`,[{text:'Close'}])} style={styles.libraryItem}>
     <View style={S.circle}><Text style={{color:C.accent,fontWeight:'900',fontSize:21}}>{ex.type==='compound'?'↗':'◎'}</Text></View><View style={{flex:1,marginLeft:13}}><Label>{ex.name}</Label><Muted style={{fontSize:11,marginTop:2}}>{ex.muscle} · {ex.gear} · {ex.type}</Muted></View><Text style={{color:C.accent,fontSize:21}}>{swap?'+':'›'}</Text></TouchableOpacity>)}
   {!matches.length?<Panel><Muted>No exercises match these filters.</Muted></Panel>:null}
  </>;
 };
 const InsightsScreen=()=>{
   const chart=weeklyChart(db.history);const max=Math.max(1,...chart.map(x=>x.volume));
   const records=Object.values(db.history.flatMap(h=>h.sets).reduce((a,s)=>{const ex=byId[s.exerciseId];if(!ex)return a;const v=estimate1RM(s.weight,s.reps);if(!a[s.exerciseId]||a[s.exerciseId].best<v)a[s.exerciseId]={name:ex.name,best:v};return a},{} as Record<string,{name:string;best:number}>)).sort((a,b)=>b.best-a.best).slice(0,6);
   return <><Header title="Progress insights" subtitle="Turn every logged rep into measurable progress."/>
    <Panel><Text style={S.eyebrow}>ALL-TIME PERFORMANCE</Text><Row style={{marginTop:17}}><Stat value={String(db.history.length)} label="WORKOUTS"/><Stat value={String(totalSets)} label="WORKING SETS"/><Stat value={fmt(Math.round(workVolume))} label={`VOLUME · ${db.profile.unit}`}/></Row></Panel>
    <Panel><BlockTitle title="Training volume"/><Muted style={{fontSize:11}}>Last 6 calendar weeks · estimated load × reps</Muted>
      <Row style={{height:160,marginTop:18,alignItems:'flex-end',justifyContent:'space-around'}}>{chart.map((p,i)=><View key={i} style={{alignItems:'center',flex:1}}><Text style={{color:C.muted,fontSize:9,marginBottom:4}}>{p.volume?`${Math.round(p.volume/1000*10)/10}k`:''}</Text><View style={{width:'58%',height:Math.max(4,125*p.volume/max),borderTopLeftRadius:6,borderTopRightRadius:6,backgroundColor:i===chart.length-1?C.accent:'#28675D'}}/><Muted style={{fontSize:10,marginTop:7}}>{p.label}</Muted></View>)}</Row></Panel>
    <Panel><BlockTitle title="Weekly consistency"/>{chart.map((p,i)=><View key={i} style={{flexDirection:'row',alignItems:'center',marginBottom:11}}><Text style={{width:44,fontSize:11,color:C.muted}}>{p.label}</Text><View style={{height:10,flex:1,backgroundColor:C.cardAlt,borderRadius:8,overflow:'hidden'}}><View style={{backgroundColor:C.accent,width:`${Math.min(100,p.workouts/7*100)}%`,height:'100%',borderRadius:8}}/></View><Text style={{width:26,color:C.text,textAlign:'right',fontSize:12,fontWeight:'800'}}>{p.workouts}</Text></View>)}</Panel>
    <Panel><BlockTitle title="Strength estimates"/><Muted style={{fontSize:11,marginBottom:8}}>Approximate one-rep maximum from sets of 12 reps or fewer. Not a guarantee or a recommendation to test maximal loads.</Muted>
      {records.length?records.map((r,i)=><View key={i} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:i===records.length-1?0:1,borderColor:C.line}}><Label>{r.name}</Label><Text style={{fontWeight:'800',color:C.accent}}>{fmt(Math.round(r.best*10)/10)} {db.profile.unit}</Text></View>):<Muted style={{marginTop:11}}>Log a workout to see strength estimates.</Muted>}</Panel>
    <BlockTitle title="Workout history"/>
    {[...db.history].reverse().slice(0,15).map(h=><Panel key={h.id} style={{marginBottom:8}}><Row style={{justifyContent:'space-between'}}><View><Label>{h.dayTitle} · {h.sessionName}</Label><Muted style={{fontSize:11}}>{dateTitle(h.completedAt)}</Muted></View><Text style={{color:C.accent,fontWeight:'800'}}>{h.sets.length} sets</Text></Row></Panel>)}
    {!db.history.length?<Panel><Muted>Your finished workouts will appear here.</Muted></Panel>:null}
  </>;
 };
 const WorkoutScreen=()=>{
  if(!db.active||!activeDay||!activeSession)return <><Header title="No active workout"/><Btn title="GO TO MY PLAN" onPress={()=>goto('plan')}/></>;
  const done=db.active.sets.length;
  const planned=activeSession.exercises.reduce((n,e)=>n+e.sets,0);
  return <><Header title={activeDay.title} subtitle={`${activeSession.name} · ${done} of ${planned} working sets logged`} back={()=>goto('day')}/>
    <Panel style={{backgroundColor:'#173C35',borderColor:C.accent}}><Row style={{justifyContent:'space-between'}}><View><Text style={[S.eyebrow,{marginBottom:7}]}>LIVE TRAINING</Text><Text style={{fontSize:20,fontWeight:'900',color:C.text}}>Workout in progress</Text><Muted>All entries are saved locally.</Muted></View><Text style={{fontSize:28,color:C.accent}}>●</Text></Row><View style={{height:6,borderRadius:6,backgroundColor:'#285148',marginTop:17,overflow:'hidden'}}><View style={{height:6,backgroundColor:C.accent,width:`${Math.min(100,done/Math.max(1,planned)*100)}%`}}/></View></Panel>
    {restUntil>clock?<Panel><Row style={{justifyContent:'space-between'}}><View><Label>Rest timer</Label><Muted>Suggested rest is counting down.</Muted></View><Text style={{color:C.accent,fontSize:23,fontWeight:'900'}}>{Math.floor(Math.max(0,restUntil-clock)/60000)}:{String(Math.floor(Math.max(0,restUntil-clock)/1000)%60).padStart(2,'0')}</Text></Row><TouchableOpacity onPress={()=>setRestUntil(0)} style={{marginTop:8}}><Text style={{color:C.accent,fontWeight:'700',fontSize:12}}>SKIP TIMER</Text></TouchableOpacity></Panel>:null}
    {activeSession.exercises.map((move,idx)=>{const ex=byId[move.exerciseId];if(!ex)return null;const prev=latestFor(ex.id);const target=nextTargets(prev,move.repMin,move.repMax,db.profile.unit,ex.muscle);
      return <Panel key={`${ex.id}-${idx}`}><Row style={{justifyContent:'space-between'}}><View style={{flex:1}}><Text style={[S.eyebrow,{marginBottom:7}]}>{String(idx+1).padStart(2,'0')} · {ex.muscle.toUpperCase()}</Text><H2>{ex.name}</H2><Muted>{move.sets} sets · {move.repMin}–{move.repMax} {isTimed(ex.id)?'seconds':'reps'} · {move.rest}s rest</Muted></View><Text style={{color:C.accent,fontSize:23}}>↗</Text></Row>
        {target?<View style={{backgroundColor:C.accentDark,padding:10,borderRadius:10,marginTop:12}}><Text style={{fontSize:12,fontWeight:'700',color:C.accent}}>NEXT TARGET · {fmt(target.weight)} {db.profile.unit} × {target.reps}</Text><Muted style={{fontSize:11,marginTop:3}}>{target.text}</Muted></View>:null}
        <Row style={{marginTop:15,marginBottom:5}}><Text style={styles.setHead}>SET</Text><Text style={[styles.setHead,{flex:1}]}>WEIGHT ({db.profile.unit})</Text><Text style={[styles.setHead,{flex:1}]}>{isTimed(ex.id)?'SECONDS':'REPS'}</Text><Text style={[styles.setHead,{width:48}]}>RIR</Text><Text style={[styles.setHead,{width:40,textAlign:'center'}]}>✓</Text></Row>
        {Array.from({length:move.sets},(_,i)=>{
          const setNo=i+1;const key=`${ex.id}:${setNo}`;const logged=db.active?.sets.find(s=>s.exerciseId===ex.id&&s.setNumber===setNo);
          const setValue=(field:'weight'|'reps'|'rir',value:string)=>setDrafts(o=>({...o,[key]:{weight:o[key]?.weight??String(target?.weight??prev?.weight??0),reps:o[key]?.reps??String(target?.reps??move.repMin),rir:o[key]?.rir??'2',[field]:value}}));
          return <Row key={i} style={{marginBottom:7,gap:7,opacity:logged?0.68:1}}><Text style={{color:C.text,width:27,fontWeight:'800'}}>{setNo}</Text>
            <TextInput style={[styles.setInput,{flex:1}]} editable={!logged} keyboardType="decimal-pad" selectTextOnFocus value={logged?String(logged.weight):(drafts[key]?.weight??String(target?.weight??prev?.weight??0))} onChangeText={(t:string)=>setValue('weight',t)} accessibilityLabel={`${ex.name} set ${setNo} weight`}/>
            <TextInput style={[styles.setInput,{flex:1}]} editable={!logged} keyboardType="number-pad" selectTextOnFocus value={logged?String(logged.reps):(drafts[key]?.reps??String(target?.reps??move.repMin))} onChangeText={(t:string)=>setValue('reps',t)} accessibilityLabel={`${ex.name} set ${setNo} reps`}/>
            <TextInput style={[styles.setInput,{width:48}]} editable={!logged} keyboardType="number-pad" selectTextOnFocus value={logged?String(logged.rir):(drafts[key]?.rir??'2')} onChangeText={(t:string)=>setValue('rir',t)} accessibilityLabel={`${ex.name} set ${setNo} reps in reserve`}/>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={logged?'Undo logged set':'Log set'} onPress={()=>toggleLogged(ex.id,setNo,move)} style={[styles.setCheck,logged&&{backgroundColor:C.accent}]}><Text style={{color:logged?C.bg:C.accent,fontWeight:'900',fontSize:16}}>{logged?'✓':'+'}</Text></TouchableOpacity>
          </Row>;
        })}
        <TouchableOpacity onPress={()=>Alert.alert(ex.name,ex.instructions)}><Text style={{color:C.muted,fontWeight:'700',fontSize:12,marginTop:7}}>FORM & TECHNIQUE  ↗</Text></TouchableOpacity>
      </Panel>})}
    <Btn title="FINISH & SAVE WORKOUT" onPress={finishWorkout}/><View style={{marginTop:12}}><Btn title="DISCARD WORKOUT" secondary onPress={discardWorkout}/></View>
  </>;
 };
 const SettingsScreen=()=>{
   return <><Header title="Your settings" subtitle="Personalize how you train and track."/>
   <Panel><Text style={S.eyebrow}>PROFILE</Text><Text style={{color:C.text,fontWeight:'800',marginVertical:10}}>Your name</Text><TextInput style={S.input} placeholder="Optional" placeholderTextColor={C.dim} value={db.profile.name} onChangeText={(name:string)=>put(o=>({...o,profile:{...o.profile,name}}))}/><Rule/><Label>Weight unit</Label><Selector choices={[{value:'kg',label:'Kilograms (kg)'},{value:'lb',label:'Pounds (lb)'}]} value={db.profile.unit} onChange={x=>{const target=x as Unit;if(target===db.profile.unit)return;const factor=target==='lb'?2.2046226218:1/2.2046226218;const cv=(w:number)=>Math.round(w*factor*100)/100;put(o=>({...o,profile:{...o.profile,unit:target},plan:o.plan?{...o.plan,profile:{...o.plan.profile,unit:target}}:null,history:o.history.map(h=>({...h,sets:h.sets.map(s=>({...s,weight:cv(s.weight)}))})),active:o.active?{...o.active,sets:o.active.sets.map(s=>({...s,weight:cv(s.weight)}))}:null}));}}/><Muted style={{fontSize:11}}>Changing units converts previously logged weights and updates the saved training plan.</Muted></Panel>
   <Panel><Text style={S.eyebrow}>DATA & PRIVACY</Text><BlockTitle title="Your training data"/><Muted style={{marginBottom:15}}>Your training history is stored locally on this device. There is no account or cloud sync in this version.</Muted><Btn title="SHARE HISTORY AS CSV TEXT" secondary onPress={exportCSV}/></Panel>
   <Panel><Label>Training plan</Label><Muted style={{marginTop:7,marginBottom:14}}>You can regenerate your schedule without erasing previous workout history.</Muted><Btn title="EDIT TRAINING PREFERENCES" secondary onPress={()=>goto('generator')}/></Panel>
   <Panel><Label>About SetMetric</Label><Muted style={{marginTop:8}}>Version 1.4 · Cross-platform Expo app · Offline-first.</Muted><Muted style={{fontSize:11,marginTop:8}}>SetMetric provides general fitness planning, not clinical assessment. Stop painful exercises and seek professional advice for injuries or health concerns.</Muted></Panel>
   </>;
 };
 const nav:[Tab,string,string][]=[['home','Today','⌂'],['plan','My week','▤'],['insights','Progress','▥']];
 if(!loaded)return <View style={[S.screen,{justifyContent:'center',alignItems:'center'}]}><ActivityIndicator color={C.accent} size="large"/><Text style={{color:C.accent,fontWeight:'900',fontSize:25,marginTop:18}}>SetMetric</Text></View>;
 return <SafeAreaView edges={['top','bottom']} style={S.screen}><StatusBar barStyle="light-content" backgroundColor={C.bg}/>
   <ScrollView key={tab+(selectedDay||'')} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>
     {tab==='home'&&!plan?GeneratorScreen():tab==='home'?RootHome():tab==='plan'?PlanScreen():tab==='generator'?GeneratorScreen():tab==='day'?DayScreen():tab==='workout'?WorkoutScreen():tab==='library'?LibraryScreen():tab==='insights'?InsightsScreen():SettingsScreen()}
   </ScrollView>
   <View style={styles.bottom}>{nav.map(([k,l,ico])=><TouchableOpacity accessibilityRole="tab" accessibilityState={{selected:tab===k}} key={k} onPress={()=>goto(k)} style={styles.navItem}><Text style={{fontSize:24,color:tab===k?C.accent:C.dim,fontWeight:'700'}}>{ico}</Text><Text style={{fontWeight:'800',fontSize:10,color:tab===k?C.accent:C.muted,marginTop:2}}>{l}</Text></TouchableOpacity>)}</View>
   <Modal visible={customOpen} transparent animationType="slide" onRequestClose={()=>setCustomOpen(false)}><KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS==='ios'?'padding':undefined}><View style={styles.modal}>
     <Row style={{justifyContent:'space-between'}}><H2>Add custom exercise</H2><TouchableOpacity onPress={()=>setCustomOpen(false)}><Text style={{fontSize:23,color:C.muted}}>×</Text></TouchableOpacity></Row>
     <Label>Exercise name</Label><TextInput style={[S.input,{marginTop:7,marginBottom:16}]} value={customName} onChangeText={setCustomName} placeholder="e.g. Incline machine press" placeholderTextColor={C.dim}/>
     <Label>Primary muscle</Label><ScrollView horizontal style={{marginTop:8,flexGrow:0}}>{MUSCLES.map(m=><Chip title={m} key={m} selected={m===customMuscle} onPress={()=>setCustomMuscle(m)}/>)}</ScrollView>
     <Label>Equipment</Label><ScrollView horizontal style={{marginTop:8,flexGrow:0}}>{(['dumbbell','barbell','cable','machine','bodyweight','bands'] as Gear[]).map(g=><Chip key={g} title={g} selected={g===customGear} onPress={()=>setCustomGear(g)}/>)}</ScrollView>
     <Label>Technique notes (optional)</Label><TextInput multiline style={[S.input,{marginTop:7,marginBottom:17,minHeight:68}]} value={customCue} onChangeText={setCustomCue} placeholder="Setup and execution cues" placeholderTextColor={C.dim}/>
     <Btn title="SAVE EXERCISE" onPress={customSave}/>
   </View></KeyboardAvoidingView></Modal>
 </SafeAreaView>;
}
const tinyBtn={color:C.accent,fontSize:11,fontWeight:'700' as const,backgroundColor:C.cardAlt,borderRadius:8,paddingHorizontal:10,paddingVertical:7};
const styles=StyleSheet.create({
  bottom:{height:69,backgroundColor:'#0E171E',borderTopWidth:1,borderTopColor:C.line,flexDirection:'row',paddingBottom:4},
  navItem:{flex:1,justifyContent:'center',alignItems:'center'},
  tool:{backgroundColor:C.card,borderRadius:18,borderWidth:1,borderColor:C.line,padding:17,minHeight:131,justifyContent:'space-between'},
  weekItem:{backgroundColor:C.card,borderRadius:16,borderWidth:1,borderColor:C.line,padding:12,marginBottom:9,flexDirection:'row',alignItems:'center'},
  libraryItem:{backgroundColor:C.card,borderRadius:15,padding:12,marginBottom:8,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:C.line},
  counter:{backgroundColor:C.cardAlt,borderRadius:12,borderWidth:1,borderColor:C.line,width:55,height:50,alignItems:'center',justifyContent:'center'},
  counterText:{color:C.accent,fontSize:27,fontWeight:'600'},
  toggle:{width:49,height:29,backgroundColor:C.line,borderRadius:20,padding:4,justifyContent:'center',alignItems:'flex-start'},
  toggleDot:{width:21,height:21,borderRadius:12,backgroundColor:C.text},
  setHead:{color:C.muted,fontSize:9,fontWeight:'900',width:27},
  setInput:{height:40,backgroundColor:C.cardAlt,borderColor:C.line,borderWidth:1,borderRadius:8,color:C.text,fontSize:13,textAlign:'center',paddingHorizontal:3},
  setCheck:{backgroundColor:C.accentDark,width:40,height:40,borderRadius:9,alignItems:'center',justifyContent:'center'},
  modalOverlay:{flex:1,backgroundColor:'#000A',justifyContent:'flex-end'},
  modal:{backgroundColor:C.bg,borderTopLeftRadius:25,borderTopRightRadius:25,padding:23,maxHeight:'88%',gap:8},
});
export default function App(){return <SafeAreaProvider><AppInner/></SafeAreaProvider>}
