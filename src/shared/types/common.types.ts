export type GenericSchema = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface ProviderType {
  EMAIL: 'email';
  PHONE: 'phone';
  USERNAME: 'username';
  GOOGLE: 'google';
  GITHUB: 'github';
}

export type Provider = ProviderType[keyof ProviderType];

export interface UserStatus {
  ACTIVE: 'active';
  SUSPENDED: 'suspended';
  DELETED: 'deleted';
  TERMINATED: 'terminated';
}

export type UserStatusType = UserStatus[keyof UserStatus];

export interface DeviceType {
  DESKTOP: 'desktop';
  MOBILE: 'mobile';
  TABLET: 'tablet';
  UNKNOWN: 'unknown';
}

export type Device = DeviceType[keyof DeviceType];
