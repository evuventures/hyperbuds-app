# Component Refactoring Plan

## Overview
Breaking down components that exceed 500 lines into smaller, maintainable components and ensuring color consistency across the application.

## Components Over 500 Lines

### 1. ProfileEdit/Card.tsx (1323 lines) - **PRIORITY 1**
**Breakdown Plan:**
- `AvatarUploadSection.tsx` (~150 lines) - Avatar upload/URL input
- `BasicInfoSection.tsx` (~100 lines) - Display name and bio
- `NichesSection.tsx` (~200 lines) - Niche selection dropdown
- `LocationSection.tsx` (~80 lines) - City, state, country inputs
- `ProfileEditForm.tsx` (~300 lines) - Main form orchestrator
- Keep main `Card.tsx` as container (~200 lines)

**Status:** In Progress

### 2. profile/complete-profile/page.jsx (1081 lines) - **PRIORITY 2**
**Breakdown Plan:**
- Similar structure to ProfileEdit
- Extract same sections as above
- `CompleteProfilePage.tsx` as main orchestrator

### 3. ProfileCard.jsx (886 lines) - **PRIORITY 3**
**Breakdown Plan:**
- `ProfileHeader.tsx` - Header section with avatar/name
- `ProfileStats.tsx` - Stats display
- `ProfileBio.tsx` - Bio and description
- `ProfileActions.tsx` - Action buttons
- `ProfileCard.tsx` - Main container

### 4. RizzScoreDisplay.tsx (671 lines) - **PRIORITY 4**
**Breakdown Plan:**
- `RizzScoreHeader.tsx` - Score display header
- `RizzScoreFactors.tsx` - Factor breakdown
- `RizzScoreChart.tsx` - Chart visualization
- `RizzScoreDisplay.tsx` - Main container

### 5. collaborations/page.tsx (675 lines) - **PRIORITY 5**
**Breakdown Plan:**
- `CollaborationFilters.tsx` - Filter section
- `CollaborationList.tsx` - List display
- `CollaborationCard.tsx` - Individual card
- `CollaborationsPage.tsx` - Main page

### 6. Other Components (500-600 lines)
- `matching/page.tsx` (559 lines)
- `marketplace/services/create/page.tsx` (545 lines)
- `PaymentForm/StripeForm.tsx` (542 lines)
- `ChatInterface/ChatInput.tsx` (526 lines)
- `collaborations/[id]/page.tsx` (511 lines)
- `rizz-score/page.tsx` (510 lines)

## Color Consistency

### Created Files
- ✅ `src/constants/colors.ts` - Centralized color constants

### Migration Plan
1. Replace hardcoded color classes with constants from `colors.ts`
2. Update components to use consistent color patterns:
   - Brand colors: `brandColors.primary.*`
   - Status colors: `statusColors.*`
   - Background colors: `backgroundColors.*`
   - Text colors: `textColors.*`

### Components to Update
- All components using hardcoded Tailwind color classes
- Priority: Components with most color variations first

## Progress Tracking

- [x] Create color constants file
- [x] Create social URL validation utility
- [ ] Break down ProfileEdit/Card.tsx
- [ ] Break down complete-profile/page.jsx
- [ ] Break down ProfileCard.jsx
- [ ] Break down RizzScoreDisplay.tsx
- [ ] Break down collaborations/page.tsx
- [ ] Update color usage across all components
- [ ] Break down remaining large components

## Notes
- Each extracted component should be < 300 lines
- Maintain existing functionality during refactoring
- Use TypeScript for all new components
- Follow existing folder structure patterns
