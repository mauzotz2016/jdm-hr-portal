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

if (isLiveAppwrite) {
  const { Client, Databases } = Appwrite;
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  databases = new Databases(client);

  const badge = document.getElementById('connection-badge');
  if (badge) {
    badge.innerText = 'Appwrite Cloud Connected';
    badge.classList.add('live');
  }
}

// ==========================================
// 1. WEEKLY OPERATIONS AGENDA MODULE
// ==========================================
const agendaTemplate = [
  { title: '1. Opening & Prayer / Welcome Remarks', mins: 5, resp: 'General Manager', points: '' },
  { title: '2. Review of Previous Meeting Minutes & Action Items', mins: 10, resp: 'HR Manager', points: '' },
  { title: '3. Front Office & Room Occupancy Report', mins: 10, resp: 'Front Office Manager', points: '' },
  { title: '4. Housekeeping & Laundry Operations Update', mins: 10, resp: 'Executive Housekeeper', points: '' },
  { title: '5. Food & Beverage (Kitchen & Restaurant) Performance', mins: 10, resp: 'F&B Manager', points: '' },
  { title: '6. Sales, Marketing & Corporate Reservations', mins: 10, resp: 'Sales & Marketing Lead', points: '' },
  { title: '7. Maintenance, Engineering & IT Systems Status', mins: 8, resp: 'Chief Engineer / IT', points: '' },
  { title: '8. Procurement, Stores & Inventory Control', mins: 8, resp: 'Procurement Officer', points: '' },
  { title: '9. Finance, Accounts & Cost Control Summary', mins: 10, resp: 'Chief Accountant', points: '' },
  { title: '10. Human Resources, Staffing, Attendance & Contracts', mins: 10, resp: 'HR Manager', points: '' },
  { title: '11. Guest Feedback, Reviews & Quality Assurance', mins: 7, resp: 'Duty Manager', points: '' },
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
  if (!dateInput) return;
  dateInput.valueAsDate = new Date();
  renderParticipants();

  const container = document.getElementById('agenda-items-container');
  container.innerHTML = agendaTemplate.map((item, idx) => `
    <div class="agenda-accordion">
      <div class="agenda-acc-head" onclick="this.nextElementSibling.classList.toggle('open')">
        <span>${item.title}</span>
        <span><span id="acc-min-label-${idx}">${item.mins}</span> min &#9662;</span>
      </div>
      <div class="agenda-acc-body ${idx === 0 ? 'open' : ''}">
        <div class="form-grid">
          <div class="form-group">
            <label>Presenter / Responsible</label>
            <input type="text" value="${item.resp}" oninput="agendaTemplate[${idx}].resp=this.value; updateAgendaPreview()" />
          </div>
          <div class="form-group">
            <label>Minutes</label>
            <input type="number" value="${item.mins}" min="1" oninput="agendaTemplate[${idx}].mins=Number(this.value)||0; document.getElementById('acc-min-label-${idx}').innerText=this.value; updateAgendaPreview()" />
          </div>
        </div>
        <div class="form-group">
          <label>Key Points / Discussion Notes</label>
          <textarea rows="2" placeholder="Enter key points..." oninput="agendaTemplate[${idx}].points=this.value; updateAgendaPreview()" style="padding:8px; border:1px solid var(--border); border-radius:6px; width:100%;"></textarea>
        </div>
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
      <input type="text" placeholder="Full Name" value="${p.name}" oninput="participantsList[${i}].name=this.value; updateAgendaPreview()" style="padding:7px; border:1px solid var(--border); border-radius:6px;" />
      <input type="text" placeholder="Job Title" value="${p.title}" oninput="participantsList[${i}].title=this.value; updateAgendaPreview()" style="padding:7px; border:1px solid var(--border); border-radius:6px;" />
      <label style="font-size:0.8rem; display:flex; align-items:center; gap:4px;">
        <input type="checkbox" ${p.present ? 'checked' : ''} onchange="participantsList[${i}].present=this.checked; updateAgendaPreview()" /> Present
      </label>
      <button class="btn btn-outline btn-sm" onclick="participantsList.splice(${i},1); renderParticipants(); updateAgendaPreview()">&times;</button>
    </div>
  `).join('');
}

function addParticipantRow() {
  participantsList.push({ name: '', title: '', present: true });
  renderParticipants();
}

function updateAgendaPreview() {
  const dateVal = document.getElementById('ag-date').value || '-';
  const startTime = document.getElementById('ag-time').value || '09:00';
  const venue = document.getElementById('ag-venue').value || '-';
  const recap = document.getElementById('ag-recap').value.trim();

  document.getElementById('prev-date').innerText = dateVal;
  document.getElementById('prev-time').innerText = startTime;
  document.getElementById('prev-venue').innerText = venue;

  const recapBox = document.getElementById('prev-recap-box');
  if (recap) {
    recapBox.style.display = 'block';
    document.getElementById('prev-recap').innerText = recap;
  } else {
    recapBox.style.display = 'none';
  }

  const activeParticipants = participantsList.filter(p => p.name.trim() !== '' && p.present);
  document.getElementById('prev-participants').innerHTML = activeParticipants.length
    ? activeParticipants.map(p => `<span class="badge badge-approved" style="margin:2px;">${p.name} (${p.title})</span>`).join(' ')
    : '<span style="color:var(--muted);">No participants marked present yet.</span>';

  let [hh, mm] = startTime.split(':').map(Number);
  let currentMins = (hh * 60) + mm;
  let totalMins = 0;

  const formatTime = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  document.getElementById('prev-agenda-tbody').innerHTML = agendaTemplate.map(item => {
    const slotStart = formatTime(currentMins);
    currentMins += item.mins;
    totalMins += item.mins;
    const slotEnd = formatTime(currentMins);
    return `
      <tr>
        <td><strong>${slotStart} - ${slotEnd}</strong><br><span style="font-size:0.74rem; color:var(--muted);">${item.mins} min</span></td>
        <td><strong>${item.title}</strong></td>
        <td><strong>${item.resp}</strong>${item.points ? '<br><span style="font-size:0.8rem; color:var(--muted);">' + item.points + '</span>' : ''}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('prev-total-min').innerText = totalMins;
  document.getElementById('prev-end-time').innerText = formatTime(currentMins);
}

function sendWeeklyAgenda() {
  const email = document.getElementById('ag-group-email').value.trim();
  const code = document.getElementById('ag-access-code').value.trim();
  if (!code) return alert('Please enter your HR Access Code before sending.');
  const dateVal = document.getElementById('ag-date').value;
  const subject = encodeURIComponent(`Tiffany Weekly Operations Agenda - ${dateVal}`);
  const body = encodeURIComponent(`Dear Team,\n\nPlease find the Weekly Operations Meeting Agenda for ${dateVal} at ${document.getElementById('ag-venue').value}.\n\nChairperson: General Manager\nSecretary: HR Manager`);
  window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
}

// ==========================================
// 2. CORE HR PORTAL & OPERATIONS STATE
// ==========================================
function getDaysRemaining(endDateStr) {
  if (!endDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}

let state = {
  employees: [
    {
      $id: 'emp1',
      name: 'Amina Hassan',
      email: 'amina.hassan@company.co.tz',
      phone: '+255 712 345 678',
      nida: '19920412-14102-00001-22',
      role: 'Branch Manager',
      branch: 'Indira Gandhi',
      contractStart: '2025-01-01',
      contractEnd: '2026-12-25',
      salary: 1450000,
      leaveBalance: 14,
      emergencyContact: 'Salim Hassan (+255 754 111 222)',
      status: 'Active'
    },
    {
      $id: 'emp2',
      name: 'David Mwakalinga',
      email: 'david.m@company.co.tz',
      phone: '+255 765 987 654',
      nida: '19950819-11204-00004-19',
      role: 'Front Office Lead',
      branch: 'Makunganya',
      contractStart: '2025-06-01',
      contractEnd: '2027-06-01',
      salary: 850000,
      leaveBalance: 18,
      emergencyContact: 'Mary Mwakalinga (+255 713 444 555)',
      status: 'Active'
    },
    {
      $id: 'emp3',
      name: 'Baraka Juma',
      email: 'baraka.j@company.co.tz',
      phone: '+255 655 222 333',
      nida: '19941102-15109-00009-14',
      role: 'Operations Supervisor',
      branch: 'Chikongola',
      contractStart: '2025-01-10',
      contractEnd: '2027-01-05',
      salary: 900000,
      leaveBalance: 12,
      emergencyContact: 'Juma Selemani (+255 784 999 000)',
      status: 'Active'
    }
  ],
  staffForms: JSON.parse(localStorage.getItem('jdm_staff_forms') || 'null') || [
