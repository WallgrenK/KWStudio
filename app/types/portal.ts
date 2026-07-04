export type UserProfileRole = "admin" | "client";

export type InviteStatus = "not_invited" | "invited" | "accepted" | "expired";

export type PortalClientDto = {
  id: string;
  company_name: string;
  org_number: string | null;
  client_slug: string | null;
  website: string | null;
  logo_url: string | null;
  brand_color: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  project_count: number;
  contacts: PortalContactDto[];
};

export type PortalContactDto = {
  id: string;
  client_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
  invite_status: InviteStatus;
  project_count: number;
};

export type PortalProjectDto = {
  id: string;
  client_id: string;
  service_id: string;
  title: string;
  status: string;
  description: string | null;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type UserProfileDto = {
  id: string;
  auth_user_id: string;
  role: UserProfileRole;
  client_id: string | null;
  client_contact_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PortalInviteLookupDto = {
  ok: boolean;
  status: "ready" | "invalid" | "expired" | "used";
  email?: string;
  expiresAt?: string;
  error?: string;
};

export type CreatePortalInviteDto = {
  inviteUrl: string;
  rawToken: string;
  expiresAt: string;
  email: string;
};

export type PortalMeDto = {
  profile: UserProfileDto;
  contact: PortalContactDto | null;
  client: PortalClientDto | null;
};

export type ActivatePortalInvitePayload = {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};
