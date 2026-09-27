export function photoSource(name) {
  if (name === 'reception') {
    return '/assets/clinic-facade.png';
  }
  if (name === 'history') {
    return '/assets/reception-lobby.png';
  }
  if (name === 'history-walk') {
    return '/assets/history-walk.png';
  }
  if (['hero', 'clinic', 'frolov', 'utin'].includes(name)) {
    return `/assets/enhanced/${name}.webp`;
  }
  if (['tishina', 'sorokin', 'maksakov'].includes(name)) {
    return `/assets/doctors-original/${name}.webp`;
  }
  return `/assets/${name}.webp`;
}
