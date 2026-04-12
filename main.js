// --- LOCK ICON LOGIC ---
const lockToggle = document.getElementById('lockToggle');
const iconLocked = document.getElementById('iconLocked');
const iconUnlocked = document.getElementById('iconUnlocked');
let isLocked = true; 

lockToggle.addEventListener('click', () => {
  isLocked = !isLocked;
  if (isLocked) {
    iconLocked.style.display = 'block';
    iconUnlocked.style.display = 'none';
  } else {
    iconLocked.style.display = 'none';
    iconUnlocked.style.display = 'block';
  }
  saveState();
});

// --- MODAL UTILITIES ---
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      if(overlay.id === 'wallpaperModalOverlay') {
        closeWallpaperModal();
      } else {
        closeModal(overlay.id);
      }
    }
  });
});

// --- TIME MODAL LOGIC ---
const timeDisplay = document.getElementById('timeDisplay');
const timeInput = document.getElementById('timeInput');
const saveTimeBtn = document.getElementById('saveTimeBtn');

timeDisplay.addEventListener('click', () => { openModal('timeModalOverlay'); });

saveTimeBtn.addEventListener('click', () => {
  if (timeInput.value) {
    let [hours, minutes] = timeInput.value.split(':');
    hours = parseInt(hours);
    hours = hours % 12 || 12; 
    timeDisplay.innerText = `${hours}:${minutes}`;
  }
  closeModal('timeModalOverlay');
  saveState();
});

// --- DATE MODAL LOGIC ---
const dateDisplay = document.getElementById('dateDisplay');
const dateInput = document.getElementById('dateInput');
const saveDateBtn = document.getElementById('saveDateBtn');

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
dateInput.value = `${yyyy}-${mm}-${dd}`;

dateDisplay.addEventListener('click', () => { openModal('dateModalOverlay'); });

saveDateBtn.addEventListener('click', () => {
  if (dateInput.value) {
    const selectedDate = new Date(dateInput.value + 'T00:00:00');
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.innerText = selectedDate.toLocaleDateString('en-US', options);
  }
  closeModal('dateModalOverlay');
  saveState();
});

// --- WALLPAPER CHANGE LOGIC (CROPPER.JS) ---
const changeWallpaperBtn = document.getElementById('changeWallpaperBtn');
const wallpaperUploadInput = document.getElementById('wallpaperUploadInput');
const cropperImage = document.getElementById('cropperImage');
const cropperWrapper = document.getElementById('cropperWrapper');
const applyWallpaperBtn = document.getElementById('applyWallpaperBtn');
const resetWallpaperBtn = document.getElementById('resetWallpaperBtn');
const phoneScreen = document.getElementById('phoneScreen');

let cropperInstance = null;

changeWallpaperBtn.addEventListener('click', () => {
  openModal('wallpaperModalOverlay');
});

wallpaperUploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      cropperImage.src = evt.target.result;
      cropperWrapper.style.display = 'block';
      applyWallpaperBtn.style.display = 'block';

      if (cropperInstance) {
        cropperInstance.destroy();
      }

      cropperInstance = new Cropper(cropperImage, {
        aspectRatio: 9 / 19.5,
        viewMode: 1, 
        dragMode: 'move', 
        autoCropArea: 1
      });
    };
    reader.readAsDataURL(file);
  }
});

applyWallpaperBtn.addEventListener('click', () => {
  if (cropperInstance) {
    const canvas = cropperInstance.getCroppedCanvas({
      width: 1080,
      height: 2340
    });
    const croppedImageURL = canvas.toDataURL('image/jpeg', 0.9);
    phoneScreen.style.backgroundImage = `url('${croppedImageURL}')`;
    closeWallpaperModal();
  }
  saveState();
});

// --- RESTORE DEFAULT WALLPAPER ---
resetWallpaperBtn.addEventListener('click', () => {
  phoneScreen.style.backgroundImage = '';
  closeWallpaperModal();
  saveState();
});

function closeWallpaperModal() {
  closeModal('wallpaperModalOverlay');
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
  cropperImage.src = '';
  cropperWrapper.style.display = 'none';
  applyWallpaperBtn.style.display = 'none';
  wallpaperUploadInput.value = '';
}

// --- NOTIFICATION MULTI-EDIT LOGIC ---
const notificationsList = document.getElementById('notificationsList');
let currentActiveNotification = null; 

const editNotifAppTitle = document.getElementById('editNotifAppTitle');
const editNotifName = document.getElementById('editNotifName');
const editNotifMessage = document.getElementById('editNotifMessage');
const editNotifSubtext = document.getElementById('editNotifSubtext');
const editNotifTime = document.getElementById('editNotifTime');
const saveNotifBtn = document.getElementById('saveNotifBtn');
const deleteNotifBtn = document.getElementById('deleteNotifBtn');

const logoUploadInput = document.getElementById('logoUploadInput');
const presetItems = document.querySelectorAll('.preset-item');
let pendingImageSrc = null; 
let pendingBgColor = 'transparent';

notificationsList.addEventListener('click', (e) => {
  const clickedNotification = e.target.closest('.notification');
  if (!clickedNotification) return; 

  currentActiveNotification = clickedNotification; 

  editNotifAppTitle.value = clickedNotification.querySelector('.notif-app-title').innerText;
  editNotifName.value = clickedNotification.querySelector('.notif-name').innerText;
  editNotifMessage.value = clickedNotification.querySelector('.notif-message').innerText;
  editNotifSubtext.value = clickedNotification.querySelector('.notif-subtext').innerText;
  editNotifTime.value = clickedNotification.querySelector('.notif-time').innerText;
  
  pendingImageSrc = null;
  logoUploadInput.value = '';
  presetItems.forEach(p => p.classList.remove('selected'));

  openModal('notificationModalOverlay');
});

logoUploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      pendingImageSrc = evt.target.result;
      pendingBgColor = 'transparent'; 
      presetItems.forEach(item => item.classList.remove('selected'));
    };
    reader.readAsDataURL(file);
  }
});

presetItems.forEach(item => {
  item.addEventListener('click', () => {
    presetItems.forEach(p => p.classList.remove('selected'));
    item.classList.add('selected');
    pendingImageSrc = item.getAttribute('data-src');
    pendingBgColor = window.getComputedStyle(item).backgroundColor; 
    logoUploadInput.value = ''; 
  });
});

saveNotifBtn.addEventListener('click', () => {
  if (!currentActiveNotification) return;

  currentActiveNotification.querySelector('.notif-app-title').innerText = editNotifAppTitle.value;
  currentActiveNotification.querySelector('.notif-name').innerText = editNotifName.value;
  currentActiveNotification.querySelector('.notif-message').innerText = editNotifMessage.value;
  currentActiveNotification.querySelector('.notif-subtext').innerText = editNotifSubtext.value;
  currentActiveNotification.querySelector('.notif-time').innerText = editNotifTime.value;
  
  if (pendingImageSrc) {
    const iconElement = currentActiveNotification.querySelector('.notif-app-icon');
    iconElement.style.backgroundImage = `url('${pendingImageSrc}')`;
    iconElement.style.backgroundColor = pendingBgColor;
    iconElement.innerText = ''; 
  }

  closeModal('notificationModalOverlay');
  saveState();
});

deleteNotifBtn.addEventListener('click', () => {
  if (currentActiveNotification) {
    currentActiveNotification.remove();
    currentActiveNotification = null; 
  }
  closeModal('notificationModalOverlay');
  saveState();
});

// --- ADD / DELETE ALL NOTIFICATIONS LOGIC ---
const addNotificationBtn = document.getElementById('addNotificationBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');

addNotificationBtn.addEventListener('click', () => {
  const newNotificationHTML = `
    <div class="notification">
        <div class="notification-header">
            <div class="notification-title-group">
                <div class="imessage-icon-placeholder notif-app-icon"></div> 
                <span class="notification-title notif-app-title">NEW APP PO ITO</span>
            </div>
            <span class="notification-time notif-time">now</span>
        </div>
        <div class="notification-content">
            <div class="notification-subtitle notif-name">name ni sender</div>
            <span class="notif-message">blah blah blah</span>
            <div class="notification-footer notif-subtext">12+ more messages from Whoever</div>
        </div>
    </div>
  `;

  notificationsList.insertAdjacentHTML('beforeend', newNotificationHTML);
  notificationsList.scrollTop = notificationsList.scrollHeight;
  saveState();
});

deleteAllBtn.addEventListener('click', () => {
  notificationsList.innerHTML = ''; 
  saveState();
});

// --- DOWNLOAD HD SCREENSHOT LOGIC ---
const downloadScreenshotBtn = document.getElementById('downloadScreenshotBtn');

downloadScreenshotBtn.addEventListener('click', () => {
  const targetElement = document.getElementById('screenshotTarget');

  html2canvas(targetElement, { 
    scale: 3, 
    useCORS: true, 
    backgroundColor: null 
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'tarantado.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

// --- LOCAL STORAGE (SAVE/LOAD LOGIC) ---

function saveState() {
  const appState = {
    isLocked: isLocked,
    timeText: timeDisplay.innerText,
    dateText: dateDisplay.innerText,
    wallpaperURL: phoneScreen.style.backgroundImage,
    notificationsHTML: notificationsList.innerHTML
  };
  
  try {
    // Save everything as a stringified JSON object
    localStorage.setItem('lockScreenState', JSON.stringify(appState));
  } catch (e) {
    console.error("Failed to save state. The cropped wallpaper might be too large for local storage.", e);
  }
}

function loadState() {
  const savedData = localStorage.getItem('lockScreenState');
  
  if (savedData) {
    const appState = JSON.parse(savedData);

    // 1. Restore Lock Status
    isLocked = appState.isLocked;
    if (isLocked) {
      iconLocked.style.display = 'block';
      iconUnlocked.style.display = 'none';
    } else {
      iconLocked.style.display = 'none';
      iconUnlocked.style.display = 'block';
    }

    // RESTORATION
    if (appState.timeText) timeDisplay.innerText = appState.timeText;
    if (appState.dateText) dateDisplay.innerText = appState.dateText;

    if (appState.wallpaperURL) phoneScreen.style.backgroundImage = appState.wallpaperURL;
    
    if (appState.notificationsHTML) notificationsList.innerHTML = appState.notificationsHTML;
  }
}

window.addEventListener('DOMContentLoaded', loadState);
