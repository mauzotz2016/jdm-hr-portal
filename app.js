function openSection(sectionId, navEl) {
  document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
  var target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  if (navEl) {
    navEl.classList.add('active');
    document.getElementById('page-title').innerText = navEl.innerText;
  }
}

function jumpToTab(sectionId) {
  openSection(sectionId, document.querySelector('.nav-item[data-tab="' + sectionId + '"]'));
}

var agendaTemplate = [
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

var participantsList = [
  { name: 'General Manager', title: 'Chairperson', present: true },
  { name: 'HR Manager', title: 'Secretary', present: true },
  { name: 'Front Office Lead', title: 'Head of Front Office', present: true },
  { name: 'Chief Accountant', title: 'Finance Lead', present: true }
];

function initWeeklyAgenda() {
  var dateInput = document.getElementById('ag-date');
  if (dateInput) dateInput.valueAsDate = new Date();
  renderParticipants();
  var container = document.getElementById('agenda-items-container');
  if (!container) return;
  container.innerHTML = agendaTemplate.map(function(item, idx) {
    return '<div class="agenda-accordion"><div class="agenda-acc-head" onclick="this.nextElementSibling.classList.toggle(\'open\')"><span>' + item.title + '</span><span><span id="acc-min-' + idx + '">' + item.mins + '</span> min &#9662;</span></div>' +
      '<div class="agenda-acc-body ' + (idx === 0 ? 'open' : '') + '"><div class="form-grid">' +
      '<div class="form-group"><label>Presenter</label><input type="text" value="' + item.resp + '" oninput="agendaTemplate[' + idx + '].resp=this.value; updateAgendaPreview()" /></div>' +
      '<div class="form-group"><label>Minutes</label><input type="number" value="' + item.mins + '" min="1" oninput="agendaTemplate[' + idx + '].mins=Number(this.value)||0; document.getElementById(\'acc-min-' + idx + '\').innerText=this.value; updateAgendaPreview()" /></div></div>' +
      '<div class="form-group"><label>Key Points</label><textarea rows="2" oninput="agendaTemplate[' + idx + '].points=this.value; updateAgendaPreview()"></textarea></div></div></div>';
  }).join('');
  updateAgendaPreview();
}

function renderParticipants() {
  var container = document.getElementById('participants-container');
  if (!container) return;
  container.innerHTML = participantsList.map(function(p, i) {
    return '<div class="participant-row"><input type="text" value="' + p.name + '" oninput="participantsList[' + i + '].name=this.value; updateAgendaPreview()" style="padding:6px; border:1px solid var(--border); border-radius:6px;" />' +
      '<input type="text" value="' + p.title + '" oninput="participantsList[' + i + '].title=this.value; updateAgendaPreview()" style="padding:6px; border:1px solid var(--border); border-radius:6px;" />' +
      '<label style="font-size:0.78rem;"><input type="checkbox" ' + (p.present ? 'checked' : '') + ' onchange="participantsList[' + i + '].present=this.checked; updateAgendaPreview()" /> Present</label>' +
      '<button class="btn btn-outline btn-sm" onclick="participantsList.splice(' + i + ',1); renderParticipants(); updateAgendaPreview()">&times;</button></div>';
  }).join('');
}

function addParticipantRow() { participantsList.push({ name: '', title: '', present: true }); renderParticipants(); }

function updateAgendaPreview() {
  document.getElementById('prev-date').innerText = document.getElementById('ag-date').value || '-';
  var startTime = document.getElementById('ag-time').value || '09:00';
  document.getElementById('prev-time').innerText = startTime;
  document.getElementById('prev-venue').innerText = document.getElementById('ag-venue').value || '-';
  var recap = document.getElementById('ag-recap').value.trim();
  var rBox = document.getElementById('prev-recap-box');
  if (recap) { rBox.style.display = 'block'; document.getElementById('prev-recap').innerText = recap; } else { rBox.style.display = 'none'; }

  var activeP = participantsList.filter(function(p) { return p.name.trim() !== '' && p.present; });
  document.getElementById('prev-participants').innerHTML = activeP.length ? activeP.map(function(p) { return '<span class="badge badge-approved" style="margin:2px;">' + p.name + ' (' + p.title + ')</span>'; }).join(' ') : 'None';

  var parts = startTime.split(':');
  var cur = ((Number(parts) || 9) * 60) + (Number(parts) || 0);
  var tot = 0;
  function fmt(m) { return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }

  document.getElementById('prev-agenda-tbody').innerHTML = agendaTemplate.map(function(item) {
    var s = fmt(cur); cur += item.mins; tot += item.mins; var e = fmt(cur);
    return '<tr><td><strong>' + s + '-' + e + '</strong><br><span style="font-size:0.72rem;">' + item.mins + ' min</span></td><td><strong>' + item.title + '</strong></td><td><strong>' + item.resp + '</strong>' + (item.points ? '<br><span style="font-size:0.78rem;">' + item.points + '</span>' : '') + '</td></tr>';
  }).join('');
  document.getElementById('prev-total-min').innerText = tot;
  document.getElementById('prev-end-time').innerText = fmt(cur);
}

function sendWeeklyAgenda() {
  var code = document.getElementById('ag-access-code').value.trim();
  if (!code) return alert('Enter HR access code.');
  window.open('mailto:' + document.getElementById('ag-group-email').value + '?subject=' + encodeURIComponent('Tiffany Weekly Operations Agenda - ' + document.getElementById('ag-date').value), '_blank');
}function getDaysRemaining(d) {
  if (!d) return 999;
  var t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(d) - t) / 86400000);
}

var state = {
  employees: [
    { id: 'emp1', name: 'Amina Hassan', email: 'amina@company.co.tz', role: 'Branch Manager', branch: 'Indira Gandhi', contractEnd: '2026-12-25', salary: 1450000 },
    { id: 'emp2', name: 'David Mwakalinga', email: 'david@company.co.tz', role: 'Front Office Lead', branch: 'Makunganya', contractEnd: '2027-06-01', salary: 850000 },
    { id: 'emp3', name: 'Baraka Juma', email: 'baraka@company.co.tz', role: 'Operations Supervisor', branch: 'Chikongola', contractEnd: '2027-01-05', salary: 900000 }
  ],
  staffForms: [{ id: 'sf1', name: 'David Mwakalinga', email: 'david@company.co.tz', branch: 'Makunganya', type: 'Weekly Off-Day', dates: 'Nov 19, 2026', notes: 'Thursday off request', status: 'Pending' }],
  leaves: [{ id: 'l1', emp: 'Amina Hassan', branch: 'Indira Gandhi', type: 'Annual Leave', dates: 'Dec 01 - Dec 05, 2026', status: 'Approved' }],
  appointments: [{ id: 'ap1', type: 'Management & HR', person: 'Managing Director', subject: 'Q4 Staffing Review', datetime: '2026-11-16T10:00', status: 'Scheduled' }],
  portals: [
    { id: 'p1', name: 'NSSF Employer Portal', url: 'https://nssf.go.tz', username: 'hr@jdmhub.co.tz', password: 'Password123' },
    { id: 'p2', name: 'NHIF Self-Service', url: 'https://nhif.or.tz', username: 'jdm_employer_01', password: 'Password123' },
    { id: 'p3', name: 'TRA Taxpayer Portal', url: 'https://tra.go.tz', username: '104-882-910', password: 'Password123' }
  ]
};

function renderAll() {
  var br = document.getElementById('branch-filter').value;
  var filt = function(x) { return br === 'ALL' || x.branch === br; };
  var staff = state.employees.filter(filt);
  var forms = state.staffForms.filter(filt);
  var leaves = state.leaves.filter(filt);
  var expSoon = staff.filter(function(e) { return getDaysRemaining(e.contractEnd) <= 60; });

  var banner = document.getElementById('contract-alert-banner');
  if (expSoon.length > 0) {
    banner.style.display = 'flex';
    document.getElementById('contract-alert-text').innerText = expSoon.length + ' staff contract(s) expiring within 60 days.';
  } else { banner.style.display = 'none'; }

  document.getElementById('kpi-staff').innerText = staff.length;
  document.getElementById('kpi-contracts').innerText = expSoon.length;
  document.getElementById('kpi-forms').innerText = forms.filter(function(f) { return f.status === 'Pending'; }).length;
  document.getElementById('kpi-portals').innerText = state.portals.length;

  document.getElementById('staff-tbody').innerHTML = staff.map(function(e) {
    var d = getDaysRemaining(e.contractEnd);
    return '<tr class="clickable-row" onclick="openEmployeeDossier(\'' + e.id + '\')"><td><strong>' + e.name + '</strong></td><td>' + e.role + ' (' + e.branch + ')</td><td>' + (e.contractEnd || 'Permanent') + '</td><td><span class="badge ' + (d <= 60 ? 'badge-danger' : 'badge-approved') + '">' + (d === 999 ? 'N/A' : d + ' Days') + '</span></td><td><button class="btn btn-outline btn-sm">Open Form</button></td></tr>';
  }).join('');

  document.getElementById('forms-tbody').innerHTML = forms.map(function(f) {
    var bc = f.status === 'Approved' ? 'badge-approved' : (f.status === 'Rejected' ? 'badge-danger' : 'badge-pending');
    return '<tr><td><strong>' + f.name + '</strong><br><small>' + f.email + '</small></td><td>' + f.type + '</td><td>' + f.dates + '</td><td><span class="badge ' + bc + '">' + f.status + '</span></td>' +
      '<td><button class="btn btn-success btn-sm" onclick="respondToStaffForm(\'' + f.id + '\',\'Approved\')">Approve</button> <button class="btn btn-danger btn-sm" onclick="respondToStaffForm(\'' + f.id + '\',\'Rejected\')">Reject</button></td></tr>';
  }).join('');

  document.getElementById('leave-tbody').innerHTML = leaves.map(function(l) {
    return '<tr><td><strong>' + l.emp + '</strong></td><td>' + l.branch + '</td><td>' + l.type + '</td><td>' + l.dates + '</td><td><span class="badge ' + (l.status === 'Approved' ? 'badge-approved' : 'badge-pending') + '">' + l.status + '</span></td><td>' + (l.status === 'Pending' ? '<button class="btn btn-sm" onclick="approveLeave(\'' + l.id + '\')">Approve</button>' : 'Approved') + '</td></tr>';
  }).join('');

  document.getElementById('appt-tbody').innerHTML = state.appointments.map(function(a) {
    return '<tr><td>' + a.type + '</td><td>' + a.person + '</td><td>' + a.subject + '</td><td>' + a.datetime.replace('T', ' ') + '</td><td><span class="badge ' + (a.status === 'Completed' ? 'badge-approved' : 'badge-pending') + '">' + a.status + '</span></td><td>' + (a.status !== 'Completed' ? '<button class="btn btn-sm" onclick="completeAppointment(\'' + a.id + '\')">Done</button>' : 'Done') + '</td></tr>';
  }).join('');

  document.getElementById('portals-grid').innerHTML = state.portals.map(function(p) {
    return '<div class="portal-card"><div><h4>' + p.name + '</h4><small>' + p.url + '</small><p style="font-size:0.8rem; margin-top:4px;">User: <strong>' + p.username + '</strong></p></div><div style="display:flex; gap:6px;"><button class="btn btn-sm" onclick="launchEmbeddedPortal(\'' + p.id + '\')">Open Inside</button><button class="btn btn-outline btn-sm" onclick="copyText(\'' + p.username + '\',\'User\')">User</button><button class="btn btn-outline btn-sm" onclick="copyText(\'' + p.password + '\',\'Pass\')">Pass</button></div></div>';
  }).join('');

  document.getElementById('payroll-tbody').innerHTML = staff.map(function(e) {
    var g = Number(e.salary || 0), nssf = Math.round(g * 0.1), net = g - nssf;
    return '<tr><td><strong>' + e.name + '</strong></td><td>' + e.branch + '</td><td>TZS ' + g.toLocaleString() + '</td><td>TZS ' + nssf.toLocaleString() + '</td><td><strong>TZS ' + net.toLocaleString() + '</strong></td><td><button class="btn btn-outline btn-sm" onclick="openPayslip(\'' + e.name + '\',\'' + e.role + '\',\'' + e.branch + '\',' + g + ',' + nssf + ',' + net + ')">Payslip</button></td></tr>';
  }).join('');
}function openEmployeeDossier(id) {
  var e = state.employees.find(function(x) { return x.id === id; });
  if (!e) return;
  document.getElementById('employee-dossier-content').innerHTML = '<div class="form-grid"><div class="form-group"><label>Name</label><input id="ed-name" value="' + e.name + '" /></div><div class="form-group"><label>Email</label><input id="ed-email" value="' + (e.email || '') + '" /></div><div class="form-group"><label>Role</label><input id="ed-role" value="' + e.role + '" /></div><div class="form-group"><label>Branch</label><input id="ed-branch" value="' + e.branch + '" /></div><div class="form-group"><label>Contract End</label><input type="date" id="ed-end" value="' + (e.contractEnd || '') + '" /></div><div class="form-group"><label>Salary</label><input type="number" id="ed-sal" value="' + e.salary + '" /></div></div><button class="btn" style="margin-top:12px;" onclick="saveEmployeeDossier(\'' + e.id + '\')">Save Changes</button>';
  document.getElementById('employee-modal').style.display = 'flex';
}

function saveEmployeeDossier(id) {
  var e = state.employees.find(function(x) { return x.id === id; });
  if (e) { e.name = document.getElementById('ed-name').value; e.email = document.getElementById('ed-email').value; e.role = document.getElementById('ed-role').value; e.branch = document.getElementById('ed-branch').value; e.contractEnd = document.getElementById('ed-end').value; e.salary = Number(document.getElementById('ed-sal').value); }
  document.getElementById('employee-modal').style.display = 'none';
  renderAll();
}

function respondToStaffForm(id, status) {
  var f = state.staffForms.find(function(x) { return x.id === id; });
  if (!f) return;
  f.status = status; renderAll();
  window.open('mailto:' + f.email + '?subject=' + encodeURIComponent('HR Request: ' + status), '_blank');
}

function copyStaffFormLink() {
  var base = window.location.href.split('?').replace(/index\.html$/, '');
  copyText((base.endsWith('/') ? base : base + '/') + 'staff-form.html', 'Staff Form Link');
}

function copyText(t, l) { navigator.clipboard.writeText(t); alert(l + ' copied!'); }

function handleAddPortal() {
  var n = document.getElementById('portal-name').value.trim(), u = document.getElementById('portal-url').value.trim();
  if (!n || !u) return alert('Fill Name and URL');
  state.portals.unshift({ id: 'p_' + Date.now(), name: n, url: u, username: document.getElementById('portal-user').value, password: document.getElementById('portal-pass').value });
  renderAll();
}

function launchEmbeddedPortal(id) {
  var p = state.portals.find(function(x) { return x.id === id; });
  if (!p) return;
  document.getElementById('embedded-workspace').style.display = 'block';
  document.getElementById('active-portal-title').innerText = p.name;
  document.getElementById('active-portal-creds').innerText = 'User: ' + p.username;
  document.getElementById('portal-iframe').src = p.url;
  document.getElementById('external-fallback-link').href = p.url;
  document.getElementById('copy-user-btn').onclick = function() { copyText(p.username, 'User'); };
  document.getElementById('copy-pass-btn').onclick = function() { copyText(p.password, 'Pass'); };
}

function closeEmbeddedPortal() { document.getElementById('portal-iframe').src = ''; document.getElementById('embedded-workspace').style.display = 'none'; }

function handleAddEmployee() {
  var n = document.getElementById('emp-name').value.trim(), r = document.getElementById('emp-role').value.trim(), s = Number(document.getElementById('emp-salary').value);
  if (!n || !r || !s) return alert('Fill Name, Role & Salary');
  state.employees.unshift({ id: 'emp_' + Date.now(), name: n, email: document.getElementById('emp-email').value, role: r, branch: document.getElementById('emp-branch').value, contractEnd: document.getElementById('emp-contract-end').value, salary: s });
  renderAll();
}

function handleAddLeave() {
  var emp = document.getElementById('leave-emp').value.trim(), dates = document.getElementById('leave-dates').value.trim();
  if (!emp || !dates) return alert('Fill Employee & Dates');
  state.leaves.unshift({ id: 'l_' + Date.now(), emp: emp, branch: 'Indira Gandhi', type: document.getElementById('leave-type').value, dates: dates, status: 'Pending' });
  renderAll();
}

function approveLeave(id) { var l = state.leaves.find(function(x) { return x.id === id; }); if (l) l.status = 'Approved'; renderAll(); }

function handleAddAppointment() {
  var p = document.getElementById('appt-person').value.trim(), s = document.getElementById('appt-subject').value.trim(), d = document.getElementById('appt-datetime').value;
  if (!p || !s || !d) return alert('Fill all fields');
  state.appointments.unshift({ id: 'ap_' + Date.now(), type: document.getElementById('appt-type').value, person: p, subject: s, datetime: d, status: 'Scheduled' });
  renderAll();
}

function completeAppointment(id) { var a = state.appointments.find(function(x) { return x.id === id; }); if (a) a.status = 'Completed'; renderAll(); }

function openPayslip(n, r, b, g, nssf, net) {
  document.getElementById('payslip-content').innerHTML = '<div class="payslip-row"><span>Employee:</span><strong>' + n + '</strong></div><div class="payslip-row"><span>Role:</span><span>' + r + ' (' + b + ')</span></div><div class="payslip-row"><span>Gross:</span><span>TZS ' + g.toLocaleString() + '</span></div><div class="payslip-row"><span>NSSF (10%):</span><span>- TZS ' + nssf.toLocaleString() + '</span></div><div class="payslip-row"><strong>Net Pay:</strong><strong>TZS ' + net.toLocaleString() + '</strong></div>';
  document.getElementById('payslip-modal').style.display = 'flex';
}

function exportCSV() {
  var rows = [['Name', 'Role', 'Branch', 'Expiry', 'Salary']];
  state.employees.forEach(function(e) { rows.push([e.name, e.role, e.branch, e.contractEnd || '', e.salary]); });
  var a = document.createElement('a'); a.href = encodeURI('data:text/csv;charset=utf-8,' + rows.map(function(r) { return r.join(','); }).join('\n')); a.download = 'JDM_HR_Report.csv'; a.click();
}

initWeeklyAgenda();
renderAll();
