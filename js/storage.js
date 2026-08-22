/**
 * IronPulse Gym Management System - Storage & State Layer
 */

const STORAGE_KEY = 'ironpulse_gym_data_v1';
const DEFAULT_FEE = 1500;

// Helper to format ISO date string (YYYY-MM-DD)
function formatDateISO(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to add days
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Generate realistic initial dataset relative to the current date
function generateInitialData() {
  const today = new Date();
  
  // Member 1: Ali Khan - Expiring in 3 days (Expiry Warning Demo)
  const m1Start = formatDateISO(addDays(today, -27));
  const m1End = formatDateISO(addDays(today, 3));
  
  // Member 2: Bilal Sheikh - Expiring in 1 day (Expiry Warning Demo)
  const m2Start = formatDateISO(addDays(today, -29));
  const m2End = formatDateISO(addDays(today, 1));
  
  // Member 3: Usman Tariq - Expired 4 days ago
  const m3Start = formatDateISO(addDays(today, -34));
  const m3End = formatDateISO(addDays(today, -4));
  
  // Member 4: Hamza Ahmed - Active (expires in 20 days)
  const m4Start = formatDateISO(addDays(today, -10));
  const m4End = formatDateISO(addDays(today, 20));
  
  // Member 5: Fatima Noor - Active (expires in 25 days)
  const m5Start = formatDateISO(addDays(today, -5));
  const m5End = formatDateISO(addDays(today, 25));

  // Member 6: Zaid Malik - Active (joined today)
  const m6Start = formatDateISO(today);
  const m6End = formatDateISO(addDays(today, 30));

  const members = [
    {
      id: 'MEM-1001',
      fullName: 'Ali Khan',
      phone: '0300-1234567',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      startDate: m1Start,
      endDate: m1End,
      createdAt: m1Start
    },
    {
      id: 'MEM-1002',
      fullName: 'Bilal Sheikh',
      phone: '0321-9876543',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      startDate: m2Start,
      endDate: m2End,
      createdAt: m2Start
    },
    {
      id: 'MEM-1003',
      fullName: 'Usman Tariq',
      phone: '0333-4567890',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      startDate: m3Start,
      endDate: m3End,
      createdAt: m3Start
    },
    {
      id: 'MEM-1004',
      fullName: 'Hamza Ahmed',
      phone: '0312-3456789',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      startDate: m4Start,
      endDate: m4End,
      createdAt: m4Start
    },
    {
      id: 'MEM-1005',
      fullName: 'Fatima Noor',
      phone: '0345-6789012',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      startDate: m5Start,
      endDate: m5End,
      createdAt: m5Start
    },
    {
      id: 'MEM-1006',
      fullName: 'Zaid Malik',
      phone: '0302-8877665',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      startDate: m6Start,
      endDate: m6End,
      createdAt: m6Start
    }
  ];

  const payments = [
    {
      id: 'PAY-2001',
      memberId: 'MEM-1001',
      memberName: 'Ali Khan',
      amount: 1500,
      paymentDate: m1Start,
      startDate: m1Start,
      endDate: m1End,
      method: 'Cash',
      notes: 'Initial Membership Fee'
    },
    {
      id: 'PAY-2002',
      memberId: 'MEM-1002',
      memberName: 'Bilal Sheikh',
      amount: 1500,
      paymentDate: m2Start,
      startDate: m2Start,
      endDate: m2End,
      method: 'JazzCash',
      notes: 'Monthly Membership'
    },
    {
      id: 'PAY-2003',
      memberId: 'MEM-1003',
      memberName: 'Usman Tariq',
      amount: 1500,
      paymentDate: m3Start,
      startDate: m3Start,
      endDate: m3End,
      method: 'Cash',
      notes: 'Initial Registration'
    },
    {
      id: 'PAY-2004',
      memberId: 'MEM-1004',
      memberName: 'Hamza Ahmed',
      amount: 1500,
      paymentDate: m4Start,
      startDate: m4Start,
      endDate: m4End,
      method: 'EasyPaisa',
      notes: 'Monthly Membership'
    },
    {
      id: 'PAY-2005',
      memberId: 'MEM-1005',
      memberName: 'Fatima Noor',
      amount: 1500,
      paymentDate: m5Start,
      startDate: m5Start,
      endDate: m5End,
      method: 'Bank Transfer',
      notes: 'Monthly Membership'
    },
    {
      id: 'PAY-2006',
      memberId: 'MEM-1006',
      memberName: 'Zaid Malik',
      amount: 1500,
      paymentDate: m6Start,
      startDate: m6Start,
      endDate: m6End,
      method: 'Cash',
      notes: 'New Member Registration'
    }
  ];

  return {
    gymName: 'IronPulse Fitness Club',
    gymPhone: '0300-1122334',
    gymAddress: 'Main Boulevard, Gulberg III, Lahore',
    defaultFee: DEFAULT_FEE,
    members: members,
    payments: payments
  };
}

const Storage = {
  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = generateInitialData();
        this.saveData(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load gym data from localStorage:', e);
      const initial = generateInitialData();
      return initial;
    }
  },

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save gym data:', e);
      return false;
    }
  },

  resetData() {
    const initial = generateInitialData();
    this.saveData(initial);
    return initial;
  },

  getMembers() {
    const data = this.loadData();
    return data.members || [];
  },

  getMemberById(id) {
    const members = this.getMembers();
    return members.find(m => m.id === id) || null;
  },

  addMember(memberData, initialPaymentAmount = DEFAULT_FEE, paymentMethod = 'Cash') {
    const data = this.loadData();
    const newId = 'MEM-' + (1000 + data.members.length + 1 + Math.floor(Math.random() * 900));
    
    const newMember = {
      id: newId,
      fullName: memberData.fullName.trim(),
      phone: memberData.phone.trim(),
      photo: memberData.photo || '',
      startDate: memberData.startDate,
      endDate: memberData.endDate,
      createdAt: formatDateISO(new Date())
    };

    data.members.unshift(newMember);

    // If initial payment recorded
    if (initialPaymentAmount && Number(initialPaymentAmount) > 0) {
      const payId = 'PAY-' + (2000 + data.payments.length + 1 + Math.floor(Math.random() * 900));
      const newPayment = {
        id: payId,
        memberId: newId,
        memberName: newMember.fullName,
        amount: Number(initialPaymentAmount),
        paymentDate: memberData.startDate || formatDateISO(new Date()),
        startDate: memberData.startDate,
        endDate: memberData.endDate,
        method: paymentMethod,
        notes: 'Initial Registration Payment'
      };
      data.payments.unshift(newPayment);
    }

    this.saveData(data);
    return newMember;
  },

  updateMember(id, updatedFields) {
    const data = this.loadData();
    const index = data.members.findIndex(m => m.id === id);
    if (index === -1) return null;

    data.members[index] = {
      ...data.members[index],
      ...updatedFields
    };

    // Also update member name in existing payment records if name changed
    if (updatedFields.fullName) {
      data.payments.forEach(p => {
        if (p.memberId === id) {
          p.memberName = updatedFields.fullName.trim();
        }
      });
    }

    this.saveData(data);
    return data.members[index];
  },

  deleteMember(id) {
    const data = this.loadData();
    data.members = data.members.filter(m => m.id !== id);
    data.payments = data.payments.filter(p => p.memberId !== id);
    this.saveData(data);
    return true;
  },

  getPayments() {
    const data = this.loadData();
    return (data.payments || []).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  },

  getPaymentsByMemberId(memberId) {
    const data = this.loadData();
    return (data.payments || [])
      .filter(p => p.memberId === memberId)
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  },

  addPayment(payment) {
    const data = this.loadData();
    const payId = 'PAY-' + (2000 + data.payments.length + 1 + Math.floor(Math.random() * 900));
    
    const newPayment = {
      id: payId,
      memberId: payment.memberId,
      memberName: payment.memberName,
      amount: Number(payment.amount),
      paymentDate: payment.paymentDate,
      startDate: payment.startDate,
      endDate: payment.endDate,
      method: payment.method || 'Cash',
      notes: payment.notes || 'Membership Renewal'
    };

    data.payments.unshift(newPayment);

    // Update member's membership end date and start date if applicable
    const memberIndex = data.members.findIndex(m => m.id === payment.memberId);
    if (memberIndex !== -1) {
      data.members[memberIndex].endDate = payment.endDate;
      // If renewed from a new cycle
      if (payment.startDate) {
        data.members[memberIndex].startDate = payment.startDate;
      }
    }

    this.saveData(data);
    return newPayment;
  },

  getGymInfo() {
    const data = this.loadData();
    return {
      gymName: data.gymName || 'IronPulse Fitness Club',
      gymPhone: data.gymPhone || '0300-1122334',
      gymAddress: data.gymAddress || 'Main Boulevard, Gulberg III, Lahore',
      defaultFee: data.defaultFee || DEFAULT_FEE
    };
  },

  updateGymInfo(info) {
    const data = this.loadData();
    data.gymName = info.gymName || data.gymName;
    data.gymPhone = info.gymPhone || data.gymPhone;
    data.gymAddress = info.gymAddress || data.gymAddress;
    data.defaultFee = Number(info.defaultFee) || DEFAULT_FEE;
    this.saveData(data);
    return true;
  }
};
