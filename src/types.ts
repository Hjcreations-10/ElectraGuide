/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VoterProfile {
  age?: number;
  location?: string;
  hasId: boolean;
  language: string;
}

export interface VoterStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
  actionLabel?: string;
}

export interface ElectionData {
  year: number;
  turnout: number;
  totalSeats: number;
  registeredVoters: number;
}

export interface StateData {
  state: string;
  turnout: number;
  lastElection: string;
}

export type AppTab = 'assistant' | 'journey' | 'dashboard' | 'misinformation';

export interface PartyResult {
  name: string;
  value: number;
  color: string;
  voters: number;
}

export interface VoterDemographics {
  male: number;
  female: number;
  senior: number; // >60
}

export interface DashboardRegion {
  id: string;
  name: string;
  totalSeats: number;
  registeredVoters: string; // display string
  votersNum: number; // numeric for calculations
  totalPopulation: string;
  populationNum: number;
  participation: { name: string; value: number; color: string }[];
  partyResults: PartyResult[];
  demographics: VoterDemographics;
  previousTurnout: number;
  urbanTurnout: number;
  ruralTurnout: number;
  youthVoters: number; // in millions
  mapCoords: { top: string; left: string };
}
