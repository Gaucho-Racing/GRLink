import { User } from "@/models/user";

export interface LinkVisit {
  id: string;
  link_id: string;
  ip_address: string;
  user_agent: string;
  referer: string;
  country: string;
  device_type: string;
  created_at: Date;
}

export interface LinkStatistics {
  link_id: string;
  total_visits: number;
  last_visit: Date;
  visits: LinkVisit[];
}

export interface Link {
  id: string;
  original_url: string;
  short_code: string;
  user_id: string;
  user: User;
  expires_at: Date;
  is_active: boolean;
  statistics: LinkStatistics;
  updated_at: Date;
  created_at: Date;
}

export const initLinkVisit: LinkVisit = {
  id: "",
  link_id: "",
  ip_address: "",
  user_agent: "",
  referer: "",
  country: "",
  device_type: "",
  created_at: new Date(),
};

export const initLinkStatistics: LinkStatistics = {
  link_id: "",
  total_visits: 0,
  last_visit: new Date(),
  visits: [],
};

export const initLink: Link = {
  id: "",
  original_url: "",
  short_code: "",
  user_id: "",
  user: {} as User,
  expires_at: new Date(),
  is_active: true,
  statistics: initLinkStatistics,
  updated_at: new Date(),
  created_at: new Date(),
};
