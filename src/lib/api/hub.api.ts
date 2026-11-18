import {apiClient} from './client';
export interface PitchRole { _id?:string; title:string; skills?:string[]; isSelected?:boolean; rationale?:string; priority?:string; hireOrder?:number; offerTerms?:Record<string,unknown>; }
export interface Pitch { _id:string; startupName?:string; title?:string; tagline?:string; summary?:string; fullDescription?:string; description?:string; category?:string; fundingStage?:string; status:'draft'|'published'; tags?:string[]; recommendedRoles?:PitchRole[]; }
export interface HubOffer { id:string; roleTitle:string; status:string; startup?:{id?:string;name?:string;tagline?:string}; talent?:{name?:string;role?:string}; offerTerms?:{compensationType?:string;salary?:number;currency?:string;equity?:number;vesting?:string}; negotiations?:{note?:string;createdAt?:string;senderRole?:string;counterTerms?:{compensationType?:string;salary?:number;equity?:number;vesting?:string}}[]; collaborationId?:string; }
export interface PitchDraft {startupName:string;tagline:string;fullDescription:string;category:string;fundingStage:string;}
export interface HubTalent {id:string;name:string;username?:string;avatar?:string;bio?:string;skills?:string[];}
export interface InvitationDraft {pitchId:string;talentId:string;roleTitle:string;roleId?:string;offerTerms:{compensationType:'salary'|'equity'|'hybrid';salary:number;equity:number;currency:string;vesting:string};}
export const hubApi={
 async updatePitch(id:string,draft:PitchDraft){
  const {data}=await apiClient.put<{data:Pitch}>(`/idea-pitches/${encodeURIComponent(id)}`,{...draft,title:draft.startupName,summary:draft.tagline,description:draft.fullDescription});return data.data;
 },
 async saveRoles(id:string,roles:PitchRole[]){const {data}=await apiClient.put<{data:Pitch}>(`/idea-pitches/${encodeURIComponent(id)}/roles`,{roles});return data.data;},
 async talents(id:string,signal:AbortSignal){const {data}=await apiClient.get<{data:HubTalent[]}>(`/idea-pitches/${encodeURIComponent(id)}/matched-talents`,{signal});if(!Array.isArray(data.data))throw new Error('Unexpected talent response');return data.data;},
 async invite(draft:InvitationDraft){const {data}=await apiClient.post('/invites',draft);return data.data;},
 async pitches(mine:boolean,search:string,offset:number,signal:AbortSignal){
  const {data}=await apiClient.get<{data:Pitch[];total:number}>(mine?'/idea-pitches/my':'/idea-pitches',{params:{...(!mine&&search?{search}:{}),limit:12,offset},signal});
  if(!Array.isArray(data.data)||!Number.isFinite(data.total))throw new Error('Unexpected pitch response');
  return {pitches:data.data,total:data.total};
 },
 async offers(founder:boolean,signal:AbortSignal){
  const {data}=await apiClient.get<{data:HubOffer[]|{invites:HubOffer[]}}>(founder?'/invites/pipeline':'/invites/inbound',{signal});
  const offers=Array.isArray(data.data)?data.data:data.data?.invites;
  if(!Array.isArray(offers))throw new Error('Unexpected offer response');
  return offers;
 },
 async publish(pitchId:string,published:boolean){
  const {data}=await apiClient.patch<{data:Pitch}>(`/idea-pitches/${encodeURIComponent(pitchId)}/${published?'publish':'unpublish'}`);
  return data.data;
 },
 async respond(inviteId:string,action:'accept'|'negotiate'|'decline',body?:{note:string;counterTerms?:{salary?:number;equity?:number}}){
  const {data}=await apiClient.post(`/invites/${encodeURIComponent(inviteId)}/${action}`,body||{});
  return data;
 },
 async revise(inviteId:string,body:{note:string;offerTerms?:{compensationType?:string;salary?:number;equity?:number;vesting?:string}}){
  const {data}=await apiClient.post(`/invites/${encodeURIComponent(inviteId)}/revise`,body);
  return data;
 },
 async createDraft(draft:PitchDraft){
  const {data}=await apiClient.post<{data:Pitch}>('/idea-pitches',{...draft,status:'draft'});
  return data.data;
 }
};
