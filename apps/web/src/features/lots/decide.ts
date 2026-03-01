export type DecideInput = {
  buyPriceCents: number | null;
  sellableBooks: number | null;
  estNetPerBookCents: number | null;

  // rule: target profit = max(floor, percentOfBuy * buyPrice)
  profitFloorCents?: number; // default 1000 ($10)
  profitPercentOfBuy?: number; // default 0.25 (25%)
};

export type DecideOutput = {
  estNetCents: number | null;
  estProfitCents: number | null;
  desiredProfitCents: number | null;
  desiredProfitFloorCents: number;
  desiredProfitPercentOfBuy: number;
  shouldBuy: boolean | null;
};

export function decide({
  buyPriceCents,
  sellableBooks,
  estNetPerBookCents,
  profitFloorCents = 1000,
  profitPercentOfBuy = 0.25,
}: DecideInput): DecideOutput {
  if (
    buyPriceCents == null ||
    sellableBooks == null ||
    estNetPerBookCents == null
  ) {
    return {
      estNetCents: null,
      estProfitCents: null,
      desiredProfitCents: null,
      desiredProfitFloorCents: profitFloorCents,
      desiredProfitPercentOfBuy: profitPercentOfBuy,
      shouldBuy: null,
    };
  }

  const estNetCents = sellableBooks * estNetPerBookCents;
  const estProfitCents = estNetCents - buyPriceCents;

  const pctTarget = Math.round(buyPriceCents * profitPercentOfBuy);
  const desiredProfitCents = Math.max(profitFloorCents, pctTarget);

  return {
    estNetCents,
    estProfitCents,
    desiredProfitCents,
    desiredProfitFloorCents: profitFloorCents,
    desiredProfitPercentOfBuy: profitPercentOfBuy,
    shouldBuy: estProfitCents >= desiredProfitCents,
  };
}
