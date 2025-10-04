"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Save } from "lucide-react";

interface PreferencesFormProps {
   onSubmit: (preferences: Record<string, unknown>) => void;
   isSubmitting: boolean;
}

const collaborationTypes = [
   { id: "live-stream", label: "Live Stream", description: "Real-time streaming collaborations" },
   { id: "duet", label: "Duet", description: "Synchronized content creation" },
   { id: "reaction", label: "Reaction", description: "Reacting to each other's content" },
   { id: "podcast", label: "Podcast", description: "Audio content collaborations" },
   { id: "tutorial", label: "Tutorial", description: "Educational content together" },
   { id: "challenge", label: "Challenge", description: "Fun challenges and games" },
   { id: "review", label: "Review", description: "Product or content reviews" },
   { id: "interview", label: "Interview", description: "Creator interviews" }
];

const locations = [
   "United States", "Canada", "United Kingdom", "Australia", "Germany", "France",
   "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Japan",
   "South Korea", "Brazil", "Mexico", "Argentina", "India", "Singapore", "Global"
];

const niches = [
   "gaming", "lifestyle", "beauty", "fashion", "fitness", "food", "travel",
   "music", "art", "tech", "business", "education", "entertainment", "sports",
   "comedy", "dance", "photography", "writing", "podcasting", "streaming"
];

const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSubmit, isSubmitting }) => {
   const [preferences, setPreferences] = useState({
      collaborationTypes: [] as string[],
      audienceSize: { min: 1000, max: 1000000 },
      locations: [] as string[],
      niches: [] as string[],
      maxDistance: 100,
      timezone: "UTC",
      language: "English",
      experienceLevel: "any",
      contentFrequency: "weekly"
   });


   const handleCollaborationTypeChange = useCallback((typeId: string, checked: boolean) => {
      setPreferences(prev => ({
         ...prev,
         collaborationTypes: checked
            ? [...prev.collaborationTypes, typeId]
            : prev.collaborationTypes.filter(id => id !== typeId)
      }));
   }, []);

   const handleLocationAdd = (location: string) => {
      if (location && !preferences.locations.includes(location)) {
         setPreferences(prev => ({
            ...prev,
            locations: [...prev.locations, location]
         }));
      }
   };

   const handleLocationRemove = (location: string) => {
      setPreferences(prev => ({
         ...prev,
         locations: prev.locations.filter(loc => loc !== location)
      }));
   };

   const handleNicheAdd = (niche: string) => {
      if (niche && !preferences.niches.includes(niche)) {
         setPreferences(prev => ({
            ...prev,
            niches: [...prev.niches, niche]
         }));
      }
   };

   const handleNicheRemove = (niche: string) => {
      setPreferences(prev => ({
         ...prev,
         niches: prev.niches.filter(n => n !== niche)
      }));
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(preferences);
   };

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6 }}
         className="mx-auto max-w-4xl"
      >
         <Card className="border border-gray-200 backdrop-blur-sm bg-white/80 dark:bg-white/10 dark:border-white/20">
            <CardHeader>
               <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  Collaboration Preferences
               </CardTitle>
               <p className="text-center text-gray-600 dark:text-white/70">
                  Tell us about your ideal collaboration partners and we&apos;ll find the perfect matches!
               </p>
            </CardHeader>

            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Collaboration Types */}
                  <div className="space-y-4">
                     <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                        Collaboration Types
                     </Label>
                     <p className="text-sm text-gray-600 dark:text-white/70">
                        What types of collaborations are you interested in?
                     </p>
                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {collaborationTypes.map((type) => {
                           const isSelected = preferences.collaborationTypes.includes(type.id);
                           return (
                              <div
                                 key={type.id}
                                 className={`flex items-start space-x-3 p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${isSelected
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50 hover:from-purple-500/30 hover:to-pink-500/30'
                                    : 'bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                                    }`}
                              >
                                 <Checkbox
                                    id={type.id}
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                       handleCollaborationTypeChange(type.id, checked as boolean)
                                    }
                                    className={`mt-1 cursor-pointer ${isSelected
                                       ? 'data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 '
                                       : ''
                                       }`}
                                 />
                                 <div className="flex-1">
                                    <Label
                                       htmlFor={type.id}
                                       className={`font-medium cursor-pointer transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                                          }`}
                                    >
                                       {type.label}
                                    </Label>
                                    <p className={`text-sm mt-1 transition-colors ${isSelected ? 'text-gray-600 dark:text-white/80' : 'text-gray-500 dark:text-white/60'
                                       }`}>
                                       {type.description}
                                    </p>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Audience Size */}
                  <div className="space-y-4">
                     <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                        Preferred Audience Size
                     </Label>
                     <p className="text-sm text-gray-600 dark:text-white/70">
                        What audience size range are you looking for in collaborators?
                     </p>
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <Label className="text-sm text-gray-600 dark:text-white/80">Minimum Followers</Label>
                              <Input
                                 type="number"
                                 value={preferences.audienceSize.min}
                                 onChange={(e) => setPreferences(prev => ({
                                    ...prev,
                                    audienceSize: { ...prev.audienceSize, min: parseInt(e.target.value) || 0 }
                                 }))}
                                 className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 placeholder-gray-500 dark:placeholder-white/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                 placeholder="1000"
                              />
                           </div>
                           <div>
                              <Label className="text-sm text-gray-600 dark:text-white/80">Maximum Followers</Label>
                              <Input
                                 type="number"
                                 value={preferences.audienceSize.max}
                                 onChange={(e) => setPreferences(prev => ({
                                    ...prev,
                                    audienceSize: { ...prev.audienceSize, max: parseInt(e.target.value) || 1000000 }
                                 }))}
                                 className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 placeholder-gray-500 dark:placeholder-white/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                 placeholder="1000000"
                              />
                           </div>
                        </div>
                        <div className="text-sm text-center text-gray-500 dark:text-white/60">
                           {preferences.audienceSize.min.toLocaleString()} - {preferences.audienceSize.max.toLocaleString()} followers
                        </div>
                     </div>
                  </div>

                  {/* Locations */}
                  <div className="space-y-4">
                     <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                        Preferred Locations
                     </Label>
                     <p className="text-sm text-gray-600 dark:text-white/70">
                        Where would you like your collaborators to be located?
                     </p>

                     {/* Selected Locations */}
                     {preferences.locations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                           {preferences.locations.map((location) => (
                              <Badge
                                 key={location}
                                 variant="outline"
                                 className="text-gray-900 bg-gray-100 border-gray-300 dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
                              >
                                 {location}
                                 <button
                                    type="button"
                                    onClick={() => handleLocationRemove(location)}
                                    className="ml-2 hover:text-red-400"
                                 >
                                    <X className="w-3 h-3 cursor-pointer" />
                                 </button>
                              </Badge>
                           ))}
                        </div>
                     )}

                     {/* Add Location */}
                     <div className="flex gap-2">
                        <Select onValueChange={handleLocationAdd}>
                           <SelectTrigger className="flex-1 text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 [&>svg]:text-gray-900 dark:[&>svg]:text-white cursor-pointer focus:border-gray-400 dark:focus:border-white/30 focus:ring-0">
                              <SelectValue placeholder="Select a location" />
                           </SelectTrigger>
                           <SelectContent className="bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                              {locations.map((location) => (
                                 <SelectItem
                                    key={location}
                                    value={location}
                                    className="text-gray-900 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700"
                                 >
                                    {location}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        {/* <Button
                           type="button"
                           onClick={() => handleLocationAdd(customLocation)}
                           disabled={!customLocation}
                           className="text-gray-900 dark:text-white bg-white/10 border-white/20 hover:bg-white/20"
                        >
                           <Plus className="w-4 h-4" />
                        </Button> */}
                     </div>
                  </div>

                  {/* Niches */}
                  <div className="space-y-4">
                     <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                        Preferred Niches
                     </Label>
                     <p className="text-sm text-gray-600 dark:text-white/70">
                        What content niches are you most interested in collaborating on?
                     </p>

                     {/* Selected Niches */}
                     {preferences.niches.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                           {preferences.niches.map((niche) => (
                              <Badge
                                 key={niche}
                                 variant="outline"
                                 className="text-gray-900 bg-gray-100 border-gray-300 dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
                              >
                                 #{niche}
                                 <button
                                    type="button"
                                    onClick={() => handleNicheRemove(niche)}
                                    className="ml-2 hover:text-red-400"
                                 >
                                    <X className="w-3 h-3 cursor-pointer" />
                                 </button>
                              </Badge>
                           ))}
                        </div>
                     )}

                     {/* Add Niche */}
                     <div className="flex gap-2">
                        <Select onValueChange={handleNicheAdd}>
                           <SelectTrigger className="flex-1 text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 [&>svg]:text-gray-900 dark:[&>svg]:text-white cursor-pointer focus:border-gray-400 dark:focus:border-white/30 focus:ring-0">
                              <SelectValue placeholder="Select a niche" />
                           </SelectTrigger>
                           <SelectContent className="bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                              {niches.map((niche) => (
                                 <SelectItem
                                    key={niche}
                                    value={niche}
                                    className="text-gray-900 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700"
                                 >
                                    #{niche}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  {/* Additional Preferences */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <Label className="flex gap-3 items-center text-xl font-bold text-gray-900 dark:text-white">
                              <div className="flex relative justify-center items-center w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full shadow-lg transition-all duration-300 animate-pulse hover:shadow-xl hover:scale-110">
                                 <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full opacity-20 animate-spin"></div>
                                 <div className="absolute inset-1 bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 rounded-full opacity-30 animate-ping"></div>
                                 <svg className="relative z-10 w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                 </svg>
                              </div>
                              Maximum Distance
                           </Label>
                           <p className="ml-11 text-sm font-medium text-gray-600 dark:text-white/80">
                              How far are you willing to travel for collaborations?
                           </p>
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-6">
                              {/* Distance Options */}
                              <div className="grid grid-cols-3 gap-2">
                                 {[
                                    { value: 50, label: "50 km", desc: "Local" },
                                    { value: 100, label: "100 km", desc: "Nearby" },
                                    { value: 250, label: "250 km", desc: "Regional" },
                                    { value: 500, label: "500 km", desc: "State" },
                                    { value: 750, label: "750 km", desc: "Multi-state" },
                                    { value: 1000, label: "1000 km", desc: "Nationwide" }
                                 ].map((option) => (
                                    <button
                                       key={option.value}
                                       type="button"
                                       onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setPreferences(prev => ({ ...prev, maxDistance: option.value }));
                                       }}
                                       className={`p-3 cursor-pointer rounded-lg text-center transition-all duration-300 border ${preferences.maxDistance === option.value
                                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400/30 hover:from-purple-600 hover:to-pink-600'
                                          : 'bg-gray-100 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600/30 hover:bg-gray-200 dark:hover:bg-slate-700/50 hover:border-gray-400 dark:hover:border-slate-500/50'
                                          }`}
                                    >
                                       <div className="text-sm font-bold">{option.label}</div>
                                       <div className={`text-xs ${preferences.maxDistance === option.value ? 'text-white/80' : 'text-gray-500 dark:text-slate-400'}`}>
                                          {option.desc}
                                       </div>
                                    </button>
                                 ))}
                              </div>

                              {/* Current Selection Display */}
                              <div className="text-center">
                                 <div className="inline-flex gap-2 items-center px-4 py-2 bg-gradient-to-r rounded-full border backdrop-blur-sm from-purple-500/20 to-pink-500/20 border-purple-500/30">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                       {preferences.maxDistance} km
                                    </span>
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <Label className="flex gap-3 items-center text-xl font-bold text-gray-900 dark:text-white">
                              <div className="flex relative justify-center items-center w-10 h-10 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full shadow-lg transition-all duration-300 animate-pulse hover:shadow-xl hover:scale-110">
                                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full opacity-20 animate-spin"></div>
                                 <div className="absolute inset-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 rounded-full opacity-30 animate-ping"></div>
                                 <svg className="relative z-10 w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                              </div>
                              Content Frequency
                           </Label>
                           <p className="ml-11 text-sm font-medium text-gray-600 dark:text-white/80">
                              How often do you create content?
                           </p>
                        </div>
                        <Select
                           value={preferences.contentFrequency}
                           onValueChange={(value) => setPreferences(prev => ({ ...prev, contentFrequency: value }))}
                        >
                           <SelectTrigger className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 [&>svg]:text-gray-900 dark:[&>svg]:text-white cursor-pointer focus:border-gray-400 dark:focus:border-white/30 focus:ring-0">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                              <SelectItem value="daily" className="text-gray-900 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700">Daily</SelectItem>
                              <SelectItem value="weekly" className="text-gray-900 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700">Weekly</SelectItem>
                              <SelectItem value="bi-weekly" className="text-gray-900 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700">Bi-weekly</SelectItem>
                              <SelectItem value="monthly" className="text-gray-900 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700">Monthly</SelectItem>
                              <SelectItem value="flexible" className="text-gray-900 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700">Flexible</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center px-2 pt-6">
                     <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full max-w-md px-4 sm:px-8 py-3 text-sm sm:text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02]"
                     >
                        {isSubmitting ? (
                           <>
                              <div className="mr-2 w-4 h-4 rounded-full border-2 animate-spin sm:w-5 sm:h-5 border-white/30 border-t-white" />
                              <span className="hidden sm:inline">Finding Matches...</span>
                              <span className="sm:hidden">Finding...</span>
                           </>
                        ) : (
                           <>
                              <Save className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">Save Preferences & Find Matches</span>
                              <span className="sm:hidden">Save & Find Matches</span>
                           </>
                        )}
                     </Button>
                  </div>
               </form>
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default PreferencesForm;
