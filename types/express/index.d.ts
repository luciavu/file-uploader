import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }

    interface Request {
      user: User;
    }
  }
}
