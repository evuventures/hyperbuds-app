'use client';
import {useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogTrigger} from '@/components/ui/dialog';
import {hubApi,type HubOffer,type Pitch} from '@/lib/api/hub.api';
const message=(error:unknown)=>typeof error==='object'&&error!==null&&'message' in error?String(error.message):'Unable to save your response. Try again.';

export function PitchPublication({pitch,onChanged}:{pitch:Pitch;onChanged:()=>void}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const publishing=pitch.status==='draft';
 async function submit(){setBusy(true);setError('');try{await hubApi.publish(pitch._id,publishing);setOpen(false);onChanged();}catch(e){setError(message(e));}finally{setBusy(false);}}
 return <div className="mt-5 border-t border-border pt-4">
  <Dialog open={open} onOpenChange={value=>{if(!busy)setOpen(value);}}><DialogTrigger asChild><Button variant="outline" onClick={()=>setError('')}>{publishing?'Publish pitch':'Return to draft'}</Button></DialogTrigger><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
   <DialogHeader><DialogTitle>{publishing?'Publish this pitch?':'Return this pitch to draft?'}</DialogTitle><DialogDescription>{publishing?'Your pitch and selected roles will be visible in public discovery. Review the content before publishing.':'This pitch will leave public discovery. Existing invitations and conversations are retained.'}</DialogDescription></DialogHeader>
   <p className="font-medium text-foreground">{pitch.startupName||pitch.title}</p>
   {error&&<p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
   <DialogFooter className="gap-2"><Button variant="outline" disabled={busy} onClick={()=>setOpen(false)}>Cancel</Button><Button disabled={busy} onClick={submit}>{busy?'Saving…':publishing?'Confirm publish':'Confirm return to draft'}</Button></DialogFooter>
  </DialogContent></Dialog>
 </div>;
}

type ResponseAction='accept'|'negotiate'|'decline';
export function OfferActions({offer,onChanged}:{offer:HubOffer;onChanged:()=>void}){
 const triggerRef=useRef<HTMLButtonElement|null>(null);
 const [action,setAction]=useState<ResponseAction|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [note,setNote]=useState(''),[salary,setSalary]=useState(''),[equity,setEquity]=useState('');
 if(!['pending','viewed','negotiating'].includes(offer.status))return null;
 const titles={accept:'Accept the original offer?',negotiate:'Propose different terms',decline:'Decline this offer?'};
 async function submit(event:React.FormEvent){
  event.preventDefault();if(!action||busy)return;setBusy(true);setError('');
  try{
   const counterTerms={...(salary!==''?{salary:Number(salary)}:{}),...(equity!==''?{equity:Number(equity)}:{})};
   await hubApi.respond(offer.id,action,action==='negotiate'?{note:note.trim(),counterTerms}:undefined);
   setAction(null);setNote('');setSalary('');setEquity('');onChanged();
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
  <Button onClick={event=>{triggerRef.current=event.currentTarget;setError('');setAction('accept');}}>Accept offer</Button><Button variant="outline" onClick={event=>{triggerRef.current=event.currentTarget;setError('');setAction('negotiate');}}>Negotiate</Button><Button variant="ghost" onClick={event=>{triggerRef.current=event.currentTarget;setError('');setAction('decline');}}>Decline</Button>
  <Dialog open={action!==null} onOpenChange={open=>{if(!busy&&!open)setAction(null);}}><DialogContent onCloseAutoFocus={event=>{event.preventDefault();triggerRef.current?.focus();}} className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
   <DialogHeader><DialogTitle>{action?titles[action]:''}</DialogTitle><DialogDescription>{action==='accept'?'This locks the original proposal and opens a collaboration workspace. Counterproposals do not replace the original terms. This does not execute payment or a legal agreement.':action==='decline'?'This closes the invitation. You can still review its history.':'Explain your proposed changes. The original offer stays unchanged until a separate agreement is reached.'}</DialogDescription></DialogHeader>
   <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground"><p className="font-semibold">{offer.roleTitle}</p><p className="mt-1 text-muted-foreground">{offer.startup?.name}</p><dl className="mt-3 space-y-2">
    {typeof offer.offerTerms?.salary==='number'&&<div className="flex justify-between gap-4"><dt>Original salary</dt><dd>{offer.offerTerms.currency?`${offer.offerTerms.currency} `:''}{offer.offerTerms.salary.toLocaleString()}</dd></div>}
    {typeof offer.offerTerms?.equity==='number'&&<div className="flex justify-between gap-4"><dt>Original equity</dt><dd>{offer.offerTerms.equity}%</dd></div>}
   </dl>{offer.offerTerms?.vesting&&<p className="mt-2 text-muted-foreground">Vesting: {offer.offerTerms.vesting}</p>}</div>
   <form onSubmit={submit} className="space-y-4">
    {action==='negotiate'&&<>
     <label className="grid gap-2 text-sm font-medium text-foreground">Proposal note<Textarea required maxLength={4000} value={note} onChange={e=>setNote(e.target.value)} rows={4}/></label>
     <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium text-foreground">Proposed salary (optional)<Input type="number" min="0" step="any" value={salary} onChange={e=>setSalary(e.target.value)}/></label><label className="grid gap-2 text-sm font-medium text-foreground">Proposed equity % (optional)<Input type="number" min="0" max="100" step="any" value={equity} onChange={e=>setEquity(e.target.value)}/></label></div>
     <p className="text-xs text-muted-foreground">Salary uses the original offer&apos;s currency and units.</p>
    </>}
    {error&&<p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    <DialogFooter className="gap-2"><Button type="button" variant="outline" disabled={busy} onClick={()=>setAction(null)}>Cancel</Button><Button type="submit" disabled={busy||(action==='negotiate'&&!note.trim())}>{busy?'Saving…':action==='accept'?'Confirm acceptance':action==='decline'?'Confirm decline':'Send proposal'}</Button></DialogFooter>
   </form>
  </DialogContent></Dialog>
 </div>;
}

export function FounderOfferActions({offer,onChanged}:{offer:HubOffer;onChanged:()=>void}){
 const triggerRef=useRef<HTMLButtonElement|null>(null);
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [note,setNote]=useState(''),[salary,setSalary]=useState(''),[equity,setEquity]=useState(''),[vesting,setVesting]=useState('');
 if(!['pending','viewed','negotiating'].includes(offer.status))return null;
 async function submit(event:React.FormEvent){
  event.preventDefault();if(busy||!note.trim())return;setBusy(true);setError('');
  try{
   const offerTerms={
    ...(salary!==''?{salary:Number(salary)}:{}),
    ...(equity!==''?{equity:Number(equity)}:{}),
    ...(vesting.trim()?{vesting:vesting.trim()}:{}),
   };
   await hubApi.revise(offer.id,{note:note.trim(),...(Object.keys(offerTerms).length>0?{offerTerms}:{})});
   setOpen(false);setNote('');setSalary('');setEquity('');setVesting('');onChanged();
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
  <Button variant="outline" onClick={event=>{triggerRef.current=event.currentTarget;setError('');setOpen(true);}}>Respond / Revise terms</Button>
  <Dialog open={open} onOpenChange={value=>{if(!busy)setOpen(value);}}><DialogContent onCloseAutoFocus={event=>{event.preventDefault();triggerRef.current?.focus();}} className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
   <DialogHeader><DialogTitle>Respond to negotiation or revise terms</DialogTitle><DialogDescription>Send a discussion note to the talent, or enter revised proposal figures. Revising figures updates the offer proposal and requires the talent to explicitly confirm acceptance before terms lock.</DialogDescription></DialogHeader>
   <form onSubmit={submit} className="space-y-4">
    <label className="grid gap-2 text-sm font-medium text-foreground">Founder response note<Textarea required maxLength={4000} value={note} onChange={e=>setNote(e.target.value)} rows={4}/></label>
    <div className="grid gap-4 sm:grid-cols-3">
     <label className="grid gap-2 text-sm font-medium text-foreground">Revised salary (optional)<Input type="number" min="0" step="any" value={salary} onChange={e=>setSalary(e.target.value)}/></label>
     <label className="grid gap-2 text-sm font-medium text-foreground">Revised equity % (optional)<Input type="number" min="0" max="100" step="any" value={equity} onChange={e=>setEquity(e.target.value)}/></label>
     <label className="grid gap-2 text-sm font-medium text-foreground">Revised vesting (optional)<Input type="text" maxLength={500} value={vesting} onChange={e=>setVesting(e.target.value)}/></label>
    </div>
    {error&&<p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    <DialogFooter className="gap-2"><Button type="button" variant="outline" disabled={busy} onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit" disabled={busy||!note.trim()}>{busy?'Saving…':'Send response'}</Button></DialogFooter>
   </form>
  </DialogContent></Dialog>
 </div>;
}