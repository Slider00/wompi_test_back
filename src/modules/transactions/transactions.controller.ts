import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una transacción en estado PENDIENTE' })
  @ApiResponse({ status: 201, description: 'Transacción creada exitosamente en estado PENDIENTE' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o referencia duplicada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Request() req: any, @Body() createDto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, createDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar el estado del pago de la transacción' })
  @ApiResponse({ status: 200, description: 'Transacción actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente (si cambia a APPROVED) o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  async updateStatus(@Param('id') id: string, @Body() updateDto: UpdateTransactionStatusDto) {
    return this.transactionsService.updateStatus(id, updateDto.status);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el historial de transacciones del usuario logueado' })
  @ApiResponse({ status: 200, description: 'Historial de transacciones obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(@Request() req: any) {
    return this.transactionsService.findAllByUserId(req.user.id);
  }
}
