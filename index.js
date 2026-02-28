/* ============================================================
   CODAX ZENITH 2K26 — script.js
   Assignment 3: Full JavaScript Interactivity
   ============================================================
   Features:
   1.  Form Validation (all required fields, inline messages)
   2.  Inline red/green field feedback
   3.  Email regex validation
   4.  Confirmation checkbox validation
   5.  Dynamic participants table (all columns)
   6.  Prevent page reload (e.preventDefault)
   7.  Auto-reset after submission + clear validation states
   8.  Success popup (setTimeout)
   9.  [BONUS] Participant counter badge
   10. [BONUS] Delete row button per row
   11. [BONUS] Duplicate email prevention
   12. [BONUS] Live event summary preview
   ============================================================ */

/* ── STATE ── */
var registeredEmails = [];   // tracks registered emails for duplicate check

/* ────────────────────────────────────────────
   HELPERS: inline error / valid styling
──────────────────────────────────────────── */
function setError(el, msg) {
  el.classList.add('input-error');
  el.classList.remove('input-valid');
  var errEl = el.parentElement.querySelector('.err-msg');
  if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
}
function setValid(el) {
  el.classList.remove('input-error');
  el.classList.add('input-valid');
  var errEl = el.parentElement.querySelector('.err-msg');
  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
}
function clearState(el) {
  el.classList.remove('input-error', 'input-valid');
  var errEl = el.parentElement ? el.parentElement.querySelector('.err-msg') : null;
  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
}

/* Inject a <span class="err-msg"> after each tracked input */
function injectErrSpans() {
  ['name','email','phone','dob','college','otherDept'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var span = document.createElement('span');
    span.className = 'err-msg';
    el.parentElement.appendChild(span);
  });
}

/* ── EMAIL REGEX ── */
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
}

/* ────────────────────────────────────────────
   REAL-TIME FIELD FEEDBACK (input + blur)
──────────────────────────────────────────── */
function attachLiveValidation() {
  /* Name */
  var nameEl = document.getElementById('name');
  nameEl.addEventListener('input', function() {
    if (this.value.trim()) setValid(this); else clearState(this);
  });
  nameEl.addEventListener('blur', function() {
    if (!this.value.trim()) setError(this, 'Full name cannot be empty.');
    else setValid(this);
  });

  /* Email */
  var emailEl = document.getElementById('email');
  emailEl.addEventListener('input', function() {
    var v = this.value.trim();
    if (!v) { clearState(this); return; }
    if (isValidEmail(v)) setValid(this);
    else setError(this, 'Enter a valid email (e.g. abc@gmail.com).');
  });
  emailEl.addEventListener('blur', function() {
    var v = this.value.trim();
    if (!v) { setError(this, 'Email cannot be empty.'); return; }
    if (!isValidEmail(v)) { setError(this, 'Enter a valid email address.'); return; }
    setValid(this);
  });

  /* Phone — digits only, max 10 */
  var phoneEl = document.getElementById('phone');
  phoneEl.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g,'').slice(0,10);
    if (this.value.length === 10) setValid(this);
    else if (this.value.length > 0) setError(this, 'Phone must be exactly 10 digits.');
    else clearState(this);
  });
  phoneEl.addEventListener('blur', function() {
    if (this.value.length !== 10) setError(this, 'Please enter a valid 10-digit number.');
    else setValid(this);
  });

  /* DOB */
  var dobEl = document.getElementById('dob');
  dobEl.addEventListener('change', function() {
    if (this.value) setValid(this);
    else setError(this, 'Please select your date of birth.');
  });

  /* College */
  var collegeEl = document.getElementById('college');
  collegeEl.addEventListener('input', function() {
    if (this.value.trim()) setValid(this); else clearState(this);
  });
  collegeEl.addEventListener('blur', function() {
    if (!this.value.trim()) setError(this, 'College name cannot be empty.');
    else setValid(this);
  });

  /* Other dept (only when visible) */
  var otherEl = document.getElementById('otherDept');
  otherEl.addEventListener('input', function() {
    if (this.value.trim()) setValid(this); else clearState(this);
  });
}

/* ────────────────────────────────────────────
   "Others" dept reveal
──────────────────────────────────────────── */
document.querySelectorAll('input[name="dept"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    var otherInput = document.getElementById('otherDept');
    if (this.value === 'Others') {
      otherInput.style.display = 'block';
      otherInput.required = true;
      otherInput.focus();
    } else {
      otherInput.style.display = 'none';
      otherInput.required = false;
      otherInput.value = '';
      clearState(otherInput);
    }
  });
});

/* ────────────────────────────────────────────
   Mode card visual sync
──────────────────────────────────────────── */
document.querySelectorAll('.mode-card input[type="radio"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    document.querySelectorAll('.mode-card').forEach(function(c){ c.classList.remove('selected'); });
    this.closest('.mode-card').classList.add('selected');
  });
});

/* ────────────────────────────────────────────
   LIVE EVENT SUMMARY PREVIEW
──────────────────────────────────────────── */
function buildSummaryPreview() {
  var preview = document.getElementById('eventSummaryPreview');
  if (!preview) return;
  var checked = Array.from(document.querySelectorAll('.event:checked')).map(function(cb){ return cb.value; });
  if (checked.length === 0) {
    preview.innerHTML = '<span class="summary-empty">No events selected yet — check a box above to see your selection here.</span>';
  } else {
    preview.innerHTML =
      '<strong>Your selection (' + checked.length + '):</strong> ' +
      checked.map(function(ev){ return '<span class="event-tag">' + ev + '</span>'; }).join(' ');
  }
}
document.querySelectorAll('.event').forEach(function(cb){
  cb.addEventListener('change', buildSummaryPreview);
});

/* ────────────────────────────────────────────
   PARTICIPANT COUNTER
──────────────────────────────────────────── */
function updateCounter() {
  var counter = document.getElementById('participantCount');
  if (!counter) return;
  counter.textContent = document.querySelector('#participantsTable tbody').rows.length;
}

/* ────────────────────────────────────────────
   Renumber # column after delete
──────────────────────────────────────────── */
function reNumberRows() {
  document.querySelectorAll('#participantsTable tbody tr').forEach(function(row, i){
    row.cells[0].textContent = i + 1;
  });
}

/* ────────────────────────────────────────────
   SUCCESS POPUP
──────────────────────────────────────────── */
function showPopup() {
  var popup = document.getElementById('popup');
  popup.classList.add('show');
  setTimeout(function(){ popup.classList.remove('show'); }, 3500);
}

/* ────────────────────────────────────────────
   Helpers
──────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  var p = dateStr.split('-');
  return p.length === 3 ? p[2]+'-'+p[1]+'-'+p[0] : dateStr;
}
function getNow() {
  var n = new Date();
  return [n.getDate(), n.getMonth()+1, n.getFullYear()].map(function(v){ return String(v).padStart(2,'0'); }).join('-') +
         ' ' + [n.getHours(), n.getMinutes()].map(function(v){ return String(v).padStart(2,'0'); }).join(':');
}
function buildEventTags(events) {
  return events.map(function(ev){ return '<span class="event-tag">'+ev+'</span>'; }).join(' ');
}

/* ────────────────────────────────────────────
   DELETE ROW — event delegation on tbody
──────────────────────────────────────────── */
document.querySelector('#participantsTable tbody').addEventListener('click', function(e) {
  if (!e.target.classList.contains('btn-delete')) return;
  var row = e.target.closest('tr');
  var email = row.dataset.email;
  if (email) registeredEmails = registeredEmails.filter(function(em){ return em !== email; });
  row.style.animation = 'fadeOut 0.35s ease forwards';
  setTimeout(function(){
    row.remove();
    reNumberRows();
    updateCounter();
  }, 340);
});

/* ────────────────────────────────────────────
   FORM SUBMIT
──────────────────────────────────────────── */
document.getElementById('regForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var ok = true;

  /* — Declaration — */
  if (!document.getElementById('confirm').checked) {
    alert('⚠️ Please read and confirm the declaration before submitting.');
    return;
  }

  /* — Name — */
  var nameEl = document.getElementById('name');
  var name   = nameEl.value.trim();
  if (!name) { setError(nameEl, 'Full name cannot be empty.'); ok = false; }
  else setValid(nameEl);

  /* — Email — */
  var emailEl = document.getElementById('email');
  var email   = emailEl.value.trim();
  if (!email) {
    setError(emailEl, 'Email address cannot be empty.'); ok = false;
  } else if (!isValidEmail(email)) {
    setError(emailEl, 'Enter a valid email (e.g. abc@gmail.com).'); ok = false;
  } else if (registeredEmails.indexOf(email.toLowerCase()) !== -1) {
    setError(emailEl, '⚠️ This email is already registered!'); ok = false;
  } else {
    setValid(emailEl);
  }

  /* — Phone — */
  var phoneEl = document.getElementById('phone');
  var phone   = phoneEl.value.trim();
  if (phone.length !== 10) { setError(phoneEl, 'Please enter a valid 10-digit phone number.'); ok = false; }
  else setValid(phoneEl);

  /* — DOB — */
  var dobEl = document.getElementById('dob');
  var dob   = dobEl.value;
  if (!dob) { setError(dobEl, 'Please select your date of birth.'); ok = false; }
  else setValid(dobEl);

  /* — College — */
  var collegeEl = document.getElementById('college');
  var college   = collegeEl.value.trim();
  if (!college) { setError(collegeEl, 'College name cannot be empty.'); ok = false; }
  else setValid(collegeEl);

  /* — Department — */
  var deptRadio = document.querySelector('input[name="dept"]:checked');
  var dept = deptRadio ? deptRadio.value : '';
  if (dept === 'Others') {
    var otherEl  = document.getElementById('otherDept');
    var otherVal = otherEl.value.trim();
    if (!otherVal) { setError(otherEl, 'Please type your department name.'); ok = false; }
    else { setValid(otherEl); dept = otherVal; }
  }
  if (!dept) { alert('⚠️ Please select a Department.'); ok = false; }

  /* — Year — */
  var yearRadio = document.querySelector('input[name="year"]:checked');
  var year = yearRadio ? yearRadio.value : '';
  if (!year) { alert('⚠️ Please select your Year of Study.'); ok = false; }

  /* — Gender — */
  var genderRadio = document.querySelector('input[name="gender"]:checked');
  var gender = genderRadio ? genderRadio.value : '';
  if (!gender) { alert('⚠️ Please select your Gender.'); ok = false; }

  /* — Events — */
  var selectedEvents = Array.from(document.querySelectorAll('.event:checked')).map(function(cb){ return cb.value; });
  if (selectedEvents.length === 0) { alert('⚠️ Please select at least one event.'); ok = false; }

  /* — Mode — */
  var modeRadio = document.querySelector('input[name="mode"]:checked');
  var mode = modeRadio ? modeRadio.value : '';
  if (!mode) { alert('⚠️ Please select Mode of Participation (Online / Offline).'); ok = false; }

  if (!ok) return;

  /* ── All valid: register email ── */
  registeredEmails.push(email.toLowerCase());

  /* ── Insert table row ── */
  var tbody = document.querySelector('#participantsTable tbody');
  var row   = tbody.insertRow();
  row.dataset.email = email.toLowerCase();
  row.style.animation = 'fadeUp 0.4s ease both';

  var modeClass = mode.toLowerCase();
  var cells = [
    '',                                                                          /* # — renumbered */
    name, email, phone, college, dept, year, gender, formatDate(dob),
    buildEventTags(selectedEvents),
    '<span class="mode-badge '+modeClass+'">'+mode+'</span>',
    getNow(),
    '<button class="btn-delete" title="Remove registration">🗑 Delete</button>'
  ];

  cells.forEach(function(content, i) {
    var cell = row.insertCell(i);
    cell.innerHTML = content;
  });

  reNumberRows();
  updateCounter();
  showPopup();

  /* ── Reset ── */
  this.reset();
  document.querySelectorAll('.input-error, .input-valid').forEach(function(el){
    el.classList.remove('input-error','input-valid');
  });
  document.querySelectorAll('.err-msg').forEach(function(el){
    el.style.display = 'none'; el.textContent = '';
  });
  document.querySelectorAll('.mode-card').forEach(function(c){ c.classList.remove('selected'); });
  document.getElementById('otherDept').style.display = 'none';
  buildSummaryPreview();

  /* ── Scroll to table ── */
  setTimeout(function() {
    document.querySelector('.table-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
});

/* ────────────────────────────────────────────
   INIT
──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  injectErrSpans();
  attachLiveValidation();
  buildSummaryPreview();
  updateCounter();
});
