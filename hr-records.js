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