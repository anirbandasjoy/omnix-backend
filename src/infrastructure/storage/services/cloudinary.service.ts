/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  ResourceApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  version: number;
  signature: string;
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
  secureUrl: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any[];
  eager?: any[];
  format?: string;
  quality?: string | number;
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  eagerAuto?: string | string[];
}

@Injectable()
export class CloudinaryService {
  private readonly cloudinary: typeof cloudinary;
  private readonly apiSecret: string;

  constructor() {
    this.cloudinary = cloudinary;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || '';
    this.cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: this.apiSecret,
      secure: true,
    });
  }

  /**
   * Upload a file from buffer
   */
  async uploadFile(
    fileBuffer: Buffer,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'auth2x',
          public_id: options.publicId,
          overwrite: options.overwrite ?? true,
          resource_type: options.resourceType || 'image',
          transformation: options.transformation,
          eager: options.eager,
          format: options.format,
          quality: options.quality || 'auto',
          fetch_format: 'auto',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse,
        ) => {
          if (error) return reject(error);
          resolve({
            url: result.url || '',
            publicId: result.public_id || '',
            version: result.version || 0,
            signature: result.signature || '',
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes || 0,
            secureUrl: result.secure_url || '',
          });
        },
      );

      // Convert buffer to stream
      const { Readable } = require('stream');
      const stream = Readable.from(fileBuffer);
      stream.pipe(uploadStream);
    });
  }

  /**
   * Upload a file from base64
   */
  async uploadBase64(
    base64String: string,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    const result = await this.cloudinary.uploader.upload(base64String, {
      folder: options.folder || 'auth2x',
      public_id: options.publicId,
      overwrite: options.overwrite ?? true,
      resource_type: options.resourceType || 'image',
      transformation: options.transformation,
      eager: options.eager,
      quality: options.quality || 'auto',
      fetch_format: 'auto',
    });
    return {
      url: result.url || '',
      publicId: result.public_id || '',
      version: result.version || 0,
      signature: result.signature || '',
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes || 0,
      secureUrl: result.secure_url || '',
    };
  }

  /**
   * Upload a file from URL
   */
  async uploadFromUrl(
    url: string,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    const result = await this.cloudinary.uploader.upload(url, {
      folder: options.folder || 'auth2x',
      public_id: options.publicId,
      overwrite: options.overwrite ?? true,
      resource_type: options.resourceType || 'image',
      transformation: options.transformation,
      eager: options.eager,
      quality: options.quality || 'auto',
      fetch_format: 'auto',
    });
    return {
      url: result.url || '',
      publicId: result.public_id || '',
      version: result.version || 0,
      signature: result.signature || '',
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes || 0,
      secureUrl: result.secure_url || '',
    };
  }

  /**
   * Delete a file
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<any> {
    return this.cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(
    publicIds: string[],
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<any> {
    return this.cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
  }

  /**
   * Delete files by prefix
   */
  async deleteByPrefix(
    prefix: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<any> {
    return this.cloudinary.api.delete_resources_by_prefix(prefix, {
      resource_type: resourceType,
    });
  }

  /**
   * Get file info
   */
  async getFileInfo(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<ResourceApiResponse> {
    return this.cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
  }

  /**
   * Generate optimized URL
   */
  getOptimizedUrl(
    publicId: string,
    transformations: {
      width?: number;
      height?: number;
      quality?: number | string;
      crop?: string;
      format?: string;
      fetch_format?: string;
    } = {},
  ): string {
    const {
      width,
      height,
      quality = 'auto',
      crop,
      format,
      fetch_format = 'auto',
    } = transformations;

    let transform = '';
    if (width || height || crop) {
      transform += '/';
      if (width) transform += `w_${width},`;
      if (height) transform += `h_${height},`;
      if (crop) transform += `c_${crop},`;
      transform = transform.slice(0, -1); // Remove trailing comma
    }

    return this.cloudinary.url(publicId, {
      transformation: [
        { quality, fetch_format },
        transform ? { raw_transform: transform } : undefined,
      ].filter(Boolean),
    });
  }

  /**
   * Generate thumbnail URL
   */
  getThumbnailUrl(
    publicId: string,
    width: number = 200,
    height: number = 200,
    crop: 'fill' | 'thumb' | 'scale' = 'fill',
  ): string {
    return this.getOptimizedUrl(publicId, { width, height, crop });
  }

  /**
   * Get upload signature for unsigned uploads
   */
  async getUploadSignature(
    params: {
      timestamp?: number;
      folder?: string;
      public_id?: string;
      transformation?: string;
    } = {},
  ): Promise<{ signature: string; timestamp: number }> {
    const timestamp = params.timestamp || Math.floor(Date.now() / 1000);
    const signature = this.cloudinary.utils.api_sign_request(
      {
        ...params,
        timestamp,
      },
      this.apiSecret,
    );

    return {
      signature,
      timestamp,
    };
  }

  /**
   * Create upload preset for avatar uploads
   */
  async createAvatarUploadPreset(): Promise<any> {
    return this.cloudinary.api.create_upload_preset({
      name: 'avatar_preset',
      folder: 'avatars',
      allowed_formats: ['jpg', 'png', 'webp'],
      max_file_size: 2000000, // 2MB
      max_width: 1024,
      max_height: 1024,
      quality: 'auto',
      fetch_format: 'auto',
      crop: 'limit',
      eager: [
        {
          width: 200,
          height: 200,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto',
        },
        {
          width: 400,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });
  }

  /**
   * Search for assets
   */
  async searchAssets(
    expression: string,
    resourceType: 'image' | 'video' = 'image',
  ): Promise<any> {
    return this.cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();
  }
}
