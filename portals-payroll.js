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