export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

export const updateSliderBackground = (
  slider: HTMLInputElement,
  value: number,
  min: number,
  max: number
): void => {
  if (!slider) return;
  const percentage = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, hotpink 0%, hotpink ${percentage}%, white ${percentage}%, white 100%)`;
};
