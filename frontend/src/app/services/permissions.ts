export type Role =
  | 'Administrator'
  | 'Legal Manager'
  | 'Compliance Officer'
  | 'Contract Manager'
  | 'Department Head'
  | 'Employee';

const CONTRACT_CREATE_ROLES: Role[] = ['Administrator', 'Legal Manager', 'Contract Manager'];
const CONTRACT_WRITE_ROLES: Role[] = ['Administrator', 'Contract Manager'];
const OBLIGATION_MANAGE_ROLES: Role[] = ['Administrator', 'Legal Manager', 'Contract Manager'];
const RENEWAL_WRITE_ROLES: Role[] = ['Administrator', 'Legal Manager', 'Contract Manager'];
const NOTIFICATION_CREATE_ROLES: Role[] = ['Administrator', 'Legal Manager', 'Compliance Officer', 'Contract Manager'];
const AUDIT_VIEW_ROLES: Role[] = ['Administrator', 'Legal Manager'];

export const canCreate = (section: string, role: string): boolean => {
  if (section === 'contracts') return CONTRACT_CREATE_ROLES.includes(role as Role);
  if (section === 'obligations') return OBLIGATION_MANAGE_ROLES.includes(role as Role);
  if (section === 'renewals') return RENEWAL_WRITE_ROLES.includes(role as Role);
  if (section === 'notifications') return NOTIFICATION_CREATE_ROLES.includes(role as Role);
  return false;
};

export const canUpdate = (section: string, role: string): boolean => {
  if (section === 'contracts') return CONTRACT_WRITE_ROLES.includes(role as Role);
  if (section === 'obligations') return OBLIGATION_MANAGE_ROLES.includes(role as Role);
  if (section === 'renewals') return RENEWAL_WRITE_ROLES.includes(role as Role);
  return false;
};

export const canDelete = (section: string, role: string): boolean =>
  section === 'contracts' && CONTRACT_WRITE_ROLES.includes(role as Role);

export const canChangeStatus = (section: string, role: string): boolean => {
  if (section === 'contracts') return CONTRACT_WRITE_ROLES.includes(role as Role);
  if (section === 'obligations') return true;
  if (section === 'renewals') return RENEWAL_WRITE_ROLES.includes(role as Role);
  return false;
};

export const canViewAudit = (role: string): boolean => AUDIT_VIEW_ROLES.includes(role as Role);
