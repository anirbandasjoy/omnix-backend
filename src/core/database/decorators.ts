import { Inject } from '@nestjs/common';
import { DRIZZLE_DB } from './database.module';

export const InjectDatabase = () => Inject(DRIZZLE_DB);
