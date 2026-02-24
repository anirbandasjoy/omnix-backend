import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export const InjectCache = () => Inject(CACHE_MANAGER);
