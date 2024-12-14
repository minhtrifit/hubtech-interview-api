import { Customer } from '@/customer/entities/customer.entity';
import { Order } from '@/order/entities/order.entity';
import { OrderStatus } from '@/order_status/entities/order_status.entity';
import { Supplier } from '@/supplier/entities/supplier.entity';

const entities = [Supplier, Customer, OrderStatus, Order];

export default entities;
