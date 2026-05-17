import React, { useEffect, useState, useRef } from 'react';
import { debounce } from '@/utils/constants';
import { getCurrentUserToken } from '@/utils/auth-utils';
import { errorToast } from '@/utils/toast';
import styles from './admin-tables.module.scss';

const PAGE_SIZE = 10;

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isCandidateSearch, setIsCandidateSearch] = useState(false);
  const [isEmployerSearch, setIsEmployerSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const debounceRef = useRef();

  useEffect(() => {
    debounceRef.current = debounce((val) => setSearch(val), 500);
  }, []);

  const fetchUsers = async (page = currentPage) => {
    setLoading(true);
    try {
      const token = await getCurrentUserToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (isCandidateSearch) params.set('userType', 'Candidate');
      if (isEmployerSearch) params.set('userType', 'Employer');
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/list-users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.data.users || []);
      setPagination(data.data.pagination || {});
      setCurrentPage(data.data.pagination?.currentPage || page);
    } catch (error) {
      console.error('Error fetching users:', error);
      errorToast(error.message || 'Error loading users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1);
    // eslint-disable-next-line
  }, [search, isCandidateSearch, isEmployerSearch]);

  const handleNext = () => {
    if (pagination.hasNextPage) fetchUsers(currentPage + 1);
  };

  const handlePrev = () => {
    if (pagination.hasPrevPage) fetchUsers(currentPage - 1);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debounceRef.current(e.target.value);
  };

  return (
    <div className={styles['admin-table-container']}>
      <h2 className={styles['admin-table-title']}>Registered Users</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={handleSearchChange}
          className={styles['admin-table-input']}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={isCandidateSearch}
            onChange={() => {
              setIsEmployerSearch(false);
              setIsCandidateSearch((v) => !v);
            }}
            className={styles['admin-table-checkbox']}
          />
          Only Candidates
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={isEmployerSearch}
            onChange={() => {
              setIsCandidateSearch(false);
              setIsEmployerSearch((v) => !v);
            }}
            className={styles['admin-table-checkbox']}
          />
          Only Employers
        </label>
      </div>
      <table className={styles['admin-table']}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>User Type</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className={styles['admin-table-loading']}>
                Loading...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles['admin-table-empty']}>
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id || user.uid}>
                <td>{user.email || <span style={{ color: '#999' }}>(no email)</span>}</td>
                <td>{user.name || '-'}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  {user.userType === 'Candidate' && (
                    <span
                      className={`${styles.chip} ${styles['chip-candidate']}`}
                    >
                      Candidate
                    </span>
                  )}
                  {user.userType === 'Employer' && (
                    <span
                      className={`${styles.chip} ${styles['chip-employer']}`}
                    >
                      Employer
                    </span>
                  )}
                  {user.userType === 'Admin' && (
                    <span className={`${styles.chip} ${styles['chip-admin']}`}>
                      Admin
                    </span>
                  )}
                  {!user.userType && (
                    <span style={{ color: '#c00', fontSize: 12 }}>
                      Incomplete profile
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles['admin-table-actions']}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handlePrev}
            disabled={!pagination.hasPrevPage || loading}
            className={styles['admin-table-btn']}
          >
            Previous
          </button>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Page {currentPage} of {pagination.totalPages || 1}
            {pagination.totalUsers != null && (
              <span style={{ marginLeft: 8 }}>
                ({pagination.totalUsers} total)
              </span>
            )}
          </span>
          <button
            onClick={handleNext}
            disabled={!pagination.hasNextPage || loading}
            className={styles['admin-table-btn']}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
