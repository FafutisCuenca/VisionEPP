/** Reglas configurables de demostración. Validar con SST antes de uso real. */
import { APP_CONFIG } from './config.js';

export function getProfile(profileId) {
  return APP_CONFIG.profiles[profileId] ?? APP_CONFIG.profiles.general;
}

export function renderProfileSummary(profileId, target) {
  const profile = getProfile(profileId);
  target.replaceChildren();
  const heading = document.createElement('strong');
  heading.textContent = profile.title;
  const description = document.createElement('div');
  description.textContent = profile.description;
  const list = document.createElement('ul');
  profile.items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  });
  const note = document.createElement('p');
  note.textContent = profile.note;
  note.style.marginBottom = '0';
  target.append(heading, description, list, note);
}
