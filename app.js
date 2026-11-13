const APPWRITE_CONFIG = {
  endpoint: 'https://cloud.appwrite.io/v1',
  projectId: 'YOUR_PROJECT_ID',
  databaseId: 'hr_portal_db',
  collections: {
    employees: 'employees',
    leaves: 'leave_requests',
    appointments: 'appointments',
    expenses: 'expense_claims'
  }
};

const isLiveAppwrite = APPWRITE_CONFIG.projectId !== 'YOUR_PROJECT_ID';
let databases = null;

if (isLiveAppwrite) {
  const { Client, Databases } = Appwrite;
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  databases = new Databases(client);

  const badge = document.getElementById('connection-badge');
  badge.innerText = 'Appwrite Cloud Connected';
  badge.classList.add('live');
}

// Helper to create future date strings relative to today so 60-day demo alerts work dynamically
function getFutureDateString(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

let state = {
  employees: [
    {
      $id: '1',
      name: 'Amina Hassan',
      role: 'Branch Manager',
      branch: 'Indira Gandhi',
      phone: '+255 713 440 112',
      email: 'amina.hassan@jdmhub.co.tz',
      nida: '19910815-14102-00024-19',
      emergency: 'Salim Hassan (+255 754 221 900)',
      contractStart: '2025-12-20',
      contractEnd: getFutureDateString(38), // 38 days left -> triggers 60-day alert!
      salary: 1450000,
      leaveBalance: 16,
      status: 'Active'
    },
    {
      $id: '2',
      name: 'David Mwakalinga',
      role: 'Front Office Lead',
      branch: 'Makunganya',
      phone: '+255 765 890 331',
      email: 'david.m@jdmhub.co.tz',
      nida: '19940322-11205-00089-21',
      emergency: 'Esther Mwakalinga (+255 715 998 110)',
      contractStart: '2026-01-05',
      contractEnd: getFutureDateString(54), // 54 days left -> triggers 60-day alert!
      salary: 850000,
      leaveBalance: 14,
      status: 'Active'
    },
    {
      $id: '3',
      name: 'Grace Kimaro',
      role: 'Accounts & Payroll Officer',
      branch: 'Indira Gandhi',
      phone: '+255 688 512 774',
      email: 'grace.kimaro@jdmhub.co.tz',
      nida: '19931110-15101-00043-18',
      emergency: 'Peter Kimaro (+255 784 300 412)',
      contractStart: '2026-05-01',
      contractEnd: getFutureDateString(170),
      salary: 1100000,
      leaveBalance: 21,
      status: 'Active'
    },
    {
      $id: '4',
      name: 'Baraka Juma',
      role: 'Operations Supervisor',
      branch: 'Chikongola',
      phone: '+255 719 604 882',
      email: 'baraka.juma@jdmhub.co.tz',
      nida: '19960214-12104-00017-22',
      emergency: 'Halima Juma (+255 655 118 209)',
      contractStart: '2026-06-15',
      contractEnd: getFutureDateString(215),
      salary: 900000,
      leaveBalance: 18,
      status: 'Active'
    }
  ],
  leaves: [
    { $id: 'l1', emp: 'David Mwakalinga', branch: 'Makunganya', type: 'Weekly Off-Day', dates: 'Nov 15, 2026', notes: 'Covered by Front Desk team', status: 'Pending' },
    { $id: 'l2', emp: 'Amina Hassan', branch: 'Indira Gandhi', type: 'Annual Leave', dates: 'Nov 24 - Nov 28, 2026', notes: 'Handover to Accounts Lead', status: 'Pending' }
  ],
  appointments: [
    { $id: 'a1', type: 'Contract Renewal Review', participant: 'Amina Hassan', branch: 'Indira Gandhi', datetime: 'Nov 17, 2026 at 10:00 AM', agenda: '60-Day Contract Extension & KPI Review', status: 'Scheduled' },
    { $id: 'a2', type: 'Company Management & HR', participant: 'Managing Director & HR Lead', branch: 'Indira Gandhi', datetime: 'Nov 19, 2026 at 02:30 PM', agenda: 'Q4 Staffing Budget & Branch Off-Day Policy', status: 'Scheduled' }
  ],
  expenses: [
    { $id: 'e1', emp: 'Baraka Juma', branch: 'Chikongola', desc: 'Guest Transfer & Fuel', amount: 65000, status: 'Pending' },
    { $id: 'e2', emp: 'Grace Kimaro', branch: 'Indira Gandhi', desc: 'Stationery & Printer Toner', amount: 140000, status: 'Approved' }
  ]
};

function calculateDaysRemaining(endDateStr) {
  if (!endDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);
  const diffTime = end - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function switchTab(sectionId, navEl) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) {
    navEl.classList.add('active');
    document.getElementById('page-title').innerText = navEl.innerText;
  }
}

async function syncFromAppwrite() {
  if (!isLiveAppwrite) {
    renderAll();
    return;
  }
  try {
    const [empRes, leaveRes, apptRes, expRes] = await Promise.all([
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.employees),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.leaves),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.appointments),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.expenses)
    ]);
    state.employees = empRes.documents;
    state.leaves = leaveRes.documents;
    state.appointments = apptRes.documents;
    state.expenses = expRes.documents;
    renderAll();
  } catch (err) {
    console.error('Appwrite Sync Error:', err);
    renderAll();
  }
}

function renderAll() {
  const selectedBranch = document.getElementById('branch-filter').value;
  const filterByBranch = (item) => selectedBranch === 'ALL' || item.branch === selectedBranch;

  const filteredStaff = state.employees.filter(filterByBranch);
  const filteredLeaves = state.leaves.filter(filterByBranch);
  const filteredAppts = state.appointments.filter(filterByBranch);
  const filteredExpenses = state.expenses.filter(filterByBranch);

  // Check 60-Day Contract Alerts
  const expiringStaff = filteredStaff.filter(emp => calculateDaysRemaining(emp.contractEnd) <= 60);
  const banner = document.getElementById('contract-alert-banner');
  const alertList = document.getElementById('contract-alert-list');

  if (expiringStaff.length > 0) {
    banner.style.display = 'block';
    alertList.innerHTML = expiringStaff.map(emp => {
      const days = calculateDaysRemaining(emp.contractEnd);
      const label = days < 0 ? `EXPIRED (${Math.abs(days)} days ago)` : `${days} days remaining (Ends ${emp.contractEnd})`;
      return `<li><strong>${emp.name}</strong> (${emp.role} - ${emp.branch}): <strong>${label}</strong> &mdash; <span class="staff-link" onclick="openStaffDossier('${emp.$id}')">Open Form &amp; Renew Contract</span></li>`;
    }).join('');
  } else {
    banner.style.display = 'none';
  }

  // Update KPIs
  document.getElementById('kpi-staff').innerText = filteredStaff.length;
  document.getElementById('kpi-contracts').innerText = expiringStaff.length;
  document.getElementById('kpi-leave').innerText = filteredLeaves.filter(l => l.status === 'Pending').length;
  document.getElementById('kpi-appointments').innerText = filteredAppts.filter(a => a.status === 'Scheduled').length;

  // Render Staff Table
  document.getElementById('staff-tbody').innerHTML = filteredStaff.map(emp => {
    const days = calculateDaysRemaining(emp.contractEnd);
    let badgeClass = 'badge-approved';
    let daysText = `${days} days left`;
    if (days < 0) {
      badgeClass = 'badge-danger';
      daysText = 'Expired';
    } else if (days <= 60) {
      badgeClass = 'badge-danger';
      daysText = `${days} days (Renew!)`;
    }

    return `
      <tr>
        <td><span class="staff-link" onclick="openStaffDossier('${emp.$id}')">${emp.name}</span></td>
        <td>${emp.role} &bull; <small>${emp.branch}</small></td>
        <td>${emp.contractEnd || 'N/A'}</td>
        <td><span class="badge ${badgeClass}">${daysText}</span></td>
        <td>TZS ${Number(emp.salary).toLocaleString()}</td>
        <td><button class="btn btn-outline btn-sm" onclick="openStaffDossier('${emp.$id}')">Full Form</button></td>
      </tr>
    `;
  }).join('');

  // Render Leave & Off-Days Table
  document.getElementById('leave-tbody').innerHTML = filteredLeaves.map(l => `
    <tr>
      <td><strong>${l.emp}</strong></td>
      <td>${l.branch}</td>
      <td><span class="badge ${l.type.includes('Off-Day') ? 'badge-pending' : 'badge-approved'}">${l.type}</span></td>
      <td>${l.dates}</td>
      <td>${l.notes || '-'}</td>
      <td><span class="badge ${l.status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${l.status}</span></td>
      <td>
        ${l.status === 'Pending' 
          ? `<button class="btn btn-sm" onclick="approveItem('leaves', '${l.$id}', 'Approved')">Approve</button>` 
          : '<span style="color:var(--muted); font-size:0.8rem;">Approved</span>'}
      </td>
    </tr>
  `).join('');

  // Render Appointments Table
  document.getElementById('appointments-tbody').innerHTML = filteredAppts.map(a => `
    <tr>
      <td><strong>${a.type}</strong></td>
      <td>${a.participant}</td>
      <td>${a.branch}</td>
      <td>${a.datetime}</td>
      <td>${a.agenda}</td>
      <td><span class="badge ${a.status === 'Completed' ? 'badge-approved' : 'badge-pending'}">${a.status}</span></td>
      <td>
        ${a.status === 'Scheduled' 
          ? `<button class="btn btn-sm" onclick="approveItem('appointments', '${a.$id}', 'Completed')">Mark Done</button>` 
          : '<span style="color:var(--muted); font-size:0.8rem;">Completed</span>'}
      </td>
    </tr>
  `).join('');

  // Render Expense Table
  document.getElementById('expense-tbody').innerHTML = filteredExpenses.map(e => `
    <tr>
      <td><strong>${e.emp}</strong></td>
      <td>${e.branch}</td>
      <td>${e.desc}</td>
      <td>TZS ${Number(e.amount).toLocaleString()}</td>
      <td><span class="badge ${e.status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${e.status}</span></td>
      <td>
        ${e.status === 'Pending' 
          ? `<button class="btn btn-sm" onclick="approveItem('expenses', '${e.$id}', 'Approved')">Approve</button>` 
          : '<span style="color:var(--muted); font-size:0.8rem;">Resolved</span>'}
      </td>
    </tr>
  `).join('');

  // Render Payroll Table
  document.getElementById('payroll-tbody').innerHTML = filteredStaff.map(emp => {
    const gross = Number(emp.salary);
    const nssf = Math.round(gross * 0.10);
    const net = gross - nssf;
    return `
      <tr>
        <td><strong>${emp.name}</strong></td>
        <td>${emp.branch}</td>
        <td>TZS ${gross.toLocaleString()}</td>
        <td>TZS ${nssf.toLocaleString()}</td>
        <td><strong>TZS ${net.toLocaleString()}</strong></td>
        <td><button class="btn btn-outline btn-sm" onclick="openPayslip('${emp.name}', '${emp.role}', '${emp.branch}', ${gross}, ${nssf}, ${net})">View Payslip</button></td>
      </tr>
    `;
  }).join('');
}

// Open Complete Staff Dossier & Contract Renewal Modal
function openStaffDossier(empId) {
  const emp = state.employees.find(e => e.$id === empId);
  if (!emp) return;

  const days = calculateDaysRemaining(emp.contractEnd);
  const alertHtml = days <= 60
    ? `<div class="alert-banner" style="margin-bottom:16px;"><strong>HR Action Needed:</strong> Only <strong>${days} days</strong> remaining on this contract. Use the renewal date picker below to extend the contract.</div>`
    : '';

  document.getElementById('staff-dossier-content').innerHTML = `
    ${alertHtml}
    <div class="dossier-grid">
      <div class="dossier-field"><small>Full Legal Name</small><strong>${emp.name}</strong></div>
      <div class="dossier-field"><small>Job Title / Role</small><strong>${emp.role}</strong></div>
      <div class="dossier-field"><small>Assigned Branch</small><strong>${emp.branch}</strong></div>
      <div class="dossier-field"><small>Phone Number</small><strong>${emp.phone || 'Not Provided'}</strong></div>
      <div class="dossier-field"><small>Email Address</small><strong>${emp.email || 'Not Provided'}</strong></div>
      <div class="dossier-field"><small>NIDA / National ID</small><strong>${emp.nida || 'Pending Verification'}</strong></div>
      <div class="dossier-field"><small>Emergency Contact</small><strong>${emp.emergency || 'Not Provided'}</strong></div>
      <div class="dossier-field"><small>Basic Gross Salary</small><strong>TZS ${Number(emp.salary).toLocaleString()} / Month</strong></div>
      <div class="dossier-field"><small>Contract Start Date</small><strong>${emp.contractStart || 'N/A'}</strong></div>
      <div class="dossier-field"><small>Contract End Date</small><strong>${emp.contractEnd || 'N/A'} (${days} days left)</strong></div>
      <div class="dossier-field"><small>Annual Leave Balance</small><strong>${emp.leaveBalance || 21} Days Remaining</strong></div>
      <div class="dossier-field"><small>Employment Status</small><strong>${emp.status || 'Active'}</strong></div>
    </div>

    <div class="form-box" style="margin-bottom:0;">
      <h4 style="margin-bottom:10px; color:var(--primary); font-size:0.95rem;">HR Contract Update &amp; Renewal Form</h4>
      <div class="form-grid">
        <div class="form-group">
          <label>New Contract End Date</label>
          <input type="date" id="renew-date-input" value="${emp.contractEnd || ''}" />
        </div>
        <div class="form-group">
          <label>Updated Salary (TZS)</label>
          <input type="number" id="renew-salary-input" value="${emp.salary}" />
        </div>
        <div class="form-group">
          <button class="btn" onclick="renewEmployeeContract('${emp.$id}')">Save &amp; Update Contract</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('staff-modal').style.display = 'flex';
}

async function renewEmployeeContract(empId) {
  const newEndDate = document.getElementById('renew-date-input').value;
  const newSalary = Number(document.getElementById('renew-salary-input').value);
  if (!newEndDate) return alert('Please select a valid new contract end date.');

  if (isLiveAppwrite) {
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.employees, empId, {
      contractEnd: newEndDate,
      salary: newSalary
    });
    await syncFromAppwrite();
  } else {
    const emp = state.employees.find(e => e.$id === empId);
    if (emp) {
      emp.contractEnd = newEndDate;
      emp.salary = newSalary;
    }
    renderAll();
  }

  document.getElementById('staff-modal').style.display = 'none';
  alert('Employee contract and profile updated successfully.');
}

async function handleAddEmployee() {
  const name = document.getElementById('emp-name').value.trim();
  const role = document.getElementById('emp-role').value.trim();
  const branch = document.getElementById('emp-branch').value;
  const phone = document.getElementById('emp-phone').value.trim();
  const email = document.getElementById('emp-email').value.trim();
  const nida = document.getElementById('emp-nida').value.trim();
  const emergency = document.getElementById('emp-emergency').value.trim();
  const contractStart = document.getElementById('emp-start').value;
  const contractEnd = document.getElementById('emp-end').value;
  const salary = Number(document.getElementById('emp-salary').value);

  if (!name || !role || !contractEnd || !salary) {
    return alert('Please fill in Name, Role, Contract End Date, and Salary.');
  }

  const payload = {
    name, role, branch, phone, email, nida, emergency,
    contractStart, contractEnd, salary, leaveBalance: 21, status: 'Active'
  };

  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.employees, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.employees.unshift({ $id: Date.now().toString(), ...payload });
    renderAll();
  }

  ['emp-name', 'emp-role', 'emp-phone', 'emp-email', 'emp-nida', 'emp-emergency', 'emp-start', 'emp-end', 'emp-salary']
    .forEach(id => document.getElementById(id).value = '');
}

async function handleAddLeave() {
  const emp = document.getElementById('leave-emp').value.trim();
  const type = document.getElementById('leave-type').value;
  const dates = document.getElementById('leave-dates').value.trim();
  const notes = document.getElementById('leave-notes').value.trim();
  const branch = document.getElementById('branch-filter').value === 'ALL' ? 'Indira Gandhi' : document.getElementById('branch-filter').value;

  if (!emp || !dates) return alert('Please fill in employee name and dates.');

  const payload = { emp, branch, type, dates, notes, status: 'Pending' };

  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.leaves, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.leaves.unshift({ $id: Date.now().toString(), ...payload });
    renderAll();
  }

  document.getElementById('leave-emp').value = '';
  document.getElementById('leave-dates').value = '';
  document.getElementById('leave-notes').value = '';
}

async function handleAddAppointment() {
  const type = document.getElementById('appt-type').value;
  const participant = document.getElementById('appt-participant').value.trim();
  const datetime = document.getElementById('appt-datetime').value.trim();
  const agenda = document.getElementById('appt-agenda').value.trim();
  const branch = document.getElementById('branch-filter').value === 'ALL' ? 'Indira Gandhi' : document.getElementById('branch-filter').value;

  if (!participant || !datetime || !agenda) return alert('Please complete all appointment fields.');

  const payload = { type, participant, branch, datetime, agenda, status: 'Scheduled' };

  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.appointments, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.appointments.unshift({ $id: Date.now().toString(), ...payload });
    renderAll();
  }

  document.getElementById('appt-participant').value = '';
  document.getElementById('appt-datetime').value = '';
  document.getElementById('appt-agenda').value = '';
}

async function handleAddExpense() {
  const emp = document.getElementById('exp-emp').value.trim();
  const desc = document.getElementById('exp-desc').value.trim();
  const amount = Number(document.getElementById('exp-amt').value);
  const branch = document.getElementById('branch-filter').value === 'ALL' ? 'Indira Gandhi' : document.getElementById('branch-filter').value;

  if (!emp || !desc || !amount) return alert('Please complete all expense claim fields.');

  const payload = { emp, branch, desc, amount, status: 'Pending' };

  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.expenses, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.expenses.unshift({ $id: Date.now().toString(), ...payload });
    renderAll();
  }

  document.getElementById('exp-emp').value = '';
  document.getElementById('exp-desc').value = '';
  document.getElementById('exp-amt').value = '';
}

async function approveItem(type, id, newStatus) {
  if (isLiveAppwrite) {
    const col = APPWRITE_CONFIG.collections[type];
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, col, id, { status: newStatus });
    await syncFromAppwrite();
  } else {
    const target = state[type].find(item => item.$id === id);
    if (target) target.status = newStatus;
    renderAll();
  }
}

function openPayslip(name, role, branch, gross, nssf, net) {
  document.getElementById('payslip-content').innerHTML = `
    <div class="payslip-row"><span>Employee Name:</span><strong>${name}</strong></div>
    <div class="payslip-row"><span>Position:</span><span>${role}</span></div>
    <div class="payslip-row"><span>Branch Location:</span><span>${branch}</span></div>
    <div class="payslip-row"><span>Pay Period:</span><span>November 2026</span></div>
    <div class="payslip-row"><span>Basic Gross Salary:</span><span>TZS ${gross.toLocaleString()}</span></div>
    <div class="payslip-row"><span>NSSF Contribution (10%):</span><span style="color:var(--danger);">- TZS ${nssf.toLocaleString()}</span></div>
    <div class="payslip-row" style="border-bottom:none; font-size:1.05rem; margin-top:8px;">
      <strong>Net Take-Home Pay:</strong><strong style="color:var(--success);">TZS ${net.toLocaleString()}</strong>
    </div>
  `;
  document.getElementById('payslip-modal').style.display = 'flex';
}

function exportCSV() {
  const rows = [['Name', 'Role', 'Branch', 'Phone', 'NIDA', 'Contract Start', 'Contract End', 'Days Remaining', 'Salary', 'Status']];
  state.employees.forEach(e => {
    rows.push([
      e.name, e.role, e.branch, e.phone || '', e.nida || '',
      e.contractStart || '', e.contractEnd || '', calculateDaysRemaining(e.contractEnd),
      e.salary, e.status
    ]);
  });
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', 'JDM_HR_Full_Staff_Dossier.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.onload = syncFromAppwrite;
