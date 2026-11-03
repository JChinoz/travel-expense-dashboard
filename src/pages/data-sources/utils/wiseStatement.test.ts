import { describe, expect, it } from 'vitest';
import { expenseRecords, tripMeta } from '@/common/data';
import { emptyImportState, importReducer, countsOnDashboard, itemToRecord } from '@/common/utils/wiseImport';
import { buildTrips } from '@/common/utils/records';
import {
  buildImportItems,
  estimateSgdRates,
  parseStatementDate,
  parseStatementRows,
  tripWindows,
} from './wiseStatement';

const HEADER = ['TransferWise ID', 'Date', 'Amount', 'Currency', 'Description', 'Merchant', 'Total fees'];

// Demo trip 0 (Kuala Lumpur) runs 8-11 Mar 2024.
const rows = [
  ['Account statement'],
  HEADER,
  ['CARD-900000001', '09-03-2024', -10, 'SGD', 'Card transaction of 31.00 MYR issued by Test Cafe KUALA LUMPUR', 'Test Cafe KUALA LUMPUR', 0],
  ['FEE-CARD-900000001', '09-03-2024', -0.05, 'SGD', 'Wise Charges for: CARD-900000001', '', 0],
  // Not near any trip.
  ['CARD-900000002', '01-01-2030', -3, 'SGD', 'Card transaction of 3.00 SGD issued by Local Shop SINGAPORE', 'Local Shop SINGAPORE', 0],
  ['BALANCE-1', '09-03-2024', 50, 'SGD', 'Converted 100 MYR to 50 SGD', '', 0],
];

describe('Wise statement import', () => {
  const parsed = parseStatementRows(rows, 'statement_SGD.xlsx');
  const ctx = {
    rates: estimateSgdRates(expenseRecords),
    windows: tripWindows(expenseRecords, tripMeta),
    knownIds: new Set<string>(),
    startSeq: 1,
    startBatch: 1,
  };

  it('reads card and fee lines and ignores other rows', () => {
    expect(parsed.lines).toHaveLength(3);
    expect(parsed.ignoredRows).toBe(1);
    expect(parsed.lines[1]).toMatchObject({ id: 'CARD-900000001', fee: true, row: 4 });
  });

  it('parses the supported date formats', () => {
    expect(parseStatementDate('30-04-2022')).toBe('2022-04-30');
    expect(parseStatementDate('2022-04-30')).toBe('2022-04-30');
    expect(parseStatementDate(new Date(Date.UTC(2022, 3, 30)))).toBe('2022-04-30');
  });

  it('rejects files that are not Wise statements', () => {
    expect(() => parseStatementRows([['a', 'b']], 'x.xlsx')).toThrow(/not a Wise statement/);
  });

  it('builds one item per card id, with the fee folded in and the trip matched by date', () => {
    const { items, uploads } = buildImportItems([parsed], ctx);
    expect(items).toHaveLength(2);
    const kl = items.find((i) => i.id === 'CARD-900000001')!;
    expect(kl.amountSGD).toBeCloseTo(10.05, 2);
    expect(kl.originalCharge).toBe('31.00 MYR');
    expect(kl.tripId).toBe(0);
    expect(items.find((i) => i.id === 'CARD-900000002')!.tripId).toBeNull();
    expect(uploads[0]).toMatchObject({ cardTransactions: 2, added: 2, alreadyKnown: 0 });
  });

  it('estimates exchange rates from existing Wise rows', () => {
    expect(estimateSgdRates(expenseRecords).MYR).toBeGreaterThan(0.2);
  });

  it('skips transactions that are already known', () => {
    const { items, uploads } = buildImportItems([parsed], { ...ctx, knownIds: new Set(['CARD-900000001']) });
    expect(items.map((i) => i.id)).toEqual(['CARD-900000002']);
    expect(uploads[0].alreadyKnown).toBe(1);
  });
});

describe('Review inbox flow', () => {
  const { items } = buildImportItems([parseStatementRows(rows, 'statement_SGD.xlsx')], {
    rates: {},
    windows: tripWindows(expenseRecords, tripMeta),
    knownIds: new Set(),
    startSeq: 1,
    startBatch: 1,
  });
  const klTotal = (extra: typeof items) =>
    buildTrips(tripMeta, [...expenseRecords, ...extra.filter(countsOnDashboard).map((i) => itemToRecord(i, false))]).find(
      (t) => t.id === 0,
    )!.total;
  const base = buildTrips(tripMeta, expenseRecords).find((t) => t.id === 0)!.total;

  it('counts pending rows on the dashboard and drops them again when removed', () => {
    let state = importReducer(emptyImportState, { type: 'add', items, uploads: [] });
    expect(klTotal(state.pending)).toBeCloseTo(base + 10.05, 2);

    state = importReducer(state, { type: 'discard', id: 'CARD-900000001' });
    expect(klTotal(state.pending)).toBeCloseTo(base, 2);

    state = importReducer(state, { type: 'restore', id: 'CARD-900000001' });
    expect(klTotal(state.pending)).toBeCloseTo(base + 10.05, 2);
  });

  it('moves a confirmed row to the data source with the written status description', () => {
    let state = importReducer(emptyImportState, { type: 'add', items, uploads: [] });
    state = importReducer(state, { type: 'update', id: 'CARD-900000001', patch: { statusDescription: 'Checked receipt' } });
    state = importReducer(state, { type: 'confirm', id: 'CARD-900000001' });
    expect(state.pending.map((i) => i.id)).toEqual(['CARD-900000002']);
    const record = itemToRecord(state.confirmed[0], true);
    expect(record).toMatchObject({ status: 'Checked receipt', userConfirmed: true, tripId: 0 });
  });

  it('will not confirm a row that has no trip', () => {
    const state = importReducer(emptyImportState, { type: 'add', items, uploads: [] });
    expect(importReducer(state, { type: 'confirm', id: 'CARD-900000002' })).toBe(state);
  });
});
