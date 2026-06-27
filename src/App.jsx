import { useState } from "react";

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
const fmtTs=dt=>`${dt.getDate()} ${MONTHS_SH[dt.getMonth()]}, ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
const monthStart=(y,m)=>{const d=new Date(y,m,1).getDay();return(d+6)%7;};

const USERS=[
  {id:'admin',name:'Δήμητρα',firstName:'Δήμητρα',email:'admin@taverna.gr',password:'admin123',role:'admin',initials:'Δ',position:'Διαχ/στής'},
  {id:'nikos',name:'Νίκος Παπαδόπουλος',firstName:'Νίκος',email:'nikos@taverna.gr',password:'1234',role:'employee',position:'Αρχιμάγειρας',category:'kitchen',years:5,phone:'6912345678',initials:'ΝΠ'},
  {id:'maria',name:'Μαρία Γεωργίου',firstName:'Μαρία',email:'maria@taverna.gr',password:'1234',role:'employee',position:'Μαγείρισσα',category:'kitchen',years:3,phone:'6972345678',initials:'ΜΓ'},
  {id:'kostas',name:'Κώστας Αλεξίου',firstName:'Κώστας',email:'kostas@taverna.gr',password:'1234',role:'employee',position:'Μάγειρας',category:'kitchen',years:1,phone:'6987654321',initials:'ΚΑ'},
  {id:'eleni',name:'Ελένη Δημητρίου',firstName:'Ελένη',email:'eleni@taverna.gr',password:'1234',role:'employee',position:'Σερβιτόρα',category:'service',years:4,phone:'6953214789',initials:'ΕΔ'},
  {id:'giorgos',name:'Γιώργος Παπανικολάου',firstName:'Γιώργος',email:'giorgos@taverna.gr',password:'1234',role:'employee',position:'Σερβιτόρος',category:'service',years:2,phone:'6998112233',initials:'ΓΠ'},
  {id:'sofia',name:'Σοφία Αντωνίου',firstName:'Σοφία',email:'sofia@taverna.gr',password:'1234',role:'employee',position:'Σερβιτόρα',category:'service',years:3,phone:'6936547890',initials:'ΣΑ'},
  {id:'thanasis',name:'Θανάσης Κωνσταντίνου',firstName:'Θανάσης',email:'thanasis@taverna.gr',password:'1234',role:'employee',position:'Σερβιτόρος',category:'service',years:1,phone:'6945678123',initials:'ΘΚ'},
  {id:'xristos',name:'Χρήστος Παπαγεωργίου',firstName:'Χρήστος',email:'xristos@taverna.gr',password:'1234',role:'employee',position:'Ταμίας',category:'cashier',years:4,phone:'6912349876',initials:'ΧΠ'},
  {id:'anna',name:'Άννα Στεφανίδου',firstName:'Άννα',email:'anna@taverna.gr',password:'1234',role:'employee',position:'Ταμίας',category:'cashier',years:2,phone:'6967894561',initials:'ΑΣ'},
];
const REQ={kitchen:2,service:2,cashier:1};
const getUser=id=>USERS.find(u=>u.id===id);

function buildSched(){
  const s={};
  for(let i=0;i<30;i++){
    const d=new Date(TODAY);d.setDate(d.getDate()+i);
    const k=fmtKey(d),dow=d.getDay(),fri=dow===5;
    let mK,mS,mC,eK,eS,eC;
    if(i===0){mK=['maria','kostas'];mS=['eleni','giorgos'];mC=[];eK=['nikos'];eS=['sofia','thanasis'];eC=['xristos','anna'];}
    else if(i===1){mK=['nikos','maria'];mS=['eleni','giorgos'];mC=[];eK=['nikos','kostas'];eS=['sofia'];eC=['xristos'];}
    else if(i===2){mK=['maria','kostas'];mS=['giorgos','sofia'];mC=['xristos'];eK=['nikos','maria'];eS=['eleni','thanasis'];eC=['anna'];}
    else if(i===3){mK=['kostas'];mS=['eleni','giorgos'];mC=['xristos'];eK=['maria'];eS=['sofia','thanasis'];eC=['xristos','anna'];}
    else{
      mK=fri?['nikos','maria','kostas']:(i%7===4?['kostas']:['maria','kostas']);
      mS=(i%9===3)?['eleni']:['eleni','giorgos'];
      mC=(i%11===5)?[]:['xristos'];
      eK=['nikos',i%5===2?'maria':'kostas'];
      eS=(i%10===3)?['sofia']:['sofia','thanasis'];
      eC=['xristos','anna'];
    }
    s[k]={morning:{kitchen:mK,service:mS,cashier:mC},evening:{kitchen:eK,service:eS,cashier:eC}};
  }
  return s;
}

const shiftSt=sh=>{let e=false,m=false;for(const c of['kitchen','service','cashier']){const r=REQ[c],n=sh[c].length;if(n===0&&r>0)e=true;else if(n<r)m=true;}return e?'shortage':m?'marginal':'full';};
const daySt=dd=>{if(!dd)return'full';const a=shiftSt(dd.morning),b=shiftSt(dd.evening);return(a==='shortage'||b==='shortage')?'shortage':(a==='marginal'||b==='marginal')?'marginal':'full';};

let _nid=10;
const INIT_REQ=[
  {id:'r0',userId:'nikos',type:'dayoff',date:fmtKey(new Date(2026,4,31)),reason:'Εκδήλωση σχολής',status:'pending',createdAt:new Date(2026,4,28,7,30)},
  {id:'r1',userId:'nikos',type:'dayoff',date:fmtKey(new Date(2026,4,31)),reason:'Προσωπικοί λόγοι',status:'rejected',createdAt:new Date(2026,4,23,0,14)},
  {id:'r2',userId:'nikos',type:'dayoff',date:fmtKey(new Date(2026,4,30)),reason:'Οικογενειακή υποχρέωση',status:'pending',createdAt:new Date(2026,4,27,9,15)},
  {id:'r3',userId:'nikos',type:'shift',shiftType:'morning',date:fmtKey(new Date(2026,4,27)),reason:'Διαθέσιμος/η το πρωί',status:'approved',createdAt:new Date(2026,4,25,14,30)},
  {id:'r4',userId:'kostas',type:'dayoff',date:fmtKey(new Date(2026,4,29)),reason:'Ραντεβού στον γιατρό το πρωί',status:'pending',createdAt:new Date(2026,4,27,8,0)},
  {id:'r5',userId:'giorgos',type:'shift',shiftType:'evening',date:fmtKey(new Date(2026,4,30)),reason:'Θέλω να καλύψω επιπλέον ώρες το Σαββατοκύριακο',status:'pending',createdAt:new Date(2026,4,27,10,0)},
];

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
  const go=()=>{const u=USERS.find(x=>x.email===em.trim()&&x.password===pw);u?(setErr(''),onLogin(u)):setErr('Λάθος email ή κωδικός');};
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
        <button onClick={go} style={{width:'100%',background:BLUE,color:'white',border:'none',borderRadius:10,padding:'13px',fontSize:15,fontWeight:600,cursor:'pointer',marginTop:16,letterSpacing:0.3}}>
          Είσοδος
        </button>
        <div style={{marginTop:16,padding:'12px',background:'#F8F4F0',borderRadius:10,fontSize:12,color:'#5A5650'}}>
          <p style={{fontWeight:600,margin:'0 0 5px',color:'#1A1614'}}>Demo λογαριασμοί</p>
          <p style={{margin:'0 0 3px'}}>Διαχ/στής: <b>admin@taverna.gr</b> / <b>admin123</b></p>
          <p style={{margin:'0 0 3px'}}>Υπάλληλος: <b>nikos@taverna.gr</b> / <b>1234</b></p>
          <p style={{margin:0,color:'#8A8480',fontSize:11}}>Άλλοι: maria, kostas, eleni, giorgos, sofia, thanasis, xristos, anna @taverna.gr (κωδ: 1234)</p>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Grid ───────────────────────────
function CalGrid({sched,reqs,uid,admin,onDay}){
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
                const dd=sched[k];
                const chips=[];
                if(admin){
                  const st=daySt(dd);
                  if(st!=='full')chips.push(<Chip key="s" type="shortage" sm>Έλλειψη</Chip>);
                }else{
                  const inM=dd&&['kitchen','service','cashier'].some(c=>dd.morning[c]?.includes(uid));
                  const inE=dd&&['kitchen','service','cashier'].some(c=>dd.evening[c]?.includes(uid));
                  const hp=reqs.some(r=>r.userId===uid&&r.date===k&&r.status==='pending');
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
function EmpDay({dk,sched,reqs,uid,onBack,onReq}){
  const[modal,setModal]=useState(null);
  const[reason,setReason]=useState('');
  const dd=sched[dk];
  const inM=dd&&['kitchen','service','cashier'].some(c=>dd.morning[c]?.includes(uid));
  const inE=dd&&['kitchen','service','cashier'].some(c=>dd.evening[c]?.includes(uid));
  const submit=()=>{
    if(modal==='dayoff'&&!reason.trim())return;
    onReq({id:`r${_nid++}`,userId:uid,type:modal==='dayoff'?'dayoff':'shift',
      shiftType:modal==='dayoff'?null:modal,date:dk,reason:reason.trim(),status:'pending',createdAt:new Date()});
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
              style={{width:'100%',border:`2px solid ${reason?BLUE:'#E0DAD4'}`,borderRadius:10,padding:'10px 12px',fontSize:14,resize:'none',height:96,boxSizing:'border-box',outline:'none',fontFamily:'inherit',background:'#FAF7F4'}}/>
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
  const mine=reqs.filter(r=>r.userId===uid);
  const flt=mine.filter(r=>(sf==='all'||r.status===sf)&&(tf==='all'||r.type===tf));
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
        {[['all','Όλα'],['dayoff','Ρεπό']].map(([v,l])=>(
          <FilterBtn key={v} val={v} cur={tf} set={setTf} lbl={l}/>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {flt.length===0&&<p style={{color:'#9A9590',textAlign:'center',marginTop:32,fontSize:14}}>Δεν υπάρχουν αιτήματα</p>}
        {flt.map(r=>(
          <div key={r.id} style={{background:CARD,borderRadius:14,padding:'16px',border:'1px solid #EDE8E2'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <p style={{margin:'0 0 2px',fontWeight:600,color:'#1A1614'}}>{r.type==='dayoff'?'Ρεπό':`Αίτημα ${r.shiftType==='morning'?'Πρωινής':'Βραδινής'}`}</p>
                <p style={{margin:0,color:'#7A7570',fontSize:13}}>{fmtFull(r.date)}{r.type==='dayoff'?' · Όλη τη μέρα':r.shiftType?` · ${r.shiftType==='morning'?'Πρωινή':'Βραδινή'}`:''}</p>
              </div>
              <SBadge type={r.status}>{SL[r.status]}</SBadge>
            </div>
            {r.reason&&(
              <div style={{background:'#F8F4F0',borderRadius:8,padding:'10px 12px',marginBottom:8}}>
                <p style={{margin:'0 0 2px',fontSize:12,color:'#9A9590'}}>Αιτιολογία</p>
                <p style={{margin:0,fontSize:13,color:'#1A1614'}}>{r.reason}</p>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <p style={{margin:0,fontSize:12,color:'#9A9590'}}>{fmtTs(r.createdAt)}</p>
              {r.status==='pending'&&(
                <button onClick={()=>onCancel(r.id)} style={{border:'1px solid #FFCDD5',background:'none',color:'#A01828',borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:500}}>× Ακύρωση αιτήματος</button>
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
        {[['Όνομα',user.name],['Πόστο',user.position],['Χρόνια υπηρεσίας',`${user.years} χρόν${user.years===1?'ος':'ια'}`],['Τηλέφωνο',user.phone],['Email',user.email]].map(([l,v])=>(
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
function AdminDay({dk,sched,setSched,onBack}){
  const[adding,setAdding]=useState(null);
  const emptyDay={morning:{kitchen:[],service:[],cashier:[]},evening:{kitchen:[],service:[],cashier:[]}};
  const dd=sched[dk]||emptyDay;
  const removeEmp=(st,cat,uid)=>setSched(p=>{
    const n=JSON.parse(JSON.stringify(p[dk]||emptyDay));
    n[st][cat]=n[st][cat].filter(id=>id!==uid);
    return{...p,[dk]:n};
  });
  const addEmp=(st,uid)=>{
    const u=getUser(uid);if(!u)return;
    setSched(p=>{
      const n=JSON.parse(JSON.stringify(p[dk]||emptyDay));
      if(!n[st][u.category].includes(uid))n[st][u.category].push(uid);
      return{...p,[dk]:n};
    });
    setAdding(null);
  };
  const renderShift=(st)=>{
    const sh=dd[st],status=shiftSt(sh),lbl=st==='morning'?'Πρωινή':'Βραδινή',hrs=st==='morning'?'10:00–18:00':'18:00–02:00';
    const allIn=[...sh.kitchen,...sh.service,...sh.cashier];
    const otherSt=st==='morning'?'evening':'morning';
    const otherIn=dd[otherSt]?[...dd[otherSt].kitchen,...dd[otherSt].service,...dd[otherSt].cashier]:[];
    const avail=USERS.filter(u=>u.role==='employee'&&!allIn.includes(u.id));
    const isA=adding===st;
    return(
      <div style={{background:CARD,borderRadius:14,padding:'16px',border:'1px solid #EDE8E2',marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:6}}>
          <div><p style={{margin:'0 0 2px',fontWeight:700,fontSize:16,color:'#1A1614'}}>{lbl}</p><p style={{margin:0,color:'#7A7570',fontSize:13}}>{hrs}</p></div>
          {status==='shortage'&&<SBadge type="shortage">Έλλειψη προσωπικού</SBadge>}
          {status==='marginal'&&<SBadge type="pending">Οριακή κάλυψη</SBadge>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:14}}>
          {[['kitchen','ΚΟΥΖΙΝΑ'],['service','ΣΕΡΒΙΤΟΡΟΙ'],['cashier','ΤΑΜΕΙΟ']].map(([c,l])=>{
            const cur=sh[c].length,req=REQ[c],short=cur<req;
            return(
              <div key={c} style={{background:short?'#FFF5F5':'#F8F4F0',borderRadius:8,padding:'8px',textAlign:'center',border:`1px solid ${short?'#FFCDD5':'#EDE8E2'}`}}>
                <p style={{margin:'0 0 2px',fontSize:9,color:'#9A9590',fontWeight:700,letterSpacing:0.8}}>{l}</p>
                <p style={{margin:0,fontSize:17,fontWeight:700,color:short?'#A01828':'#1A1614'}}>{cur}/{req}</p>
              </div>
            );
          })}
        </div>
        {[['kitchen','ΚΟΥΖΙΝΑ'],['service','ΣΕΡΒΙΣ'],['cashier','ΤΑΜΕΙΟ']].map(([c,l])=>{
          if(!sh[c].length)return null;
          return(
            <div key={c} style={{marginBottom:10}}>
              <p style={{fontSize:9,color:'#9A9590',fontWeight:700,letterSpacing:1.2,margin:'0 0 5px'}}>{l}</p>
              {sh[c].map(uid=>{
                const u=getUser(uid);if(!u)return null;
                return(
                  <div key={uid} style={{display:'flex',alignItems:'center',gap:10,background:'#F8F4F0',borderRadius:10,padding:'10px 12px',marginBottom:5}}>
                    <Av initials={u.initials} size={32}/>
                    <div style={{flex:1}}><p style={{margin:'0 0 1px',fontWeight:500,fontSize:14,color:'#1A1614'}}>{u.name}</p><p style={{margin:0,fontSize:12,color:'#7A7570'}}>{u.position}</p></div>
                    <button onClick={()=>removeEmp(st,c,uid)} style={{border:'none',background:'none',cursor:'pointer',color:'#9A9590',fontSize:20,padding:'0 4px',lineHeight:1}}>×</button>
                  </div>
                );
              })}
            </div>
          );
        })}
        <button onClick={()=>setAdding(isA?null:st)} style={{width:'100%',background:BLUE,color:'white',border:'none',borderRadius:10,padding:'12px',cursor:'pointer',fontSize:14,fontWeight:600,marginTop:4}}>
          + Προσθήκη εργαζομένου
        </button>
        {isA&&(
          <div style={{background:CARD,borderRadius:10,border:'1px solid #E0DAD4',marginTop:8,boxShadow:'0 4px 14px rgba(0,0,0,0.1)'}}>
            {avail.length===0
              ?<p style={{textAlign:'center',color:'#9A9590',padding:'14px',margin:0,fontSize:13}}>Δεν υπάρχουν διαθέσιμοι</p>
              :<>
                <p style={{fontSize:12,color:'#7A7570',margin:'10px 12px 4px',fontWeight:500}}>Διαθέσιμοι εργαζόμενοι</p>
                {avail.map((u,i)=>{
                  const inOther=otherIn.includes(u.id);
                  return(
                    <button key={u.id} onClick={()=>addEmp(st,u.id)}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:'none',background:'none',cursor:'pointer',textAlign:'left',borderTop:'1px solid #F0EBE5'}}>
                      <Av initials={u.initials} size={32}/>
                      <div>
                        <p style={{margin:'0 0 1px',fontWeight:500,fontSize:14,color:'#1A1614'}}>{u.name}</p>
                        <p style={{margin:0,fontSize:12,color:inOther?'#BC5210':'#7A7570'}}>{u.position}{inOther?' · ήδη σε άλλη βάρδια':''}</p>
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
function AdminReqs({reqs,setReqs,sched}){
  const[f,setF]=useState('pending');
  const flt=reqs.filter(r=>f==='all'||r.status===f);
  const upd=(id,st)=>setReqs(p=>p.map(r=>r.id===id?{...r,status:st}:r));
  const impact=r=>{
    if(r.type!=='dayoff')return null;
    const dd=sched[r.date];if(!dd)return null;
    const u=getUser(r.userId);if(!u?.category)return null;
    const res=[];
    for(const st of['morning','evening']){
      const sh=dd[st];
      if(sh[u.category]?.includes(r.userId)){
        const nw=sh[u.category].length-1,req=REQ[u.category],lbl=st==='morning'?'Πρωινή':'Βραδινή';
        if(nw===0&&req>0)res.push({lbl,st:'shortage'});
        else if(nw<req)res.push({lbl,st:'marginal'});
        else res.push({lbl,st:'full'});
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
          const u=getUser(r.userId);if(!u)return null;
          const imp=impact(r);
          return(
            <div key={r.id} style={{background:CARD,borderRadius:14,padding:'16px',border:'1px solid #EDE8E2'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <Av initials={u.initials} size={38}/>
                <div style={{flex:1}}><p style={{margin:'0 0 1px',fontWeight:600,color:'#1A1614'}}>{u.name}</p><p style={{margin:0,color:'#7A7570',fontSize:12}}>{u.position}</p></div>
                <SBadge type={r.status}>{SL[r.status]}</SBadge>
              </div>
              <p style={{margin:'0 0 2px',fontWeight:600,color:'#1A1614'}}>{r.type==='dayoff'?'Ρεπό':`Αίτημα ${r.shiftType==='morning'?'Πρωινής':'Βραδινής'}`}</p>
              <p style={{margin:'0 0 10px',color:'#7A7570',fontSize:13}}>{fmtFull(r.date)}</p>
              {r.reason&&(
                <div style={{background:'#F8F4F0',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
                  <p style={{margin:'0 0 2px',fontSize:12,color:'#9A9590'}}>Αιτιολογία</p>
                  <p style={{margin:0,fontSize:13,color:'#1A1614'}}>{r.reason}</p>
                </div>
              )}
              {imp&&(
                <div style={{background:'#FAF7F0',borderRadius:8,padding:'10px 12px',marginBottom:10,border:'1px solid #EDE8E2'}}>
                  <p style={{margin:'0 0 5px',fontSize:12,fontWeight:600,color:'#5A5650'}}>🛡 Επηρεάζει την κάλυψη</p>
                  {imp.map(({lbl,st})=>(
                    <p key={lbl} style={{margin:'0 0 2px',fontSize:13}}>
                      <span style={{color:'#5A5650'}}>{lbl} → </span>
                      <span style={{color:st==='shortage'?'#A01828':st==='marginal'?'#9A6E0E':'#1A6B3C',fontWeight:500}}>
                        {st==='shortage'?'Έλλειψη προσωπικού':st==='marginal'?'Οριακή κάλυψη':'Πλήρης κάλυψη'}
                      </span>
                    </p>
                  ))}
                </div>
              )}
              {r.status==='pending'&&(
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>upd(r.id,'approved')} style={{flex:1,background:'#E8F7EF',color:'#1A6B3C',border:'1px solid #B3E6C8',borderRadius:10,padding:'11px',cursor:'pointer',fontSize:14,fontWeight:600}}>✓ Έγκριση</button>
                  <button onClick={()=>upd(r.id,'rejected')} style={{flex:1,background:'none',color:'#A01828',border:'1px solid #FFCDD5',borderRadius:10,padding:'11px',cursor:'pointer',fontSize:14,fontWeight:600}}>✕ Απόρριψη</button>
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
function AdminStaff({onLogout}){
  const[sel,setSel]=useState(null);
  const emps=USERS.filter(u=>u.role==='employee');
  if(sel){const u=sel;return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',padding:'16px 16px 100px'}}>
      <BackBtn onClick={()=>setSel(null)}/>
      <div style={{background:CARD,borderRadius:14,padding:'20px 16px',border:'1px solid #EDE8E2'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,paddingBottom:16,borderBottom:'1px solid #EDE8E2'}}>
          <Av initials={u.initials} size={50}/>
          <div><p style={{margin:'0 0 3px',fontWeight:700,fontSize:17,color:'#1A1614'}}>{u.name}</p><p style={{margin:0,color:'#7A7570',fontSize:14}}>{u.position}</p></div>
        </div>
        {[['Όνομα',u.name],['Πόστο',u.position],['Χρόνια υπηρεσίας',`${u.years} χρόν${u.years===1?'ος':'ια'}`],['Τηλέφωνο',u.phone],['Email',u.email]].map(([l,v])=>(
          <div key={l} style={{marginBottom:14}}>
            <p style={{margin:'0 0 2px',fontSize:12,color:BLUE,fontWeight:500}}>{l}</p>
            <p style={{margin:0,fontSize:15,fontWeight:600,color:'#1A1614'}}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );}
  return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif',padding:'16px 16px 100px'}}>
      <h2 style={{fontSize:18,fontWeight:700,margin:'0 0 2px',color:'#1A1614'}}>Προσωπικό</h2>
      <p style={{color:'#7A7570',fontSize:13,margin:'0 0 16px'}}>{emps.length} άτομα</p>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {emps.map(u=>(
          <button key={u.id} onClick={()=>setSel(u)} style={{background:CARD,borderRadius:12,padding:'14px 16px',border:'1px solid #EDE8E2',display:'flex',alignItems:'center',gap:12,cursor:'pointer',textAlign:'left',width:'100%'}}>
            <Av initials={u.initials} size={42}/>
            <div>
              <p style={{margin:'0 0 2px',fontWeight:600,fontSize:15,color:'#1A1614'}}>{u.name}</p>
              <p style={{margin:'0 0 1px',fontSize:13,color:'#7A7570'}}>{u.position}</p>
              <p style={{margin:0,fontSize:12,color:'#9A9590'}}>{u.years} χρόν{u.years===1?'ος':'ια'}</p>
            </div>
          </button>
        ))}
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
function EmpApp({user,sched,reqs,setReqs,onLogout}){
  const[tab,setTab]=useState('calendar');
  const[dk,setDk]=useState(null);
  const[toast,setToast]=useState(null);
  const pending=reqs.filter(r=>r.userId===user.id&&r.status==='pending').length;
  const submitReq=req=>{
    setReqs(p=>[req,...p]);setDk(null);
    setToast('Το αίτημά σου υποβλήθηκε επιτυχώς!');
    setTimeout(()=>setToast(null),3500);
  };
  const cancelReq=id=>setReqs(p=>p.map(r=>r.id===id?{...r,status:'cancelled'}:r));
  const changeTab=t=>{setTab(t);setDk(null);};
  return(
    <div style={{maxWidth:520,margin:'0 auto'}}>
      {tab==='calendar'&&!dk&&(
        <>
          <div style={{padding:'20px 14px 0',background:BG}}>
            <h1 style={{fontSize:20,fontWeight:700,margin:'0 0 4px',color:'#1A1614'}}>Καλημέρα, {user.firstName} 👋</h1>
          </div>
          <CalGrid sched={sched} reqs={reqs} uid={user.id} admin={false} onDay={k=>{if(isActive(k))setDk(k);}}/>
        </>
      )}
      {tab==='calendar'&&dk&&<EmpDay dk={dk} sched={sched} reqs={reqs} uid={user.id} onBack={()=>setDk(null)} onReq={submitReq}/>}
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
function AdminApp({user,sched,setSched,reqs,setReqs,onLogout}){
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
          <CalGrid sched={sched} reqs={reqs} uid={null} admin={true} onDay={k=>{if(isActive(k))setDk(k);}}/>
        </>
      )}
      {tab==='calendar'&&dk&&<AdminDay dk={dk} sched={sched} setSched={setSched} onBack={()=>setDk(null)}/>}
      {tab==='requests'&&<AdminReqs reqs={reqs} setReqs={setReqs} sched={sched}/>}
      {tab==='staff'&&<AdminStaff onLogout={onLogout}/>}
      <BotNav tab={tab} setTab={changeTab} tabs={['calendar','requests','staff']} badge={{requests:pending}}/>
    </div>
  );
}

// ─── Root ────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null);
  const[sched,setSched]=useState(()=>buildSched());
  const[reqs,setReqs]=useState(INIT_REQ);
  const logout=()=>setUser(null);
  if(!user)return<Login onLogin={setUser}/>;
  return(
    <div style={{background:BG,minHeight:'100vh'}}>
      {user.role==='admin'
        ?<AdminApp user={user} sched={sched} setSched={setSched} reqs={reqs} setReqs={setReqs} onLogout={logout}/>
        :<EmpApp user={user} sched={sched} reqs={reqs} setReqs={setReqs} onLogout={logout}/>
      }
    </div>
  );
}
