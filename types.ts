export interface TeamMember {
  id: string;
  name: string;
  role?: string;
}

export interface DailyUpdate {
  memberId: string;
  memberName: string;
  demands: string;
  updates: string;
  timestamp: number;
}

export interface AIResponse {
  icebreaker?: string;
  summary?: string;
}

export interface Sector {
  id: string;
  name: string;
  manager: string;
  members: TeamMember[];
  themeFrom: string;
  themeTo: string;
}
