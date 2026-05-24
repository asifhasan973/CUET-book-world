const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toPlainBorrow = (borrow) => {
  if (borrow && typeof borrow.toObject === 'function') {
    return borrow.toObject();
  }

  return { ...borrow };
};

const calculateBorrowFineView = (borrow, now = new Date()) => {
  const result = toPlainBorrow(borrow);
  const dueDate = result.dueDate ? new Date(result.dueDate) : null;
  let daysLate = 0;

  result.fine = Number(result.fine || 0);

  if (
    dueDate &&
    (result.status === 'active' || result.status === 'overdue') &&
    dueDate < now
  ) {
    daysLate = Math.ceil((now - dueDate) / MS_PER_DAY);
    result.status = 'overdue';

    if (!result.fineOverride) {
      result.fine = Math.max(result.fine, daysLate);
    }
  }

  result.daysLate = daysLate;
  result.remaining = dueDate ? Math.ceil((dueDate - now) / MS_PER_DAY) : null;

  return result;
};

const getAutoOverdueFine = (borrow, now = new Date()) => {
  if (!borrow?.dueDate) return 0;
  if (!['active', 'overdue'].includes(borrow.status)) return 0;

  const dueDate = new Date(borrow.dueDate);
  if (dueDate >= now) return 0;

  return Math.ceil((now - dueDate) / MS_PER_DAY);
};

module.exports = {
  calculateBorrowFineView,
  getAutoOverdueFine,
};
