import React from 'react';

const TEAL       = '#1D9E75';
const TEAL_LIGHT = '#E1F5EE';
const AMBER      = '#EF9F27';
const AMBER_LIGHT = '#FAEEDA';
const CORAL      = '#D85A30';
const CORAL_LIGHT = '#FAECE7';
const DARK       = '#1A1A2E';

const typeStyle = (type) =>
  ({
    client:        { bg: TEAL_LIGHT,  text: TEAL  },
    eleve:         { bg: AMBER_LIGHT, text: AMBER  },
    etablissement: { bg: CORAL_LIGHT, text: CORAL  },
  }[type] || { bg: '#F5F5F5', text: '#888' });

/**
 * UserTable
 * A reusable table to display a paginated user list.
 *
 * Props
 * ─────
 * users        {User[]}  – array of user objects
 * loading      {boolean} – show spinner while true
 * onView       {func}    – called with the user object when "Détails" is clicked
 * page         {number}  – current page (1-based)
 * totalPages   {number}  – total number of pages
 * onPageChange {func}    – called with the new page number
 * columns      {string[]} – optional subset of column keys to display
 *                          default: ['name', 'type', 'email', 'createdAt', 'status', 'actions']
 */
const COLUMN_DEFS = [
  { key: 'name',      label: 'Utilisateur' },
  { key: 'type',      label: 'Type' },
  { key: 'email',     label: 'Email' },
  { key: 'createdAt', label: 'Date inscription' },
  { key: 'status',    label: 'Statut' },
  { key: 'actions',   label: '' },
];

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
    <div
      style={{
        width: 32,
        height: 32,
        border: '3px solid #E1F5EE',
        borderTop: `3px solid ${TEAL}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const UserTable = ({
  users = [],
  loading = false,
  onView,
  page = 1,
  totalPages = 1,
  onPageChange,
  columns,
}) => {
  const visibleCols = columns
    ? COLUMN_DEFS.filter((c) => columns.includes(c.key))
    : COLUMN_DEFS;

  const renderCell = (col, user) => {
    const tc = typeStyle(user.type);

    switch (col.key) {
      case 'name':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: tc.bg,
                color: tc.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: DARK }}>
              {user.name}
            </span>
          </div>
        );

      case 'type':
        return (
          <span
            style={{
              background: tc.bg,
              color: tc.text,
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              textTransform: 'capitalize',
            }}
          >
            {user.type}
          </span>
        );

      case 'email':
        return (
          <span style={{ fontSize: 13, color: '#666' }}>{user.email}</span>
        );

      case 'createdAt':
        return (
          <span style={{ fontSize: 13, color: '#888' }}>
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString('fr-FR')
              : '—'}
          </span>
        );

      case 'status':
        return (
          <span
            style={{
              background: user.isActive ? TEAL_LIGHT : '#F5F5F5',
              color: user.isActive ? TEAL : '#aaa',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
            }}
          >
            {user.isActive ? 'Actif' : 'Inactif'}
          </span>
        );

      case 'actions':
        return onView ? (
          <button
            onClick={() => onView(user)}
            style={{
              background: 'none',
              border: `1px solid #EBEBEB`,
              borderRadius: 8,
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: 12,
              color: TEAL,
              fontWeight: 500,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = TEAL)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = '#EBEBEB')
            }
          >
            Détails
          </button>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #EBEBEB',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                  {visibleCols.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        color: '#aaa',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.label.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: '1px solid #F5F5F5', transition: 'background 0.1s' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#FAFAFA')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    {visibleCols.map((col) => (
                      <td key={col.key} style={{ padding: '12px 16px' }}>
                        {renderCell(col, user)}
                      </td>
                    ))}
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={visibleCols.length}
                      style={{
                        textAlign: 'center',
                        padding: 48,
                        color: '#aaa',
                        fontSize: 14,
                      }}
                    >
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '16px 0',
                borderTop: '1px solid #F5F5F5',
              }}
            >
              <PaginationBtn
                label="←"
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              />

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: p === page ? 'none' : '1px solid #EBEBEB',
                    background: p === page ? TEAL : 'none',
                    color: p === page ? '#fff' : DARK,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: p === page ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              ))}

              <PaginationBtn
                label="→"
                disabled={page === totalPages}
                onClick={() => onPageChange?.(page + 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PaginationBtn = ({ label, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: 'none',
      border: '1px solid #EBEBEB',
      borderRadius: 8,
      padding: '6px 12px',
      cursor: disabled ? 'default' : 'pointer',
      color: disabled ? '#ccc' : DARK,
      fontSize: 13,
      transition: 'all 0.15s',
    }}
  >
    {label}
  </button>
);

export default UserTable;
