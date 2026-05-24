export const ALLOWED_EMAIL_DOMAINS = ['cuet.ac.bd', 'student.cuet.ac.bd'];

export const CUET_EMAIL_DOMAIN_MESSAGE =
  'Use a CUET email ending in @cuet.ac.bd or @student.cuet.ac.bd.';

export const getEmailDomain = (email = '') => {
  const normalized = String(email).trim().toLowerCase();
  const atIndex = normalized.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return '';
  }

  return normalized.slice(atIndex + 1);
};

export const isAllowedCuetEmail = (email = '') => {
  return ALLOWED_EMAIL_DOMAINS.includes(getEmailDomain(email));
};

export const createEmailDomainError = () => {
  const error = new Error(CUET_EMAIL_DOMAIN_MESSAGE);
  error.code = 'auth/unauthorized-domain';
  return error;
};
