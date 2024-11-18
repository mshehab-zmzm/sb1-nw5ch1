export function validateField(value, field) {
  if (!value) {
    return 'هذا الحقل مطلوب';
  }

  switch (field) {
    case 'mobile':
      if (!/^05\d{8}$/.test(value)) {
        return 'يجب أن يبدأ رقم الجوال بـ 05 ويتكون من 10 أرقام';
      }
      break;

    case 'nationalId':
      if (!/^\d{10}$/.test(value)) {
        return 'يجب أن يتكون رقم الهوية من 10 أرقام';
      }
      break;
  }

  return '';
}