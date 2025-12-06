export const translations = {
  en: {
    // Navigation
    appTitle: "Export Contract Generator",
    newContract: "New Contract",
    contractList: "Contract List",
    
    // Contract Form
    contractDetails: "Contract Details",
    contractNumber: "Contract Number",
    contractDate: "Contract Date",
    buyer: "Buyer",
    seller: "Seller",
    commodity: "Commodity",
    commodityDescription: "Commodity Description",
    quantity: "Quantity",
    unit: "Unit",
    unitPrice: "Unit Price",
    currency: "Currency",
    totalAmount: "Total Amount",
    tolerance: "Tolerance (%)",
    toleranceRange: "Tolerance Range",
    paymentTerm: "Payment Term",
    paymentTermText: "Payment Terms Text",
    incoterm: "Incoterm",
    portLocation: "Port/Location",
    bankDetails: "Bank Details",
    remarks: "Remarks",
    origin: "Origin",
    packing: "Packing",
    qualitySpec: "Quality Specification",
    shipmentPeriod: "Shipment Period",
    additionalTerms: "Additional Terms & Conditions",
    contractTerms: "Buyer & Seller Terms",
    buyerTerms: "Buyer Terms",
    buyerTermsPlaceholder: "Edit buyer terms...",
    sellerTerms: "Seller Terms",
    sellerTermsPlaceholder: "Edit seller terms...",
    releaseType: "Release Type",
    releaseStatus: "Release Status",
    
    // Buttons
    save: "Save Contract",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    export: "Export",
    addNewBuyer: "Add New Buyer",
    addNewSeller: "Add New Seller",
    addNewCommodity: "Add New Commodity",
    addNewBank: "Add New Bank",
    
    // Buyer/Seller Modal
    addBuyer: "Add New Buyer",
    addSeller: "Add New Seller",
    addCommodity: "Add Commodity",
    addBankDetails: "Add Bank Details",
    companyName: "Company Name",
    address: "Address",
    contactPerson: "Contact Person",
    email: "Email",
    phone: "Phone",
    partyType: "Party Type",
    country: "Country",
    taxId: "Tax ID / Business Number",
    
    // Commodity Modal
    commodityName: "Commodity Name",
    description: "Description",
    hsCode: "HS Code",
    
    // Bank Details Modal
    bankName: "Bank Name",
    accountName: "Account Name",
    accountNumber: "Account Number",
    swiftCode: "SWIFT Code",
    bankAddress: "Bank Address",
    setAsDefault: "Set as default bank details",
    
    // Contract List
    contractNo: "Contract No.",
    date: "Date",
    amount: "Amount",
    status: "Status",
    actions: "Actions",
    noContracts: "No contracts found",
    loading: "Loading...",
    
    // Status Values
    DRAFT: "Draft",
    FINALIZED: "Finalized",
    SENT: "Sent",
    SIGNED: "Signed",
    CANCELLED: "Cancelled",
    PENDING: "Pending",
    RELEASED: "Released",
    NOT_APPLICABLE: "Not Applicable",
    
    // Release Types
    SWB: "Sea Waybill (SWB)",
    TELEX_RELEASE: "Telex Release",
    ORIGINAL_BL: "Original B/L",
    NOT_SPECIFIED: "Not Specified",
    
    // Debit Note
    debitNoteNumber: "Debit Note Number",
    invoiceDate: "Invoice Date",
    dueDate: "Due Date",
    
    // Messages
    saveSuccess: "Contract saved successfully!",
    saveError: "Failed to save contract",
    deleteSuccess: "Contract deleted successfully!",
    deleteError: "Failed to delete contract",
    loadError: "Failed to load data",
    validationError: "Please fill in all required fields",
    
    // Validation
    required: "This field is required",
    selectBuyer: "Please select a buyer",
    selectSeller: "Please select a seller",
    selectCommodity: "Please select a commodity",
    selectPaymentTerm: "Please select a payment term",
    selectBank: "Please select bank details",
    
    // Units
    MT: "MT (Metric Ton)",
    KG: "KG (Kilogram)",
    LBS: "LBS (Pounds)",
    TONS: "TONS",
    
    // Currency
    USD: "USD",
    EUR: "EUR",
    VND: "VND",
    
    // Incoterms
    CIF: "CIF",
    FOB: "FOB",
    CFR: "CFR",
    EXW: "EXW",
    
    // Language
    language: "Language",
    vietnamese: "Vietnamese",
    english: "English",
    
    // Placeholders
    selectBuyerPlaceholder: "Select buyer",
    selectSellerPlaceholder: "Select seller",
    selectCommodityPlaceholder: "Select commodity",
    selectPaymentTermPlaceholder: "Select Payment Terms",
    selectBankPlaceholder: "Select Bank Details",
    searchPlaceholder: "Search by contract number or buyer name...",
    contactPersonPlaceholder: "Contact person name",
    emailPlaceholder: "buyer@example.com",
    emailPlaceholderSeller: "seller@example.com",
    shipmentPeriodPlaceholder: "e.g., Within 30 days from receipt of L/C",
    additionalTermsPlaceholder: "Enter any additional terms and conditions...",
    releaseRemarksPlaceholder: "Enter any additional notes about the release...",
    
    // Section Headers
    parties: "Parties",
    article1: "Article 1: Commodity, Quality & Quantity",
    article2: "Article 2: Price",
    article3: "Article 3: Payment",
    sellerBankDetails: "Seller's Bank Details",
    additionalInformation: "Additional Information",
    contractStatus: "Contract Status",
    
    // Labels and Fields
    quantityRange: "Quantity Range",
    amountRange: "Amount Range",
    totalAmountLabel: "Total Amount",
    inWords: "In Words",
    all: "All",
    
    // Table Headers
    contractNoHeader: "Contract No.",
    dateHeader: "Date",
    buyerHeader: "Buyer",
    commodityHeader: "Commodity",
    totalAmountHeader: "Total Amount",
    releaseHeader: "Release",
    statusHeader: "Status",
    actionsHeader: "Actions",
    
    // Messages and Alerts
    loadingContracts: "Loading contracts...",
    noContractsFound: "No contracts found",
    pleaseSelectBuyer: "Please select a buyer or add a new buyer",
    pleaseSelectSeller: "Please select a seller",
    pleaseSelectCommodityAlert: "Please select a commodity",
    pleaseSelectPaymentTermAlert: "Please select payment terms",
    pleaseSelectBankAlert: "Please select bank details",
    contractCreatedSuccess: "Contract created successfully!",
    contractUpdatedSuccess: "Contract updated successfully!",
    failedToSaveContract: "Failed to save contract",
    failedToLoadContract: "Failed to load contract",
    failedToLoadMasterData: "Failed to load master data.",
    ensureMongoDBRunning: "Please ensure MongoDB is running and the database is seeded.\nRun: node server/seed.js",
    failedToLoadContracts: "Failed to load contracts.",
    ensureServerRunning: "Please ensure MongoDB is running and the server is started.\nRun: npm run dev",
    deleteConfirm: "Are you sure you want to delete this contract?",
    buyerAddedSuccess: "Buyer added successfully!",
    sellerAddedSuccess: "Seller added successfully!",
    commodityAddedSuccess: "Commodity added successfully!",
    bankDetailsAddedSuccess: "Bank details added successfully!",
    failedToCreateBuyer: "Failed to create buyer",
    failedToCreateSeller: "Failed to create seller",
    failedToCreateCommodity: "Failed to create commodity",
    failedToCreateBankDetails: "Failed to create bank details",
    releaseInfoSaved: "Release information saved successfully! You can now export the PDF.",
    saveBeforeExport: "Please save your changes before exporting the PDF.",
    failedToSaveRelease: "Failed to save release information",
    unsavedChangesWarning: "⚠️ You have unsaved changes. Please save before exporting PDF.",
    unsavedChanges: "Unsaved Changes",
    unsavedChangesMessage: "You have unsaved changes. Do you want to save before leaving?",
    discardChanges: "Discard",
    
    // Buttons and Actions  
    previous: "Previous",
    next: "Next",
    pageOf: "Page",
    of: "of",
    
    // Release Modal
    releaseDocument: "Release Document",
    releaseDate: "Release Date",
    releaseRemarks: "Release Remarks / Additional Notes",
    exportPDF: "Export PDF",
    
    // Footer
    footerText: "Export Contract Generator © 2025 | Automated Commercial Contract Management"
  },
  
  vi: {
    // Navigation
    appTitle: "Phần Mềm Tạo Hợp Đồng Xuất Khẩu",
    newContract: "Hợp Đồng Mới",
    contractList: "Danh Sách Hợp Đồng",
    
    // Contract Form
    contractDetails: "Chi Tiết Hợp Đồng",
    contractNumber: "Số Hợp Đồng",
    contractDate: "Ngày Hợp Đồng",
    buyer: "Bên Mua",
    seller: "Bên Bán",
    commodity: "Hàng Hóa",
    commodityDescription: "Mô Tả Hàng Hóa",
    quantity: "Số Lượng",
    unit: "Đơn Vị",
    unitPrice: "Đơn Giá",
    currency: "Tiền Tệ",
    totalAmount: "Tổng Giá Trị",
    tolerance: "Dung Sai (%)",
    toleranceRange: "Phạm Vi Dung Sai",
    paymentTerm: "Điều Khoản Thanh Toán",
    paymentTermText: "Nội Dung Thanh Toán",
    incoterm: "Điều Kiện Giao Hàng",
    portLocation: "Cảng/Địa Điểm",
    bankDetails: "Thông Tin Ngân Hàng",
    remarks: "Ghi Chú",
    origin: "Xuất Xứ",
    packing: "Đóng Gói",
    qualitySpec: "Tiêu Chuẩn Chất Lượng",
    shipmentPeriod: "Thời Gian Giao Hàng",
    additionalTerms: "Điều Khoản Bổ Sung",
    contractTerms: "Điều Khoản Bên Mua & Bên Bán",
    buyerTerms: "Điều Khoản Bên Mua",
    buyerTermsPlaceholder: "Chỉnh sửa điều khoản bên mua...",
    sellerTerms: "Điều Khoản Bên Bán",
    sellerTermsPlaceholder: "Chỉnh sửa điều khoản bên bán...",
    releaseType: "Loại Giải Phóng",
    releaseStatus: "Trạng Thái Giải Phóng",
    
    // Buttons
    save: "Lưu Hợp Đồng",
    cancel: "Hủy",
    edit: "Sửa",
    delete: "Xóa",
    search: "Tìm Kiếm",
    export: "Xuất File",
    addNewBuyer: "Thêm Bên Mua Mới",
    addNewSeller: "Thêm Bên Bán Mới",
    addNewCommodity: "Thêm Hàng Hóa Mới",
    addNewBank: "Thêm Ngân Hàng Mới",
    
    // Buyer/Seller Modal
    addBuyer: "Thêm Bên Mua Mới",
    addSeller: "Thêm Bên Bán Mới",
    addCommodity: "Thêm Hàng Hóa",
    addBankDetails: "Thêm Thông Tin Ngân Hàng",
    companyName: "Tên Công Ty",
    address: "Địa Chỉ",
    contactPerson: "Người Liên Hệ",
    email: "Email",
    phone: "Số Điện Thoại",
    partyType: "Loại Đối Tác",
    country: "Quốc Gia",
    taxId: "Mã Số Thuế / Số Đăng Ký Kinh Doanh",
    
    // Commodity Modal
    commodityName: "Tên Hàng Hóa",
    description: "Mô Tả",
    hsCode: "Mã HS",
    
    // Bank Details Modal
    bankName: "Tên Ngân Hàng",
    accountName: "Tên Tài Khoản",
    accountNumber: "Số Tài Khoản",
    swiftCode: "Mã SWIFT",
    bankAddress: "Địa Chỉ Ngân Hàng",
    setAsDefault: "Đặt làm ngân hàng mặc định",
    
    // Contract List
    contractNo: "Số HĐ",
    date: "Ngày",
    amount: "Giá Trị",
    status: "Trạng Thái",
    actions: "Thao Tác",
    noContracts: "Không tìm thấy hợp đồng",
    loading: "Đang tải...",
    
    // Status Values
    DRAFT: "Bản Nháp",
    FINALIZED: "Đã Hoàn Thiện",
    SENT: "Đã Gửi",
    SIGNED: "Đã Ký",
    CANCELLED: "Đã Hủy",
    PENDING: "Đang Chờ",
    RELEASED: "Đã Giải Phóng",
    NOT_APPLICABLE: "Không Áp Dụng",
    
    // Release Types
    SWB: "Vận Đơn Biển (SWB)",
    TELEX_RELEASE: "Giải Phóng Telex",
    ORIGINAL_BL: "Vận Đơn Gốc (B/L)",
    NOT_SPECIFIED: "Chưa Xác Định",
    
    // Debit Note
    debitNoteNumber: "Số Phiếu Ghi Nợ",
    invoiceDate: "Ngày Hóa Đơn",
    dueDate: "Ngày Đến Hạn",
    
    // Messages
    saveSuccess: "Lưu hợp đồng thành công!",
    saveError: "Lỗi khi lưu hợp đồng",
    deleteSuccess: "Xóa hợp đồng thành công!",
    deleteError: "Lỗi khi xóa hợp đồng",
    loadError: "Lỗi khi tải dữ liệu",
    validationError: "Vui lòng điền đầy đủ các trường bắt buộc",
    
    // Validation
    required: "Trường này là bắt buộc",
    selectBuyer: "Vui lòng chọn bên mua",
    selectSeller: "Vui lòng chọn bên bán",
    selectCommodity: "Vui lòng chọn hàng hóa",
    selectPaymentTerm: "Vui lòng chọn điều khoản thanh toán",
    selectBank: "Vui lòng chọn thông tin ngân hàng",
    
    // Units
    MT: "Tấn",
    KG: "Kg (Kilogram)",
    LBS: "Pao (Pounds)",
    TONS: "Tấn",
    
    // Currency
    USD: "USD (Đô la Mỹ)",
    EUR: "EUR (Euro)",
    VND: "VND (Việt Nam Đồng)",
    
    // Incoterms
    CIF: "CIF (Giá bao gồm cước phí và bảo hiểm)",
    FOB: "FOB (Giao hàng trên tàu)",
    CFR: "CFR (Giá và cước phí)",
    EXW: "EXW (Giao tại xưởng)",
    
    // Language
    language: "Ngôn Ngữ",
    vietnamese: "Tiếng Việt",
    english: "Tiếng Anh",
    
    // Placeholders
    selectBuyerPlaceholder: "Chọn bên mua",
    selectSellerPlaceholder: "Chọn bên bán",
    selectCommodityPlaceholder: "Chọn hàng hóa",
    selectPaymentTermPlaceholder: "Chọn Điều Khoản Thanh Toán",
    selectBankPlaceholder: "Chọn Thông Tin Ngân Hàng",
    searchPlaceholder: "Tìm kiếm theo số hợp đồng hoặc tên bên mua...",
    contactPersonPlaceholder: "Tên người liên hệ",
    emailPlaceholder: "benmu a@example.com",
    emailPlaceholderSeller: "benban@example.com",
    shipmentPeriodPlaceholder: "Ví dụ: Trong vòng 30 ngày kể từ khi nhận L/C",
    additionalTermsPlaceholder: "Nhập các điều khoản và điều kiện bổ sung...",
    releaseRemarksPlaceholder: "Nhập các ghi chú bổ sung về việc giải phóng...",
    
    // Section Headers
    parties: "Các Bên",
    article1: "Điều 1: Hàng Hóa, Chất Lượng & Số Lượng",
    article2: "Điều 2: Giá Cả",
    article3: "Điều 3: Thanh Toán",
    sellerBankDetails: "Thông Tin Ngân Hàng Bên Bán",
    additionalInformation: "Thông Tin Bổ Sung",
    contractStatus: "Trạng Thái Hợp Đồng",
    
    // Labels and Fields
    quantityRange: "Phạm Vi Số Lượng",
    amountRange: "Phạm Vi Giá Trị",
    totalAmountLabel: "Tổng Giá Trị",
    inWords: "Bằng Chữ",
    all: "Tất Cả",
    
    // Table Headers
    contractNoHeader: "Số HĐ",
    dateHeader: "Ngày",
    buyerHeader: "Bên Mua",
    commodityHeader: "Hàng Hóa",
    totalAmountHeader: "Tổng Giá Trị",
    releaseHeader: "Giải Phóng",
    statusHeader: "Trạng Thái",
    actionsHeader: "Thao Tác",
    
    // Messages and Alerts
    loadingContracts: "Đang tải hợp đồng...",
    noContractsFound: "Không tìm thấy hợp đồng",
    pleaseSelectBuyer: "Vui lòng chọn bên mua hoặc thêm bên mua mới",
    pleaseSelectSeller: "Vui lòng chọn bên bán",
    pleaseSelectCommodityAlert: "Vui lòng chọn hàng hóa",
    pleaseSelectPaymentTermAlert: "Vui lòng chọn điều khoản thanh toán",
    pleaseSelectBankAlert: "Vui lòng chọn thông tin ngân hàng",
    contractCreatedSuccess: "Tạo hợp đồng thành công!",
    contractUpdatedSuccess: "Cập nhật hợp đồng thành công!",
    failedToSaveContract: "Lỗi khi lưu hợp đồng",
    failedToLoadContract: "Lỗi khi tải hợp đồng",
    failedToLoadMasterData: "Lỗi khi tải dữ liệu chính.",
    ensureMongoDBRunning: "Vui lòng đảm bảo MongoDB đang chạy và cơ sở dữ liệu đã được khởi tạo.\nChạy: node server/seed.js",
    failedToLoadContracts: "Lỗi khi tải danh sách hợp đồng.",
    ensureServerRunning: "Vui lòng đảm bảo MongoDB đang chạy và server đã được khởi động.\nChạy: npm run dev",
    deleteConfirm: "Bạn có chắc chắn muốn xóa hợp đồng này?",
    buyerAddedSuccess: "Thêm bên mua thành công!",
    sellerAddedSuccess: "Thêm bên bán thành công!",
    commodityAddedSuccess: "Thêm hàng hóa thành công!",
    bankDetailsAddedSuccess: "Thêm thông tin ngân hàng thành công!",
    failedToCreateBuyer: "Lỗi khi tạo bên mua",
    failedToCreateSeller: "Lỗi khi tạo bên bán",
    failedToCreateCommodity: "Lỗi khi tạo hàng hóa",
    failedToCreateBankDetails: "Lỗi khi tạo thông tin ngân hàng",
    releaseInfoSaved: "Lưu thông tin giải phóng thành công! Bạn có thể xuất PDF ngay bây giờ.",
    saveBeforeExport: "Vui lòng lưu thay đổi trước khi xuất PDF.",
    failedToSaveRelease: "Lỗi khi lưu thông tin giải phóng",
    unsavedChangesWarning: "⚠️ Bạn có thay đổi chưa lưu. Vui lòng lưu trước khi xuất PDF.",
    unsavedChanges: "Các Thay Đổi Chưa Lưu",
    unsavedChangesMessage: "Bạn có các thay đổi chưa lưu. Bạn có muốn lưu trước khi rời khỏi?",
    discardChanges: "Bỏ Qua",
    
    // Buttons and Actions
    previous: "Trước",
    next: "Tiếp",
    pageOf: "Trang",
    of: "của",
    
    // Release Modal
    releaseDocument: "Chứng Từ Giải Phóng",
    releaseDate: "Ngày Giải Phóng",
    releaseRemarks: "Ghi Chú Giải Phóng / Ghi Chú Bổ Sung",
    exportPDF: "Xuất PDF",
    
    // Footer
    footerText: "Phần Mềm Tạo Hợp Đồng Xuất Khẩu © 2025 | Quản Lý Hợp Đồng Thương Mại Tự Động"
  }
};

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations.en[key] || key;
};
