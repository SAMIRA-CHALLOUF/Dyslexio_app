import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterFirstDto } from './dto/admin-register-first.dto';
import { AdminJwtGuard } from './guards/admin-jwt.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/register-first')
  registerFirst(@Body() dto: AdminRegisterFirstDto) {
    return this.adminService.registerFirst(dto);
  }

  @Post('auth/login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  @Get('stats')
  @UseGuards(AdminJwtGuard)
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users/recent')
  @UseGuards(AdminJwtGuard)
  getRecentUsers(@Query('limit') limit = '5') {
    return this.adminService.getRecentUsers(+limit);
  }

  @Get('users')
  @UseGuards(AdminJwtGuard)
  getUsers(
    @Query('type') type = '',
    @Query('search') search = '',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.adminService.getUsers(type, search, +page, +limit);
  }

  @Patch('users/:userId/status')
  @UseGuards(AdminJwtGuard)
  toggleUserStatus(
    @Param('userId') userId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.toggleUserStatus(userId, body.isActive);
  }

  @Delete('users/:userId')
  @UseGuards(AdminJwtGuard)
  deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('subscriptions/stats')
  @UseGuards(AdminJwtGuard)
  getSubscriptionStats() {
    return this.adminService.getSubscriptionStats();
  }

  @Get('subscriptions')
  @UseGuards(AdminJwtGuard)
  getSubscriptions(
    @Query('status') status = '',
    @Query('search') search = '',
  ) {
    return this.adminService.getSubscriptions(status, search);
  }

  @Patch('subscriptions/:clientId')
  @UseGuards(AdminJwtGuard)
  updateSubscription(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() body: { billingPeriod?: string; status?: string; expiresAt?: string },
  ) {
    return this.adminService.updateSubscription(clientId, body as any);
  }
}
