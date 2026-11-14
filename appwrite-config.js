```javascript
const APPWRITE_CONFIG = {
  endpoint: 'https://appwrite.io',
  projectId: 'YOUR_PROJECT_ID',
  databaseId: 'hr_portal_db',
  collections: {
    employees: 'employees',
    leaves: 'leave_requests',
    appointments: 'appointments',
    staffForms: 'staff_forms',
    portals: 'external_portals'
  }
};

const isLiveAppwrite = APPWRITE_CONFIG.projectId !== 'YOUR_PROJECT_ID';
let databases = null;

if (isLiveAppwrite && typeof Appwrite !== 'undefined') {
  const { Client, Databases } = Appwrite;
  const client = new Client().setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId);
  databases = new Databases(client);
  const badge = document.getElementById('connection-badge');
  badge.innerText = 'Appwrite Cloud Connected';
  badge.classList.add('live');
}

function getDaysRemaining(endDateStr) {
  if (!endDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(endDateStr) - today) / 86400000);
}

let state = {
  employees: [
    { $id: 'emp1', name: 'Amina Hassan', email: 'amina.hassan@company.co.tz', phone: '+255 712 345 678', nida: '19920412-14102-00001-22', role: 'Branch Manager', branch: 'Indira Gandhi', contractEnd: '2026-12-25', salary: 1450000, leaveBalance: 14, emergencyContact: 'Salim Hassan (+255 754 111 222)', status: 'Active' },
    { $id: 'emp2', name: 'David Mwakalinga', email: 'david.m@company.co.tz', phone: '+255 765 987 654', nida: '19950819-11204-00004-19', role: 'Front Office Lead', branch: 'Makunganya', contractEnd: '2027-06-01', salary: 850000, leaveBalance: 18, emergencyContact: 'Mary Mwakalinga (+255 713 444 555)', status: 'Active' },
    { $id: 'emp3', name: 'Baraka Juma', email: 'baraka.j@company.co.tz', phone: '+255 655 222 333', nida: '19941102-15109-00009-14', role: 'Operations Supervisor', branch: 'Chikongola', contractEnd: '2027-01-05', salary: 900000, leaveBalance: 12, emergencyContact: 'Juma Selemani (+255 784 999 000)', status: 'Active' }
  ],
  staffForms: JSON.parse(localStorage.getItem('jdm_staff_forms') || 'null') || [
    { $id: 'sf1', name: 'David Mwakalinga', email: 'david.m@company.co.tz', branch: 'Makunganya', type: 'Weekly Off-Day', dates: 'Nov 19, 2026', notes: 'Requesting Thursday off after weekend shift coverage.', status: 'Pending' }
  ],
  leaves: [
    { $id: 'l1', emp: 'Amina Hassan', branch: 'Indira Gandhi', type: 'Annual Leave', dates: 'Dec 01 - Dec 05, 2026', status: 'Approved' }
  ],
  appointments: [
    { $id: 'ap1', type: 'Company Management & HR', person: 'Managing Director', subject: 'Q4 Staffing & Branch Payroll Review', datetime: '2026-11-16T10:00', status: 'Scheduled' },
    { $id: 'ap2', type: 'HR & Staff', person: 'Amina Hassan', subject: '60-Day Contract Renewal Discussion', datetime: '2026-11-18T14:30', status: 'Scheduled' }
  ],
  portals: JSON.parse(localStorage.getItem('jdm_external_portals') || 'null') || [
    { $id: 'p1', name: 'NSSF Employer Portal', url: 'https://nssf.go.tz', username: 'hr@jdmhub.co.tz', password: 'NSSF_Password_2026' },
    { $id: 'p2', name: 'NHIF Employer Self-Service', url: 'https://nhif.or.tz', username: 'jdm_employer_01', password: 'NHIF_Password_2026' },
    { $id: 'p3', name: 'TRA Taxpayer Portal', url: 'https://tra.go.tz', username: '104-882-910', password: 'TRA_Password_2026' }
  ]
};

function switchTab(sectionId, navEl) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) {
    navEl.classList.add('active');
    document.getElementById('page-title').innerText = navEl.innerText;
  }
}

function copyStaffFormLink() {
  const base = window.location.href.split('?')[0].replace(/index\.html$/, '');
  copyText((base.endsWith('/') ? base : base + '/') + 'staff-form.html', 'Staff Self-Service Form Link');
}

function copyText(text, label) {
  navigator.clipboard.writeText(text);
  alert(`${label} copied to clipboard!`);
}

async function syncFromAppwrite() {
  if (!isLiveAppwrite) { renderAll(); return; }
  try {
    const [empRes, leaveRes, apptRes, formsRes, portalsRes] = await Promise.all([
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.employees),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.leaves),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.appointments),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.staffForms),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.portals)
    ]);
    state.employees = empRes.documents;
    state.leaves = leaveRes.documents;
    state.appointments = apptRes.documents;
    state.staffForms = formsRes.documents;
    state.portals = portalsRes.documents;
    renderAll();
  } catch (err) {
    console.error('Appwrite Sync Error:', err);
    renderAll();
  }
}

Faili la 4: agenda.js

Mfumo wa Tiffany Diamond Hotels Limited wa kuandaa na kutuma ajenda za mikutano ya Jumanne na Ijumaa.
javascript
const agendaTemplate = [
  { title: '1. Opening & Prayer / Welcome Remarks', mins: 5, resp: 'General Manager', points: '' },
  { title: '2. Review of Previous Meeting Minutes', mins: 10, resp: 'HR Manager', points: '' },
  { title: '3. Front Office & Room Occupancy Report', mins: 10, resp: 'Front Office Manager', points: '' },
  { title: '4. Housekeeping & Laundry Operations', mins: 10, resp: 'Executive Housekeeper', points: '' },
  { title: '5. Food & Beverage Performance', mins: 10, resp: 'F&B Manager', points: '' },
  { title: '6. Sales, Marketing & Reservations', mins: 10, resp: 'Sales & Marketing Lead', points: '' },
  { title: '7. Maintenance, Engineering & IT', mins: 8, resp: 'Chief Engineer / IT', points: '' },
  { title: '8. Procurement, Stores & Inventory', mins: 8, resp: 'Procurement Officer', points: '' },
  { title: '9. Finance, Accounts & Cost Control', mins: 10, resp: 'Chief Accountant', points: '' },
  { title: '10. HR, Staffing, Attendance & Contracts', mins: 10, resp: 'HR Manager', points: '' },
  { title: '11. Guest Feedback & Quality Assurance', mins: 7, resp: 'Duty Manager', points: '' },
  { title: '12. Any Other Business (AOB) & Closing', mins: 5, resp: 'General Manager', points: '' }
];

let participantsList = [
  { name: 'General Manager', title: 'Chairperson', present: true },
  { name: 'HR Manager', title: 'Secretary', present: true },
  { name: 'Front Office Lead', title: 'Head of Front Office', present: true },
  { name: 'Chief Accountant', title: 'Finance Lead', present: true }
];

function initWeeklyAgenda() {
  const dateInput = document.getElementById('ag-date');
  if (dateInput) dateInput.valueAsDate = new Date();
  renderParticipants();
  const container = document.getElementById('agenda-items-container');
  if (!container) return;
  container.innerHTML = agendaTemplate.map((item, idx) => `
    <div class="agenda-accordion">
      <div class="agenda-acc-head" onclick="this.nextElementSibling.classList.toggle('open')">
        <span>${item.title}</span>
        <span><span id="acc-min-${idx}">${item.mins}</span> min &#9662;</span>
      </div>
      <div class="agenda-acc-body ${idx === 0 ? 'open' : ''}">
        <div class="form-grid">
          <div class="form-group"><label>Presenter</label><input type="text" value="${item.resp}" oninput="agendaTemplate[${idx}].resp=this.value; updateAgendaPreview()" /></div>
          <div class="form-group"><label>Minutes</label><input type="number" value="${item.mins}" min="1" oninput="agendaTemplate[${idx}].mins=Number(this.value)||0; document.getElementById('acc-min-${idx}').innerText=this.value; updateAgendaPreview()" /></div>
        </div>
        <div class="form-group"><label>Key Points</label><textarea rows="2" oninput="agendaTemplate[${idx}].points=this.value; updateAgendaPreview()"></textarea></div>
      </div>
    </div>
  `).join('');
  updateAgendaPreview();
}

function renderParticipants() {
  const container = document.getElementById('participants-container');
  if (!container) return;
  container.innerHTML = participantsList.map((p, i) => `
    <div class="participant-row">
      <input type="text" value="${p.name}" oninput="participantsList[${i}].name=this.value; updateAgendaPreview()" style="padding:7px; border:1px solid var(--border); border-radius:6px;" />
      <input type="text" value="${p.title}" oninput="participantsList[${i}].title=this.value; updateAgendaPreview()" style="padding:7px; border:1px solid var(--border); border-radius:6px;" />
      <label style="font-size:0.8rem;"><input type="checkbox" ${p.present ? 'checked' : ''} onchange="participantsList[${i}].present=this.checked; updateAgendaPreview()" /> Present</label>
      <button class="btn btn-outline btn-sm" onclick="participantsList.splice(${i},1); renderParticipants(); updateAgendaPreview()">&times;</button>
    </div>
  `).join('');
}

function addParticipantRow() { participantsList.push({ name: '', title: '', present: true }); renderParticipants(); }

function updateAgendaPreview() {
  document.getElementById('prev-date').innerText = document.getElementById('ag-date').value || '-';
  const startTime = document.getElementById('ag-time').value || '09:00';
  document.getElementById('prev-time').innerText = startTime;
  document.getElementById('prev-venue').innerText = document.getElementById('ag-venue').value || '-';
  const recap = document.getElementById('ag-recap').value.trim();
  const rBox = document.getElementById('prev-recap-box');
  if (recap) { rBox.style.display = 'block'; document.getElementById('prev-recap').innerText = recap; } else { rBox.style.display = 'none'; }

  const activeP = participantsList.filter(p => p.name.trim() !== '' && p.present);
  document.getElementById('prev-participants').innerHTML = activeP.length ? activeP.map(p => `<span class="badge badge-approved" style="margin:2px;">${p.name} (${p.title})</span>`).join(' ') : 'None';

  const parts = startTime.split(':');
  let cur = ((Number(parts[0]) || 9) * 60) + (Number(parts[1]) || 0);
  let tot = 0;
  const fmt = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  document.getElementById('prev-agenda-tbody').innerHTML = agendaTemplate.map(item => {
    const s = fmt(cur); cur += item.mins; tot += item.mins; const e = fmt(cur);
    return `<tr><td><strong>${s}-${e}</strong><br><span style="font-size:0.74rem; color:var(--muted);">${item.mins} min</span></td><td><strong>${item.title}</strong></td><td><strong>${item.resp}</strong>${item.points ? `<br><span style="font-size:0.8rem;">${item.points}</span>` : ''}</td></tr>`;
  }).join('');
  document.getElementById('prev-total-min').innerText = tot;
  document.getElementById('prev-end-time').innerText = fmt(cur);
}

function sendWeeklyAgenda() {
  const code = document.getElementById('ag-access-code').value.trim();
  if (!code) return alert('Enter HR access code.');
  window.open(`mailto:${document.getElementById('ag-group-email').value}?subject=${encodeURIComponent('Tiffany Weekly Operations Agenda - ' + document.getElementById('ag-date').value)}`, '_blank');
}
Use code with caution.

Faili la 5: hr-records.js

Functions za usimamizi wa wafanyakazi, fomu za likizo, maombi ya wafanyakazi (Email Reply), na miadi (Appointments).
javascript
function openEmployeeDossier(empId) {
  const emp = state.employees.find(e => e.$id === empId);
  if (!emp) return;
  const daysLeft = getDaysRemaining(emp.contractEnd);

  document.getElementById('employee-dossier-content').innerHTML = `
    <div class="form-grid" style="margin-bottom:16px;">
      <div class="form-group"><label>Full Name</label><input type="text" id="edit-emp-name" value="${emp.name}" /></div>
      <div class="form-group"><label>Email Address</label><input type="email" id="edit-emp-email" value="${emp.email || ''}" /></div>
      <div class="form-group"><label>Phone Number</label><input type="text" id="edit-emp-phone" value="${emp.phone || ''}" /></div>
      <div class="form-group"><label>NIDA / National ID</label><input type="text" id="edit-emp-nida" value="${emp.nida || ''}" /></div>
      <div class="form-group"><label>Job Position</label><input type="text" id="edit-emp-role" value="${emp.role}" /></div>
      <div class="form-group"><label>Branch</label><input type="text" id="edit-emp-branch" value="${emp.branch}" /></div>
      <div class="form-group"><label>Contract Expiry Date</label><input type="date" id="edit-emp-end" value="${emp.contractEnd || ''}" /></div>
      <div class="form-group"><label>Basic Salary (TZS)</label><input type="number" id="edit-emp-salary" value="${emp.salary}" /></div>
      <div class="form-group"><label>Leave Balance (Days)</label><input type="number" id="edit-emp-leave" value="${emp.leaveBalance || 14}" /></div>
      <div class="form-group"><label>Emergency Contact</label><input type="text" id="edit-emp-emerg" value="${emp.emergencyContact || ''}" /></div>
    </div>
    <div style="padding:12px; border-radius:8px; background:${daysLeft <= 60 ? 'var(--danger-bg)' : 'var(--success-bg)'}; color:${daysLeft <= 60 ? 'var(--danger)' : 'var(--success)'}; margin-bottom:16px; font-size:0.88rem;">
      <strong>Contract Status:</strong> ${daysLeft === 999 ? 'Permanent Staff' : daysLeft + ' days remaining until contract renewal.'}
    </div>
    <div style="display:flex; justify-content:flex-end; gap:10px;">
      <button class="btn" onclick="saveEmployeeDossier('${emp.$id}')">Save & Update Contract</button>
    </div>
  `;
  document.getElementById('employee-modal').style.display = 'flex';
}

async function saveEmployeeDossier(empId) {
  const updated = {
    name: document.getElementById('edit-emp-name').value.trim(),
    email: document.getElementById('edit-emp-email').value.trim(),
    phone: document.getElementById('edit-emp-phone').value.trim(),
    nida: document.getElementById('edit-emp-nida').value.trim(),
    role: document.getElementById('edit-emp-role').value.trim(),
    branch: document.getElementById('edit-emp-branch').value.trim(),
    contractEnd: document.getElementById('edit-emp-end').value,
    salary: Number(document.getElementById('edit-emp-salary').value),
    leaveBalance: Number(document.getElementById('edit-emp-leave').value),
    emergencyContact: document.getElementById('edit-emp-emerg').value.trim()
  };

  if (isLiveAppwrite) {
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.employees, empId, updated);
    await syncFromAppwrite();
  } else {
    const idx = state.employees.findIndex(e => e.$id === empId);
    if (idx !== -1) state.employees[idx] = { ...state.employees[idx], ...updated };
    renderAll();
  }
  document.getElementById('employee-modal').style.display = 'none';
}

async function respondToStaffForm(formId, decision) {
  const formItem = state.staffForms.find(f => f.$id === formId);
  if (!formItem) return;

  if (isLiveAppwrite) {
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.staffForms, formId, { status: decision });
    await syncFromAppwrite();
  } else {
    formItem.status = decision;
    localStorage.setItem('jdm_staff_forms', JSON.stringify(state.staffForms));
    renderAll();
  }

  const subject = encodeURIComponent(`HR Request Update: ${formItem.type} [${decision.toUpperCase()}]`);
  const body = encodeURIComponent(`Hello ${formItem.name},\n\nYour HR request for "${formItem.type}" (${formItem.dates}) has been reviewed.\nCurrent Status: ${decision.toUpperCase()}\n\nBest regards,\nHR Department - JDM Digital Hub`);
  window.open(`mailto:${formItem.email}?subject=${subject}&body=${body}`, '_blank');
}

async function handleAddEmployee() {
  const name = document.getElementById('emp-name').value.trim();
  const email = document.getElementById('emp-email').value.trim();
  const role = document.getElementById('emp-role').value.trim();
  const branch = document.getElementById('emp-branch').value;
  const contractEnd = document.getElementById('emp-contract-end').value;
  const salary = Number(document.getElementById('emp-salary').value);

  if (!name || !role || !salary) return alert('Please fill in Name, Role, and Salary.');
  const payload = { name, email, role, branch, contractEnd, salary, status: 'Active' };
  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.employees, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.employees.unshift({ $id: 'emp_' + Date.now(), ...payload });
    renderAll();
  }
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
    state.leaves.unshift({ $id: 'l_' + Date.now(), ...payload });
    renderAll();
  }
}

async function approveLeave(id) {
  if (isLiveAppwrite) {
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.leaves, id, { status: 'Approved' });
    await syncFromAppwrite();
  } else {
    const item = state.leaves.find(l => l.$id === id);
    if (item) item.status = 'Approved';
    renderAll();
  }
}

async function handleAddAppointment() {
  const type = document.getElementById('appt-type').value;
  const person = document.getElementById('appt-person').value.trim();
  const subject = document.getElementById('appt-subject').value.trim();
  const datetime = document.getElementById('appt-datetime').value;

  if (!person || !subject || !datetime) return alert('Please fill in all appointment fields.');
  const payload = { type, person, subject, datetime, status: 'Scheduled' };
  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.appointments, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.appointments.unshift({ $id: 'ap_' + Date.now(), ...payload });
    renderAll();
  }
}

async function completeAppointment(id) {
  if (isLiveAppwrite) {
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.appointments, id, { status: 'Completed' });
    await syncFromAppwrite();
  } else {
    const item = state.appointments.find(a => a.$id === id);
    if (item) item.status = 'Completed';
    renderAll();
  }
}
Use code with caution.

Faili la 6: portals-payroll.js

Inaendesha External Portals Vault (NSSF, NHIF, TRA), Payslips, CSV Export, na uanzishaji wa mfumo wote (renderAll, initWeeklyAgenda, syncFromAppwrite).
javascript
async function handleAddPortal() {
  const name = document.getElementById('portal-name').value.trim();
  const url = document.getElementById('portal-url').value.trim();
  const username = document.getElementById('portal-user').value.trim();
  const password = document.getElementById('portal-pass').value.trim();

  if (!name || !url) return alert('Please provide Portal Name and URL.');
  const payload = { name, url, username, password };
  if (isLiveAppwrite) {
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.portals, Appwrite.ID.unique(), payload);
    await syncFromAppwrite();
  } else {
    state.portals.unshift({ $id: 'p_' + Date.now(), ...payload });
    localStorage.setItem('jdm_external_portals', JSON.stringify(state.portals));
    renderAll();
  }
  document.getElementById('portal-name').value = '';
  document.getElementById('portal-url').value = '';
  document.getElementById('portal-user').value = '';
  document.getElementById('portal-pass').value = '';
}

function launchEmbeddedPortal(portalId) {
  const portal = state.portals.find(p => p.$id === portalId);
  if (!portal) return;

  document.getElementById('embedded-workspace').style.display = 'block';
  document.getElementById('active-portal-title').innerText = portal.name;
  document.getElementById('active-portal-creds').innerText = `User: ${portal.username}`;
  document.getElementById('portal-iframe').src = portal.url;
  document.getElementById('external-fallback-link').href = portal.url;

  document.getElementById('copy-user-btn').onclick = () => copyText(portal.username, 'Username');
  document.getElementById('copy-pass-btn').onclick = () => copyText(portal.password, 'Password');
  document.getElementById('embedded-workspace').scrollIntoView({ behavior: 'smooth' });
}

function closeEmbeddedPortal() {
  document.getElementById('portal-iframe').src = '';
  document.getElementById('embedded-workspace').style.display = 'none';
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
  const rows = [['Name', 'Email', 'Role', 'Branch', 'Contract End', 'Salary', 'Status']];
  state.employees.forEach(e => rows.push([e.name, e.email || '', e.role, e.branch, e.contractEnd || '', e.salary, e.status]));
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', 'JDM_HR_Staff_Report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function renderAll() {
  const selectedBranch = document.getElementById('branch-filter').value;
  const filterByBranch = (item) => selectedBranch === 'ALL' || item.branch === selectedBranch;

  const filteredStaff = state.employees.filter(filterByBranch);
  const filteredForms = state.staffForms.filter(filterByBranch);
  const filteredLeaves = state.leaves.filter(filterByBranch);

  const expiringSoon = filteredStaff.filter(emp => getDaysRemaining(emp.contractEnd) <= 60);
  const banner = document.getElementById('contract-alert-banner');
  if (expiringSoon.length > 0) {
    banner.style.display = 'flex';
    const names = expiringSoon.map(e => `${e.name} (${getDaysRemaining(e.contractEnd)} days left)`).join(', ');
    document.getElementById('contract-alert-text').innerText = ` ${expiringSoon.length} staff contract(s) need renewal soon: ${names}.`;
  } else {
    banner.style.display = 'none';
  }

  document.getElementById('kpi-staff').innerText = filteredStaff.length;
  document.getElementById('kpi-contracts').innerText = expiringSoon.length;
  document.getElementById('kpi-forms').innerText = filteredForms.filter(f => f.status === 'Pending').length;
  document.getElementById('kpi-portals').innerText = state.portals.length;

  document.getElementById('staff-tbody').innerHTML = filteredStaff.map(emp => {
    const daysLeft = getDaysRemaining(emp.contractEnd);
    const badgeClass = daysLeft <= 60 ? 'badge-danger' : 'badge-approved';
    return `<tr class="clickable-row" onclick="openEmployeeDossier('${emp.$id}')"><td><strong>${emp.name}</strong><br><span style="font-size:0.78rem; color:var(--muted);">${emp.email || ''}</span></td><td>${emp.role}<br><span style="font-size:0.78rem; color:var(--muted);">${emp.branch}</span></td><td>${emp.contractEnd || 'Permanent'}</td><td><span class="badge ${badgeClass}">${daysLeft === 999 ? 'N/A' : daysLeft + ' Days'}</span></td><td><button class="btn btn-outline btn-sm">Open Full Form</button></td></tr>`;
  }).join('');

  document.getElementById('forms-tbody').innerHTML = filteredForms.map(f => {
    let badgeClass = 'badge-pending';
    if (f.status === 'Approved') badgeClass = 'badge-approved';
    if (f.status === 'Rejected') badgeClass = 'badge-danger';
    return `<tr><td><strong>${f.name}</strong><br><span style="font-size:0.78rem; color:var(--muted);">${f.email}</span></td><td>${f.type}<br><span style="font-size:0.75rem; color:var(--muted);">${f.branch}</span></td><td><strong>${f.dates}</strong><br><span style="font-size:0.78rem; color:var(--muted);">${f.notes || ''}</span></td><td><span class="badge ${badgeClass}">${f.status}</span></td><td style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-success btn-sm" onclick="respondToStaffForm('${f.$id}', 'Approved')">Approve & Email</button><button class="btn btn-outline btn-sm" onclick="respondToStaffForm('${f.$id}', 'Pending')">Hold</button><button class="btn btn-danger btn-sm" onclick="respondToStaffForm('${f.$id}', 'Rejected')">Reject & Email</button></td></tr>`;
  }).join('');

  document.getElementById('leave-tbody').innerHTML = filteredLeaves.map(l => `<tr><td><strong>${l.emp}</strong></td><td>${l.branch}</td><td>${l.type}</td><td>${l.dates}</td><td><span class="badge ${l.status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${l.status}</span></td><td>${l.status === 'Pending' ? `<button class="btn btn-sm" onclick="approveLeave('${l.$id}')">Approve</button>` : '<span style="color:var(--muted); font-size:0.8rem;">Approved</span>'}</td></tr>`).join('');

  document.getElementById('appt-tbody').innerHTML = state.appointments.map(a => `<tr><td><strong>${a.type}</strong></td><td>${a.person}</td><td>${a.subject}</td><td>${a.datetime.replace('T', ' ')}</td><td><span class="badge ${a.status === 'Completed' ? 'badge-approved' : 'badge-pending'}">${a.status}</span></td><td>${a.status !== 'Completed' ? `<button class="btn btn-sm" onclick="completeAppointment('${a.$id}')">Mark Done</button>` : 'Done'}</td></tr>`).join('');

  document.getElementById('portals-grid').innerHTML = state.portals.map(p => `<div class="portal-card"><div><h4>${p.name}</h4><p>${p.url}</p><p style="margin-top:6px; color:var(--primary);">User: <strong>${p.username}</strong></p></div><div style="display:flex; gap:8px; flex-wrap:wrap;"><button class="btn btn-sm" onclick="launchEmbeddedPortal('${p.$id}')">Open Inside Portal</button><button class="btn btn-outline btn-sm" onclick="copyText('${p.username}', 'Username')">Copy User</button><button class="btn btn-outline btn-sm" onclick="copyText('${p.password}', 'Password')">Copy Pass</button></div></div>`).join('');

  document.getElementById('payroll-tbody').innerHTML = filteredStaff.map(emp => {
    const gross = Number(emp.salary || 0), nssf = Math.round(gross * 0.10), net = gross - nssf;
    return `<tr><td><strong>${emp.name}</strong></td><td>${emp.branch}</td><td>TZS ${gross.toLocaleString()}</td><td>TZS ${nssf.toLocaleString()}</td><td><strong>TZS ${net.toLocaleString()}</strong></td><td><button class="btn btn-outline btn-sm" onclick="openPayslip('${emp.name}', '${emp.role}', '${emp.branch}', ${gross}, ${nssf}, ${net})">View Payslip</button></td></tr>`;
  }).join('');
}

initWeeklyAgenda();
syncFromAppwrite();
Use code with caution.
Ukishazihifadhi faili zote 6 kwenye folda moja (style.css, index.html, appwrite-config.js, agenda.js, hr-records.js, na portals-payroll.js), ungependa tuendelee na kuunganisha Appwrite Project ID yako ili data zihifadhiwe mtandaoni?
