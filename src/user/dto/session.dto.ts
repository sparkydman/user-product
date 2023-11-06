export class SessionEntity {
  session: string;
  lastLogin: Date;
  isActive: boolean;
  userId: number;
  constructor(partial: Partial<SessionEntity>) {
    Object.assign(this, partial);
  }
}
