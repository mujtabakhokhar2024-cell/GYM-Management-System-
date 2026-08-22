// IronPulse Gym Management System - Main App Logic
let currentView = 'dashboard';
let currentMemberId = null;
let memberFilter = 'all';

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return 'PKR ' + num.toLocaleString('en-PK');
}

function calculateOneMonthLater(startDateStr) {
  if (!startDateStr) return '';
  const parts = startDateStr.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  date.setMonth(date.getMonth() + 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMembershipStatus(endDateStr) {
  if (!endDateStr) {
    return {
      status: 'expired',
      badgeClass: 'badge-expired',
      pillBg: 'bg-red-100 text-red-800 border-red-200',
      dotBg: 'bg-red-500',
      label: 'Expired',
      subtext: 'No end date',
      daysRemaining: -999
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = endDateStr.split('-');
  const end = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      status: 'expired',
      badgeClass: 'badge-expired',
      pillBg: 'bg-red-100 text-red-800 border-red-200',
      dotBg: 'bg-red-500',
      label: 'Expired',
      subtext: overdue === 1 ? 'Expired 1 day ago' : `Expired ${overdue} days ago`,
      daysRemaining: diffDays
    };
  } else if (diffDays <= 7) {
    let warningText = '';
    if (diffDays === 0) warningText = 'Expires today';
    else if (diffDays === 1) warningText = 'Expires tomorrow';
    else warningText = `Expires in ${diffDays} days`;

    return {
      status: 'expiring_soon',
      badgeClass: 'badge-expiring',
      pillBg: 'bg-amber-100 text-amber-900 border-amber-300',
      dotBg: 'bg-amber-500',
      label: 'Expiring Soon',
      subtext: warningText,
      daysRemaining: diffDays
    };
  } else {
    return {
      status: 'active',
      badgeClass: 'badge-active',
      pillBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotBg: 'bg-emerald-500',
      label: 'Active',
      subtext: `${diffDays} days left`,
      daysRemaining: diffDays
    };
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-slate-900 text-white' : (type === 'error' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white');
  const icon = type === 'success' ? '<i class="fas fa-check-circle text-emerald-400"></i>' : '<i class="fas fa-info-circle text-amber-400"></i>';

  toast.className = `${bg} px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0 z-50 border border-slate-700/30`;
  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function navigateTo(view, param = null) {
  currentView = view;
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(link => {
    const target = link.getAttribute('data-view');
    if (target === view || (view === 'member-profile' && target === 'members')) {
      link.classList.add('bg-emerald-500/10', 'text-emerald-400', 'font-semibold');
      link.classList.remove('text-slate-400', 'hover:bg-slate-800/60');
    } else {
      link.classList.remove('bg-emerald-500/10', 'text-emerald-400', 'font-semibold');
      link.classList.add('text-slate-400', 'hover:bg-slate-800/60');
    }
  });

  if (view === 'dashboard') {
    document.getElementById('viewDashboard').classList.remove('hidden');
    renderDashboard();
  } else if (view === 'members') {
    document.getElementById('viewMembers').classList.remove('hidden');
    renderMembers();
  } else if (view === 'member-profile') {
    document.getElementById('viewMemberProfile').classList.remove('hidden');
    if (param) currentMemberId = param;
    renderMemberProfile(currentMemberId);
  } else if (view === 'payments') {
    document.getElementById('viewPayments').classList.remove('hidden');
    renderPayments();
  } else if (view === 'warnings') {
    document.getElementById('viewWarnings').classList.remove('hidden');
    renderWarnings();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderDashboard() {
  const members = Storage.getMembers();
  const payments = Storage.getPayments();

  let activeCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;
  const expiringMembers = [];

  members.forEach(m => {
    const st = getMembershipStatus(m.endDate);
    if (st.status === 'active') {
      activeCount++;
    } else if (st.status === 'expiring_soon') {
      expiringCount++;
      activeCount++;
      expiringMembers.push({ ...m, statusInfo: st });
    } else {
      expiredCount++;
    }
  });

  expiringMembers.sort((a, b) => a.statusInfo.daysRemaining - b.statusInfo.daysRemaining);
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  document.getElementById('dashTotalMembers').textContent = members.length;
  document.getElementById('dashActiveMembers').textContent = activeCount;
  document.getElementById('dashExpiredMembers').textContent = expiredCount;
  document.getElementById('dashExpiringMembers').textContent = expiringCount;
  document.getElementById('dashTotalRevenue').textContent = formatCurrency(totalRevenue);

  const expiryContainer = document.getElementById('dashExpiringList');
  if (expiringMembers.length === 0) {
    expiryContainer.innerHTML = `
      <div class="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <i class="fas fa-check-circle text-emerald-500 text-3xl mb-2"></i>
        <p class="font-medium text-slate-700">No memberships expiring within the next 7 days.</p>
        <p class="text-xs text-slate-400 mt-1">All active members are in good standing.</p>
      </div>
    `;
  } else {
    expiryContainer.innerHTML = expiringMembers.map(m => {
      const waNumber = m.phone.replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(`Hi ${m.fullName}, reminder from IronPulse Fitness: Your gym membership is due to expire on ${formatDisplayDate(m.endDate)} (${m.statusInfo.subtext}). Please visit the counter to renew.`);
      
      return `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl gap-3 transition-all hover:bg-amber-50">
          <div class="flex items-center gap-3.5">
            <div class="relative">
              <img src="${m.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.fullName) + '&background=f59e0b&color=fff'}" 
                   alt="${m.fullName}" 
                   class="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-sm" />
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-900 text-base">${m.fullName}</h4>
                <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-200 text-amber-900 border border-amber-300">${m.statusInfo.subtext}</span>
              </div>
              <p class="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                <span><i class="fas fa-phone text-slate-400 mr-1"></i>${m.phone}</span>
                <span>•</span>
                <span>Expires on: <strong class="text-slate-800">${formatDisplayDate(m.endDate)}</strong></span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1.5" title="Send WhatsApp Reminder">
              <i class="fab fa-whatsapp text-emerald-600"></i> Remind
            </a>
            <button onclick="openRenewModal('${m.id}')" class="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
              <i class="fas fa-redo-alt"></i> Renew Now
            </button>
            <button onclick="navigateTo('member-profile', '${m.id}')" class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors" title="View Profile">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  const recentPaymentsContainer = document.getElementById('dashRecentPayments');
  const recentPayments = payments.slice(0, 6);
  if (recentPayments.length === 0) {
    recentPaymentsContainer.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-slate-400 text-sm">No payment records found.</td>
      </tr>
    `;
  } else {
    recentPaymentsContainer.innerHTML = recentPayments.map(p => `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-sm">
        <td class="py-3 px-4 font-semibold text-slate-800">
          <button onclick="navigateTo('member-profile', '${p.memberId}')" class="hover:text-emerald-600 flex items-center gap-2 text-left">
            <span class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">${p.memberName ? p.memberName.charAt(0) : 'M'}</span>
            <span>${p.memberName}</span>
          </button>
        </td>
        <td class="py-3 px-4 font-bold text-emerald-600">${formatCurrency(p.amount)}</td>
        <td class="py-3 px-4 text-slate-600 text-xs">${formatDisplayDate(p.paymentDate)}</td>
        <td class="py-3 px-4 text-slate-500 text-xs">${formatDisplayDate(p.startDate)} → ${formatDisplayDate(p.endDate)}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="viewReceipt('${p.id}')" class="text-xs px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-md transition-colors inline-flex items-center gap-1">
            <i class="fas fa-receipt text-slate-500"></i> Receipt
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function renderMembers() {
  const members = Storage.getMembers();
  const searchInput = document.getElementById('memberSearchInput');
  const q = (searchInput ? searchInput.value : '').trim().toLowerCase();

  const processed = members.map(m => ({
    ...m,
    statusInfo: getMembershipStatus(m.endDate)
  }));

  const totalCount = processed.length;
  const activeCount = processed.filter(m => m.statusInfo.status === 'active' || m.statusInfo.status === 'expiring_soon').length;
  const expiringCount = processed.filter(m => m.statusInfo.status === 'expiring_soon').length;
  const expiredCount = processed.filter(m => m.statusInfo.status === 'expired').length;

  document.getElementById('countAllMembers').textContent = totalCount;
  document.getElementById('countActiveMembers').textContent = activeCount;
  document.getElementById('countExpiringMembers').textContent = expiringCount;
  document.getElementById('countExpiredMembers').textContent = expiredCount;

  const filtered = processed.filter(m => {
    const matchesSearch = !q || m.fullName.toLowerCase().includes(q) || m.phone.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (memberFilter === 'active') return m.statusInfo.status === 'active' || m.statusInfo.status === 'expiring_soon';
    if (memberFilter === 'expiring') return m.statusInfo.status === 'expiring_soon';
    if (memberFilter === 'expired') return m.statusInfo.status === 'expired';
    return true;
  });

  const tableBody = document.getElementById('membersTableBody');
  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-400">
          <i class="fas fa-user-slash text-4xl mb-3 text-slate-300"></i>
          <p class="font-medium text-slate-600">No members found matching the criteria.</p>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(m => {
    const payments = Storage.getPaymentsByMemberId(m.id);
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-sm">
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <img src="${m.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.fullName) + '&background=0f172a&color=fff'}" 
                 alt="${m.fullName}" 
                 class="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs" />
            <div>
              <button onclick="navigateTo('member-profile', '${m.id}')" class="font-bold text-slate-900 hover:text-emerald-600 transition-colors text-left block">
                ${m.fullName}
              </button>
              <span class="text-xs text-slate-400 font-mono">${m.id}</span>
            </div>
          </div>
        </td>
        <td class="py-3.5 px-4 text-slate-700 font-medium">
          <div class="flex items-center gap-1.5">
            <i class="fas fa-phone text-slate-400 text-xs"></i>
            <span>${m.phone}</span>
          </div>
        </td>
        <td class="py-3.5 px-4 text-slate-600 text-xs">
          ${formatDisplayDate(m.startDate)}
        </td>
        <td class="py-3.5 px-4">
          <div class="text-xs font-semibold text-slate-800">${formatDisplayDate(m.endDate)}</div>
        </td>
        <td class="py-3.5 px-4">
          <div class="inline-flex flex-col">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${m.statusInfo.pillBg}">
              <span class="w-1.5 h-1.5 rounded-full ${m.statusInfo.dotBg}"></span>
              ${m.statusInfo.label}
            </span>
            <span class="text-[11px] text-slate-500 mt-0.5 ml-1">${m.statusInfo.subtext}</span>
          </div>
        </td>
        <td class="py-3.5 px-4 font-bold text-slate-800">
          ${formatCurrency(totalPaid)}
        </td>
        <td class="py-3.5 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="navigateTo('member-profile', '${m.id}')" class="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1" title="View Full Profile">
              <i class="fas fa-user text-slate-500"></i> Profile
            </button>
            <button onclick="openRenewModal('${m.id}')" class="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1" title="Renew / Add Payment">
              <i class="fas fa-plus"></i> Renew
            </button>
            <button onclick="openEditMemberModal('${m.id}')" class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit Info">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderMemberProfile(memberId) {
  const member = Storage.getMemberById(memberId);
  if (!member) {
    navigateTo('members');
    showToast('Member not found', 'error');
    return;
  }

  const statusInfo = getMembershipStatus(member.endDate);
  const payments = Storage.getPaymentsByMemberId(memberId);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  document.getElementById('profName').textContent = member.fullName;
  document.getElementById('profId').textContent = member.id;
  document.getElementById('profPhone').textContent = member.phone;
  document.getElementById('profStartDate').textContent = formatDisplayDate(member.startDate);
  document.getElementById('profEndDate').textContent = formatDisplayDate(member.endDate);
  
  const photoEl = document.getElementById('profPhoto');
  photoEl.src = member.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.fullName) + '&background=0f172a&color=fff&size=200';
  photoEl.alt = member.fullName;

  const statusBadgeEl = document.getElementById('profStatusBadge');
  statusBadgeEl.className = `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-bold border ${statusInfo.pillBg}`;
  statusBadgeEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${statusInfo.dotBg}"></span> ${statusInfo.label} — ${statusInfo.subtext}`;

  document.getElementById('profTotalPaid').textContent = formatCurrency(totalPaid);
  document.getElementById('profTotalPaymentsCount').textContent = payments.length;

  const waNumber = member.phone.replace(/[^0-9]/g, '');
  const waMsg = encodeURIComponent(`Hi ${member.fullName}, greetings from IronPulse Fitness! This is a reminder regarding your gym membership status: ${statusInfo.label} (${statusInfo.subtext}). Valid until: ${formatDisplayDate(member.endDate)}.`);
  document.getElementById('profWhatsAppBtn').href = `https://wa.me/${waNumber}?text=${waMsg}`;

  document.getElementById('profRenewBtn').onclick = () => openRenewModal(member.id);
  document.getElementById('profEditBtn').onclick = () => openEditMemberModal(member.id);
  document.getElementById('profDeleteBtn').onclick = () => confirmDeleteMember(member.id);

  const historyBody = document.getElementById('profPaymentHistoryBody');
  if (payments.length === 0) {
    historyBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400 text-sm">No payment history recorded for this member.</td>
      </tr>
    `;
  } else {
    historyBody.innerHTML = payments.map(p => `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-sm">
        <td class="py-3 px-4 font-mono text-xs text-slate-500">${p.id}</td>
        <td class="py-3 px-4 font-semibold text-slate-700">${formatDisplayDate(p.paymentDate)}</td>
        <td class="py-3 px-4 font-bold text-emerald-600">${formatCurrency(p.amount)}</td>
        <td class="py-3 px-4 text-xs text-slate-600">
          <span class="font-medium text-slate-800">${formatDisplayDate(p.startDate)}</span> to <span class="font-medium text-slate-800">${formatDisplayDate(p.endDate)}</span>
        </td>
        <td class="py-3 px-4 text-xs">
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">${p.method || 'Cash'}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="viewReceipt('${p.id}')" class="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1">
            <i class="fas fa-receipt text-slate-500"></i> Receipt
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function renderPayments() {
  const payments = Storage.getPayments();
  const searchInput = document.getElementById('paymentSearchInput');
  const q = (searchInput ? searchInput.value : '').trim().toLowerCase();

  const filtered = payments.filter(p => {
    if (!q) return true;
    return (p.memberName && p.memberName.toLowerCase().includes(q)) || 
           p.id.toLowerCase().includes(q) || 
           (p.method && p.method.toLowerCase().includes(q));
  });

  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  document.getElementById('paymentsTotalSum').textContent = formatCurrency(totalCollected);
  document.getElementById('paymentsCount').textContent = payments.length;

  const tableBody = document.getElementById('allPaymentsTableBody');
  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-400">
          <i class="fas fa-receipt text-4xl mb-3 text-slate-300"></i>
          <p class="font-medium text-slate-600">No payment transactions found.</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(p => `
    <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-sm">
      <td class="py-3.5 px-4 font-mono text-xs text-slate-500 font-bold">${p.id}</td>
      <td class="py-3.5 px-4">
        <button onclick="navigateTo('member-profile', '${p.memberId}')" class="font-semibold text-slate-800 hover:text-emerald-600 transition-colors text-left flex items-center gap-2">
          <span>${p.memberName}</span>
        </button>
      </td>
      <td class="py-3.5 px-4 font-bold text-emerald-600 text-base">${formatCurrency(p.amount)}</td>
      <td class="py-3.5 px-4 text-xs text-slate-600">${formatDisplayDate(p.paymentDate)}</td>
      <td class="py-3.5 px-4 text-xs text-slate-600">
        <span class="font-medium text-slate-800">${formatDisplayDate(p.startDate)}</span> → <span class="font-medium text-slate-800">${formatDisplayDate(p.endDate)}</span>
      </td>
      <td class="py-3.5 px-4 text-xs">
        <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">${p.method || 'Cash'}</span>
      </td>
      <td class="py-3.5 px-4 text-right">
        <button onclick="viewReceipt('${p.id}')" class="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5">
          <i class="fas fa-print text-slate-500"></i> View Receipt
        </button>
      </td>
    </tr>
  `).join('');
}

function renderWarnings() {
  const members = Storage.getMembers();
  const processed = members.map(m => ({
    ...m,
    statusInfo: getMembershipStatus(m.endDate)
  }));

  const expiringList = processed.filter(m => m.statusInfo.status === 'expiring_soon')
    .sort((a, b) => a.statusInfo.daysRemaining - b.statusInfo.daysRemaining);

  const expiredList = processed.filter(m => m.statusInfo.status === 'expired')
    .sort((a, b) => b.statusInfo.daysRemaining - a.statusInfo.daysRemaining);

  document.getElementById('warningsExpiringCount').textContent = expiringList.length;
  document.getElementById('warningsExpiredCount').textContent = expiredList.length;

  const expContainer = document.getElementById('warningsExpiringList');
  if (expiringList.length === 0) {
    expContainer.innerHTML = `
      <div class="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        <i class="fas fa-shield-alt text-emerald-500 text-4xl mb-3"></i>
        <h4 class="font-bold text-slate-700">No Members Expiring in 7 Days</h4>
        <p class="text-xs text-slate-400 mt-1">All memberships have more than 7 days remaining.</p>
      </div>
    `;
  } else {
    expContainer.innerHTML = expiringList.map(m => {
      const waNumber = m.phone.replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(`Hi ${m.fullName}, gentle reminder from IronPulse Fitness: Your gym membership expires on ${formatDisplayDate(m.endDate)} (${m.statusInfo.subtext}). Standard renewal is PKR 1,500.`);
      return `
        <div class="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <img src="${m.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.fullName) + '&background=f59e0b&color=fff'}" 
                 class="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-sm" />
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-900">${m.fullName}</h4>
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  <i class="fas fa-exclamation-triangle mr-1"></i>${m.statusInfo.subtext}
                </span>
              </div>
              <p class="text-xs text-slate-600 mt-1">
                Phone: <strong class="text-slate-800">${m.phone}</strong> | Current Validity: <strong>${formatDisplayDate(m.startDate)} → ${formatDisplayDate(m.endDate)}</strong>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full md:w-auto justify-end">
            <a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1.5">
              <i class="fab fa-whatsapp"></i> Send WhatsApp Reminder
            </a>
            <button onclick="openRenewModal('${m.id}')" class="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center gap-1.5">
              <i class="fas fa-redo"></i> Renew (PKR 1,500)
            </button>
            <button onclick="navigateTo('member-profile', '${m.id}')" class="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg">
              Profile
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  const expdContainer = document.getElementById('warningsExpiredList');
  if (expiredList.length === 0) {
    expdContainer.innerHTML = `
      <div class="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        <i class="fas fa-check-double text-emerald-500 text-4xl mb-3"></i>
        <h4 class="font-bold text-slate-700">No Expired Members</h4>
        <p class="text-xs text-slate-400 mt-1">All members currently have active status.</p>
      </div>
    `;
  } else {
    expdContainer.innerHTML = expiredList.map(m => {
      const waNumber = m.phone.replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(`Hi ${m.fullName}, your gym membership at IronPulse Fitness has expired (${m.statusInfo.subtext}). Please visit the gym to reactivate your membership.`);
      return `
        <div class="p-4 bg-red-50/80 border border-red-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <img src="${m.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.fullName) + '&background=ef4444&color=fff'}" 
                 class="w-12 h-12 rounded-full object-cover border-2 border-red-300 shadow-sm" />
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-900">${m.fullName}</h4>
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-200 text-red-900 border border-red-300">
                  <i class="fas fa-times-circle mr-1"></i>${m.statusInfo.subtext}
                </span>
              </div>
              <p class="text-xs text-slate-600 mt-1">
                Phone: <strong class="text-slate-800">${m.phone}</strong> | Last active until: <strong>${formatDisplayDate(m.endDate)}</strong>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full md:w-auto justify-end">
            <a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1.5">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
            <button onclick="openRenewModal('${m.id}')" class="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-1.5">
              <i class="fas fa-sync"></i> Reactivate Membership
            </button>
            <button onclick="navigateTo('member-profile', '${m.id}')" class="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg">
              Profile
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function openAddMemberModal() {
  const form = document.getElementById('addMemberForm');
  form.reset();

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  document.getElementById('addStartDate').value = todayStr;
  document.getElementById('addEndDate').value = calculateOneMonthLater(todayStr);
  document.getElementById('addFeeAmount').value = Storage.getGymInfo().defaultFee || 1500;
  document.getElementById('addPhotoPreview').src = 'https://ui-avatars.com/api/?name=New+Member&background=0f172a&color=fff';
  document.getElementById('addPhotoBase64').value = '';

  document.getElementById('addMemberModal').classList.remove('hidden');
}

function openEditMemberModal(memberId) {
  const member = Storage.getMemberById(memberId);
  if (!member) return;

  document.getElementById('editMemberId').value = member.id;
  document.getElementById('editFullName').value = member.fullName;
  document.getElementById('editPhone').value = member.phone;
  document.getElementById('editStartDate').value = member.startDate;
  document.getElementById('editEndDate').value = member.endDate;
  
  const preview = document.getElementById('editPhotoPreview');
  preview.src = member.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.fullName) + '&background=0f172a&color=fff';
  document.getElementById('editPhotoBase64').value = member.photo || '';

  document.getElementById('editMemberModal').classList.remove('hidden');
}

function openRenewModal(memberId) {
  const member = Storage.getMemberById(memberId);
  if (!member) return;

  document.getElementById('renewMemberId').value = member.id;
  document.getElementById('renewMemberName').textContent = member.fullName;
  document.getElementById('renewCurrentEnd').textContent = formatDisplayDate(member.endDate);
  
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  document.getElementById('renewPaymentDate').value = todayStr;

  const statusInfo = getMembershipStatus(member.endDate);
  let newStart = todayStr;
  
  if (statusInfo.status === 'active' || statusInfo.status === 'expiring_soon') {
    const parts = member.endDate.split('-');
    const currentEnd = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    currentEnd.setDate(currentEnd.getDate() + 1);
    const ny = currentEnd.getFullYear();
    const nm = String(currentEnd.getMonth() + 1).padStart(2, '0');
    const nd = String(currentEnd.getDate()).padStart(2, '0');
    newStart = `${ny}-${nm}-${nd}`;
  } else {
    newStart = todayStr;
  }

  document.getElementById('renewStartDate').value = newStart;
  document.getElementById('renewEndDate').value = calculateOneMonthLater(newStart);
  document.getElementById('renewAmount').value = Storage.getGymInfo().defaultFee || 1500;
  document.getElementById('renewMethod').value = 'Cash';
  document.getElementById('renewNotes').value = 'Monthly Renewal';

  document.getElementById('renewModal').classList.remove('hidden');
}

function confirmDeleteMember(memberId) {
  const member = Storage.getMemberById(memberId);
  if (!member) return;

  if (confirm(`Are you sure you want to delete member "${member.fullName}" (${member.id})? All payment records for this member will also be removed.`)) {
    Storage.deleteMember(memberId);
    showToast(`Member ${member.fullName} deleted successfully.`, 'info');
    if (currentView === 'member-profile') {
      navigateTo('members');
    } else {
      navigateTo(currentView);
    }
  }
}

function viewReceipt(paymentId) {
  const payments = Storage.getPayments();
  const payment = payments.find(p => p.id === paymentId);
  if (!payment) return;

  const gymInfo = Storage.getGymInfo();
  const member = Storage.getMemberById(payment.memberId);

  document.getElementById('receiptGymName').textContent = gymInfo.gymName;
  document.getElementById('receiptGymPhone').textContent = gymInfo.gymPhone;
  document.getElementById('receiptGymAddress').textContent = gymInfo.gymAddress;
  
  document.getElementById('receiptNo').textContent = payment.id;
  document.getElementById('receiptDate').textContent = formatDisplayDate(payment.paymentDate);
  document.getElementById('receiptMemberName').textContent = payment.memberName;
  document.getElementById('receiptMemberPhone').textContent = member ? member.phone : 'N/A';
  document.getElementById('receiptMemberId').textContent = payment.memberId;
  
  document.getElementById('receiptPeriod').textContent = `${formatDisplayDate(payment.startDate)} to ${formatDisplayDate(payment.endDate)}`;
  document.getElementById('receiptMethod').textContent = payment.method || 'Cash';
  document.getElementById('receiptNotes').textContent = payment.notes || 'Gym Membership';
  document.getElementById('receiptAmount').textContent = formatCurrency(payment.amount);

  document.getElementById('receiptModal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function handlePhotoUpload(inputEl, previewEl, hiddenInputEl) {
  const file = inputEl.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert('Photo must be smaller than 2MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    previewEl.src = base64;
    hiddenInputEl.value = base64;
  };
  reader.readAsDataURL(file);
}

function selectAvatarPreset(url, previewId, hiddenId) {
  document.getElementById(previewId).src = url;
  document.getElementById(hiddenId).value = url;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-view');
      if (target) navigateTo(target);
    });
  });

  const memberSearch = document.getElementById('memberSearchInput');
  if (memberSearch) {
    memberSearch.addEventListener('input', () => renderMembers());
  }

  const paymentSearch = document.getElementById('paymentSearchInput');
  if (paymentSearch) {
    paymentSearch.addEventListener('input', () => renderPayments());
  }

  document.querySelectorAll('.member-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.member-filter-tab').forEach(t => {
        t.classList.remove('active', 'border-emerald-500', 'text-emerald-600', 'font-bold');
        t.classList.add('text-slate-500', 'border-transparent');
      });
      tab.classList.add('active', 'border-emerald-500', 'text-emerald-600', 'font-bold');
      tab.classList.remove('text-slate-500', 'border-transparent');

      memberFilter = tab.getAttribute('data-filter');
      renderMembers();
    });
  });

  const addStartDateInput = document.getElementById('addStartDate');
  if (addStartDateInput) {
    addStartDateInput.addEventListener('change', (e) => {
      const computed = calculateOneMonthLater(e.target.value);
      document.getElementById('addEndDate').value = computed;
    });
  }

  const renewStartDateInput = document.getElementById('renewStartDate');
  if (renewStartDateInput) {
    renewStartDateInput.addEventListener('change', (e) => {
      const computed = calculateOneMonthLater(e.target.value);
      document.getElementById('renewEndDate').value = computed;
    });
  }

  const addForm = document.getElementById('addMemberForm');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('addFullName').value.trim();
      const phone = document.getElementById('addPhone').value.trim();
      const startDate = document.getElementById('addStartDate').value;
      const endDate = document.getElementById('addEndDate').value;
      const initialFee = document.getElementById('addFeeAmount').value;
      const paymentMethod = document.getElementById('addPaymentMethod').value;
      const photo = document.getElementById('addPhotoBase64').value;

      if (!fullName || !phone || !startDate || !endDate) {
        alert('Please fill in all required fields.');
        return;
      }

      const newMember = Storage.addMember({
        fullName,
        phone,
        startDate,
        endDate,
        photo
      }, initialFee, paymentMethod);

      closeModal('addMemberModal');
      showToast(`Member "${newMember.fullName}" added successfully with payment of PKR ${initialFee}!`);
      
      if (currentView === 'members') renderMembers();
      else if (currentView === 'dashboard') renderDashboard();
      else navigateTo('member-profile', newMember.id);
    });
  }

  const editForm = document.getElementById('editMemberForm');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editMemberId').value;
      const fullName = document.getElementById('editFullName').value.trim();
      const phone = document.getElementById('editPhone').value.trim();
      const startDate = document.getElementById('editStartDate').value;
      const endDate = document.getElementById('editEndDate').value;
      const photo = document.getElementById('editPhotoBase64').value;

      if (!fullName || !phone || !startDate || !endDate) {
        alert('Please fill in all required fields.');
        return;
      }

      Storage.updateMember(id, {
        fullName,
        phone,
        startDate,
        endDate,
        photo
      });

      closeModal('editMemberModal');
      showToast('Member details updated successfully.');
      
      if (currentView === 'member-profile') renderMemberProfile(id);
      else if (currentView === 'members') renderMembers();
      else if (currentView === 'dashboard') renderDashboard();
    });
  }

  const renewForm = document.getElementById('renewForm');
  if (renewForm) {
    renewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const memberId = document.getElementById('renewMemberId').value;
      const member = Storage.getMemberById(memberId);
      if (!member) return;

      const paymentDate = document.getElementById('renewPaymentDate').value;
      const startDate = document.getElementById('renewStartDate').value;
      const endDate = document.getElementById('renewEndDate').value;
      const amount = document.getElementById('renewAmount').value;
      const method = document.getElementById('renewMethod').value;
      const notes = document.getElementById('renewNotes').value;

      if (!paymentDate || !startDate || !endDate || !amount) {
        alert('Please fill in all required fields.');
        return;
      }

      const payment = Storage.addPayment({
        memberId,
        memberName: member.fullName,
        amount,
        paymentDate,
        startDate,
        endDate,
        method,
        notes
      });

      closeModal('renewModal');
      showToast(`Payment of PKR ${amount} recorded for ${member.fullName}!`);
      
      if (currentView === 'member-profile') renderMemberProfile(memberId);
      else if (currentView === 'dashboard') renderDashboard();
      else if (currentView === 'members') renderMembers();
      else if (currentView === 'warnings') renderWarnings();
      else if (currentView === 'payments') renderPayments();
    });
  }

  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const gymName = document.getElementById('setGymName').value.trim();
      const gymPhone = document.getElementById('setGymPhone').value.trim();
      const gymAddress = document.getElementById('setGymAddress').value.trim();
      const defaultFee = document.getElementById('setDefaultFee').value;

      Storage.updateGymInfo({
        gymName,
        gymPhone,
        gymAddress,
        defaultFee
      });

      closeModal('settingsModal');
      showToast('Gym settings updated.');
      updateGymBrandingUI();
    });
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.closest('.modal-container').classList.add('hidden');
      }
    });
  });

  updateGymBrandingUI();
  navigateTo('dashboard');
});

function updateGymBrandingUI() {
  const info = Storage.getGymInfo();
  document.querySelectorAll('.gym-branding-name').forEach(el => el.textContent = info.gymName);
  document.querySelectorAll('.gym-branding-phone').forEach(el => el.textContent = info.gymPhone);
}

function openSettingsModal() {
  const info = Storage.getGymInfo();
  document.getElementById('setGymName').value = info.gymName;
  document.getElementById('setGymPhone').value = info.gymPhone;
  document.getElementById('setGymAddress').value = info.gymAddress;
  document.getElementById('setDefaultFee').value = info.defaultFee;
  document.getElementById('settingsModal').classList.remove('hidden');
}

function exportDataFile() {
  const data = Storage.loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ironpulse_gym_backup.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported successfully.');
}

function importDataFile(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data && data.members && data.payments) {
        Storage.saveData(data);
        showToast('Backup restored successfully!');
        updateGymBrandingUI();
        navigateTo('dashboard');
        closeModal('settingsModal');
      } else {
        alert('Invalid backup file format.');
      }
    } catch (err) {
      alert('Failed to parse JSON file.');
    }
  };
  reader.readAsText(file);
}

function resetDemoDataAction() {
  if (confirm('Reset to initial sample demo data? This will restore sample members and payments.')) {
    Storage.resetData();
    showToast('Reset to demo dataset.');
    updateGymBrandingUI();
    navigateTo('dashboard');
    closeModal('settingsModal');
  }
}
