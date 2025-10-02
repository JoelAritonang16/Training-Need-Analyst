import React from 'react';

const emptyRow = () => ({
  Uraian: '',
  WaktuPelaksanan: '',
  JumlahPeserta: '',
  JumlahHariPesertaPelatihan: '',
  LevelTingkatan: 'NON STRUKTURAL',
  Beban: '',
  BebanTransportasi: '',
  BebanAkomodasi: '',
  BebanUangSaku: '',
});

export const makeEmptyItem = emptyRow;

const number = (v) => (v === '' || v === null || v === undefined ? 0 : parseFloat(v) || 0);

const TrainingProposalItemsTable = ({ items, onChange, onAdd, onRemove }) => {
  const update = (idx, key, val) => {
    const next = items.map((row, i) => (i === idx ? { ...row, [key]: val } : row));
    onChange(next);
  };

  const rowTotal = (row) => number(row.Beban) + number(row.BebanTransportasi) + number(row.BebanAkomodasi) + number(row.BebanUangSaku);
  const grandTotal = items.reduce((acc, r) => acc + rowTotal(r), 0);

  return (
    <div className="items-table">
      <div className="items-toolbar" style={{ marginBottom: 12 }}>
        <button type="button" className="btn-outline" onClick={onAdd}>+ Tambah Baris</button>
      </div>
      <div className="table-scroll" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Uraian</th>
              <th>Waktu Pelaksanaan</th>
              <th>Jumlah Peserta</th>
              <th>Jumlah Hari</th>
              <th>Level</th>
              <th>Beban</th>
              <th>Transport</th>
              <th>Akomodasi</th>
              <th>Uang Saku</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td>
                  <input type="text" value={row.Uraian} onChange={(e) => update(idx, 'Uraian', e.target.value)} placeholder={`Uraian #${idx + 1}`} />
                </td>
                <td>
                  <input type="date" value={row.WaktuPelaksanan || ''} onChange={(e) => update(idx, 'WaktuPelaksanan', e.target.value)} />
                </td>
                <td>
                  <input type="number" min="0" value={row.JumlahPeserta} onChange={(e) => update(idx, 'JumlahPeserta', e.target.value)} />
                </td>
                <td>
                  <input type="number" min="0" value={row.JumlahHariPesertaPelatihan} onChange={(e) => update(idx, 'JumlahHariPesertaPelatihan', e.target.value)} />
                </td>
                <td>
                  <select value={row.LevelTingkatan} onChange={(e) => update(idx, 'LevelTingkatan', e.target.value)}>
                    <option value="NON STRUKTURAL">NON STRUKTURAL</option>
                    <option value="STRUKTURAL">STRUKTURAL</option>
                  </select>
                </td>
                <td><input type="number" min="0" value={row.Beban} onChange={(e) => update(idx, 'Beban', e.target.value)} /></td>
                <td><input type="number" min="0" value={row.BebanTransportasi} onChange={(e) => update(idx, 'BebanTransportasi', e.target.value)} /></td>
                <td><input type="number" min="0" value={row.BebanAkomodasi} onChange={(e) => update(idx, 'BebanAkomodasi', e.target.value)} /></td>
                <td><input type="number" min="0" value={row.BebanUangSaku} onChange={(e) => update(idx, 'BebanUangSaku', e.target.value)} /></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Rp {rowTotal(row).toLocaleString('id-ID')}</td>
                <td>
                  {items.length > 1 && (
                    <button type="button" className="btn-danger-soft" onClick={() => onRemove(idx)}>Hapus</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={10} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Usulan</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Rp {grandTotal.toLocaleString('id-ID')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TrainingProposalItemsTable;
