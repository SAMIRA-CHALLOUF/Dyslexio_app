import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Routes spécifiques EN PREMIER (avant :id) ────────────

  // Dashboard stats
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // Utilisateurs récents
  @Get('users/recent')
  getRecentUsers(@Query('limit') limit = '5') {
    return this.adminService.getRecentUsers(+limit);
  }

  // Liste utilisateurs paginée
  @Get('users')
  getUsers(
    @Query('type') type = '',
    @Query('search') search = '',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.adminService.getUsers(type, search, +page, +limit);
  }

  // Toggle statut utilisateur
  @Patch('users/:userId/status')
  toggleUserStatus(
    @Param('userId') userId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.toggleUserStatus(userId, body.isActive);
  }

  // Supprimer utilisateur
  @Delete('users/:userId')
  deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // ── CRUD Admin (routes avec :id EN DERNIER) ──────────────
  @Post()
  create(@Body() adminData: Partial<Admin>) {
    return this.adminService.create(adminData);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Admin>) {
    return this.adminService.update(+id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}