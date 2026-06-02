/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  age: number;
  budget: 'budget' | 'mid-range' | 'luxury';
  travelStyle: 'solo' | 'family' | 'friends' | 'couple';
  travelExperience: 'beginner' | 'intermediate' | 'experienced';
  interests: string[]; // e.g. ["nature", "photography", "food", "adventure", "culture", "spiritual", "wildlife"]
  startDate: string;
  endDate: string;
  previouslyVisited: string[];
}

export interface HiddenGem {
  id: string;
  name: string;
  description: string;
  category: 'village' | 'waterfall' | 'trek' | 'market' | 'viewpoint' | 'cultural';
  matchedWhy: string;
  cost: string;
  bestTime: string;
  crowdLevel: 'very low' | 'low' | 'moderate';
  safetyScore: number;
  lat: number;
  lng: number;
  location: string;
}

export interface CulturalExperience {
  id: string;
  name: string;
  date: string;
  distance: string;
  description: string;
  matchScore: number; // 0 to 100
  explanation: string; // AI generated explanation
  category: 'festival' | 'dance' | 'fair' | 'performance' | 'workshop';
  lat: number;
  lng: number;
  location: string;
}

export interface WhyNowEngine {
  summary: string;
  reasons: string[];
}

export interface SafetyInsights {
  safetyScore: number; // 0 to 10
  transportation: string;
  touristFriendliness: string;
  familyFriendliness: string;
  soloSuitability: string;
  details: string;
}

export interface NextDestination {
  india: {
    name: string;
    description: string;
    why: string;
  };
  international: {
    name: string;
    description: string;
    why: string;
  };
}

export interface ItineraryDay {
  dayNum: number;
  morning: string;
  afternoon: string;
  evening: string;
  foodSuggestion: string;
  estimatedCost: string;
}

export interface ItineraryPlan {
  durationDays: number;
  days: ItineraryDay[];
  overallCost: string;
  notes: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface DashboardData {
  profile: UserProfile;
  hiddenGems: HiddenGem[];
  experiences: CulturalExperience[];
  whyNow: WhyNowEngine;
  safety: SafetyInsights;
  nextDestinations: NextDestination;
  itinerary1Day: ItineraryPlan;
  itinerary3Day: ItineraryPlan;
  itinerary5Day: ItineraryPlan;
}
