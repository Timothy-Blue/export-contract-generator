// Default contract terms for export agreements

const DEFAULT_BUYER_TERMS = `
1. Quality and Specifications: The goods shall conform strictly to the specifications and samples provided. Any deviation shall entitle the buyer to reject the goods or claim damages.

2. Payment Terms: Payment shall be made as per the agreed incoterm and payment method. Late payment shall incur interest at the rate of 1.5% per month.

3. Force Majeure: Neither party shall be held liable for delays or non-performance due to circumstances beyond their reasonable control, including war, natural disasters, and government actions.

4. Dispute Resolution: Any disputes arising from this contract shall be resolved through mutual agreement, negotiation, or arbitration in accordance with international commercial law.

5. Insurance and Risk: The buyer shall ensure adequate insurance coverage for the goods from the point of dispatch until final delivery and acceptance.

6. Delivery and Acceptance: Goods shall be delivered within the agreed timeframe. The buyer has 10 business days to inspect and accept or reject the goods.

7. Intellectual Property: The buyer acknowledges that all intellectual property rights related to the goods remain with the seller unless expressly transferred in writing.

8. Compliance and Laws: The goods shall comply with all applicable laws, regulations, and standards of both the country of origin and the destination country.
`;

const DEFAULT_SELLER_TERMS = `
1. Product Specifications: The seller shall provide goods strictly according to the agreed specifications, quality standards, and quantity. Any modification requires prior written approval.

2. Force Majeure: The seller shall not be liable for non-performance or delays caused by unforeseen circumstances beyond reasonable control, including natural disasters, war, and government restrictions.

3. Delivery and Risk Transfer: Risk of loss or damage to the goods shall transfer to the buyer at the point specified by the incoterm. The seller shall ensure proper packing and documentation.

4. Payment Terms: The buyer must pay according to the agreed payment method and schedule. The seller reserves the right to suspend shipment for non-payment.

5. Limitation of Liability: The seller's liability is limited to the invoice value of the goods. The seller shall not be liable for indirect, incidental, or consequential damages.

6. Intellectual Property and Confidentiality: The buyer agrees not to reproduce or disclose any technical or commercial information without the seller's written consent.

7. Dispute Settlement: Disputes shall be resolved through negotiation, mediation, or international arbitration. The UN Convention on International Contracts for the Sale of Goods shall apply.

8. Price Adjustment: Prices are valid for 30 days from the quotation date. The seller reserves the right to adjust prices for subsequent orders based on market conditions and raw material costs.
`;

const getDefaultBuyerTerms = () => DEFAULT_BUYER_TERMS.trim();
const getDefaultSellerTerms = () => DEFAULT_SELLER_TERMS.trim();

module.exports = {
  DEFAULT_BUYER_TERMS: getDefaultBuyerTerms(),
  DEFAULT_SELLER_TERMS: getDefaultSellerTerms(),
  getDefaultBuyerTerms,
  getDefaultSellerTerms
};
