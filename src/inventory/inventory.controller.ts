import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  GetAll(@Query('offset') offset: string, @Query('limit') limit: string) {
    return this.inventoryService.GetAll(
      !isNaN(+offset) ? +offset : null,
      !isNaN(+limit) ? +limit : null,
    );
  }

  @Get('/inventory-id/:id')
  getByInventoryId(@Param('id') id: string) {
    return this.inventoryService.getByInventoryId(id);
  }

  @Get('/supplier-id/:id')
  getAllBySupplierId(
    @Param('id') id: string,
    @Query('offset') offset: string,
    @Query('limit') limit: string,
  ) {
    return this.inventoryService.getAllBySupplierId(
      id,
      !isNaN(+offset) ? +offset : null,
      !isNaN(+limit) ? +limit : null,
    );
  }

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Patch(':id')
  @HttpCode(201)
  updateById(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateById(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(201)
  deleteById(@Param('id') id: string) {
    return this.inventoryService.deleteById(id);
  }
}
