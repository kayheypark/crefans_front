export interface ChargeProduct {
  beans: number;
  price: number;
}

export const CHARGE_PRODUCTS: ChargeProduct[] = [
  { beans: 10, price: 1100 },
  { beans: 30, price: 3300 },
  { beans: 50, price: 5500 },
  { beans: 100, price: 11000 },
  { beans: 300, price: 33000 },
  { beans: 500, price: 55000 },
  { beans: 1000, price: 110000 },
  { beans: 5000, price: 550000 },
];
