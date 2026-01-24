/**
 * Calculate profile score based on completeness
 * @param {Object} user - User object
 * @returns {Object} - Score and completeness breakdown
 */
const calculateProfileScore = user => {
  let score = 0;
  const completeness = {
    basicInfo: false,
    personalDetails: false,
    kycVerified: false,
    bankDetailsAdded: false,
  };

  // Basic Info (25 points)
  if (user.email && user.mobile && user.password) {
    score += 25;
    completeness.basicInfo = true;
  }

  // Personal Details (25 points)
  if (
    user.firstName &&
    user.lastName &&
    user.address &&
    user.address.city &&
    user.dateOfBirth &&
    user.gender &&
    user.profilePic
  ) {
    score += 25;
    completeness.personalDetails = true;
  }

  // KYC Verified (30 points)
  if (user.kyc && user.kyc.verified) {
    score += 30;
    completeness.kycVerified = true;
  }

  // Bank Details (20 points)
  if (
    user.bankDetails &&
    user.bankDetails.accountNumber &&
    user.bankDetails.ifscCode
  ) {
    score += 20;
    completeness.bankDetailsAdded = true;
  }

  return {
    score,
    completeness,
    isComplete: score === 100,
  };
};

module.exports = {
  calculateProfileScore,
};
