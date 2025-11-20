import React, { useState, useEffect } from 'react';
import { tempatDiklatRealisasiAPI, branchAPI } from '../../utils/api';
import { LuMapPin, LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import './TempatDiklatRealisasi.css';

const TempatDiklatRealisasi = ({ user, currentUserRole, onNavigate }) => {
  const [data, setData] = useState([]);
  const [rekapPerBulan, setRekapPerBulan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    itemId: null
  });

  useEffect(() => {
    fetchData();
    fetchRekapPerBulan();
    if (currentUserRole === 'superadmin') {
      fetchBranches();
    }
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = { tahun: selectedYear };
      if (selectedMonth !== 'all') {
        filters.bulan = selectedMonth;
      }
      const result = await tempatDiklatRealisasiAPI.getAll(filters);
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.message || 'Gagal memuat data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRekapPerBulan = async () => {
    try {
      const result = await tempatDiklatRealisasiAPI.getRekapPerBulan(selectedYear);
      if (result.success) {
        setRekapPerBulan(result.rekap || []);
      }
    } catch (error) {
      console.error('Error fetching rekap:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const result = await branchAPI.getAll();
      if (result.success) {
        setBranches(result.branch || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmDelete({
      open: true,
      itemId: id
    });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.itemId;
    if (!id) return;

    try {
      const result = await tempatDiklatRealisasiAPI.delete(id);
      if (result.success) {
        fetchData();
        fetchRekapPerBulan();
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: 'Data realisasi berhasil dihapus dari sistem.',
          type: 'success'
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menghapus',
          message: result.message || 'Gagal menghapus data. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setConfirmDelete({ open: false, itemId: null });
    }
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (isEditMode && selectedItem) {
        result = await tempatDiklatRealisasiAPI.update(selectedItem.id, formData);
      } else {
        result = await tempatDiklatRealisasiAPI.create(formData);
      }

      if (result.success) {
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: isEditMode ? 'Data realisasi berhasil diperbarui.' : 'Data realisasi berhasil ditambahkan.',
          type: 'success'
        });
        setIsModalOpen(false);
        setSelectedItem(null);
        fetchData();
        fetchRekapPerBulan();
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menyimpan',
          message: result.message || 'Gagal menyimpan data. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
        type: 'error'
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const chartData = rekapPerBulan.map(month => ({
    name: month.namaBulan,
    'Total Kegiatan': month.total.totalKegiatan,
    'Total Peserta': month.total.totalPeserta,
    'Total Biaya (Juta)': (month.total.totalBiaya / 1000000).toFixed(2),
  }));

  const bulanOptions = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  if (loading) {
    return <div className="realisasi-container"><p>Memuat data...</p></div>;
  }

  if (error) {
    return <div className="realisasi-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="realisasi-container">
      <div className="content-header">
        <div>
          <h2>Tempat Diklat Realisasi</h2>
          <p>Rekap tempat diklat yang sudah terealisasi per bulan per branch</p>
        </div>
        <button className="btn-create" onClick={handleCreate}>
          <LuPlus size={18} />
          Tambah Data
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Tahun:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Bulan:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {bulanOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <h3>Grafik Rekap Per Bulan ({selectedYear})</h3>
        <div className="charts-grid">
          <div className="chart-card chart-full-width">
            <h4>Total Kegiatan dan Peserta Per Bulan</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Total Kegiatan" stroke="#8884d8" />
                <Line type="monotone" dataKey="Total Peserta" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card chart-full-width">
            <h4>Total Biaya Realisasi Per Bulan (Juta Rupiah)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total Biaya (Juta)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="data-section">
        <h3>Data Realisasi ({data.length} entri)</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Branch</th>
                <th>Nama Tempat</th>
                <th>Bulan</th>
                <th>Jumlah Kegiatan</th>
                <th>Total Peserta</th>
                <th>Total Biaya</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    Tidak ada data realisasi
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.branch?.nama || 'N/A'}</td>
                    <td>{item.namaTempat}</td>
                    <td>
                      {new Date(selectedYear, item.bulan - 1).toLocaleString('id-ID', { month: 'long' })}
                    </td>
                    <td>{item.jumlahKegiatan}</td>
                    <td>{item.totalPeserta}</td>
                    <td>{formatCurrency(item.totalBiaya)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(item)}>
                          <LuPencil size={14} />
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                          <LuTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RealisasiModal
          item={selectedItem}
          isEditMode={isEditMode}
          branches={branches}
          currentUserRole={currentUserRole}
          user={user}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}

      <ConfirmModal
        open={confirmDelete.open}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus data realisasi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false, itemId: null })}
      />

      <AlertModal
        open={alertModal.open}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={() => setAlertModal({ ...alertModal, open: false })}
      />
    </div>
  );
};

const RealisasiModal = ({ item, isEditMode, branches, currentUserRole, user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    branchId: item?.branchId || (currentUserRole === 'admin' ? user?.branchId : ''),
    namaTempat: item?.namaTempat || '',
    alamat: item?.alamat || '',
    bulan: item?.bulan || new Date().getMonth() + 1,
    tahun: item?.tahun || new Date().getFullYear(),
    jumlahKegiatan: item?.jumlahKegiatan || 0,
    totalPeserta: item?.totalPeserta || 0,
    totalBiaya: item?.totalBiaya || 0,
    keterangan: item?.keterangan || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bulan' || name === 'tahun' || name === 'jumlahKegiatan' || name === 'totalPeserta' 
        ? Number(value) 
        : name === 'totalBiaya'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Data Realisasi' : 'Tambah Data Realisasi'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {currentUserRole === 'superadmin' && (
              <div className="form-group">
                <label>Branch *</label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.nama}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group form-full-width">
              <label>Nama Tempat *</label>
              <input
                type="text"
                name="namaTempat"
                value={formData.namaTempat}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-full-width">
              <label>Alamat</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Bulan *</label>
              <select
                name="bulan"
                value={formData.bulan}
                onChange={handleChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tahun *</label>
              <input
                type="number"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                required
                min="2020"
                max="2030"
              />
            </div>

            <div className="form-group">
              <label>Jumlah Kegiatan *</label>
              <input
                type="number"
                name="jumlahKegiatan"
                value={formData.jumlahKegiatan}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Total Peserta *</label>
              <input
                type="number"
                name="totalPeserta"
                value={formData.totalPeserta}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Total Biaya (Rp) *</label>
              <input
                type="number"
                name="totalBiaya"
                value={formData.totalBiaya}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group form-full-width">
              <label>Keterangan</label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-save">
              {isEditMode ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TempatDiklatRealisasi;

