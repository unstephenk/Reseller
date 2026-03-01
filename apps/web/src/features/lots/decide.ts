export type DecideInput = {
  buyPriceCents: number | null;
  sellableBooks: number | null;
  estNetPerBookCents: number | null;
  desiredProfitBufferCents?: number; // default 4000 ($40)
};

export type DecideOutput = {
  estNetCents: number | null;
  estProfitCents: number | null;
  desiredProfitCents: number | null;
  shouldBuy: boolean | null;
};

export function decide({
  buyPriceCents,
  sellableBooks,
  estNetPerBookCents,
  desiredProfitBufferCents = 4000,
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
      shouldBuy: null,
    };
  }

  const estNetCents = sellableBooks * estNetPerBookCents;
  const estProfitCents = estNetCents - buyPriceCents;
  const desiredProfitCents = desiredProfitBufferCents;

  return {
    estNetCents,
    estProfitCents,
    desiredProfitCents,
    shouldBuy: estProfitCents >= desiredProfitCents,
  };
}
