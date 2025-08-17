import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
  UseGuards,
  // ParseIntPipe,
  // HttpCode,
  // HttpStatus,
  // Query,
  // ValidationPipe,
  Version,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { QueryUserDto } from './dto/query-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  // ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Version('1')
  // @Post()
  // @ApiOperation({ summary: 'Create a new user' })
  // @ApiResponse({ status: 201, description: 'User successfully created.' })
  // @ApiResponse({ status: 400, description: 'Bad request.' })
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  // @Version('1')
  // @Get()
  // @ApiOperation({ summary: 'Get all users with pagination' })
  // @ApiResponse({ status: 200, description: 'Returns list of users.' })
  // findAll(@Query(new ValidationPipe({ transform: true })) query: QueryUserDto) {
  //   const { page = 1, limit = 10, searchTerm } = query;
  //   return this.usersService.findAll(page, limit, searchTerm);
  // }

  @Version('1')
  @Get('me')
  @ApiOperation({ summary: 'Get current user (me)' })
  async getMe(@Req() req) {
    const user = await this.usersService.getMe(req.user.employee.pmtCode);
    return {
      employee: user,
    };
  }

  // @Version('1')
  // @Get(':id')
  // @ApiOperation({ summary: 'Get a user by ID' })
  // @ApiResponse({ status: 200, description: 'Returns a user.' })
  // @ApiResponse({ status: 404, description: 'User not found.' })
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.findById(id.toString());
  // }

  // @Version('1')
  // @Patch(':id')
  // @ApiOperation({ summary: 'Update a user' })
  // @ApiResponse({ status: 200, description: 'User successfully updated.' })
  // @ApiResponse({ status: 404, description: 'User not found.' })
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.usersService.update(id.toString(), updateUserDto);
  // }

  // @Version('1')
  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete a user' })
  // @ApiResponse({ status: 204, description: 'User successfully deleted.' })
  // @ApiResponse({ status: 404, description: 'User not found.' })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.remove(id.toString());
  // }
}
