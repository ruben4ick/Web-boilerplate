import '../scss/style.scss';

const CONFIG = {
  selectors: {
    addTeacherButtons: '.add-teacher-btn',
    addTeacherPopup: '#addTeacherPopup',
    closeAddTeacherButton: '#closeAddTeacherPopup',
    teacherCards: '.teacher-card',
    teacherInfoPopup: '#teacherInfoPopup',
    closeTeacherInfoButton: '#closeTeacherInfoPopup',
  },
  classes: {
    visible: 'popup--visible',
    active: 'active',
  },
};

const elements = {};

function initializeElements() {
  elements.addTeacherButtons = document.querySelectorAll(CONFIG.selectors.addTeacherButtons);
  elements.addTeacherPopup = document.getElementById('addTeacherPopup');
  elements.closeAddTeacherButton = document.getElementById('closeAddTeacherPopup');
  elements.teacherCards = document.querySelectorAll(CONFIG.selectors.teacherCards);
  elements.teacherInfoPopup = document.getElementById('teacherInfoPopup');
  elements.closeTeacherInfoButton = document.getElementById('closeTeacherInfoPopup');
}

class PopupManager {
  constructor() {
    this.activePopup = null;
  }

  open(popupElement) {
    if (popupElement) {
      popupElement.classList.add(CONFIG.classes.visible);
      this.activePopup = popupElement;
      document.body.style.overflow = 'hidden';
    }
  }

  close(popupElement) {
    if (popupElement) {
      popupElement.classList.remove(CONFIG.classes.visible);
      this.activePopup = null;
      document.body.style.overflow = '';
    }
  }

  closeActive() {
    if (this.activePopup) {
      this.close(this.activePopup);
    }
  }
}

const popupManager = new PopupManager();

const openAddTeacherPopup = () => {
  popupManager.open(elements.addTeacherPopup);
};

const closeAddTeacherPopup = () => {
  popupManager.close(elements.addTeacherPopup);
};

const openTeacherInfoPopup = (card) => {
  if (!elements.teacherInfoPopup) return;

  const popupContentInfo = elements.teacherInfoPopup.querySelector('.popup-content--info');
  const popupAvatar = elements.teacherInfoPopup.querySelector('.info-avatar');
  const popupName = elements.teacherInfoPopup.querySelector('.info-name');
  const popupSubject = elements.teacherInfoPopup.querySelector('.info-subject');
  const popupLocation = elements.teacherInfoPopup.querySelector('.info-location');
  const popupEmail = elements.teacherInfoPopup.querySelector('.info-email');
  const defaultAvatar = './images/default-avatar.png';

  const cardAvatar = card.querySelector('.teacher-avatar');
  const cardName = card.querySelector('.teacher-name');
  const cardSubject = card.querySelector('.teacher-subject');
  const cardLocation = card.querySelector('.teacher-location');
  const isFavorite = card.querySelector('.star-badge') !== null;

  const imgElement = cardAvatar.querySelector('img');
  const initialsElement = cardAvatar.querySelector('.initials');

  if (imgElement && imgElement.src) {
    popupAvatar.innerHTML = `<img src="${imgElement.src}" alt="${imgElement.alt}">`;
  } else if (initialsElement) {
    popupAvatar.innerHTML = `<div class="teacher-avatar initial-avatar"><span class="initials">${initialsElement.textContent}</span></div>`;
  } else {
    popupAvatar.innerHTML = `<img src="${defaultAvatar}" alt="Default Avatar">`;
  }

  const existingStar = popupContentInfo.querySelector('.info-star');
  if (existingStar) {
    existingStar.remove();
  }
  const starElement = document.createElement('span');
  starElement.classList.add('info-star');
  if (isFavorite) {
    starElement.classList.add('is-favorite');
    starElement.textContent = '★';
  } else {
    starElement.classList.add('not-favorite');
    starElement.textContent = '☆';
  }
  popupContentInfo.appendChild(starElement);

  popupName.innerHTML = cardName.innerHTML;

  if (cardSubject) {
    popupSubject.textContent = cardSubject.textContent;
    popupSubject.style.display = 'block';
  } else {
    popupSubject.style.display = 'none';
  }

  if (cardLocation) {
    popupLocation.textContent = cardLocation.textContent;
  }

  const nameText = cardName.innerHTML.replace(/<br\s*\/?>/gi, ' ');
  const nameForEmail = nameText.replace(/\s+/g, '.').toLowerCase();
  popupEmail.href = `mailto:${nameForEmail}@example.com`;
  popupEmail.textContent = `${nameForEmail}@example.com`;

  popupManager.open(elements.teacherInfoPopup);
};

const closeTeacherInfoPopup = () => {
  popupManager.close(elements.teacherInfoPopup);
};

function initializeEventListeners() {
  elements.addTeacherButtons.forEach((button) => {
    button.addEventListener('click', openAddTeacherPopup);
  });

  if (elements.closeAddTeacherButton) {
    elements.closeAddTeacherButton.addEventListener('click', closeAddTeacherPopup);
  }

  if (elements.addTeacherPopup) {
    elements.addTeacherPopup.addEventListener('click', (e) => {
      if (e.target === elements.addTeacherPopup) {
        closeAddTeacherPopup();
      }
    });
  }

  elements.teacherCards.forEach((card) => {
    card.addEventListener('click', () => openTeacherInfoPopup(card));
  });

  if (elements.closeTeacherInfoButton) {
    elements.closeTeacherInfoButton.addEventListener('click', closeTeacherInfoPopup);
  }

  if (elements.teacherInfoPopup) {
    elements.teacherInfoPopup.addEventListener('click', (e) => {
      if (e.target === elements.teacherInfoPopup) {
        closeTeacherInfoPopup();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      popupManager.closeActive();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  initializeEventListeners();
});
