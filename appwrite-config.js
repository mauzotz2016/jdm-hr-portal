/* =====================================================================
   BADILISHA MISTARI MIWILI HII TU (kisha upload faili hili GitHub):
   1) endpoint  -> anwani ya Appwrite server yako (self-hosted)
   2) projectId -> Project ID kutoka Appwrite Console
   ===================================================================== */
const APPWRITE_CONFIG = {
  endpoint: 'https://appwrite.domain-yako.com/v1',   // <-- weka domain ya Appwrite yako
  projectId: 'YOUR_PROJECT_ID',                      // <-- weka Project ID yako
  databaseId: 'hr_portal_db',
  collections: {
    employees: 'employees',
    leaves: 'leave_requests',
    appointments: 'appointments',
    staffForms: 'staff_forms',
    portals: 'external_portals'
  }
};

// Sahihisha endpoint kiotomatiki: ondoa "/" za mwisho na hakikisha inaishia na /v1
APPWRITE_CONFIG.endpoint = APPWRITE_CONFIG.endpoint.trim().replace(/\/+$/, '');
if (!/\/v1$/.test(APPWRITE_CONFIG.endpoint)) APPWRITE_CONFIG.endpoint += '/v1';

const endpointIsPlaceholder = APPWRITE_CONFIG.endpoint.includes('domain-yako');

// Live mode huwashwa tu kama Project ID imewekwa NA SDK ya Appwrite imepakiwa
const isLiveAppwrite = APPWRITE_CONFIG.projectId !== 'YOUR_PROJECT_ID' && !endpointIsPlaceholder && typeof Appwrite !== 'undefined';
let client = null;
let databases = null;
let account = null;
let currentUser = null;

if (isLiveAppwrite) {
  const { Client, Databases, Account } = Appwrite;
  client = new Client().setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId);
  databases = new Databases(client);
  account = new Account(client);
  const badge = document.getElementById('connection-badge');
  if (badge) {
    badge.innerText = 'Appwrite Connected';
    badge.classList.add('live');
  }
} else if (APPWRITE_CONFIG.projectId !== 'YOUR_PROJECT_ID') {
  if (endpointIsPlaceholder) console.error('Weka endpoint ya Appwrite server yako kwenye appwrite-config.js (bado ni domain-yako).');
  else console.error('Appwrite SDK haikupakiwa. Hakikisha script ya CDN ipo kwenye index.html.');
}

/* ---------- Helpers ---------- */
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getDaysRemaining(endDateStr) {
  if (!endDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(endDateStr) - today) / 86400000);
}

function copyText(text, label) {
  navigator.clipboard.writeText(text).then(
    () => alert(`${label} copied to clipboard!`),
    () => alert('Copy failed. Please copy manually.')
  );
}

function showError(err, fallback) {
  console.error(err);
  alert((err && err.message) ? err.message : (fallback || 'Something went wrong.'));
}

/* ---------- State ---------- */
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

/* ---------- Navigation ---------- */
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

/* ---------- Appwrite sync ---------- */
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

/* ---------- Auth (Appwrite Auth) ---------- */
function showLogin() {
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('logout-btn').style.display = 'none';
}

function hideLogin() {
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'inline-block';
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  const errBox = document.getElementById('login-error');
  errBox.innerText = '';
  if (!email || !password) { errBox.innerText = 'Enter email and password.'; return; }
  try {
    await account.createEmailPasswordSession(email, password);
    currentUser = await account.get();
    document.getElementById('login-pass').value = '';
    hideLogin();
    await syncFromAppwrite();
  } catch (err) {
    errBox.innerText = err.message || 'Login failed.';
  }
}

async function handleLogout() {
  try { await account.deleteSession('current'); } catch (e) { console.error(e); }
  currentUser = null;
  state.employees = []; state.leaves = []; state.appointments = []; state.staffForms = []; state.portals = [];
  renderAll();
  showLogin();
}

async function startApp() {
  if (!isLiveAppwrite) { renderAll(); return; }   // Demo mode: hakuna login
  try {
    currentUser = await account.get();
    hideLogin();
    await syncFromAppwrite();
  } catch (e) {
    showLogin();                                    // Hakuna session -> onyesha login
  }
}
