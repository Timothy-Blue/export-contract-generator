// ─── Constants ───────────────────────────────────────────────────────────────

const ALLOWED_UNITS = ['MT', 'KG', 'TONS', 'BAGS', 'PIECES', 'CARTONS', 'CBM'];
const ALLOWED_INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];
const ALLOWED_STATUSES = ['DRAFT', 'FINALIZED', 'SENT', 'SIGNED', 'CANCELLED'];
const ALLOWED_RELEASE_TYPES = ['SWB', 'TELEX_RELEASE', 'ORIGINAL_BL', 'NOT_SPECIFIED'];
const SWIFT_CODE_PATTERN = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ─── ValidationService ────────────────────────────────────────────────────────

class ValidationService {
  /**
   * Validates all rows in the parsed CSV file.
   * Collects ALL errors per row — never stops early within a row.
   *
   * @param {Object} parsedFile - { rows, totalRows }
   * @param {Object} cache - ReferenceDataCache
   * @returns {Array} ValidatedRow[]
   */
  validateAll(parsedFile, cache) {
    // Build contract number frequency map for CN-003
    const cnFrequency = {};
    for (const row of parsedFile.rows) {
      const cn = (row.fields.contractNumber || '').trim();
      if (cn) {
        if (!cnFrequency[cn]) cnFrequency[cn] = [];
        cnFrequency[cn].push(row.rowNumber);
      }
    }

    return parsedFile.rows.map(rawRow => {
      const errors = [];
      const warnings = [];

      // Level 2: Field-level
      const { data, errors: fieldErrors, warnings: fieldWarnings } = this.validateFieldLevel(rawRow, cnFrequency);
      errors.push(...fieldErrors);
      warnings.push(...fieldWarnings);

      // Level 3: Business logic
      const { errors: blErrors, warnings: blWarnings } = this.validateBusinessLogic(data, errors);
      errors.push(...blErrors);
      warnings.push(...blWarnings);

      // Level 4: Reference data
      const { errors: rdErrors } = this.validateReferenceData(data, cache);
      errors.push(...rdErrors);

      // Level 5: Cross-field
      const { warnings: cfWarnings } = this.validateCrossField(data, cache);
      warnings.push(...cfWarnings);

      return {
        rowNumber: rawRow.rowNumber,
        contractNumber: data.contractNumber || '',
        isValid: errors.length === 0,
        hasWarnings: warnings.length > 0,
        data,
        errors,
        warnings
      };
    });
  }

  // ─── Level 2: Field-Level Validation ───────────────────────────────────────

  validateFieldLevel(rawRow, cnFrequency) {
    const f = rawRow.fields;
    const errors = [];
    const warnings = [];
    const data = {};

    // contractNumber
    const cn = f.contractNumber;
    if (cn === undefined || cn === null || cn.trim() === '') {
      errors.push(err('CN-001', 'contractNumber', 'Contract number is required'));
      data.contractNumber = '';
    } else if (cn !== cn.trim()) {
      errors.push(err('CN-004', 'contractNumber', 'Contract number contains invalid whitespace'));
      data.contractNumber = cn.trim();
    } else {
      data.contractNumber = cn.trim();
      // CN-003: duplicate within file
      const occurrences = cnFrequency[data.contractNumber] || [];
      if (occurrences.length > 1 && occurrences[0] !== rawRow.rowNumber) {
        errors.push(err('CN-003', 'contractNumber',
          `Duplicate contract number '${data.contractNumber}' found in row ${occurrences[0]}`));
      }
    }

    // contractDate
    const cdRaw = f.contractDate;
    if (!cdRaw || cdRaw.trim() === '') {
      errors.push(err('CD-001', 'contractDate', 'Contract date is required'));
      data.contractDate = null;
    } else if (!DATE_PATTERN.test(cdRaw.trim())) {
      errors.push(err('CD-002', 'contractDate', 'Invalid date format. Use YYYY-MM-DD (e.g., 2026-03-15)'));
      data.contractDate = null;
    } else {
      const parsed = new Date(cdRaw.trim());
      if (isNaN(parsed.getTime())) {
        errors.push(err('CD-003', 'contractDate', 'Invalid date value'));
        data.contractDate = null;
      } else {
        data.contractDate = parsed;
      }
    }

    // buyerName
    data.buyerName = requiredString(f.buyerName, 'buyerName', 'BN-001', 'Buyer name is required',
      'BN-002', 'Buyer name cannot be empty', errors);

    // sellerName
    data.sellerName = requiredString(f.sellerName, 'sellerName', 'SN-001', 'Seller name is required',
      'SN-002', 'Seller name cannot be empty', errors);

    // commodityName
    data.commodityName = requiredString(f.commodityName, 'commodityName', 'CM-001', 'Commodity name is required',
      'CM-002', 'Commodity name cannot be empty', errors);

    // commodityDescription
    data.commodityDescription = requiredString(f.commodityDescription, 'commodityDescription',
      'CMD-001', 'Commodity description is required',
      'CMD-002', 'Commodity description cannot be empty', errors);

    // quantity
    const qtyRaw = f.quantity;
    if (!qtyRaw || qtyRaw.trim() === '') {
      errors.push(err('QT-001', 'quantity', 'Quantity is required'));
      data.quantity = null;
    } else {
      const qty = parseFloat(qtyRaw);
      if (isNaN(qty) || !isFinite(qty)) {
        errors.push(err('QT-002', 'quantity', 'Quantity must be a valid number'));
        data.quantity = null;
      } else if (qty <= 0) {
        errors.push(err('QT-003', 'quantity', 'Quantity must be greater than 0'));
        data.quantity = qty;
      } else {
        data.quantity = qty;
      }
    }

    // unit
    const unitRaw = f.unit;
    if (!unitRaw || unitRaw.trim() === '') {
      errors.push(err('UN-001', 'unit', 'Unit is required'));
      data.unit = null;
    } else if (!ALLOWED_UNITS.includes(unitRaw.trim())) {
      errors.push(err('UN-002', 'unit', `Invalid unit. Must be one of: ${ALLOWED_UNITS.join(', ')}`));
      data.unit = unitRaw.trim();
    } else {
      data.unit = unitRaw.trim();
    }

    // tolerance (optional, default 0 if column missing)
    const tolRaw = f.tolerance;
    if (tolRaw === undefined || tolRaw === null) {
      data.tolerance = 0; // column missing
    } else if (tolRaw.trim() === '') {
      data.tolerance = 0; // present but empty
    } else {
      const tol = parseFloat(tolRaw);
      if (isNaN(tol) || !isFinite(tol)) {
        errors.push(err('TL-002', 'tolerance', 'Tolerance must be a valid number'));
        data.tolerance = null;
      } else if (tol < 0 || tol > 100) {
        errors.push(err('TL-003', 'tolerance', 'Tolerance must be between 0 and 100'));
        data.tolerance = tol;
      } else {
        data.tolerance = tol;
      }
    }

    // origin
    data.origin = requiredString(f.origin, 'origin', 'OR-001', 'Origin is required',
      'OR-002', 'Origin cannot be empty', errors);

    // packing
    data.packing = requiredString(f.packing, 'packing', 'PK-001', 'Packing is required',
      'PK-002', 'Packing cannot be empty', errors);

    // qualitySpec (optional)
    data.qualitySpec = f.qualitySpec !== undefined ? f.qualitySpec : '';

    // unitPrice
    const upRaw = f.unitPrice;
    if (!upRaw || upRaw.trim() === '') {
      errors.push(err('UP-001', 'unitPrice', 'Unit price is required'));
      data.unitPrice = null;
    } else {
      const up = parseFloat(upRaw);
      if (isNaN(up) || !isFinite(up)) {
        errors.push(err('UP-002', 'unitPrice', 'Unit price must be a valid number'));
        data.unitPrice = null;
      } else if (up <= 0) {
        errors.push(err('UP-003', 'unitPrice', 'Unit price must be greater than 0'));
        data.unitPrice = up;
      } else {
        data.unitPrice = up;
      }
    }

    // currency
    const curRaw = f.currency;
    if (!curRaw || curRaw.trim() === '') {
      errors.push(err('CU-001', 'currency', 'Currency is required'));
      data.currency = null;
    } else if (!CURRENCY_CODE_PATTERN.test(curRaw.trim())) {
      errors.push(err('CU-002', 'currency', 'Invalid currency code'));
      data.currency = curRaw.trim();
    } else {
      data.currency = curRaw.trim();
    }

    // incoterm
    const incRaw = f.incoterm;
    if (!incRaw || incRaw.trim() === '') {
      errors.push(err('IC-001', 'incoterm', 'Incoterm is required'));
      data.incoterm = null;
    } else if (!ALLOWED_INCOTERMS.includes(incRaw.trim())) {
      errors.push(err('IC-002', 'incoterm', `Invalid incoterm. Must be one of: ${ALLOWED_INCOTERMS.join(', ')}`));
      data.incoterm = incRaw.trim();
    } else {
      data.incoterm = incRaw.trim();
    }

    // portLocation
    data.portLocation = requiredString(f.portLocation, 'portLocation', 'PL-001', 'Port location is required',
      'PL-002', 'Port location cannot be empty', errors);

    // paymentTermName
    data.paymentTermName = requiredString(f.paymentTermName, 'paymentTermName', 'PT-001', 'Payment term name is required',
      'PT-002', 'Payment term name cannot be empty', errors);

    // bankName
    data.bankName = requiredString(f.bankName, 'bankName', 'BK-001', 'Bank name is required',
      'BK-002', 'Bank name cannot be empty', errors);

    // accountName
    data.accountName = requiredString(f.accountName, 'accountName', 'AN-001', 'Account name is required',
      'AN-002', 'Account name cannot be empty', errors);

    // accountNumber
    data.accountNumber = requiredString(f.accountNumber, 'accountNumber', 'AC-001', 'Account number is required',
      'AC-002', 'Account number cannot be empty', errors);

    // swiftCode
    const swRaw = f.swiftCode;
    if (!swRaw || swRaw.trim() === '') {
      errors.push(err('SW-001', 'swiftCode', 'SWIFT code is required'));
      data.swiftCode = null;
    } else {
      const sw = swRaw.trim();
      if (sw !== sw.toUpperCase()) {
        errors.push(err('SW-004', 'swiftCode', 'SWIFT code must be uppercase'));
        data.swiftCode = sw;
      } else if (sw.length !== 8 && sw.length !== 11) {
        errors.push(err('SW-002', 'swiftCode', 'SWIFT code must be 8 or 11 characters'));
        data.swiftCode = sw;
      } else if (!SWIFT_CODE_PATTERN.test(sw)) {
        errors.push(err('SW-003', 'swiftCode', 'Invalid SWIFT code format. Must be 6 letters + 2 alphanumeric + optional 3 alphanumeric'));
        data.swiftCode = sw;
      } else {
        data.swiftCode = sw;
      }
    }

    // shipmentPeriod (optional)
    data.shipmentPeriod = f.shipmentPeriod !== undefined ? f.shipmentPeriod : '';

    // additionalTerms (optional)
    data.additionalTerms = f.additionalTerms !== undefined ? f.additionalTerms : '';

    // releaseType (optional, default NOT_SPECIFIED if column missing)
    const rtRaw = f.releaseType;
    if (rtRaw === undefined || rtRaw === null || rtRaw.trim() === '') {
      data.releaseType = 'NOT_SPECIFIED';
    } else if (!ALLOWED_RELEASE_TYPES.includes(rtRaw.trim())) {
      errors.push(err('RT-002', 'releaseType', `Invalid release type. Must be one of: ${ALLOWED_RELEASE_TYPES.join(', ')}`));
      data.releaseType = rtRaw.trim();
    } else {
      data.releaseType = rtRaw.trim();
    }

    // status (optional, default DRAFT if column missing)
    const stRaw = f.status;
    if (stRaw === undefined || stRaw === null || stRaw.trim() === '') {
      data.status = 'DRAFT';
    } else if (!ALLOWED_STATUSES.includes(stRaw.trim())) {
      errors.push(err('ST-002', 'status', `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`));
      data.status = stRaw.trim();
    } else {
      data.status = stRaw.trim();
    }

    return { data, errors, warnings };
  }

  // ─── Level 3: Business Logic Validation ────────────────────────────────────

  validateBusinessLogic(data, existingErrors) {
    const errors = [];
    const warnings = [];
    const hasError = (field) => existingErrors.some(e => e.field === field);

    // BL-001: buyer !== seller
    if (!hasError('buyerName') && !hasError('sellerName') &&
        data.buyerName && data.sellerName &&
        data.buyerName.trim() === data.sellerName.trim()) {
      errors.push(err('BL-001', 'buyerName', 'Buyer and Seller cannot be the same party'));
    }

    // BL-002: quantity × unitPrice must be finite positive
    if (!hasError('quantity') && !hasError('unitPrice') &&
        data.quantity != null && data.unitPrice != null) {
      const total = data.quantity * data.unitPrice;
      if (!isFinite(total) || total <= 0) {
        errors.push(err('BL-002', 'quantity', 'Unable to calculate total amount. Check quantity and unit price values'));
      }
    }

    // BL-003: tolerance range must be finite
    if (!hasError('tolerance') && !hasError('quantity') &&
        data.tolerance > 0 && data.quantity != null) {
      const min = data.quantity - (data.quantity * data.tolerance / 100);
      const max = data.quantity + (data.quantity * data.tolerance / 100);
      if (!isFinite(min) || !isFinite(max)) {
        errors.push(err('BL-003', 'tolerance', 'Unable to calculate quantity range with given tolerance'));
      }
    }

    // BL-004: contract date not more than 365 days in future (warning)
    if (!hasError('contractDate') && data.contractDate) {
      const limit = new Date();
      limit.setDate(limit.getDate() + 365);
      if (data.contractDate > limit) {
        warnings.push(warn('BL-004', 'contractDate', 'Warning: Contract date is more than 1 year in the future'));
      }
    }

    return { errors, warnings };
  }

  // ─── Level 4: Reference Data Validation ────────────────────────────────────

  validateReferenceData(data, cache) {
    const errors = [];

    // RD-001: buyer active check
    if (data.buyerName && cache.parties.has(data.buyerName)) {
      const party = cache.parties.get(data.buyerName);
      if (!party.isActive) {
        errors.push(err('RD-001', 'buyerName', `Buyer '${data.buyerName}' exists but is inactive`));
      }
    }

    // RD-002: seller active check
    if (data.sellerName && cache.parties.has(data.sellerName)) {
      const party = cache.parties.get(data.sellerName);
      if (!party.isActive) {
        errors.push(err('RD-002', 'sellerName', `Seller '${data.sellerName}' exists but is inactive`));
      }
    }

    // RD-003: commodity active check
    if (data.commodityName && cache.commodities.has(data.commodityName)) {
      const commodity = cache.commodities.get(data.commodityName);
      if (!commodity.isActive) {
        errors.push(err('RD-003', 'commodityName', `Commodity '${data.commodityName}' exists but is inactive`));
      }
    }

    // RD-004: payment term active check
    if (data.paymentTermName && cache.paymentTerms.has(data.paymentTermName)) {
      const pt = cache.paymentTerms.get(data.paymentTermName);
      if (!pt.isActive) {
        errors.push(err('RD-004', 'paymentTermName', `Payment term '${data.paymentTermName}' exists but is inactive`));
      }
    }

    // RD-005: bank details active check
    if (data.bankName && data.accountNumber && data.swiftCode) {
      const bankKey = `${data.bankName}|${data.accountNumber}|${data.swiftCode}`;
      if (cache.bankDetails.has(bankKey)) {
        const bank = cache.bankDetails.get(bankKey);
        if (!bank.isActive) {
          errors.push(err('RD-005', 'bankName', `Bank details '${data.bankName}' exists but is inactive`));
        }
      }
    }

    // CN-002: contract number already in DB
    if (data.contractNumber && cache.existingContractNumbers.has(data.contractNumber)) {
      errors.push(err('CN-002', 'contractNumber', `Contract number '${data.contractNumber}' already exists`));
    }

    return { errors };
  }

  // ─── Level 5: Cross-Field Validation ───────────────────────────────────────

  validateCrossField(data, cache) {
    const warnings = [];

    // CF-001: currency vs bank currency
    if (data.bankName && data.accountNumber && data.swiftCode && data.currency) {
      const bankKey = `${data.bankName}|${data.accountNumber}|${data.swiftCode}`;
      if (cache.bankDetails.has(bankKey)) {
        const bank = cache.bankDetails.get(bankKey);
        if (bank.currency && bank.currency !== data.currency) {
          warnings.push(warn('CF-001', 'currency',
            `Warning: Contract currency '${data.currency}' differs from bank account currency '${bank.currency}'`));
        }
      }
    }

    // CF-002: unit vs commodity defaultUnit
    if (data.commodityName && data.unit) {
      if (cache.commodities.has(data.commodityName)) {
        const commodity = cache.commodities.get(data.commodityName);
        if (commodity.defaultUnit && commodity.defaultUnit !== data.unit) {
          warnings.push(warn('CF-002', 'unit',
            `Warning: Unit '${data.unit}' differs from commodity's default unit '${commodity.defaultUnit}'`));
        }
      }
    }

    return { warnings };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function err(ruleId, field, message) {
  return { ruleId, field, message, severity: 'error' };
}

function warn(ruleId, field, message) {
  return { ruleId, field, message, severity: 'warning' };
}

function requiredString(raw, field, missingRuleId, missingMsg, emptyRuleId, emptyMsg, errors) {
  if (raw === undefined || raw === null) {
    errors.push(err(missingRuleId, field, missingMsg));
    return '';
  }
  if (raw.trim() === '') {
    errors.push(err(emptyRuleId, field, emptyMsg));
    return '';
  }
  return raw.trim();
}

module.exports = ValidationService;
