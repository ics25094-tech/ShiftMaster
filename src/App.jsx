import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

const TODAY = new Date(2026, 4, 28);
const fmtKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseKey = k => { const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
const dayDiff = k => Math.floor((parseKey(k)-TODAY)/86400000);
const isActive = k => { const d=dayDiff(k); return d>=0&&d<30; };
const isToday = k => k===fmtKey(TODAY);
const MONTHS_GR=['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος','Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'];
const MONTHS_GEN=['Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου','Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου'];
const DAYS_FULL=['Κυριακή','Δευτέρα','Τρίτη','Τετάρτη','Πέμπτη','Παρασκευή','Σάββατο'];
const DAYS_COL=['Δε','Τρ','Τε','Πε','Πα','Σά','Κυ'];
const MONTHS_SH=['Ιαν','Φεβ','Μαρ','Απρ','Μαΐ','Ιουν','Ιουλ','Αυγ','Σεπ','Οκτ','Νοε','Δεκ'];
const fmtFull=k=>{const d=parseKey(k);return`${DAYS_FULL[d.getDay()]} ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;};
const fmtTs=dt=>{const d=new Date(dt);return`${d.getDate()} ${MONTHS_SH[d.getMonth()]}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
const monthStart=(y,m)=>{const d=new Date(y,m,1).getDay();return(d+6)%7;};

const REQ={kitchen:2,service:2,cashier:1};

const BG='#F2EDE8',BLUE='#5BBAD8',CARD='#FFFFFF';
const SL={pending:'Σε αναμονή',approved:'Εγκρίθηκε',rejected:'Απορρίφθηκε',cancelled:'Ακυρώθηκε'};

const Av=({initials,size=36})=>(
  <div style={{width:size,height:size,borderRadius:'50%',background:'#D4EBF5',color:'#3A8FBF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.33,fontWeight:500,flexShrink:0,letterSpacing:-0.5}}>
    {initials}
  </div>
);

const BS={morning:{bg:'#FEF3CC',c:'#9A6E0E'},evening:{bg:'#D4EEFA',c:'#1E7AB5'},request:{bg:'#FFE9D4',c:'#BC5210'},
  shortage:{bg:'#FFCDD5',c:'#A01828'},pending:{bg:'#D4EEFA',c:'#1E7AB5'},approved:{bg:'#D1F5E0',c:'#1A6B3C'},
  rejected:{bg:'#FFCDD5',c:'#A01828'},cancelled:{bg:'#EAE6E0',c:'#6A665F'}};

const Chip=({type,children,sm})=>{const b=BS[type]||BS.pending;return(
  <span style={{background:b.bg,color:b.c,fontSize:sm?10:11,fontWeight:500,padding:sm?'2px 6px':'3px 8px',borderRadius:20,display:'inline-block',lineHeight:'1.4',whiteSpace:'nowrap'}}>{children}</span>
);};
const SBadge=({type,children})=>{const b=BS[type]||BS.pending;return(
  <span style={{background:b.bg,color:b.c,fontSize:12,fontWeight:500,padding:'4px 12px',borderRadius:20,whiteSpace:'nowrap'}}>{children}</span>
);};

// ─── Back Button ────────────────────────────
const BackBtn=({onClick})=>(
  <button onClick={onClick} style={{border:'none',background:'none',cursor:'pointer',color:'#5A5650',fontSize:14,padding:'0 0 12px',display:'flex',alignItems:'center',gap:4}}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
    Πίσω
  </button>
);

// ─── Login ──────────────────────────────────
function Login({onLogin}){
  const[em,setEm]=useState('');
  const[pw,setPw]=useState('');
  const[err,setErr]=useState('');
  const[loading,setLoading]=useState(false);
  const go=async()=>{
    setLoading(true);setErr('');
    const{data,error}=await supabase.auth.signInWithPassword({email:em.trim(),password:pw});
    if(error){setErr('Λάθος email ή κωδικός');setLoading(false);return;}
    const{data:profile}=await supabase.from('profiles').select('*').eq('profile_id',data.user.id).single();
    if(profile){
      let extra={};
      if(profile.profile_type==='worker'){
        const{data:w}=await supabase.from('worker').select('*,roles(role_title)').eq('worker_id',data.user.id).single();
        if(w)extra={years:w.worker_experience,position:w.roles?.role_title,role_id:w.worker_role_id,
          initials:profile.full_name.split(' ').map(n=>n[0]).join('').slice(0,2)};
      }else{
        extra={initials:profile.full_name[0]};
      }
      onLogin({id:data.user.id,email:data.user.email,name:profile.full_name,
        firstName:profile.full_name.split(' ')[0],role:profile.profile_type==='employer'?'admin':'employee',...extra});
    }
    setLoading(false);
  };
  return(
    <div style={{minHeight:'100vh',background:BG,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px',fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:58,height:58,borderRadius:16,background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,boxShadow:'0 4px 16px rgba(91,186,216,0.35)'}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
      </div>
      <h1 style={{fontSize:28,fontWeight:700,margin:'0 0 4px',color:'#1A1614'}}>ShiftMaster</h1>
      <p style={{color:'#7A7570',margin:'0 0 32px',fontSize:14}}>Πρόγραμμα βαρδιών</p>
      <div style={{width:'100%',maxWidth:360,background:CARD,borderRadius:18,padding:'24px 20px',boxShadow:'0 2px 20px rgba(0,0,0,0.08)'}}>
        <h2 style={{textAlign:'center',fontSize:18,fontWeight:600,margin:'0 0 22px',color:'#1A1614'}}>Σύνδεση</h2>
        <label style={{fontSize:13,fontWeight:500,color:'#1A1614',display:'block',marginBottom:6}}>Email</label>
        <input value={em} onChange={e=>setEm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="nikos@taverna.gr"
          style={{width:'100%',border:`1.5px solid ${em?BLUE:'#E0DAD4'}`,borderRadius:10,padding:'11px 12px',fontSize:15,background:'#FAF7F4',marginBottom:14,boxSizing:'border-box',outline:'none',fontFamily:'inherit',color:'#1A1614'}}/>
        <label style={{fontSize:13,fontWeight:500,color:'#1A1614',display:'block',marginBottom:6}}>Κωδικός</label>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="••••"
          style={{width:'100%',border:`1.5px solid ${pw?BLUE:'#E0DAD4'}`,borderRadius:10,padding:'11px 12px',fontSize:15,background:'#FAF7F4',boxSizing:'border-box',outline:'none',fontFamily:'inherit',color:'#1A1614'}}/>
        {err&&<p style={{color:'#C4293A',fontSize:12,margin:'6px 0 0'}}>{err}</p>}
        <button onClick={go} disabled={loading} style={{width:'100%',background:loading?'#A8CCE0':BLUE,color:'white',border:'none',borderRadius:10,padding:'13px',fontSize:15,fontWeight:600,cursor:loading?'not-allowed':'pointer',marginTop:16,letterSpacing:0.3}}>
          {loading?'Σύνδεση...':'Είσοδος'}
        </button>
      </div>
    </div>
  );
}

// ─── Q6: Υπολογισμός κατάστασης ημέρας ─────
function calcDayStatus(shifts,assignments,date){
  const dayShifts=shifts.filter(s=>s.shift_day===date);
  let hasShortage=false,hasMarginal=false;
  for(const shift of dayShifts){
    for(const req of(shift.shift_requirements||[])){
      const assigned=assignments.filter(a=>
        a.assigned_shift===shift.shift_id&&
        a.worker?.worker_role_id===req.required_role
      ).length;
      if(assigned===0&&req.workers_needed>0)hasShortage=true;
      else if(assigned<req.workers_needed)hasMarginal=true;
    }
  }
  return hasShortage?'shortage':hasMarginal?'marginal':'full';
}

// ─── Calendar Grid ───────────────────────────
function CalGrid({shifts,assignments,reqs,uid,admin,onDay}){
  const months=[];
  for(let m=0;m<=1;m++){const b=new Date(TODAY.getFullYear(),TODAY.getMonth()+m,1);months.push({y:b.getFullYear(),m:b.getMonth()});}
  return(
    <div style={{padding:'0 10px 90px',background:BG,minHeight:'100vh',fontFamily:'system-ui,sans-serif'}}>
      {months.map(({y,m})=>{
        const days=new Date(y,m+1,0).getDate(),si=monthStart(y,m);
        const cells=[];
        for(let i=0;i<si;i++)cells.push(null);
        for(let d=1;d<=days;d++)cells.push(new Date(y,m,d));
        while(cells.length%7!==0)cells.push(null);
        return(
          <div key={`${y}-${m}`} style={{marginBottom:20}}>
            <h2 style={{fontSize:16,fontWeight:700,margin:'16px 4px 10px',color:'#1A1614'}}>{MONTHS_GR[m]} {y}</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,marginBottom:4}}>
              {DAYS_COL.map(d=><div key={d} style={{textAlign:'center',fontSize:11,color:'#B0A89E',padding:'4px 0',fontWeight:500}}>{d}</div>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
              {cells.map((date,i)=>{
                if(!date)return<div key={i}/>;
                const k=fmtKey(date),act=isActive(k),tod=isToday(k);
                if(!act)return(
                  <div key={k} style={{padding:'6px 5px',minHeight:54}}>
                    <span style={{fontSize:12,color:'#C0B8B0'}}>{date.getDate()}</span>
                  </div>
                );
                const chips=[];
                if(admin){
                  const st=calcDayStatus(shifts,assignments,k);
                  if(st!=='full')chips.push(<Chip key="s" type="shortage" sm>Έλλειψη</Chip>);
                }else{
                  const inM=assignments.some(a=>a.assigned_shift===`${k}_morning`&&a.assignment_holder===uid);
                  const inE=assignments.some(a=>a.assigned_shift===`${k}_evening`&&a.assignment_holder===uid);
                  const hp=reqs.some(r=>r.worker_requested===uid&&r.request_date===k&&r.status==='pending');
                  if(inM)chips.push(<Chip key="m" type="morning" sm>Πρωινή</Chip>);
                  if(inE)chips.push(<Chip key="e" type="evening" sm>Βραδινή</Chip>);
                  if(hp)chips.push(<Chip key="r" type="request" sm>Αίτημα</Chip>);
                }
                return(
                  <div key={k} onClick={()=>onDay(k)} style={{
                    background:CARD,borderRadius:10,padding:'6px 5px',minHeight:68,display:'flex',
                    flexDirection:'column',alignItems:'flex-start',cursor:'pointer',
                    border:tod?`2px solid ${BLUE}`:'1px solid #EDE8E2',gap:3,
                    boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                    <span style={{fontSize:13,fontWeight:tod?700:600,color:tod?BLUE:'#1A1614'}}>{date.getDate()}</span>
                    <div style={{display:'flex',flexDirection:'column',gap:2,width:'100%'}}>{chips}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Employee Day Detail ─────────────────────
function EmpDay({dk,shifts,assignments,reqs,uid,onBack,onReq}){
  const[modal,setModal]=useState(null);
  const[reason,setReason]=useState('');
  const inM=assignments.some(a=>a.assigned_shift===`${dk}_morning`&&a.assignment_holder===uid);
  const inE=assignments.some(a=>a.assigned_shift===`${dk}_evening`&&a.assignment_holder===uid);
  const submit=async()=>{
    if(modal==='dayoff'&&!reason.trim())return;
    const req_id=`r_${Date.now()}`;
    const{error}=await supabase.from('requests').insert({
      request_id:req_id,worker_requested:uid,
      request_type:modal==='dayoff'?'day_off':'shift_preference',
      status:'pending',request_date:dk
    });
    if(!error){
      if(modal==='dayoff'){
        await supabase.from('day_off_requests').insert({day_off_request_id:req_id,reason:reason.trim()});
      }else{
        await supabase.from('shift_preference_requests').insert({shift_preference_request_id:req_id,preferred_shift:modal,reason:reason.trim()});
      }
      onReq({request_id:req_id,worker_requested:uid,request_type:modal==='dayoff'?'day_off':'shift_preference',
        status:'pending',request_date:dk,created_at:new Date().toISOString(),
        day_off_requests:modal==='dayoff'?{reason:reason.trim()}:null,
        shift_preference_requests:modal!=='dayoff'?{preferred_shift:modal,reason:reason.trim()}:null});
    }
    setModal(null);setReason('');
  };
  return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',paddingBottom:100}}>
      <div style={{padding:'16px 16px 0'}}><BackBtn onClick={onBack}/><h2 style={{fontSize:18,fontWeight:700,margin:'0 0 18px',color:'#1A1614'}}>{fmtFull(dk)}</h2></div>
      <div style={{padding:'0 16px'}}>
        <div onClick={()=>setModal('dayoff')} style={{background:'#FEF7E8',borderRadius:12,padding:'14px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:12,cursor:'pointer',border:'1px solid #F0E8CC'}}>
          <span style={{fontSize:22}}>🗓</span>
          <div><p style={{margin:'0 0 2px',fontWeight:600,color:'#1A1614'}}>Ζητάω ρεπό</p><p style={{margin:0,color:'#7A7570',fontSize:13}}>για όλη τη μέρα</p></div>
        </div>
        {!inM&&!inE&&<p style={{fontSize:10,fontWeight:700,color:'#9A9590',letterSpacing:1.2,margin:'0 0 10px'}}>ΔΕΝ ΕΧΩ ΒΑΡΔΙΑ — ΔΗΛΩΣΕ ΔΙΑΘΕΣΙΜΟΤΗΤΑ</p>}
        {[{t:'morning',l:'Πρωινή',h:'10:00–18:00',has:inM},{t:'evening',l:'Βραδινή',h:'18:00–02:00',has:inE}].map(s=>(
          <div key={s.t} style={{marginBottom:10}}>
            <div style={{background:CARD,borderRadius:12,padding:'14px 16px',border:`1px solid ${s.has?'#D4EEFA':'#E8E3DD'}`,display:'flex',justifyContent:'space-between',alignItems:'center',
              cursor:s.has?'default':'pointer'}} onClick={()=>!s.has&&setModal(s.t)}>
              <div>
                <p style={{margin:'0 0 2px',fontWeight:600,color:'#1A1614',fontSize:15}}>{s.l}</p>
                <p style={{margin:0,color:'#7A7570',fontSize:13}}>{s.h}</p>
              </div>
              {s.has&&<Chip type={s.t==='morning'?'morning':'evening'}>{s.l}</Chip>}
            </div>
          </div>
        ))}
      </div>
      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,padding:'0 20px'}}>
          <div style={{background:CARD,borderRadius:18,padding:'24px 20px',width:'100%',maxWidth:380}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div>
                <h3 style={{margin:'0 0 3px',fontSize:16,fontWeight:600,color:'#1A1614'}}>{modal==='dayoff'?'🗓 Αίτημα Ρεπό':'Αίτημα βάρδιας'}</h3>
                <p style={{margin:0,color:BLUE,fontSize:13}}>{fmtFull(dk)}{modal!=='dayoff'?` · ${modal==='morning'?'Πρωινή':'Βραδινή'} · ${modal==='morning'?'10:00–18:00':'18:00–02:00'}`:''}</p>
              </div>
              <button onClick={()=>{setModal(null);setReason('');}} style={{border:'none',background:'none',cursor:'pointer',fontSize:22,color:'#9A9590',alignSelf:'flex-start',lineHeight:1}}>×</button>
            </div>
            <label style={{display:'block',fontSize:13,fontWeight:500,color:'#1A1614',margin:'16px 0 6px'}}>
              {modal==='dayoff'?'Λόγος αιτήματος':'Προαιρετική αιτιολόγηση'}
              {modal==='dayoff'&&<span style={{color:'#E24B4A'}}> *</span>}
            </label>
            <textarea value={reason} onChange={e=>setReason(e.target.value.slice(0,300))} placeholder={modal==='dayoff'?'Γράψε γιατί ζητάς το ρεπό...':'Γράψε κάτι αν θέλεις'}
              style={{width:'100%',border:`2px solid ${reason?BLUE:'#E0DAD4'}`,borderRadius:10,padding:'10px 12px',fontSize:14,resize:'none',height:96,boxSizing:'border-box',outline:'none',fontFamily:'inherit',background:'#FAF7F4',color:'#1A1614'}}/>
            <p style={{textAlign:'right',fontSize:11,color:'#9A9590',margin:'2px 0 0'}}>{reason.length}/300</p>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={()=>{setModal(null);setReason('');}} style={{flex:1,border:'1px solid #E0DAD4',background:'none',borderRadius:10,padding:'12px',cursor:'pointer',fontSize:14,color:'#5A5650'}}>Άκυρο</button>
              <button onClick={submit} disabled={modal==='dayoff'&&!reason.trim()}
                style={{flex:2,background:modal==='dayoff'&&!reason.trim()?'#A8CCE0':BLUE,color:'white',border:'none',borderRadius:10,padding:'12px',cursor:modal==='dayoff'&&!reason.trim()?'not-allowed':'pointer',fontSize:14,fontWeight:600}}>
                {modal==='dayoff'?'Υποβολή':'Υποβολή αιτήματος βάρδιας'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Employee Requests ───────────────────────
function EmpReqs({reqs,uid,onCancel}){
  const[sf,setSf]=useState('all');
  const[tf,setTf]=useState('all');
  const mine=reqs.filter(r=>r.worker_requested===uid);
  const flt=mine.filter(r=>(sf==='all'||r.status===sf)&&(tf==='all'||r.request_type===tf));
  const FilterBtn=({val,cur,set,lbl})=>(
    <button onClick={()=>set(val)} style={{border:'none',borderRadius:20,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:500,
      background:cur===val?BLUE:CARD,color:cur===val?'white':'#5A5650',boxShadow:cur!==val?'0 0 0 1px #E0DAD4':'none'}}>{lbl}</button>
  );
  return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',padding:'16px 16px 100px'}}>
      <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 2px',color:'#1A1614'}}>Τα αιτήματά μου</h2>
      <p style={{color:'#7A7570',fontSize:13,margin:'0 0 14px'}}>Ιστορικό αιτημάτων</p>
      <p style={{fontSize:10,fontWeight:700,color:'#9A9590',letterSpacing:1.2,margin:'0 0 7px'}}>ΚΑΤΑΣΤΑΣΗ</p>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
        {[['all','Όλα'],['pending','Σε αναμονή'],['approved','Εγκρίθηκε'],['rejected','Απορρίφθηκε'],['cancelled','Ακυρώθηκε']].map(([v,l])=>(
          <FilterBtn key={v} val={v} cur={sf} set={setSf} lbl={l}/>
        ))}
      </div>
      <p style={{fontSize:10,fontWeight:700,color:'#9A9590',letterSpacing:1.2,margin:'0 0 7px'}}>ΤΥΠΟΣ</p>
      <div style={{display:'flex',gap:6,marginBottom:18}}>
        {[['all','Όλα'],['day_off','Ρεπό']].map(([v,l])=>(
          <FilterBtn key={v} val={v} cur={tf} set={setTf} lbl={l}/>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {flt.length===0&&<p style={{color:'#9A9590',textAlign:'center',marginTop:32,fontSize:14}}>Δεν υπάρχουν αιτήματα</p>}
        {flt.map(r=>(
          <div key={r.request_id} style={{background:CARD,borderRadius:14,padding:'16px',border:'1px solid #EDE8E2'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <p style={{margin:'0 0 2px',fontWeight:600,color:'#1A1614'}}>{r.request_type==='day_off'?'Ρεπό':`Αίτημα ${r.shift_preference_requests?.preferred_shift==='morning'?'Πρωινής':'Βραδινής'}`}</p>
                <p style={{margin:0,color:'#7A7570',fontSize:13}}>{fmtFull(r.request_date)}{r.request_type==='day_off'?' · Όλη τη μέρα':''}</p>
              </div>
              <SBadge type={r.status}>{SL[r.status]}</SBadge>
            </div>
            {r.day_off_requests?.reason&&(
              <div style={{background:'#F8F4F0',borderRadius:8,padding:'10px 12px',marginBottom:8}}>
                <p style={{margin:'0 0 2px',fontSize:12,color:'#9A9590'}}>Αιτιολογία</p>
                <p style={{margin:0,fontSize:13,color:'#1A1614'}}>{r.day_off_requests.reason}</p>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <p style={{margin:0,fontSize:12,color:'#9A9590'}}>{fmtTs(r.created_at)}</p>
              {r.status==='pending'&&(
                <button onClick={()=>onCancel(r.request_id)} style={{border:'1px solid #FFCDD5',background:'none',color:'#A01828',borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:500}}>× Ακύρωση αιτήματος</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Employee Profile ────────────────────────
function EmpProfile({user,onLogout}){
  return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',padding:'16px 16px 100px'}}>
      <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 16px',color:'#1A1614'}}>Προφίλ</h2>
      <div style={{background:CARD,borderRadius:14,padding:'20px 16px',border:'1px solid #EDE8E2'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,paddingBottom:16,borderBottom:'1px solid #EDE8E2'}}>
          <Av initials={user.initials} size={50}/>
          <div><p style={{margin:'0 0 3px',fontWeight:700,fontSize:17,color:'#1A1614'}}>{user.name}</p><p style={{margin:0,color:'#7A7570',fontSize:14}}>{user.position}</p></div>
        </div>
        {[['Όνομα',user.name],['Πόστο',user.position],['Χρόνια υπηρεσίας',`${user.years} χρόν${user.years===1?'ος':'ια'}`],['Email',user.email]].map(([l,v])=>(
          <div key={l} style={{marginBottom:14}}>
            <p style={{margin:'0 0 2px',fontSize:12,color:BLUE,fontWeight:500}}>{l}</p>
            <p style={{margin:0,fontSize:15,fontWeight:600,color:'#1A1614'}}>{v}</p>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{width:'100%',marginTop:20,background:'#E24B4A',color:'white',border:'none',borderRadius:12,padding:'14px',fontSize:15,fontWeight:600,cursor:'pointer',letterSpacing:0.3}}>
        Αποσύνδεση
      </button>
    </div>
  );
}

// ─── Admin Day Detail ────────────────────────
function AdminDay({dk,shifts,assignments,setAssignments,workers,onBack}){
  const[adding,setAdding]=useState(null);
  const dayShifts=shifts.filter(s=>s.shift_day===dk);

  const removeEmp=async(assignmentId)=>{
    await supabase.from('shift_assignments').delete().eq('assignment_id',assignmentId);
    setAssignments(p=>p.filter(a=>a.assignment_id!==assignmentId));
  };

  const addEmp=async(shiftId,workerId)=>{
    const assignmentId=`as_${dk.replace(/-/g,'')}_${workerId.slice(-4)}`;
    const{error}=await supabase.from('shift_assignments').insert({
      assignment_id:assignmentId,assignment_holder:workerId,assigned_shift:shiftId
    });
    if(!error){
      const w=workers.find(x=>x.worker_id===workerId);
      setAssignments(p=>[...p,{assignment_id:assignmentId,assignment_holder:workerId,assigned_shift:shiftId,worker:w}]);
    }
    setAdding(null);
  };

  const renderShift=(shiftType)=>{
    const shift=dayShifts.find(s=>s.shift_title===shiftType);
    if(!shift)return null;
    const shiftAssignments=assignments.filter(a=>a.assigned_shift===shift.shift_id);
    const allInIds=shiftAssignments.map(a=>a.assignment_holder);
    const otherType=shiftType==='morning'?'evening':'morning';
    const otherShift=dayShifts.find(s=>s.shift_title===otherType);
    const otherInIds=otherShift?assignments.filter(a=>a.assigned_shift===otherShift.shift_id).map(a=>a.assignment_holder):[];
    const avail=workers.filter(w=>!allInIds.includes(w.worker_id));
    const lbl=shiftType==='morning'?'Πρωινή':'Βραδινή';
    const hrs=shiftType==='morning'?'10:00–18:00':'18:00–02:00';
    const reqs=shift.shift_requirements||[];
    const isA=adding===shiftType;

    const getRoleStatus=(roleId)=>{
      const req=reqs.find(r=>r.required_role===roleId);
      if(!req)return{cur:0,needed:0};
      const cur=shiftAssignments.filter(a=>a.worker?.worker_role_id===roleId).length;
      return{cur,needed:req.workers_needed};
    };

    const overallStatus=()=>{
      let shortage=false,marginal=false;
      for(const req of reqs){
        const{cur,needed}=getRoleStatus(req.required_role);
        if(cur===0&&needed>0)shortage=true;
        else if(cur<needed)marginal=true;
      }
      return shortage?'shortage':marginal?'marginal':'full';
    };

    const status=overallStatus();

    return(
      <div style={{background:CARD,borderRadius:14,padding:'16px',border:'1px solid #EDE8E2',marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:6}}>
          <div><p style={{margin:'0 0 2px',fontWeight:700,fontSize:16,color:'#1A1614'}}>{lbl}</p><p style={{margin:0,color:'#7A7570',fontSize:13}}>{hrs}</p></div>
          {status==='shortage'&&<SBadge type="shortage">Έλλειψη προσωπικού</SBadge>}
          {status==='marginal'&&<SBadge type="pending">Οριακή κάλυψη</SBadge>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:14}}>
          {reqs.map(req=>{
            const{cur,needed}=getRoleStatus(req.required_role);
            const short=cur<needed;
            return(
              <div key={req.required_role} style={{background:short?'#FFF5F5':'#F8F4F0',borderRadius:8,padding:'8px',textAlign:'center',border:`1px solid ${short?'#FFCDD5':'#EDE8E2'}`}}>
                <p style={{margin:'0 0 2px',fontSize:9,color:'#9A9590',fontWeight:700,letterSpacing:0.8}}>{req.required_role.toUpperCase()}</p>
                <p style={{margin:0,fontSize:17,fontWeight:700,color:short?'#A01828':'#1A1614'}}>{cur}/{needed}</p>
              </div>
            );
          })}
        </div>
        {shiftAssignments.map(a=>{
          const w=a.worker;if(!w)return null;
          const initials=(w.profiles?.full_name||'').split(' ').map(n=>n[0]).join('').slice(0,2);
          return(
            <div key={a.assignment_id} style={{display:'flex',alignItems:'center',gap:10,background:'#F8F4F0',borderRadius:10,padding:'10px 12px',marginBottom:5}}>
              <Av initials={initials} size={32}/>
              <div style={{flex:1}}>
                <p style={{margin:'0 0 1px',fontWeight:500,fontSize:14,color:'#1A1614'}}>{w.profiles?.full_name}</p>
                <p style={{margin:0,fontSize:12,color:'#7A7570'}}>{w.roles?.role_title}</p>
              </div>
              <button onClick={()=>removeEmp(a.assignment_id)} style={{border:'none',background:'none',cursor:'pointer',color:'#9A9590',fontSize:20,padding:'0 4px',lineHeight:1}}>×</button>
            </div>
          );
        })}
        <button onClick={()=>setAdding(isA?null:shiftType)} style={{width:'100%',background:BLUE,color:'white',border:'none',borderRadius:10,padding:'12px',cursor:'pointer',fontSize:14,fontWeight:600,marginTop:4}}>
          + Προσθήκη εργαζομένου
        </button>
        {isA&&(
          <div style={{background:CARD,borderRadius:10,border:'1px solid #E0DAD4',marginTop:8,boxShadow:'0 4px 14px rgba(0,0,0,0.1)'}}>
            {avail.length===0
              ?<p style={{textAlign:'center',color:'#9A9590',padding:'14px',margin:0,fontSize:13}}>Δεν υπάρχουν διαθέσιμοι</p>
              :<>
                <p style={{fontSize:12,color:'#7A7570',margin:'10px 12px 4px',fontWeight:500}}>Διαθέσιμοι εργαζόμενοι</p>
                {avail.map(w=>{
                  const inOther=otherInIds.includes(w.worker_id);
                  const initials=(w.profiles?.full_name||'').split(' ').map(n=>n[0]).join('').slice(0,2);
                  return(
                    <button key={w.worker_id} onClick={()=>addEmp(shift.shift_id,w.worker_id)}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:'none',background:'none',cursor:'pointer',textAlign:'left',borderTop:'1px solid #F0EBE5'}}>
                      <Av initials={initials} size={32}/>
                      <div>
                        <p style={{margin:'0 0 1px',fontWeight:500,fontSize:14,color:'#1A1614'}}>{w.profiles?.full_name}</p>
                        <p style={{margin:0,fontSize:12,color:inOther?'#BC5210':'#7A7570'}}>{w.roles?.role_title}{inOther?' · ήδη σε άλλη βάρδια':''}</p>
                      </div>
                    </button>
                  );
                })}
              </>
            }
          </div>
        )}
      </div>
    );
  };

  return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',padding:'16px 16px 100px'}}>
      <BackBtn onClick={onBack}/>
      <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 2px',color:'#1A1614'}}>{fmtFull(dk)}</h2>
      <p style={{color:'#7A7570',fontSize:13,margin:'0 0 18px'}}>Διαχείριση βαρδιών</p>
      {renderShift('morning')}
      {renderShift('evening')}
    </div>
  );
}

// ─── Admin Requests ──────────────────────────
function AdminReqs({reqs,setReqs,shifts,assignments}){
  const[f,setF]=useState('pending');
  const flt=reqs.filter(r=>f==='all'||r.status===f);

  const upd=async(id,st)=>{
    await supabase.from('requests').update({status:st}).eq('request_id',id);
    setReqs(p=>p.map(r=>r.request_id===id?{...r,status:st}:r));
  };

  const impact=r=>{
    if(r.request_type!=='day_off')return null;
    const workerAssignments=assignments.filter(a=>a.assignment_holder===r.worker_requested);
    const res=[];
    for(const wa of workerAssignments){
      const shift=shifts.find(s=>s.shift_id===wa.assigned_shift&&s.shift_day===r.request_date);
      if(!shift)continue;
      const shiftReqs=shift.shift_requirements||[];
      const w=wa.worker;
      if(!w)continue;
      for(const req of shiftReqs){
        if(req.required_role===w.worker_role_id){
          const cur=assignments.filter(a=>a.assigned_shift===shift.shift_id&&a.worker?.worker_role_id===req.required_role).length;
          const nw=cur-1;
          const lbl=shift.shift_title==='morning'?'Πρωινή':'Βραδινή';
          if(nw===0&&req.workers_needed>0)res.push({lbl,st:'shortage'});
          else if(nw<req.workers_needed)res.push({lbl,st:'marginal'});
        }
      }
    }
    return res.length?res:null;
  };

  return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',padding:'16px 16px 100px'}}>
      <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 2px',color:'#1A1614'}}>Αιτήματα</h2>
      <p style={{color:'#7A7570',fontSize:13,margin:'0 0 14px'}}>Αιτήματα προσωπικού</p>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
        {[['all','Όλα'],['pending','Σε αναμονή'],['approved','Εγκρίθηκε'],['rejected','Απορρίφθηκε']].map(([v,l])=>(
          <button key={v} onClick={()=>setF(v)} style={{border:'none',borderRadius:20,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:500,
            background:f===v?BLUE:CARD,color:f===v?'white':'#5A5650',boxShadow:f!==v?'0 0 0 1px #E0DAD4':'none'}}>{l}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {flt.length===0&&<p style={{color:'#9A9590',textAlign:'center',marginTop:32,fontSize:14}}>Δεν υπάρχουν αιτήματα</p>}
        {flt.map(r=>{
          const worker=r.worker;
          if(!worker)return null;
          const initials=(worker.profiles?.full_name||'').split(' ').map(n=>n[0]).join('').slice(0,2);
          const imp=impact(r);
          return(
            <div key={r.request_id} style={{background:CARD,borderRadius:14,padding:'16px',border:'1px solid #EDE8E2'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <Av initials={initials} size={38}/>
                <div style={{flex:1}}>
                  <p style={{margin:'0 0 1px',fontWeight:600,color:'#1A1614'}}>{worker.profiles?.full_name}</p>
                  <p style={{margin:0,color:'#7A7570',fontSize:12}}>{worker.roles?.role_title}</p>
                </div>
                <SBadge type={r.status}>{SL[r.status]}</SBadge>
              </div>
              <p style={{margin:'0 0 2px',fontWeight:600,color:'#1A1614'}}>{r.request_type==='day_off'?'Ρεπό':`Αίτημα ${r.shift_preference_requests?.preferred_shift==='morning'?'Πρωινής':'Βραδινής'}`}</p>
              <p style={{margin:'0 0 10px',color:'#7A7570',fontSize:13}}>{fmtFull(r.request_date)}</p>
              {r.day_off_requests?.reason&&(
                <div style={{background:'#F8F4F0',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
                  <p style={{margin:'0 0 2px',fontSize:12,color:'#9A9590'}}>Αιτιολογία</p>
                  <p style={{margin:0,fontSize:13,color:'#1A1614'}}>{r.day_off_requests.reason}</p>
                </div>
              )}
              {imp&&(
                <div style={{background:'#FAF7F0',borderRadius:8,padding:'10px 12px',marginBottom:10,border:'1px solid #EDE8E2'}}>
                  <p style={{margin:'0 0 5px',fontSize:12,fontWeight:600,color:'#5A5650'}}>🛡 Επηρεάζει την κάλυψη</p>
                  {imp.map(({lbl,st})=>(
                    <p key={lbl} style={{margin:'0 0 2px',fontSize:13}}>
                      <span style={{color:'#5A5650'}}>{lbl} → </span>
                      <span style={{color:st==='shortage'?'#A01828':'#9A6E0E',fontWeight:500}}>
                        {st==='shortage'?'Έλλειψη προσωπικού':'Οριακή κάλυψη'}
                      </span>
                    </p>
                  ))}
                </div>
              )}
              {r.status==='pending'&&(
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>upd(r.request_id,'approved')} style={{flex:1,background:'#E8F7EF',color:'#1A6B3C',border:'1px solid #B3E6C8',borderRadius:10,padding:'11px',cursor:'pointer',fontSize:14,fontWeight:600}}>✓ Έγκριση</button>
                  <button onClick={()=>upd(r.request_id,'rejected')} style={{flex:1,background:'none',color:'#A01828',border:'1px solid #FFCDD5',borderRadius:10,padding:'11px',cursor:'pointer',fontSize:14,fontWeight:600}}>✕ Απόρριψη</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin Staff ─────────────────────────────
function AdminStaff({workers,onLogout}){
  const[sel,setSel]=useState(null);
  if(sel){const w=sel;
    const initials=(w.profiles?.full_name||'').split(' ').map(n=>n[0]).join('').slice(0,2);
    return(
      <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',padding:'16px 16px 100px'}}>
        <BackBtn onClick={()=>setSel(null)}/>
        <div style={{background:CARD,borderRadius:14,padding:'20px 16px',border:'1px solid #EDE8E2'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,paddingBottom:16,borderBottom:'1px solid #EDE8E2'}}>
            <Av initials={initials} size={50}/>
            <div><p style={{margin:'0 0 3px',fontWeight:700,fontSize:17,color:'#1A1614'}}>{w.profiles?.full_name}</p><p style={{margin:0,color:'#7A7570',fontSize:14}}>{w.roles?.role_title}</p></div>
          </div>
          {[['Όνομα',w.profiles?.full_name],['Πόστο',w.roles?.role_title],['Χρόνια υπηρεσίας',`${w.worker_experience} χρόν${w.worker_experience===1?'ος':'ια'}`],['Τηλέφωνο',w.phone||'—']].map(([l,v])=>(
            <div key={l} style={{marginBottom:14}}>
              <p style={{margin:'0 0 2px',fontSize:12,color:BLUE,fontWeight:500}}>{l}</p>
              <p style={{margin:0,fontSize:15,fontWeight:600,color:'#1A1614'}}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',padding:'16px 16px 100px'}}>
      <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 2px',color:'#1A1614'}}>Προσωπικό</h2>
      <p style={{color:'#7A7570',fontSize:13,margin:'0 0 16px'}}>{workers.length} άτομα</p>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {workers.map(w=>{
          const initials=(w.profiles?.full_name||'').split(' ').map(n=>n[0]).join('').slice(0,2);
          return(
            <button key={w.worker_id} onClick={()=>setSel(w)} style={{background:CARD,borderRadius:12,padding:'14px 16px',border:'1px solid #EDE8E2',display:'flex',alignItems:'center',gap:12,cursor:'pointer',textAlign:'left',width:'100%'}}>
              <Av initials={initials} size={42}/>
              <div>
                <p style={{margin:'0 0 2px',fontWeight:600,fontSize:15,color:'#1A1614'}}>{w.profiles?.full_name}</p>
                <p style={{margin:'0 0 1px',fontSize:13,color:'#7A7570'}}>{w.roles?.role_title}</p>
                <p style={{margin:0,fontSize:12,color:'#9A9590'}}>{w.worker_experience} χρόν{w.worker_experience===1?'ος':'ια'}</p>
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={onLogout} style={{width:'100%',marginTop:20,background:'#E24B4A',color:'white',border:'none',borderRadius:12,padding:'14px',fontSize:15,fontWeight:600,cursor:'pointer',letterSpacing:0.3}}>
        Αποσύνδεση
      </button>
    </div>
  );
}

// ─── Bottom Navigation ───────────────────────
function BotNav({tab,setTab,tabs,badge={}}){
  const ICONS={
    calendar:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
    requests:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    staff:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    profile:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  const LBLS={calendar:'Μέρες',requests:'Αιτήματα',staff:'Προσωπικό',profile:'Προφίλ'};
  return(
    <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:520,
      background:CARD,borderTop:'1px solid #E8E3DD',display:'flex',zIndex:100}}>
      {tabs.map(t=>(
        <button key={t} onClick={()=>setTab(t)} style={{flex:1,border:'none',background:'none',padding:'8px 0 10px',cursor:'pointer',
          color:tab===t?BLUE:'#9A9590',display:'flex',flexDirection:'column',alignItems:'center',gap:2,position:'relative'}}>
          {ICONS[t]}
          <span style={{fontSize:11,fontWeight:tab===t?600:400}}>{LBLS[t]}</span>
          {(badge[t]||0)>0&&<span style={{position:'absolute',top:6,right:'50%',marginRight:-18,width:8,height:8,borderRadius:'50%',background:'#E24B4A'}}/>}
        </button>
      ))}
    </div>
  );
}

// ─── Employee App ────────────────────────────
function EmpApp({user,shifts,assignments,setAssignments,reqs,setReqs,onLogout}){
  const[tab,setTab]=useState('calendar');
  const[dk,setDk]=useState(null);
  const[toast,setToast]=useState(null);
  const pending=reqs.filter(r=>r.worker_requested===user.id&&r.status==='pending').length;
  const submitReq=req=>{
    setReqs(p=>[req,...p]);setDk(null);
    setToast('Το αίτημά σου υποβλήθηκε επιτυχώς!');
    setTimeout(()=>setToast(null),3500);
  };
  const cancelReq=async(id)=>{
    await supabase.from('requests').update({status:'cancelled'}).eq('request_id',id);
    setReqs(p=>p.map(r=>r.request_id===id?{...r,status:'cancelled'}:r));
  };
  const changeTab=t=>{setTab(t);setDk(null);};
  return(
    <div style={{maxWidth:520,margin:'0 auto'}}>
      {tab==='calendar'&&!dk&&(
        <>
          <div style={{padding:'20px 14px 0',background:BG}}>
            <h1 style={{fontSize:20,fontWeight:700,margin:'0 0 4px',color:'#1A1614'}}>Καλημέρα, {user.firstName} 👋</h1>
          </div>
          <CalGrid shifts={shifts} assignments={assignments} reqs={reqs} uid={user.id} admin={false} onDay={k=>{if(isActive(k))setDk(k);}}/>
        </>
      )}
      {tab==='calendar'&&dk&&<EmpDay dk={dk} shifts={shifts} assignments={assignments} reqs={reqs} uid={user.id} onBack={()=>setDk(null)} onReq={submitReq}/>}
      {tab==='requests'&&<EmpReqs reqs={reqs} uid={user.id} onCancel={cancelReq}/>}
      {tab==='profile'&&<EmpProfile user={user} onLogout={onLogout}/>}
      {toast&&(
        <div style={{position:'fixed',bottom:80,right:16,background:'#2C2C2A',color:'white',padding:'12px 16px',borderRadius:12,fontSize:13,zIndex:500,maxWidth:280,boxShadow:'0 4px 16px rgba(0,0,0,0.25)'}}>
          {toast}
        </div>
      )}
      <BotNav tab={tab} setTab={changeTab} tabs={['calendar','requests','profile']} badge={{requests:pending}}/>
    </div>
  );
}

// ─── Admin App ───────────────────────────────
function AdminApp({user,shifts,assignments,setAssignments,reqs,setReqs,workers,onLogout}){
  const[tab,setTab]=useState('calendar');
  const[dk,setDk]=useState(null);
  const pending=reqs.filter(r=>r.status==='pending').length;
  const changeTab=t=>{setTab(t);setDk(null);};
  return(
    <div style={{maxWidth:520,margin:'0 auto'}}>
      {tab==='calendar'&&!dk&&(
        <>
          <div style={{padding:'20px 14px 0',background:BG}}>
            <h1 style={{fontSize:20,fontWeight:700,margin:'0 0 4px',color:'#1A1614'}}>Καλώς ήρθες, {user.firstName} 👋</h1>
          </div>
          <CalGrid shifts={shifts} assignments={assignments} reqs={reqs} uid={null} admin={true} onDay={k=>{if(isActive(k))setDk(k);}}/>
        </>
      )}
      {tab==='calendar'&&dk&&<AdminDay dk={dk} shifts={shifts} assignments={assignments} setAssignments={setAssignments} workers={workers} onBack={()=>setDk(null)}/>}
      {tab==='requests'&&<AdminReqs reqs={reqs} setReqs={setReqs} shifts={shifts} assignments={assignments}/>}
      {tab==='staff'&&<AdminStaff workers={workers} onLogout={onLogout}/>}
      <BotNav tab={tab} setTab={changeTab} tabs={['calendar','requests','staff']} badge={{requests:pending}}/>
    </div>
  );
}

// ─── Root ────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null);
  const[shifts,setShifts]=useState([]);
  const[assignments,setAssignments]=useState([]);
  const[reqs,setReqs]=useState([]);
  const[workers,setWorkers]=useState([]);
  const[loading,setLoading]=useState(false);

  const logout=async()=>{
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(()=>{
    if(!user)return;
    async function fetchAll(){
      setLoading(true);

      // Q4 — Βάρδιες μήνα
      const{data:shiftsData}=await supabase
        .from('shifts')
        .select(`shift_id,shift_title,shift_day,shift_start,shift_end,
          shift_requirements(requirement_id,required_role,workers_needed)`)
        .gte('shift_day','2026-05-28')
        .lte('shift_day','2026-06-30')
        .order('shift_day');
      setShifts(shiftsData||[]);

      // Q5 — Assignments μήνα
      const{data:assignData}=await supabase
        .from('shift_assignments')
        .select(`assignment_id,assignment_holder,assigned_shift,
          worker:assignment_holder(worker_id,worker_role_id,worker_experience,phone,
            profiles:worker_id(full_name),
            roles:worker_role_id(role_title))`);
      setAssignments(assignData||[]);

      // Q12 — Αιτήματα
      const{data:reqData}=await supabase
        .from('requests')
        .select(`request_id,worker_requested,request_type,status,request_date,created_at,
          worker:worker_requested(worker_id,worker_role_id,
            profiles:worker_id(full_name),
            roles:worker_role_id(role_title)),
          day_off_requests(reason),
          shift_preference_requests(preferred_shift,reason)`)
        .order('created_at',{ascending:false});
      setReqs(reqData||[]);

      // Q17 — Προσωπικό
      const{data:workersData}=await supabase
        .from('worker')
        .select(`worker_id,worker_experience,worker_role_id,phone,
          profiles:worker_id(full_name),
          roles:worker_role_id(role_title)`);
      setWorkers(workersData||[]);

      setLoading(false);
    }
    fetchAll();
  },[user]);

  if(!user)return<Login onLogin={setUser}/>;
  if(loading)return(
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif'}}>
      <p style={{color:'#7A7570',fontSize:15}}>Φόρτωση δεδομένων...</p>
    </div>
  );

  return(
    <div style={{background:BG,minHeight:'100vh'}}>
      {user.role==='admin'
        ?<AdminApp user={user} shifts={shifts} assignments={assignments} setAssignments={setAssignments} reqs={reqs} setReqs={setReqs} workers={workers} onLogout={logout}/>
        :<EmpApp user={user} shifts={shifts} assignments={assignments} setAssignments={setAssignments} reqs={reqs} setReqs={setReqs} onLogout={logout}/>
      }
    </div>
  );
}
