import React,{useState} from 'react';
<<<<<<< HEAD
import {Alert,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {Muscle,MUSCLES,Profile} from './types';
import {AssessmentAnswers,DEFAULT_ASSESSMENT,assessmentToProfile,coachingNotes,focusIsAll,recommendDays,safeFocus} from './science';

const C={background:'#0B1216',surface:'#142127',stroke:'#2C4045',accent:'#8EEDD0',white:'#F6FBFA',sub:'#A1B3B7',soft:'#19382F'};
const OBJECTIVES:[string,string,string][]=[
 ['hypertrophy','Build muscle','Get stronger and add size'],
 ['fat_loss','Lose body fat','Get fitter while preserving muscle'],
 ['recomposition','Recomposition','Build muscle + reduce fat'],
 ['strength','Build strength','Improve lifting performance'],
 ['fitness','Improve fitness','Build stamina and resilience'],
 ['sport','Sport performance','Support your chosen sport'],
];
const MUSCLE_LABEL:Record<Muscle,string>={Chest:'Chest',Back:'Back',Shoulders:'Shoulders',Quads:'Front legs',Hamstrings:'Back legs',Glutes:'Glutes',Biceps:'Biceps',Triceps:'Triceps',Core:'Abs / core',Forearms:'Forearms'};
const SCREEN_TITLES=['What is your goal?','Where are you starting?','What fits your week?','Which muscles matter most?'];
const SCREEN_NOTES=['Choose the result you care about most.','A quick estimate is enough. No max-effort tests.','A few taps now. Adjust anytime.','Every plan covers the whole body. Choose what deserves extra attention.'];
function Tile({title,subtitle,selected,onPress,compact=false}:{title:string;subtitle?:string;selected:boolean;onPress:()=>void;compact?:boolean}){
 return <TouchableOpacity activeOpacity={0.85} accessibilityRole="button" accessibilityState={{selected}} onPress={onPress} style={[styles.tile,compact&&styles.compact,selected&&styles.activeTile]}>
   <View style={{flex:1}}><Text style={[styles.tileLabel,selected&&{color:C.accent}]}>{title}</Text>{subtitle?<Text style={styles.tileSubtitle}>{subtitle}</Text>:null}</View>
   <View style={[styles.dot,selected&&styles.dotActive]}>{selected?<Text style={{color:C.background,fontSize:11,fontWeight:'900'}}>✓</Text>:null}</View>
 </TouchableOpacity>;
}
function SmallPick({title,selected,onPress}:{title:string;selected:boolean;onPress:()=>void}){return <TouchableOpacity accessibilityRole="button" accessibilityState={{selected}} onPress={onPress} style={[styles.smallPick,selected&&styles.smallPickOn]}><Text style={[styles.smallPickText,selected&&{color:C.background}]}>{title}</Text></TouchableOpacity>}
function Field({label,value,onChange,placeholder='',numeric=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;numeric?:boolean}){
 return <View style={{marginTop:14}}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#728B91" value={value} onChangeText={onChange} keyboardType={numeric?'decimal-pad':'default'} /></View>;
}
export function AssessmentFlow({base,initial,onGenerate}:{base:Profile;initial?:Partial<AssessmentAnswers>;onGenerate:(profile:Profile,answers:AssessmentAnswers)=>void}){
 const [a,setA]=useState<AssessmentAnswers>(()=>({...DEFAULT_ASSESSMENT,...initial,focus:initial?.focus?safeFocus(initial.focus):[...MUSCLES]}));
 const [step,setStep]=useState(0);
 const [extra,setExtra]=useState(false);
 const [measurements,setMeasurements]=useState(false);
 const [sporting,setSporting]=useState(!!initial?.sport);
 const edit=<K extends keyof AssessmentAnswers>(key:K,val:AssessmentAnswers[K])=>setA(prev=>({...prev,[key]:val}));
 const selectMuscle=(m:Muscle)=>setA(prev=>{const current=safeFocus(prev.focus);const next=current.includes(m)?current.filter(x=>x!==m):MUSCLES.filter(x=>current.includes(x)||x===m);return {...prev,focus:next};});
 const check=():string|null=>{
   if(step===0&&!a.goal)return 'Choose a goal to continue.';
   if(step===1&&(!/^\d{1,3}$/.test(a.age)||Number(a.age)<13||Number(a.age)>100))return 'Enter an age from 13 to 100.';
   if(step===3&&a.focus.length===0)return 'Choose at least one muscle group or select all.';
   for(const key of ['height','weight','waist','chest','hips'] as const)if(a[key]&&(!Number.isFinite(Number(a[key]))||Number(a[key])<=0))return 'Measurements must be positive numbers.';
   return null;
 };
 const advance=()=>{
   const error=check();if(error){Alert.alert('One thing to check',error);return;}
   if(step<3){setStep(step+1);return;}
   const finish=()=>onGenerate(assessmentToProfile(a,base),a);
   const caution=coachingNotes(a).filter(s=>/Under 18|limitations were reported/.test(s));
   if(caution.length)Alert.alert('Training guidance',caution.join('\n\n'),[{text:'Review my plan',onPress:finish},{text:'Go back',style:'cancel'}]);
   else finish();
 };
 return <View style={{paddingBottom:38}}>
  <Text style={styles.brand}>SETMETRIC <Text style={{color:C.sub}}> / START HERE</Text></Text>
  <View style={styles.progressRow}>{[0,1,2,3].map(n=><View key={n} style={[styles.progress,n<=step&&styles.progressOn]}/>)}</View>
  <Text style={styles.step}>STEP {step+1} / 4</Text>
  <Text style={styles.heading}>{SCREEN_TITLES[step]}</Text>
  <Text style={styles.explain}>{SCREEN_NOTES[step]}</Text>
  {step===0?<View style={{marginTop:24,gap:10}}>{OBJECTIVES.map(([value,title,note])=><Tile key={value} title={title} subtitle={note} selected={a.goal===value} onPress={()=>edit('goal',value)}/>)}</View>:null}
  {step===1?<View style={{marginTop:22}}>
   <Text style={styles.section}>Your current strength</Text>
   <View style={styles.row}>{([['new','Just starting'],['some','Some training'],['strong','Experienced']] as const).map(([v,l])=><SmallPick key={v} title={l} selected={a.strength===v} onPress={()=>edit('strength',v)}/>)}</View>
   <Text style={[styles.section,{marginTop:24}]}>Your current stamina</Text>
   <View style={styles.row}>{([['low','Low'],['moderate','Average'],['high','High']] as const).map(([v,l])=><SmallPick key={v} title={l} selected={a.stamina===v} onPress={()=>edit('stamina',v)}/>)}</View>
   <Text style={[styles.section,{marginTop:24}]}>Training history</Text>
   <View style={styles.row}>{([['new','New'],['returning','Returning'],['consistent','Regular']] as const).map(([v,l])=><SmallPick key={v} title={l} selected={a.experience===v} onPress={()=>edit('experience',v)}/>)}</View>
   <Field label="Age" numeric value={a.age} placeholder="e.g. 30" onChange={v=>edit('age',v.replace(/[^\d]/g,'').slice(0,3))}/>
   <Text style={[styles.label,{marginTop:18}]}>Gender <Text style={{color:C.sub,fontWeight:'400'}}>(optional)</Text></Text>
   <View style={styles.row}>{['Woman','Man','Another identity','Prefer not to say'].map(v=><SmallPick key={v} title={v} selected={a.gender===v} onPress={()=>edit('gender',v)}/>)}</View>
  </View>:null}
  {step===2?<View style={{marginTop:22}}>
   <Text style={styles.section}>Where will you train?</Text>
   <View style={styles.row}>{([['full_gym','Gym'],['dumbbells','Dumbbells'],['home','Home']] as const).map(([v,l])=><SmallPick key={v} title={l} selected={a.equipment===v} onPress={()=>edit('equipment',v)}/>)}</View>
   <Text style={[styles.section,{marginTop:24}]}>Time per workout</Text>
   <View style={styles.row}>{(['30','45','60','75'] as const).map(v=><SmallPick key={v} title={v+' min'} selected={a.minutes===v} onPress={()=>edit('minutes',v)}/>)}</View>
   <Text style={[styles.section,{marginTop:24}]}>Days available</Text>
   <View style={styles.row}>{(['auto','2','3','4','5','6'] as const).map(v=><SmallPick key={v} title={v==='auto'?'You decide':v} selected={a.days===v} onPress={()=>edit('days',v)}/>)}</View>
   <Text style={styles.helper}>Recommended: {recommendDays(a)} training days each week, based on your current ability.</Text>
   <Text style={[styles.section,{marginTop:24}]}>Do you play a sport already?</Text>
   <View style={styles.row}><SmallPick title="No" selected={!sporting} onPress={()=>{setSporting(false);edit('sport','');}}/><SmallPick title="Yes" selected={sporting} onPress={()=>setSporting(true)}/></View>
   {sporting?<Field label="Your current sport" value={a.sport} placeholder="e.g. football, running, cricket" onChange={v=>edit('sport',v)}/>:null}
   <TouchableOpacity style={styles.more} onPress={()=>setExtra(!extra)}><Text style={styles.moreText}>{extra?'−':'+'} Future sport, injuries or restrictions (optional)</Text></TouchableOpacity>
   {extra?<View><Field label="Sport you'd like to pursue" value={a.futureSport} placeholder="e.g. powerlifting" onChange={v=>edit('futureSport',v)}/><Field label="Physical limitations or health concerns" value={a.limitations} placeholder="Optional; e.g. knee pain" onChange={v=>edit('limitations',v)}/></View>:null}
  </View>:null}
  {step===3?<View style={{marginTop:23}}>
   <Tile title="All body parts" subtitle="Balanced full-body development (recommended)" selected={focusIsAll(a.focus)} onPress={()=>edit('focus',[...MUSCLES])}/>
   <Text style={[styles.section,{marginTop:21,marginBottom:12}]}>Or customize your focus — select as many as you want</Text>
   <View style={styles.grid}>{MUSCLES.map(m=><TouchableOpacity key={m} accessibilityRole="button" accessibilityState={{selected:a.focus.includes(m)}} style={[styles.muscle,a.focus.includes(m)&&styles.muscleOn]} onPress={()=>selectMuscle(m)}><Text style={[styles.muscleText,a.focus.includes(m)&&{color:C.accent}]}>{a.focus.includes(m)?'✓  ':''}{MUSCLE_LABEL[m]}</Text></TouchableOpacity>)}</View>
   <Text style={styles.helper}>{a.focus.length} of {MUSCLES.length} groups selected. Other muscle groups are still trained for balance.</Text>
   <TouchableOpacity style={styles.more} onPress={()=>setMeasurements(!measurements)}><Text style={styles.moreText}>{measurements?'−':'+'} Body weight & measurements (optional)</Text></TouchableOpacity>
   {measurements?<View><Field label="Body weight (kg)" value={a.weight} onChange={v=>edit('weight',v)} numeric/><Field label="Height (cm)" value={a.height} onChange={v=>edit('height',v)} numeric/><Field label="Waist (cm)" value={a.waist} onChange={v=>edit('waist',v)} numeric/><Field label="Chest (cm)" value={a.chest} onChange={v=>edit('chest',v)} numeric/><Field label="Hips (cm)" value={a.hips} onChange={v=>edit('hips',v)} numeric/></View>:null}
   <View style={styles.summary}><Text style={styles.summaryTop}>YOUR STARTING SCHEDULE</Text><Text style={styles.summaryNumber}>{recommendDays(a)} <Text style={{fontSize:19}}>days per week</Text></Text><Text style={styles.summaryText}>{a.minutes} min sessions · {a.focus.length===10?'All body parts':a.focus.length+' focus groups'} · Balanced recovery</Text></View>
  </View>:null}
  <TouchableOpacity accessibilityRole="button" activeOpacity={0.84} style={styles.primary} onPress={advance}><Text style={styles.primaryText}>{step===3?'Generate my schedule  →':'Continue  →'}</Text></TouchableOpacity>
  {step>0?<TouchableOpacity accessibilityRole="button" style={styles.back} onPress={()=>setStep(step-1)}><Text style={{color:C.sub,fontWeight:'600'}}>← Back</Text></TouchableOpacity>:null}
 </View>;
}
const styles=StyleSheet.create({
 brand:{fontSize:12,letterSpacing:2.4,fontWeight:'900',color:C.accent,marginTop:7,marginBottom:22},
 progressRow:{flexDirection:'row',gap:7},progress:{height:5,flex:1,backgroundColor:'#25353A',borderRadius:6},progressOn:{backgroundColor:C.accent},
 step:{color:C.accent,fontWeight:'900',letterSpacing:1.6,fontSize:11,marginTop:24},heading:{fontSize:32,lineHeight:39,letterSpacing:-1,color:C.white,fontWeight:'900',marginTop:9},
 explain:{fontSize:14,lineHeight:21,color:C.sub,marginTop:7},
 tile:{borderWidth:1,borderColor:C.stroke,backgroundColor:C.surface,borderRadius:17,paddingVertical:15,paddingHorizontal:17,flexDirection:'row',alignItems:'center',gap:12,minHeight:71},
 compact:{minHeight:54},activeTile:{borderColor:C.accent,backgroundColor:'#16352F'},tileLabel:{fontSize:16,fontWeight:'800',color:C.white},tileSubtitle:{fontSize:12,color:C.sub,marginTop:4,lineHeight:17},dot:{width:21,height:21,borderRadius:12,borderWidth:1,borderColor:'#577176',alignItems:'center',justifyContent:'center'},dotActive:{backgroundColor:C.accent,borderColor:C.accent},
 section:{fontSize:15,color:C.white,fontWeight:'800',marginBottom:11},row:{flexDirection:'row',flexWrap:'wrap',gap:8},
 smallPick:{borderRadius:11,borderWidth:1,borderColor:C.stroke,backgroundColor:C.surface,paddingHorizontal:14,paddingVertical:12,minHeight:43,justifyContent:'center'},
 smallPickOn:{backgroundColor:C.accent,borderColor:C.accent},smallPickText:{fontSize:13,fontWeight:'800',color:C.sub},
 label:{fontSize:13,color:C.white,fontWeight:'800',marginBottom:8},input:{backgroundColor:C.surface,borderWidth:1,borderColor:C.stroke,paddingHorizontal:15,paddingVertical:13,color:C.white,borderRadius:12,fontSize:15},
 more:{paddingVertical:15,marginTop:12},moreText:{color:C.accent,fontSize:13,fontWeight:'800'},helper:{color:C.sub,fontSize:12,lineHeight:18,marginTop:12},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:8},muscle:{width:'48%',backgroundColor:C.surface,borderColor:C.stroke,borderWidth:1,borderRadius:12,padding:12},muscleOn:{backgroundColor:C.soft,borderColor:'#589C89'},muscleText:{fontSize:13,color:C.sub,fontWeight:'800'},
 summary:{backgroundColor:'#17372F',padding:17,borderRadius:17,marginTop:22,borderWidth:1,borderColor:'#366C5C'},
 summaryTop:{fontSize:10,color:C.accent,letterSpacing:1.7,fontWeight:'900'},summaryNumber:{fontSize:31,color:C.white,fontWeight:'900',marginTop:6},summaryText:{fontSize:12,color:C.sub,marginTop:5},
 primary:{backgroundColor:C.accent,borderRadius:15,paddingVertical:18,alignItems:'center',justifyContent:'center',marginTop:27},primaryText:{color:C.background,fontSize:16,fontWeight:'900'},back:{alignItems:'center',padding:15}
});
=======
import {View,Text,TouchableOpacity,TextInput,StyleSheet,Alert} from 'react-native';
import {Profile,Goal,Level,Setup,Muscle,MUSCLES} from './types';
type Answers={goal:string;stamina:string;strength:string;age:string;gender:string;sport:string;futureSport:string;weight:string;height:string;waist:string;hips:string;chest:string;fatLoss:string;limitations:string;days:string;minutes:string;equipment:string;experience:string;focus:Muscle[]};
const START:Answers={goal:'',stamina:'',strength:'',age:'',gender:'',sport:'None',futureSport:'None',weight:'',height:'',waist:'',hips:'',chest:'',fatLoss:'',limitations:'None',days:'',minutes:'45',equipment:'full_gym',experience:'',focus:[...MUSCLES]};
const INK='#F5F7F7',MUTED='#98A5A9',ACCENT='#9CE4CE',BACKGROUND='#10171B';
const OPTIONS:Record<string,string[]>={goal:['Build muscle','Lose body fat','Gain strength','Fitness & stamina','Sport performance','Build muscle + lose fat'],stamina:['Low — tire quickly','Moderate — active sometimes','High — train regularly'],strength:['New to resistance training','Some lifting experience','Strong and experienced'],gender:['Woman','Man','Non-binary','Prefer not to say'],experience:['New','Returning','Consistent 6+ months'],fatLoss:['Not a priority','Lose some fat','Fat loss is my main goal'],equipment:['full_gym','dumbbells','home']};
const STEPS=[{title:'What is your main goal?',caption:'Start with what matters most.',fields:['goal']},{title:'How fit are you today?',caption:'No performance tests required.',fields:['stamina','strength','experience']},{title:'Tell us about yourself',caption:'We adapt the starting workload to you.',fields:['age','gender']},{title:'Sports & activities',caption:'Your gym schedule should fit your sport.',fields:['sport','futureSport']},{title:'Your body measurements',caption:'Optional measurements help track change.',fields:['weight','height','waist','hips','chest','fatLoss']},{title:'Your availability',caption:'We will recommend an achievable week.',fields:['days','minutes','equipment','limitations']}];
const LABEL:Record<string,string>={goal:'Goal',stamina:'Current stamina',strength:'Current strength',experience:'Training history',age:'Age in years',gender:'Gender (optional)',sport:'Current sport',futureSport:'Sport you want to pursue',weight:'Weight (kg)',height:'Height (cm)',waist:'Waist (cm)',hips:'Hips (cm)',chest:'Chest (cm)',fatLoss:'Fat-loss priority',days:'Maximum gym days per week (optional)',minutes:'Minutes available per session',equipment:'Available equipment',limitations:'Injuries, pregnancy, health or movement restrictions'};
const PLACEHOLDER:Record<string,string>={sport:'e.g. cricket, football, running or None',futureSport:'e.g. powerlifting, bodybuilding or None',limitations:'None, or describe restrictions'};
function recommend(a:Answers):number {const age=Number(a.age);const active=a.sport.trim().toLowerCase()!=='none'&&!!a.sport.trim();let days=a.strength==='New to resistance training'?2:a.stamina.startsWith('Low')?2:a.experience==='Consistent 6+ months'&&a.stamina.startsWith('High')?5:3;if(active)days=Math.min(days,3);if(age>=65)days=Math.min(days,3);if(a.limitations.trim().toLowerCase()!=='none'&&a.limitations.trim())days=Math.min(days,2);if(a.days.trim())days=Math.min(days,Math.max(2,Math.min(6,Number(a.days)||2)));return Math.max(2,days);}
function profileFrom(a:Answers,base:Profile):Profile {const g:Goal=a.goal==='Gain strength'?'strength':a.goal==='Lose body fat'||a.goal==='Build muscle + lose fat'||a.fatLoss==='Fat loss is my main goal'?'recomposition':'hypertrophy';const level:Level=a.strength==='New to resistance training'||a.experience==='New'?'beginner':a.experience==='Consistent 6+ months'&&a.strength==='Strong and experienced'?'advanced':'intermediate';return {...base,goal:g,level,daysPerWeek:recommend(a),minutes:Number(a.minutes)||45,split:'auto',setup:a.equipment as Setup,sessionsPerDay:1,volume:'balanced',armwrestling:/armwrestl/i.test(a.sport+' '+a.futureSport),priorities:a.focus.length===MUSCLES.length?[]:[...a.focus]};}
export function AssessmentFlow({base,onGenerate}: {base:Profile;onGenerate:(profile:Profile,answers:Answers)=>void}) {
 const[step,setStep]=useState(0);const[a,setA]=useState<Answers>(()=>({...START,focus:base.priorities.length?[...base.priorities]:[...MUSCLES]}));const s=STEPS[step];
 const update=(field:string,value:string)=>setA(o=>({...o,[field]:value}));
 const toggleFocus=(muscle:Muscle)=>setA(old=>({...old,focus:old.focus.includes(muscle)?old.focus.filter(m=>m!==muscle):MUSCLES.filter(m=>old.focus.includes(m)||m===muscle)}));
 const isValid=()=>{if(step===0&&!a.goal)return 'Choose your main goal.';if(step===1&&(!a.stamina||!a.strength||!a.experience))return 'Choose stamina, strength and experience.';if(step===2&&(!/^[0-9]+$/.test(a.age)||Number(a.age)<13||Number(a.age)>100))return 'Enter an age between 13 and 100.';if(step===5&&a.focus.length===0)return 'Select at least one muscle group or choose All body parts.';if(step===5&&a.days&&(!Number.isInteger(Number(a.days))||Number(a.days)<2||Number(a.days)>6))return 'Available gym days must be 2–6.';if(step===5&&(!Number(a.minutes)||Number(a.minutes)<20||Number(a.minutes)>120))return 'Enter 20–120 minutes per session.';for(const key of ['weight','height','waist','hips','chest'])if(a[key as keyof Answers]&&(!Number.isFinite(Number(a[key as keyof Answers]))||Number(a[key as keyof Answers])<=0))return 'Measurements must be positive numbers.';return ''};
 const go=()=>{const problem=isValid();if(problem)return Alert.alert('One detail needed',problem);if(step<STEPS.length-1)setStep(step+1);else{if(Number(a.age)<18)Alert.alert('Youth training','This plan should be reviewed with a parent, guardian and qualified youth coach before starting.',[{text:'Continue',onPress:()=>onGenerate(profileFrom(a,base),a)}]);else if(a.limitations.trim()&&a.limitations.trim().toLowerCase()!=='none')Alert.alert('Check with a professional','Medical conditions, pregnancy and injuries may need an individually reviewed exercise plan.',[{text:'Continue',onPress:()=>onGenerate(profileFrom(a,base),a)}]);else onGenerate(profileFrom(a,base),a);}};
 return <View style={{paddingBottom:30}}>
   <Text style={styles.brand}>SETMETRIC  /  YOUR PLAN</Text>
   <View style={styles.progress}><View style={[styles.progressFill,{width:`${100*(step+1)/STEPS.length}%` as `${number}%`}]}/></View>
   <Text style={styles.step}>STEP {step+1} OF {STEPS.length}</Text>
   <Text style={styles.heading}>{s.title}</Text><Text style={styles.caption}>{s.caption}</Text>
   {s.fields.map(field=><View key={field} style={styles.field}><Text style={styles.label}>{LABEL[field]}</Text>
    {OPTIONS[field]?<View style={styles.options}>{OPTIONS[field].map(value=><TouchableOpacity accessibilityRole="button" key={value} style={[styles.option,a[field as keyof Answers]===value&&styles.chosen]} onPress={()=>update(field,value)}><Text style={[styles.optionText,a[field as keyof Answers]===value&&styles.chosenText]}>{field==='equipment'?value==='full_gym'?'Gym':value==='home'?'Home / bands':'Dumbbells':value}</Text></TouchableOpacity>)}</View>:
    <TextInput style={styles.input} placeholder={PLACEHOLDER[field]||'Optional'} placeholderTextColor="#76878A" value={String(a[field as keyof Answers])} onChangeText={v=>update(field,v)} keyboardType={['age','weight','height','waist','hips','chest','days','minutes'].includes(field)?'numeric':'default'}/>}
   </View>)}
   {step===5?<View style={styles.field}><Text style={styles.label}>Muscles to focus on</Text><Text style={styles.caption}>Choose any number of muscles, or select them all. No three-muscle limit.</Text><TouchableOpacity accessibilityRole="button" style={[styles.option,{marginTop:14},a.focus.length===MUSCLES.length&&styles.chosen]} onPress={()=>setA(old=>({...old,focus:[...MUSCLES]}))}><Text style={[styles.optionText,a.focus.length===MUSCLES.length&&styles.chosenText]}>✓  All body parts</Text></TouchableOpacity><View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:12}}>{MUSCLES.map(m=><TouchableOpacity key={m} accessibilityRole="button" accessibilityState={{selected:a.focus.includes(m)}} onPress={()=>toggleFocus(m)} style={[styles.option,{paddingVertical:12,paddingHorizontal:13},a.focus.includes(m)&&styles.chosen]}><Text style={[styles.optionText,a.focus.includes(m)&&styles.chosenText]}>{a.focus.includes(m)?'✓  ':''}{m}</Text></TouchableOpacity>)}</View><Text style={[styles.caption,{marginTop:10}]}>{a.focus.length} of {MUSCLES.length} muscle groups selected</Text></View>:null}
   {step===STEPS.length-1?<View style={styles.recommend}><Text style={styles.recTop}>YOUR RECOMMENDED START</Text><Text style={styles.recValue}>{recommend(a)} strength-training days / week</Text><Text style={styles.recNote}>Your sport and recovery days are considered. Most adults should cover all major muscle groups at least twice each week. Days can be adjusted as you progress.</Text></View>:null}
   <TouchableOpacity style={styles.next} onPress={go}><Text style={styles.nextText}>{step===STEPS.length-1?'Generate my weekly schedule  →':'Continue  →'}</Text></TouchableOpacity>
   {step>0?<TouchableOpacity onPress={()=>setStep(step-1)} style={{padding:18,alignItems:'center'}}><Text style={{color:MUTED}}>← Previous question</Text></TouchableOpacity>:null}
 </View>;
}
const styles=StyleSheet.create({brand:{fontSize:11,letterSpacing:3,color:ACCENT,fontWeight:'800',marginBottom:18},progress:{backgroundColor:'#28353A',height:5,borderRadius:5,overflow:'hidden'},progressFill:{height:5,backgroundColor:ACCENT},step:{color:ACCENT,fontSize:11,letterSpacing:1,marginTop:20,fontWeight:'700'},heading:{color:INK,fontWeight:'800',fontSize:32,letterSpacing:-1,marginTop:12,lineHeight:37},caption:{color:MUTED,marginTop:7,fontSize:14,lineHeight:22},field:{marginTop:25},label:{color:INK,fontWeight:'700',fontSize:14,marginBottom:11},options:{gap:9},option:{borderWidth:1,borderColor:'#354448',backgroundColor:'#1B262A',borderRadius:14,paddingVertical:14,paddingHorizontal:15},chosen:{backgroundColor:'#204139',borderColor:ACCENT},optionText:{color:'#CBD5D7',fontSize:14,fontWeight:'600'},chosenText:{color:ACCENT},input:{borderWidth:1,borderColor:'#354448',backgroundColor:'#1B262A',color:INK,padding:15,borderRadius:13,fontSize:16},recommend:{marginTop:23,padding:18,backgroundColor:'#1B3532',borderRadius:16},recTop:{color:ACCENT,fontSize:10,fontWeight:'800',letterSpacing:1.6},recValue:{color:INK,fontSize:22,fontWeight:'800',marginTop:8},recNote:{color:MUTED,fontSize:12,lineHeight:18,marginTop:8},next:{backgroundColor:ACCENT,marginTop:27,paddingVertical:18,borderRadius:14,alignItems:'center'},nextText:{color:BACKGROUND,fontWeight:'900',fontSize:15}});
>>>>>>> 0231507b0e3f28685395d33a30aca9db624065c2
