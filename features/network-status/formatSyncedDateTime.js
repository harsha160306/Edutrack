/** @param {string | Date} iso */
export const formatSyncedDateTime = (iso) => {
  const d = iso instanceof Date ? iso : new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const hours24 = d.getHours();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  const hh = String(hours12).padStart(2, '0');
  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} ${ampm}`;
};
