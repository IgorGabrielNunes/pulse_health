import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

export type Database = PrismaClient;

export function createDatabase(connectionString: string): Database {
  const adapter = new PrismaPg({
    connectionString,
    // The driver adapter serializes dates without an offset; pinning the session
    // to UTC keeps `timestamptz` columns correct regardless of the server default.
    options: '-c timezone=UTC',
  });

  return new PrismaClient({ adapter });
}
