import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let confirmationResult = null;
let recaptchaVerifier = null;

const backdrop = document.querySelector('.modal-backdrop');
const openButtons = document.querySelectorAll('.open-report');
const closeButton = document.querySelector('.close-modal');
const form = document.querySelector('#report-form');
const success = document.querySelector('.success-state');
const phoneGate = document.querySelector('#phone-gate');
const otpStep = document.querySelector('#otp-step');
const authStatus = document.querySelector('#auth-status');
const themeToggle = document.querySelector('.theme-toggle');
const citySignals = document.querySelector('#city-signals');

const cityCoordinates = {
  delhi: { name: 'Delhi', x: 54, y: 29 }, mumbai: { name: 'Mumbai', x: 33, y: 62 },
  bengaluru: { name: 'Bengaluru', x: 44, y: 77 }, kolkata: { name: 'Kolkata', x: 74, y: 45 },
  hyderabad: { name: 'Hyderabad', x: 51, y: 63 }, jaipur: { name: 'Jaipur', x: 39, y: 38 },
  pune: { name: 'Pune', x: 38, y: 66 }, kochi: { name: 'Kochi', x: 40, y: 88 },
  thane: { name: 'Thane', x: 33, y: 60 }, ahmedabad: { name: 'Ahmedabad', x: 25, y: 48 },
  lucknow: { name: 'Lucknow', x: 59, y: 39 }, patna: { name: 'Patna', x: 67, y: 46 },
  bhopal: { name: 'Bhopal', x: 48, y: 52 }, chennai: { name: 'Chennai', x: 54, y: 82 }
};

const sampleReports = [
  { city: 'Delhi', count: 84 }, { city: 'Mumbai', count: 61 }, { city: 'Bengaluru', count: 55 },
  { city: 'Kolkata', count: 39 }, { city: 'Hyderabad', count: 31 }, { city: 'Jaipur', count: 24 }
];

function cityKey(city) { return city.trim().toLowerCase().replace(/\s+/g, ' '); }
function setStatus(message, kind = '') { authStatus.textContent = message; authStatus.dataset.kind = kind; }

function renderCitySignals(reports) {
  const counts = reports.reduce((acc, report) => {
    const key = cityKey(report.city || '');
    if (cityCoordinates[key]) acc[key] = (acc[key] || 0) + (report.count || 1);
    return acc;
  }, {});
  citySignals.innerHTML = Object.entries(counts).map(([key, count]) => {
    const city = cityCoordinates[key];
    return `<span class="city-dot" style="left:${city.x}%;top:${city.y}%"><b>${city.name}</b><i>${count}</i></span>`;
  }).join('');
}

async function loadReports() {
  try {
    const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(250));
    const snapshot = await getDocs(reportsQuery);
    const reports = snapshot.docs.map(doc => doc.data());
    renderCitySignals(reports.length ? reports : sampleReports);
  } catch (error) {
    renderCitySignals(sampleReports);
    console.info('Public report feed is not available yet:', error.code || error.message);
  }
}

function syncThemeToggle() {
  const light = document.body.dataset.theme === 'light';
  themeToggle.setAttribute('aria-pressed', String(light));
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
}
const savedTheme = localStorage.getItem('bribe-theme');
if (savedTheme === 'light') document.body.dataset.theme = 'light';
syncThemeToggle();
themeToggle.addEventListener('click', () => {
  const light = document.body.dataset.theme !== 'light';
  document.body.dataset.theme = light ? 'light' : 'dark';
  localStorage.setItem('bribe-theme', light ? 'light' : 'dark');
  syncThemeToggle();
});

function openModal() {
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'normal' });
    recaptchaVerifier.render().catch(() => setStatus('Please refresh and try the verification again.', 'error'));
  }
  if (auth.currentUser) unlockReportForm();
  else setTimeout(() => document.querySelector('#phone-number').focus(), 50);
}
function closeModal() { backdrop.hidden = true; document.body.style.overflow = ''; }
function unlockReportForm() {
  phoneGate.hidden = true;
  otpStep.hidden = true;
  form.hidden = false;
  document.querySelector('#report-title').textContent = 'What happened?';
}
openButtons.forEach(button => button.addEventListener('click', openModal));
closeButton.addEventListener('click', closeModal);
backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !backdrop.hidden) closeModal(); });

document.querySelector('#send-code').addEventListener('click', async () => {
  const phone = document.querySelector('#phone-number').value.trim();
  if (!phone) return setStatus('Enter a mobile number with country code, for example +91…', 'error');
  setStatus('Sending your one-time code…');
  try {
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    phoneGate.hidden = true;
    otpStep.hidden = false;
    setStatus('Code sent. It expires shortly.');
    document.querySelector('#otp-code').focus();
  } catch (error) {
    setStatus(error.code === 'auth/operation-not-allowed' ? 'Phone sign-in is not enabled in Firebase yet.' : 'Could not send the code. Check the number and try again.', 'error');
    recaptchaVerifier?.clear();
    recaptchaVerifier = null;
  }
});

document.querySelector('#verify-code').addEventListener('click', async () => {
  const code = document.querySelector('#otp-code').value.trim();
  if (!confirmationResult || code.length !== 6) return setStatus('Enter the 6-digit code from your SMS.', 'error');
  try {
    await confirmationResult.confirm(code);
    unlockReportForm();
  } catch { setStatus('That code was not accepted. Request a new one and try again.', 'error'); }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!auth.currentUser) return setStatus('Verify your mobile before submitting.', 'error');
  const report = {
    department: document.querySelector('#report-department').value,
    city: document.querySelector('#report-city').value.trim(),
    amount: Number(document.querySelector('#report-amount').value),
    service: document.querySelector('#report-service').value.trim(),
    status: 'pending',
    uid: auth.currentUser.uid,
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, 'reports'), report);
    form.hidden = true;
    success.hidden = false;
    await loadReports();
  } catch (error) {
    setStatus('Your report could not be saved yet. Check that Firestore is enabled, then try again.', 'error');
    console.error(error);
  }
});

onAuthStateChanged(auth, user => { if (user && !backdrop.hidden) unlockReportForm(); });
loadReports();
