export type DecideInput = {
  buyPriceCents: number | null;
  sellableBooks: number | null;
  estNetPerBookCents: number | null;

  // rule: target profit = max(floor, percentOfBuy * buyPrice)
  profitFloorCents: number;
  profitPercentOfBuy: number;
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
  profitFloorCents,
  profitPercentOfBuy,
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
