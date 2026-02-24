import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  fingerprint: string;
  deviceType?: string;
  deviceName?: string;
  os?: string;
  browser?: string;
}

interface RequestWithDeviceInfo {
  ip?: string;
  connection?: { remoteAddress?: string };
  socket?: { remoteAddress?: string };
  headers: {
    'user-agent'?: string;
    'x-device-fingerprint'?: string;
    'x-device-type'?: string;
    'x-device-name'?: string;
    'x-device-os'?: string;
    'x-device-browser'?: string;
    [key: string]: string | undefined;
  };
}

export const DeviceInfo = createParamDecorator(
  (data: keyof DeviceInfo | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithDeviceInfo>();

    const deviceInfo: DeviceInfo = {
      userAgent: request.headers['user-agent'] || '',
      ipAddress:
        request.ip ||
        request.connection?.remoteAddress ||
        request.socket?.remoteAddress ||
        '',
      fingerprint: request.headers['x-device-fingerprint'] || '',
      deviceType: request.headers['x-device-type'],
      deviceName: request.headers['x-device-name'],
      os: request.headers['x-device-os'],
      browser: request.headers['x-device-browser'],
    };

    return data ? deviceInfo[data] : deviceInfo;
  },
);
