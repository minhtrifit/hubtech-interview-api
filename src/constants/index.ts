export const STATUSES = [
  {
    name: 'Nhận đơn',
    code: 'pending',
  },
  {
    name: 'Soạn hàng',
    code: 'preparing',
  },
  {
    name: 'Giao hàng',
    code: 'shipping',
  },
  {
    name: 'Hoàn thành',
    code: 'completed',
  },
];

export const PAYMENT_METHODS = [
  {
    name: 'COD',
    description: 'Thanh toán khi nhận hàng',
  },
  {
    name: 'Credit Card',
    description: 'Thanh toán bằng thẻ tín dụng',
  },
  {
    name: 'Bank Transfer',
    description: 'Thanh toán qua chuyển khoản ngân hàng',
  },
];
