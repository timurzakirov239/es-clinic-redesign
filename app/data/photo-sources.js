export function photoSource(name) {
  if (name === 'reception') {
    return '/assets/reception-lobby.png';
  }
  if (['hero', 'clinic', 'history', 'frolov', 'utin'].includes(name)) {
    return `/assets/enhanced/${name}.webp`;
  }
  if (['tishina', 'sorokin', 'maksakov'].includes(name)) {
    return `/assets/doctors-original/${name}.webp`;
  }
  return `/assets/${name}.webp`;
}
