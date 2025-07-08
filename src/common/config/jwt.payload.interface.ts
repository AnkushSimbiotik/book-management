export interface JwtPayload {
    email: string;
    id: number;
    firstName: string;
    lastName: string;
    status: string;
    roles: string[];
    permissions: string[];
  }
  