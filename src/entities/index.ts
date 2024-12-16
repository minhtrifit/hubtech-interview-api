import { Customer } from '@/customer/entities/customer.entity';
import { Order } from '@/order/entities/order.entity';
import { OrderItem } from '@/order/entities/order_item.entity';
import { OrderStatus } from '@/order_status/entities/order_status.entity';
import { Product } from '@/product/entities/product.entity';
import { Supplier } from '@/supplier/entities/supplier.entity';

const entities = [Supplier, Customer, OrderStatus, Order, Product, OrderItem];

export default entities;
