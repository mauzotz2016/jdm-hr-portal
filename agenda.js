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