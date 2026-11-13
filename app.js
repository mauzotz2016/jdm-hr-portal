const APPWRITE_CONFIG = {
  endpoint: 'https://cloud.appwrite.io/v1',
  projectId: 'JDM HR Portal',
  databaseId: 'hr_portal_db',
  collections: {
    employees: 'employees',
    leaves: 'leave_requests',
    expenses: 'expense_claims'
  }
};

const isLiveAppwrite = APPWRITE_CONFIG.projectId !== 'JDM HR Portal';
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

let state = {
  employees: [
    { $id: '1', name: 'Amina Hassan', role: 'Branch Manager', branch: 'Indira Gandhi', salary: 1450000, status: 'Active' },
    { $id: '2', name: 'David Mwakalinga', role: 'Front Office Lead', branch: 'Makunganya', salary: 850000, status: 'Active' },
    { $id: '3', name: 'Grace Kimaro', role: 'Accounts & Payroll Officer', branch: 'Indira Gandhi', salary: 1100000, status: 'Active' },
    { $id: '4', name: 'Baraka Juma', role: 'Operations Supervisor', branch: 'Chikongola', salary: 900000, status: 'Active' }
  ],
  leaves: [
    { $id: 'l1', emp: 'David Mwakalinga', branch: 'Makunganya', type: 'Annual Leave', dates: 'Nov 20 - Nov 25, 2026', status: 'Pending' },
    { $id: 'l2', emp: 'Amina Hassan', branch: 'Indira Gandhi', type: 'Sick Leave', dates: 'Nov 04 - Nov 05, 2026', status: 'Approved' }
  ],
  expenses: [
    { $id: 'e1', emp: 'Baraka Juma', branch: 'Chikongola', desc: 'Guest Transfer & Fuel', amount: 65000, status: 'Pending' },
    { $id: 'e2', emp: 'Grace Kimaro', branch: 'Indira Gandhi', desc: 'Stationery & Printer Toner', amount: 140000, status: 'Approved' }
  ]
};

function switchTab(sectionId, navEl) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  navEl.classList.add('active');
  document.getElementById('page-title').innerText = navEl.innerText;
}

async function syncFromAppwrite() {
  if (!isLiveAppwrite) {
    renderAll();
    return;
  }
  try {
    const [empRes, leaveRes, expRes] = await Promise.all([
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.employees),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.leaves),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.expenses)
    ]);
    state.employees = empRes.documents;
    state.leaves = leaveRes.documents;
    state.expenses = expRes.documents;
    renderAll();
  } catch (err) {
    console.error('Appwrite Sync Error:', err);
  }
}

function renderAll() {
  const selectedBranch = document.getElementById('branch-filter').value;
  const filterByBranch = (item) => selectedBranch === 'ALL' || item.branch === selectedBranch;

  const filteredStaff = state.employees.filter(filterByBranch);
  const filteredLeaves = state.leaves.filter(filterByBranch);
  const filteredExpenses = state.expenses.filter(filterByBranch);

  document.getElementById('kpi-staff').innerText = filteredStaff.length;
  document.getElementById('kpi-leave').innerText = filteredLeaves.filter(l => l.status === 'Pending').length;
  document.getElementById('kpi-expenses').innerText = filteredExpenses.filter(e => e.status === 'Pending').length;

  const totalGross = filteredStaff.reduce((sum, emp) => sum + Number(emp.salary || 0), 0);
  document.getElementById('kpi-payroll').innerText = 'TZS ' + totalGross.toLocaleString();

  document.getElementById('staff-tbody').innerHTML = filteredStaff.map(emp => `
    <tr>
      <td><strong>${emp.name}</strong></td>
      <td>${emp.role}</td>
      <td>${emp.branch}</td>
      <td>TZS ${Number(emp.salary).toLocaleString()}</td>
      <td><span class="badge badge-approved">${emp.status || 'Active'}</span></td>
    </tr>
  `).join('');

  document.getElementById('leave-tbody').innerHTML = filteredLeaves.map(l => `
    <tr>
      <td><strong>${l.emp}</strong></td>
      <td>${l.branch}</td>
      <td>${l.type}</td>
      <td>${l.dates}</td>
      <td><span class="badge ${l.status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${l.status}</span></td>
      <td>
        ${l.status === 'Pending' 
          ? `<button class="btn btn-sm" onclick="approveItem('leaves', '${l.$id}')">Approve</button>` 
          : '<span style="color:var(--muted); font-size:0.8rem;">Completed</span>'}
      </td>
    </tr>
  `).join('');

  document.getElementById('expense-tbody').innerHTML = filteredExpenses.map(e => `
    <tr>
      <td><strong>${e.emp}</strong></td>
      <td>${e.branch}</td>
      <td>${e.desc}</td>
      <td>TZS ${Number(e.amount).toLocaleString()}</td>
      <td><span class="badge ${e.status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${e.status}</span></td>
      <td>
        ${e.status === 'Pending' 
          ? `<button class="btn btn-sm" onclick="approveItem('expenses', '${e.$id}')">Approve</button>` 
          : '<span style="color:var(--muted); font-size:0.8rem;">Resolved</span>'}
      </td>
    </tr>
  `).join('');

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

async function handleAddEmployee() {
  const name = document.getElementById('emp-name').value.trim();
  const role = document.getElementById('emp-role').value.trim();
  const branch = document.getElementById('emp-branch').value;
  const salary = Number(document.getElementById('emp-salary').value);

  if (!name || !role || !salary) return alert('Please complete all employee fields.');

  const payload = { name, role, branch, salary, status: 'Active' };

  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.employees, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.employees.unshift({ $id: Date.now().toString(), ...payload });
    renderAll();
  }

  document.getElementById('emp-name').value = '';
  document.getElementById('emp-role').value = '';
  document.getElementById('emp-salary').value = '';
}

async function handleAddLeave() {
  const emp = document.getElementById('leave-emp').value.trim();
  const type = document.getElementById('leave-type').value;
  const dates = document.getElementById('leave-dates').value.trim();
  const branch = document.getElementById('branch-filter').value === 'ALL' ? 'Indira Gandhi' : document.getElementById('branch-filter').value;

  if (!emp || !dates) return alert('Please fill in employee name and dates.');

  const payload = { emp, branch, type, dates, status: 'Pending' };

  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.leaves, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.leaves.unshift({ $id: Date.now().toString(), ...payload });
    renderAll();
  }

  document.getElementById('leave-emp').value = '';
  document.getElementById('leave-dates').value = '';
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

async function approveItem(type, id) {
  if (isLiveAppwrite) {
    const col = APPWRITE_CONFIG.collections[type];
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, col, id, { status: 'Approved' });
    await syncFromAppwrite();
  } else {
    const target = state[type].find(item => item.$id === id);
    if (target) target.status = 'Approved';
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
  const rows = [['Name', 'Role', 'Branch', 'Basic Salary', 'Status']];
  state.employees.forEach(e => rows.push([e.name, e.role, e.branch, e.salary, e.status]));
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', 'JDM_HR_Staff_Report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.onload = syncFromAppwrite;
