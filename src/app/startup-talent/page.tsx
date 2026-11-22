'use client';
import {useEffect,useState} from 'react';
import {PitchWorkspace} from '@/components/hub/PitchWorkspace';
import {FounderOfferActions, OfferActions, PitchPublication} from '@/components/hub/HubActions';
import Link from 'next/link';
import {ArrowRight,BriefcaseBusiness,Building2,Search,Plus,RefreshCw,Layers,Sparkles,ShieldAlert,CheckCircle2,GitCompareArrows} from 'lucide-react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { CardGridSkeleton } from '@/components/ui/AppSkeletons';
import {useAppSelector} from '@/store/hooks';
import {hubApi, type Pitch, type PitchDraft, type HubOffer} from '@/lib/api/hub.api';
const control='rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800';
const action='inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50';
const label=(value?:string)=>value?.replaceAll('_',' ')||'Not specified';
const errorText=(error:unknown)=>typeof error==='object'&&error!==null&&'message' in error?String(error.message):'Unable to load this workspace. Try again.';
const initialDraft:PitchDraft={startupName:'',tagline:'',fullDescription:'',category:'',fundingStage:'just_an_idea'};
export default function StartupTalentPage(){
 const user=useAppSelector(state=>state.auth.user);
 const founder=user?.role==='founder';
 const [tab,setTab]=useState<'discover'|'mine'|'offers'>('discover');
 const [search,setSearch]=useState(''),[query,setQuery]=useState(''),[offset,setOffset]=useState(0),[revision,setRevision]=useState(0);
 const [pitches,setPitches]=useState<Pitch[]>([]),[offers,setOffers]=useState<HubOffer[]>([]),[total,setTotal]=useState(0);
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[creating,setCreating]=useState(false),[saving,setSaving]=useState(false),[draft,setDraft]=useState(initialDraft),[saveError,setSaveError]=useState('');
 useEffect(()=>{setPitches([]);setOffers([]);setOffset(0);setTab('discover');setDraft(initialDraft);setCreating(false);},[user?.id,user?._id]);
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError('');setPitches([]);setOffers([]);
  if(!user&&tab!=='discover'){setLoading(false);return ()=>controller.abort();}
  const load=async()=>{
   try{
    if(tab==='offers'){const result=await hubApi.offers(founder,controller.signal);if(!controller.signal.aborted)setOffers(result);}
    else{const result=await hubApi.pitches(tab==='mine'&&founder,query,offset,controller.signal);if(!controller.signal.aborted){setPitches(result.pitches);setTotal(result.total);}}
   }catch(e){if(!controller.signal.aborted)setError(errorText(e));}
   finally{if(!controller.signal.aborted)setLoading(false);}
  };void load();return ()=>controller.abort();
 },[tab,founder,user?.id,user?._id,query,offset,revision]);
 const changeTab=(next:typeof tab)=>{setTab(next);setOffset(0);setCreating(false);};
 async function save(event:React.FormEvent){
  event.preventDefault();if(saving)return;setSaving(true);setSaveError('');
  try{await hubApi.createDraft(draft);setDraft(initialDraft);setCreating(false);setTab('mine');setOffset(0);setRevision(v=>v+1);}
  catch(e){setSaveError(errorText(e));}finally{setSaving(false);}
 }
 const openRolesCount=pitches.reduce((acc,p)=>acc+(p.recommendedRoles?.filter(r=>r.isSelected!==false).length||0),0);
 return <DashboardLayout><section aria-label="Startup and Talent workspace" className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
  {/* Linear + LinkedIn Command Header */}
  <header className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
   <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="max-w-2xl">
     <div className="mb-2 flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300">
       <Layers size={12}/>Linear · LinkedIn Deal Flow
      </span>
      <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
       Mode: {founder?'Founder Workspace':'Talent Workspace'}
      </span>
     </div>
     <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Startup &amp; Talent Hub</h1>
     <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Discover ideas, explore open roles, and keep your founder and talent conversations in one structured pipeline.</p>
    </div>
    <div className="flex flex-wrap items-center gap-2.5">
     {founder&&<button className={action} onClick={()=>{setCreating(v=>!v);setSaveError('');}} aria-expanded={creating} aria-controls="pitch-draft"><Plus size={16}/>New pitch</button>}
    </div>
   </div>

   {/* Linear KPI Strip & View Switcher */}
   <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
    <nav aria-label="Hub views" className="flex flex-wrap gap-2">
     {([{id:'discover',name:'Discover pitches'},...(founder?[{id:'mine',name:'My pitches'}]:[]),...(user?[{id:'offers',name:founder?'Team pipeline':'My opportunities'}]:[])] as {id:typeof tab;name:string}[]).map(item=><button key={item.id} aria-pressed={tab===item.id} onClick={()=>changeTab(item.id)} className={tab===item.id?action:control}>{item.name}</button>)}
    </nav>
    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
     <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"/><strong>{total||pitches.length}</strong> Active Pitches</span>
     <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500"/><strong>{openRolesCount}</strong> Open Roles</span>
     <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"/><strong>{offers.length}</strong> Tracked Proposals</span>
    </div>
   </div>
  </header>

  {/* Draft Pitch Composer Drawer */}
  {creating&&founder&&<section id="pitch-draft" aria-labelledby="draft-title" className="rounded-xl border border-indigo-200 bg-white p-5 sm:p-6 dark:border-indigo-900/60 dark:bg-slate-900">
   <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
    <div>
     <h2 id="draft-title" className="text-lg font-semibold text-slate-900 dark:text-white">Create a draft pitch</h2>
     <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Save your idea privately before publishing it to the talent directory.</p>
    </div>
    <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">DRAFT-NEW</span>
   </div>
   <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2">
    {([{key:'startupName',name:'Startup name',max:120},{key:'tagline',name:'One-line pitch',max:250},{key:'category',name:'Category',max:100}] as const).map(field=><label key={field.key} className="grid gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">{field.name}<input className={control} required maxLength={field.max} value={draft[field.key]} onChange={e=>setDraft({...draft,[field.key]:e.target.value})}/></label>)}
    <label className="grid gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">Funding stage<select className={control} value={draft.fundingStage} onChange={e=>setDraft({...draft,fundingStage:e.target.value})}>{['just_an_idea','pre_seed','mvp_built','seed','series_a'].map(stage=><option key={stage} value={stage}>{label(stage)}</option>)}</select></label>
    <label className="grid gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:col-span-2">Description<textarea className={control} rows={4} required maxLength={10000} value={draft.fullDescription} onChange={e=>setDraft({...draft,fullDescription:e.target.value})}/></label>
    {saveError&&<p role="alert" className="text-sm text-red-700 dark:text-red-300 sm:col-span-2">{saveError}</p>}
    <div className="flex gap-2.5 pt-1"><button disabled={saving} className={action}>{saving?'Saving…':'Save draft'}</button><button type="button" disabled={saving} className={control} onClick={()=>setCreating(false)}>Cancel</button></div>
   </form>
  </section>}

  {/* Search Filter Bar */}
  {tab==='discover'&&<form onSubmit={e=>{e.preventDefault();setOffset(0);setQuery(search.trim());}} className="flex gap-2.5"><label className="relative min-w-0 flex-1"><span className="sr-only">Search pitches</span><Search size={16} aria-hidden="true" className="absolute left-3.5 top-3 text-slate-400"/><input className={`${control} w-full pl-9`} placeholder="Search ideas, categories, and open startup roles…" value={search} maxLength={100} onChange={e=>setSearch(e.target.value)}/></label><button className={action}>Search</button></form>}

  {loading?<CardGridSkeleton count={4} columns={2} />:error?<div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-red-700 dark:border-red-900 dark:bg-slate-900 dark:text-red-300"><p>{error}</p><button className={`${control} mt-4`} onClick={()=>setRevision(v=>v+1)}><RefreshCw size={16} className="mr-2 inline"/>Try again</button></div>:tab==='offers'?<section aria-label={founder?'Team pipeline':'My opportunities'} className="space-y-4">
   {offers.length===0?<Empty title={founder?'No invitations sent yet':'No opportunities yet'} text={founder?'Invitations you send will appear here with their current status.':'Your invitations will appear here when a founder reaches out.'}/>:offers.map((offer,idx)=><article key={offer.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    {/* Linear Issue Header Bar */}
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40">
     <div className="flex flex-wrap items-center gap-2.5">
      <span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
       OFFER-{String(idx+1).padStart(2,'0')}
      </span>
      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{offer.startup?.name}</p>
      <span className="text-slate-300 dark:text-slate-700">/</span>
      <h2 className="text-base font-bold text-slate-900 dark:text-white">{offer.roleTitle}</h2>
      {founder&&offer.talent?.name&&<span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{offer.talent.name}</span>}
     </div>
     <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-0.5 text-xs font-semibold capitalize text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
       <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"/>{label(offer.status)}
      </span>
      {offer.collaborationId&&<Link className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" href={`/collaborations/${encodeURIComponent(offer.collaborationId)}`}>Open collaboration<ArrowRight size={13}/></Link>}
     </div>
    </div>

    {/* 2-Column Split Comparison: Left = Current Offer Terms | Right = Negotiation History & Actions */}
    <div className="grid gap-6 p-5 lg:grid-cols-12">
     <div className="space-y-4 lg:col-span-5">
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
       <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Baseline Offer Terms</p>
       <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-slate-500 dark:text-slate-400">Compensation</dt><dd className="mt-0.5 font-semibold capitalize text-slate-900 dark:text-slate-100">{label(offer.offerTerms?.compensationType)}</dd></div>
        {typeof offer.offerTerms?.salary==='number'&&<div><dt className="text-xs text-slate-500 dark:text-slate-400">Offered salary</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{offer.offerTerms.currency?`${offer.offerTerms.currency} `:''}{offer.offerTerms.salary.toLocaleString()}</dd></div>}
        {typeof offer.offerTerms?.equity==='number'&&<div><dt className="text-xs text-slate-500 dark:text-slate-400">Offered equity</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{offer.offerTerms.equity}%</dd></div>}
       </dl>
       {offer.offerTerms?.vesting&&<p className="mt-3 border-t border-slate-200/80 pt-2.5 text-xs text-slate-600 dark:border-slate-700/70 dark:text-slate-300">Vesting: {offer.offerTerms.vesting}</p>}
      </div>
     </div>

     <div className="space-y-4 lg:col-span-7">
      {!!offer.negotiations?.length&&<details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
       <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-300">
        <span className="inline-flex items-center gap-2"><GitCompareArrows size={15}/>Negotiation history</span>
        <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{offer.negotiations.length} {offer.negotiations.length===1?'entry':'entries'}</span>
       </summary>
       <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
        <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"/>
        <span>Counterproposals are discussion records. They do not replace the original offer or execute an agreement.</span>
       </div>
       <ul className="mt-3 space-y-2.5">
        {offer.negotiations.map((n,i)=><li key={i} className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200">
         <p className="text-xs leading-relaxed"><span className="font-semibold capitalize text-slate-900 dark:text-white">{n.senderRole}: </span>{n.note}</p>
         {n.counterTerms&&<dl className="mt-2.5 grid gap-2 border-t border-slate-200 pt-2.5 text-xs dark:border-slate-700 sm:grid-cols-3">
          <div><dt className="text-slate-500 dark:text-slate-400">Proposed salary</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">{typeof n.counterTerms.salary==='number'?`${offer.offerTerms?.currency?`${offer.offerTerms.currency} `:''}${n.counterTerms.salary.toLocaleString()}`:'Unchanged'}</dd></div>
          <div><dt className="text-slate-500 dark:text-slate-400">Proposed equity</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">{typeof n.counterTerms.equity==='number'?`${n.counterTerms.equity}%`:'Unchanged'}</dd></div>
          <div><dt className="text-slate-500 dark:text-slate-400">Vesting</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">{n.counterTerms.vesting||'Unchanged'}</dd></div>
         </dl>}
        </li>)}
       </ul>
      </details>}
      <div className="pt-1">
       {founder?<FounderOfferActions offer={offer} onChanged={()=>setRevision(v=>v+1)}/>:<OfferActions offer={offer} onChanged={()=>setRevision(v=>v+1)}/>}
      </div>
     </div>
    </div>
   </article>)}
  </section>:<section aria-label="Startup pitches">
   <div className="mb-4 flex items-center justify-between">
    <h2 className="text-base font-bold text-slate-900 dark:text-white">{tab==='mine'?'Your pitches':'Explore startups'}</h2>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{total} {total===1?'pitch':'pitches'}</p>
   </div>
   {pitches.length===0?<Empty title={query?'No pitches match your search':'No pitches yet'} text={tab==='mine'?'Create a draft to start shaping your idea.':'Published startup ideas will appear here.'}/>:<div className="grid gap-5 lg:grid-cols-2">{pitches.map((pitch,idx)=><article key={pitch._id} className="flex min-w-0 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
    <div>
     {/* Top Pitch Meta Row */}
     <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
      <div className="flex items-center gap-3">
       <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
        <Building2 size={20}/>
       </span>
       <div>
        <div className="flex items-center gap-2">
         <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">PITCH-{String(idx+1).padStart(2,'0')}</span>
         {pitch.category&&<span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{pitch.category}</span>}
        </div>
        <h3 className="mt-0.5 break-words text-lg font-bold text-slate-950 dark:text-white">{pitch.startupName||pitch.title}</h3>
       </div>
      </div>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
       {label(pitch.fundingStage)}{tab==='mine'?` · ${pitch.status}`:''}
      </span>
     </div>

     {/* Tagline */}
     <p className="mt-3.5 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">{pitch.tagline||pitch.summary}</p>

     {/* Open Roles Strip */}
     {!!pitch.recommendedRoles?.filter(r=>r.isSelected!==false).length&&(
      <div className="mt-4">
       <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Open Target Roles</p>
       <div className="flex flex-wrap gap-1.5">
        {pitch.recommendedRoles.filter(r=>r.isSelected!==false).map((role,i)=><span key={role._id||i} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"><Sparkles size={11} className="text-indigo-500"/>{role.title}</span>)}
       </div>
      </div>
     )}

     {/* Pitch Details Accordion */}
     <details className="mt-4 rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-800/30">
      <summary className="cursor-pointer text-xs font-semibold text-indigo-600 focus-visible:outline-2 dark:text-indigo-300">View pitch details<span className="sr-only"> for {pitch.startupName||pitch.title}</span></summary>
      <p className="mt-2.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-600 dark:text-slate-300">{pitch.fullDescription||pitch.description||'No further description provided.'}</p>
     </details>
    </div>

    {tab==='mine'&&<div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800"><PitchWorkspace pitch={pitch} onChanged={()=>setRevision(v=>v+1)}/><PitchPublication pitch={pitch} onChanged={()=>setRevision(v=>v+1)}/></div>}
   </article>)}</div>}
   {total>12&&<div className="mt-6 flex items-center justify-between gap-3"><button className={control} disabled={offset===0} onClick={()=>setOffset(Math.max(0,offset-12))}>Previous</button><span className="text-sm text-slate-600 dark:text-slate-300">Page {Math.floor(offset/12)+1} of {Math.ceil(total/12)}</span><button className={control} disabled={offset+12>=total} onClick={()=>setOffset(offset+12)}>Next</button></div>}
  </section>}
 </section></DashboardLayout>;
}
function Empty({title,text}:{title:string;text:string}){return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900"><BriefcaseBusiness className="mx-auto mb-3 text-indigo-500"/><h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{text}</p></div>;}
