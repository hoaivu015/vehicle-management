export const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const generateStaffCode = (name: string): string => {
  if (!name) return 'NV-000';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return 'NV-000';
  
  if (words.length === 1) {
    return `NV-${removeAccents(words[0]).toUpperCase()}`;
  }
  
  const initials = words.slice(0, -1).map(word => removeAccents(word[0]).toUpperCase()).join('');
  const lastWord = removeAccents(words[words.length - 1]).toUpperCase();
  
  return `NV-${initials}${lastWord}`;
};
