function getDaysRemaining(d) {
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
}
