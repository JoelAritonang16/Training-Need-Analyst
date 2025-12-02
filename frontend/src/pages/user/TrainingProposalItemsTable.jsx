import React from 'react';

const emptyRow = () => ({
  Uraian: '',
  WaktuPelaksanan: '',
  JumlahPeserta: '',
  JumlahHariPesertaPelatihan: '',
  LevelTingkatan: 'NON STRUKTURAL',
  Jenis: '',
  ProgramInisiatifStrategis: '',
  ClusterUtama: '',
  ClusterKecil: '',
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
  

  const rowTotal = (row) =>
    number(row.Beban) +
    number(row.BebanTransportasi) +
    number(row.BebanAkomodasi) +
    number(row.BebanUangSaku);

  const grandTotal = items.reduce((acc, r) => acc + rowTotal(r), 0);

  return (
    <div className="items-table">
      <div className="items-toolbar" style={{ marginBottom: 12 }}>
        <button type="button" className="btn-outline" onClick={onAdd}>
          + Tambah Baris
        </button>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Uraian</th>
              <th>Wkt Pelaksanaan</th>
              <th>Jlh Peserta</th>
              <th>Jlh Hari</th>
              <th>Level</th>
              <th>Jenis</th>
              <th>Program Inisiatif Strategis</th>
              <th>Cluster Utama</th>
              <th>Cluster Kecil</th>
              <th>Biaya Beban</th>
              <th>Biaya Transport</th>
              <th>Biaya Akomodasi</th>
              <th>Uang Saku</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((row, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td><input type="text" value={row.Uraian} onChange={(e) => update(idx, 'Uraian', e.target.value)} placeholder={`Uraian #${idx + 1}`} /></td>
                <td><input type="date" value={row.WaktuPelaksanan || ''} onChange={(e) => update(idx, 'WaktuPelaksanan', e.target.value)} /></td>
                <td><input type="number" value={row.JumlahPeserta} onChange={(e) => update(idx, 'JumlahPeserta', e.target.value)} min="0" /></td>
                <td><input type="number" value={row.JumlahHariPesertaPelatihan} onChange={(e) => update(idx, 'JumlahHariPesertaPelatihan', e.target.value)} min="0" /></td>
                <td>
                  <select value={row.LevelTingkatan} onChange={(e) => update(idx, 'LevelTingkatan', e.target.value)}>
                    <option value="NON STRUKTURAL">NON STRUKTURAL</option>
                    <option value="STRUKTURAL">STRUKTURAL</option>
                  </select>
                </td>
                <td>
                  <select value={row.Jenis || ''} onChange={(e) => update(idx, 'Jenis', e.target.value)}>
                    <option value="">-- Pilih --</option>
                    <option value="Pelatihan">Pelatihan</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sertifikasi">Sertifikasi</option>
                  </select>
                </td>
                <td>
                  <select value={row.ProgramInisiatifStrategis || ''} onChange={(e) => update(idx, 'ProgramInisiatifStrategis', e.target.value)}>
                    <option value="">-- Pilih --</option>
                    <option value="Standarisasi Operasi">Standarisasi Operasi</option>
                    <option value="Knowledge">Knowledge</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Manajemen Risiko">Manajemen Risiko</option>
                  </select>
                </td>
                <td>
                  <select value={row.ClusterUtama || ''} onChange={(e) => update(idx, 'ClusterUtama', e.target.value)}>
                    <option value="">-- Pilih --</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Knowledge">Knowledge</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Manajemen Risiko">Manajemen Risiko</option>
                    <option value="Audit">Audit</option>
                  </select>
                </td>
                <td>
                  <select value={row.ClusterKecil || ''} onChange={(e) => update(idx, 'ClusterKecil', e.target.value)}>
                    <option value="">-- Pilih --</option>
                    <option value="HSSE">HSSE</option>
                    <option value="IT">IT</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Komersil">Komersil</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Risiko">Risiko</option>
                    <option value="SDM">SDM</option>
                    <option value="Sistem Manajemen">Sistem Manajemen</option>
                    <option value="SPI">SPI</option>
                    <option value="Umum">Umum</option>
                    <option value="Hukum">Hukum</option>
                    <option value="Komunikasi">Komunikasi</option>
                    <option value="Pengadaan">Pengadaan</option>
                  </select>
                </td>
                <td><input type="number" value={row.Beban} onChange={(e) => update(idx, 'Beban', e.target.value)} min="0" /></td>
                <td><input type="number" value={row.BebanTransportasi} onChange={(e) => update(idx, 'BebanTransportasi', e.target.value)} min="0" /></td>
                <td><input type="number" value={row.BebanAkomodasi} onChange={(e) => update(idx, 'BebanAkomodasi', e.target.value)} min="0" /></td>
                <td><input type="number" value={row.BebanUangSaku} onChange={(e) => update(idx, 'BebanUangSaku', e.target.value)} min="0" /></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: '600', color: '#0077b6' }}>
                  Rp {rowTotal(row).toLocaleString('id-ID')}
                </td>
                <td>
                  {items.length > 1 && (
                    <button type="button" className="btn-danger-soft" onClick={() => onRemove(idx)}>
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={14} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Usulan</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#0077b6' }}>
                Rp {grandTotal.toLocaleString('id-ID')}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TrainingProposalItemsTable;
