export interface Union {
  id: string;
  name: string;
  description?: string;
  category: string;
  scope: string;
  scopeValue?: string;
  creatorId: string;
  governanceRules?: any;
  memberCount: number;
  pledgedCount: number;
  districtCount: number;
  powerIndex: string;
  createdAt: Date;
}

export interface UnionDemand {
  id: string;
  unionId: string;
  demandText: string;
  supportPercentage: string;
  voteCount: number;
  priority: number;
  createdAt: Date;
}

export interface Pledge {
  id: string;
  userId: string;
  unionId: string;
  candidateId?: string;
  isPublic: boolean;
  conditions?: any;
  status: string;
  createdAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  district: string;
  state: string;
  position: string;
  stances?: any;
  pledgeCount: number;
  alignmentScore: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  date: Date;
  location?: string;
  isVirtual: boolean;
  organizerId: string;
  unionId?: string;
  attendeeCount: number;
  maxAttendees?: number;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  zipCode?: string;
  district?: string;
  state?: string;
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeType: string;
  earnedAt: Date;
}
