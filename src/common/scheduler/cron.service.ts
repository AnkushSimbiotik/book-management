// cron.service.ts

import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AuthenticationService } from "src/iam/authentication/authentication.service";

@Injectable()
export class CronService {
    constructor(private readonly authService : AuthenticationService){}

    @Cron(CronExpression.EVERY_MINUTE)
   async handleExpiredTokens() {
    await this.authService.cleanupExpiredTokens();
    console.log('Expired tokens cleanup completed');
  }
}