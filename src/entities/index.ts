import { Customer } from '@/customer/entities/customer.entity';
import { Inventory } from '@/inventory/entities/inventory.entity';
import { InventoryItem } from '@/inventory/entities/inventory_item.entity';
import { Order } from '@/order/entities/order.entity';
import { OrderItem } from '@/order/entities/order_item.entity';
import { OrderStatus } from '@/order_status/entities/order_status.entity';
import { Payment } from '@/payment/entities/payment.entity';
import { PaymentMethod } from '@/payment_method/entities/payment_method.entity';
import { Product } from '@/product/entities/product.entity';
import { Supplier } from '@/supplier/entities/supplier.entity';

const entities = [
  Supplier,
  Customer,
  OrderStatus,
  Order,
  Product,
  OrderItem,
  Inventory,
  InventoryItem,
  PaymentMethod,
  Payment,
];

export default entities;
