import "./DataQualityNote.css";

export function DataQualityNote() {
  return (
    <div className="data-quality">
      <strong>Data quality:</strong> Amounts use recorded SGD values. Evidence
      includes booking receipts, Wise merchant/date matches and author-verified
      Agoda bookings. Historical FX estimates are retained; any material fare or
      amount discrepancy is identified in Data Sources.
    </div>
  );
}
